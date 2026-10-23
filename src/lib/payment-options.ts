import type { Price } from "@/content/lectures";

/**
 * Central payment configuration for paid lectures: who pays what, and how.
 *
 * Safe to import in the browser: it holds no secrets. Merchant credentials
 * belong in server environment variables and are read only in
 * `src/lib/payment-gateways.ts`.
 *
 * Amounts use the same minor units as `Intl.NumberFormat` (PKR has no decimal
 * places there, so PKR 500 is `500`; USD 2 is `200` cents).
 *
 * To launch a method: set its `availability` to "live" here AND implement and
 * configure its gateway in `src/lib/payment-gateways.ts`. A method only becomes
 * selectable when both are true.
 */

export type PaymentRegionId = "pk" | "intl";
export type PaymentMethodId = "jazzcash" | "easypaisa" | "card";

export type PaymentMethodOption = {
  id: PaymentMethodId;
  label: string;
  description: string;
  availability: "coming-soon" | "live";
};

export type PaymentRegion = {
  id: PaymentRegionId;
  label: string;
  audience: string;
  fee: Price;
  /** How the fee is written in the interface. */
  feeLabel: string;
  methods: PaymentMethodOption[];
};

export const paymentRegions: PaymentRegion[] = [
  {
    id: "pk",
    label: "Pakistan",
    audience: "For participants paying from Pakistan",
    fee: { amount: 500, currency: "PKR" },
    feeLabel: "PKR 500",
    methods: [
      {
        id: "jazzcash",
        label: "JazzCash",
        description: "Mobile wallet or JazzCash account",
        availability: "coming-soon",
      },
      {
        id: "easypaisa",
        label: "Easypaisa",
        description: "Mobile wallet or Easypaisa account",
        availability: "coming-soon",
      },
    ],
  },
  {
    id: "intl",
    label: "International",
    audience: "For participants paying from outside Pakistan",
    fee: { amount: 200, currency: "USD" },
    feeLabel: "USD $2",
    methods: [
      {
        id: "card",
        label: "International card payment",
        description: "Visa, Mastercard and other major cards",
        availability: "coming-soon",
      },
    ],
  },
];

export const paymentsComingSoonNotice = "Secure online payments will be available soon.";

/**
 * A paid lecture's own fees, set in the admin panel: whole rupees for Pakistan,
 * US cents for international (so $2.50 is 250).
 */
export type LectureFees = { pkr: number; usdCents: number };

/** Used for paid lectures that have no fees of their own (e.g. published before fees were customisable). */
export const defaultFees: LectureFees = { pkr: 500, usdCents: 200 };

/** e.g. "PKR 1,500", "USD $2", "USD $2.50" */
export function feeLabel(price: Price): string {
  if (price.currency === "PKR") return `PKR ${price.amount.toLocaleString("en-US")}`;
  const dollars = price.amount / 100;
  return `USD $${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

/** The payment regions with a lecture's own fees applied. */
export function regionsWithFees(fees: LectureFees = defaultFees): PaymentRegion[] {
  return paymentRegions.map((region) => {
    const fee: Price = region.id === "pk" ? { amount: fees.pkr, currency: "PKR" } : { amount: fees.usdCents, currency: "USD" };
    return { ...region, fee, feeLabel: feeLabel(fee) };
  });
}

export function getPaymentRegion(id: string | null | undefined, fees?: LectureFees): PaymentRegion | undefined {
  return regionsWithFees(fees).find((region) => region.id === id);
}

export function getPaymentMethod(region: PaymentRegion, id: string | null | undefined) {
  return region.methods.find((method) => method.id === id);
}

/** Every method across all regions, for status summaries. */
export const allPaymentMethods = paymentRegions.flatMap((region) => region.methods);
