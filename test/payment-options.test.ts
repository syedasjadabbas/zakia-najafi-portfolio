import { describe, expect, it } from "vitest";
import { getGateway, getLiveMethodIds } from "@/lib/payment-gateways";
import { allPaymentMethods, getPaymentMethod, getPaymentRegion, paymentRegions } from "@/lib/payment-options";

describe("payment options", () => {
  it("charges PKR 500 in Pakistan and USD $2 internationally", () => {
    expect(getPaymentRegion("pk")).toMatchObject({ fee: { amount: 500, currency: "PKR" }, feeLabel: "PKR 500" });
    expect(getPaymentRegion("intl")).toMatchObject({ fee: { amount: 200, currency: "USD" }, feeLabel: "USD $2" });
    expect(getPaymentRegion("elsewhere")).toBeUndefined();
  });

  it("offers JazzCash and Easypaisa in Pakistan and card payment internationally", () => {
    expect(paymentRegions.map((r) => [r.id, r.methods.map((m) => m.id)])).toEqual([
      ["pk", ["jazzcash", "easypaisa"]],
      ["intl", ["card"]],
    ]);
    // A method from another region is not accepted.
    expect(getPaymentMethod(getPaymentRegion("pk")!, "card")).toBeUndefined();
  });

  it("takes no payments until a gateway is live and configured", () => {
    expect(allPaymentMethods.every((m) => m.availability === "coming-soon")).toBe(true);
    for (const method of allPaymentMethods) expect(getGateway(method.id)).toBeNull();
    expect(getLiveMethodIds()).toEqual([]);
  });
});

describe("per-lecture fees", () => {
  it("labels fees the way the site shows them", async () => {
    const { feeLabel } = await import("@/lib/payment-options");
    expect(feeLabel({ amount: 1500, currency: "PKR" })).toBe("PKR 1,500");
    expect(feeLabel({ amount: 500, currency: "USD" })).toBe("USD $5");
    expect(feeLabel({ amount: 250, currency: "USD" })).toBe("USD $2.50");
  });

  it("applies a lecture's own fees to both regions, and falls back to the defaults", async () => {
    const { getPaymentRegion, regionsWithFees } = await import("@/lib/payment-options");
    const custom = { pkr: 1000, usdCents: 500 };
    expect(getPaymentRegion("pk", custom)?.fee).toEqual({ amount: 1000, currency: "PKR" });
    expect(getPaymentRegion("intl", custom)?.feeLabel).toBe("USD $5");
    expect(regionsWithFees().map((r) => r.feeLabel)).toEqual(["PKR 500", "USD $2"]);
  });
});
