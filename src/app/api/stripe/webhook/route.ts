import type Stripe from "stripe";
import { getStripe } from "@/lib/payments";
import { applyPaymentEvent, findByStripeSession, transitionRegistration } from "@/lib/registrations";

/**
 * Stripe webhook. A registration is confirmed only here, after the signature
 * is verified, the session is paid, and amount and currency match what was
 * recorded at registration. Each event is applied once.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response("Not configured", { status: 404 });
  if (!signature) return new Response("Missing signature", { status: 400 });

  const stripe = await getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.expired" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return Response.json({ received: true });
  }

  const session = event.data.object;

  await applyPaymentEvent(event.id, async (query) => {
    const registration = await findByStripeSession(session.id, query);
    if (!registration) return;

    if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      await transitionRegistration(registration.id, ["pending_payment"], "cancelled", query);
      return;
    }

    const amountMatches =
      session.amount_total === registration.amount_minor &&
      session.currency?.toLowerCase() === registration.currency?.toLowerCase();

    if (session.payment_status !== "paid") return; // async payments confirm later
    if (!amountMatches) {
      console.error(`Stripe amount mismatch for registration ${registration.id}`);
      await transitionRegistration(registration.id, ["pending_payment"], "pending_verification", query);
      return;
    }
    await transitionRegistration(registration.id, ["pending_payment", "cancelled"], "confirmed", query);
  });

  return Response.json({ received: true });
}
