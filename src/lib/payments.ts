import "server-only";

import type Stripe from "stripe";
import type { Lecture, Price } from "@/content/lectures";

/**
 * Stripe Checkout helpers, used by the "card" gateway in payment-gateways.ts.
 * Registrations are confirmed only by the signature-verified webhook at
 * /api/stripe/webhook, after amount and currency are checked.
 */

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

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
  fee: Price;
  registrationId: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const { lecture, fee } = input;
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
            currency: fee.currency.toLowerCase(),
            unit_amount: fee.amount,
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
