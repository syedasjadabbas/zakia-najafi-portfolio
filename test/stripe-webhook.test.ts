import Stripe from "stripe";
import { beforeAll, describe, expect, it } from "vitest";
import { lecture } from "./fixtures";

process.env.PGLITE_DATA_DIR = "memory://";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
delete process.env.DATABASE_URL;

const stripe = new Stripe("sk_test_dummy");
let r: typeof import("@/lib/registrations");
let POST: (req: Request) => Promise<Response>;

beforeAll(async () => {
  r = await import("@/lib/registrations");
  ({ POST } = await import("@/app/api/stripe/webhook/route"));
  await r.getPlacesTaken(); // boots the embedded database once
}, 60_000);

function signedRequest(event: object, secret = "whsec_test_secret") {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    body: payload,
    headers: { "stripe-signature": header },
  });
}

function completed(id: string, sessionId: string, amount: number, currency = "gbp") {
  return {
    id,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: { id: sessionId, object: "checkout.session", amount_total: amount, currency, payment_status: "paid" },
    },
  };
}

async function pendingStripeRegistration(slug: string, sessionId: string) {
  const res = await r.createRegistration({
    lecture: lecture({ slug }),
    name: "S",
    email: `${slug}@example.com`,
    method: "stripe",
    paymentReference: null,
    fee: { amount: 1000, currency: "GBP" },
    now: new Date("2030-01-01T00:00:00Z"),
  });
  if (!res.ok) throw new Error("setup failed");
  await r.attachStripeSession(res.id, sessionId);
  return res;
}

describe("Stripe webhook", () => {
  it("rejects requests with an invalid signature", async () => {
    const res = await POST(signedRequest(completed("evt_bad", "cs_x", 1000), "whsec_wrong"));
    expect(res.status).toBe(400);
  });

  it("confirms a paid session with the right amount, once", async () => {
    const reg = await pendingStripeRegistration("stripe-ok", "cs_ok");
    expect((await POST(signedRequest(completed("evt_1", "cs_ok", 1000)))).status).toBe(200);
    expect((await r.getRegistrationByToken(reg.token))?.status).toBe("confirmed");
    // Replaying the same event is a no-op.
    expect((await POST(signedRequest(completed("evt_1", "cs_ok", 1000)))).status).toBe(200);
    expect((await r.getRegistrationByToken(reg.token))?.status).toBe("confirmed");
  });

  it("does not confirm when the amount does not match", async () => {
    const reg = await pendingStripeRegistration("stripe-mismatch", "cs_bad_amount");
    await POST(signedRequest(completed("evt_2", "cs_bad_amount", 1)));
    expect((await r.getRegistrationByToken(reg.token))?.status).toBe("pending_verification");
  });

  it("releases the place when a session expires", async () => {
    const reg = await pendingStripeRegistration("stripe-expired", "cs_expired");
    await POST(
      signedRequest({
        id: "evt_3",
        object: "event",
        type: "checkout.session.expired",
        data: { object: { id: "cs_expired", object: "checkout.session" } },
      }),
    );
    expect((await r.getRegistrationByToken(reg.token))?.status).toBe("cancelled");
  });
});
