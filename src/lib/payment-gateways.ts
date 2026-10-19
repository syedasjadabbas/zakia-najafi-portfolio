import "server-only";

import type { Lecture, Price } from "@/content/lectures";
import { allPaymentMethods, type PaymentMethodId } from "./payment-options";
import { createCheckoutSession, isStripeConfigured } from "./payments";
import { attachStripeSession } from "./registrations";

/**
 * Integration point for online payment gateways.
 *
 * Each gateway starts a checkout for a registration that has already been
 * saved with status "pending_payment", and returns the gateway's hosted
 * payment page to redirect to. Card details, wallet PINs and OTPs are only
 * ever entered on the gateway's own page, never on this site.
 *
 * A registration must ONLY be confirmed by the gateway's server-to-server
 * callback, after verifying its signature/hash, the amount and the currency,
 * and recording the event id so it is applied once (see applyPaymentEvent in
 * registrations.ts and the Stripe webhook for the pattern). Never confirm a
 * payment because the visitor's browser returned to a "success" URL.
 *
 * Still to be connected:
 *  - jazzcash:  JazzCash merchant API (hosted checkout). Server env such as
 *               JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, JAZZCASH_INTEGRITY_SALT.
 *               Callback route: src/app/api/payments/jazzcash/route.ts.
 *  - easypaisa: Easypaisa merchant API. Server env such as EASYPAISA_STORE_ID,
 *               EASYPAISA_HASH_KEY. Callback route: src/app/api/payments/easypaisa/route.ts.
 *  - card:      implemented below with Stripe Checkout (+ /api/stripe/webhook);
 *               another international gateway can replace it behind this interface.
 */

export type CheckoutRequest = {
  registrationId: string;
  lecture: Lecture;
  fee: Price;
  name: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
};

export type PaymentGateway = {
  id: PaymentMethodId;
  /** How the registration is recorded in the database. */
  storedAs: "stripe" | "jazzcash" | "easypaisa";
  isConfigured(): boolean;
  /** Creates the gateway-side checkout and returns the hosted page to redirect to. */
  startCheckout(request: CheckoutRequest): Promise<{ redirectUrl: string }>;
};

const stripeCard: PaymentGateway = {
  id: "card",
  storedAs: "stripe",
  isConfigured: isStripeConfigured,
  async startCheckout(request) {
    const session = await createCheckoutSession(request);
    await attachStripeSession(request.registrationId, session.id);
    return { redirectUrl: session.url };
  },
};

const gateways: Partial<Record<PaymentMethodId, PaymentGateway>> = {
  card: stripeCard,
  // jazzcash: connect here,
  // easypaisa: connect here,
};

/**
 * Returns a gateway only when the method is marked "live" in
 * payment-options.ts AND its server-side credentials are configured.
 */
export function getGateway(methodId: string | null | undefined): PaymentGateway | null {
  const option = allPaymentMethods.find((method) => method.id === methodId);
  if (!option || option.availability !== "live") return null;
  const gateway = gateways[option.id];
  return gateway?.isConfigured() ? gateway : null;
}

/** Method ids that can take payments right now. */
export function getLiveMethodIds(): PaymentMethodId[] {
  return allPaymentMethods.filter((method) => getGateway(method.id)).map((method) => method.id);
}
