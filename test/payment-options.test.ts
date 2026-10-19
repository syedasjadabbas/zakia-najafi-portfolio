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
