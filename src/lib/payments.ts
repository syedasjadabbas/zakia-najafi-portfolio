import "server-only";

import type Stripe from "stripe";
import type { Lecture } from "@/content/lectures";
import { site } from "@/content/site";

/**
 * Payment provider selection.
 *
 * PAYMENT_PROVIDER=manual (default) — visitors pay using the instructions in
 *   src/content/site.ts, submit a transaction reference, and an administrator
 *   approves or rejects the registration at /admin.
 * PAYMENT_PROVIDER=stripe — Stripe Checkout. Registrations are confirmed only
 *   by a signature-verified webhook whose amount and currency match.
 */

export type PaymentProvider = "manual" | "stripe";

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "stripe" ? "stripe" : "manual";
}

export async function getManualInstructions(): Promise<string | null> {
  if (site.payment.manualInstructions) return site.payment.manualInstructions;
  if (process.env.NODE_ENV !== "production" && process.env.SHOW_EXAMPLE_LECTURES === "true") {
    return (await import("@/content/lectures.example")).exampleManualInstructions;
  }
  return null;
}

/** Whether paid registration can be offered at all with the current configuration. */
export async function isPaidRegistrationAvailable(): Promise<boolean> {
  if (getPaymentProvider() === "stripe") {
    return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  }
  return Boolean(await getManualInstructions());
}

let stripeClient: Stripe | null = null;

export async function getStripe(): Promise<Stripe> {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (!stripeClient) {
    const { default: StripeSdk } = await import("stripe");
    stripeClient = new StripeSdk(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export async function createCheckoutSession(input: {
  lecture: Lecture;
  registrationId: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const { lecture } = input;
  if (!lecture.price) throw new Error("Lecture is free");
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: input.email,
      client_reference_id: input.registrationId,
      metadata: { registrationId: input.registrationId, lectureSlug: lecture.slug },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: lecture.price.currency.toLowerCase(),
            unit_amount: lecture.price.amount,
            product_data: { name: lecture.title },
          },
        },
      ],
      // Abandoned checkouts release their place after 30 minutes.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
    { idempotencyKey: `checkout-${input.registrationId}` },
  );
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { id: session.id, url: session.url };
}
