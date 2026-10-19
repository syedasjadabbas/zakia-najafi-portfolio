import { beforeAll, describe, expect, it } from "vitest";
import { lecture } from "./fixtures";

process.env.PGLITE_DATA_DIR = "memory://";
delete process.env.DATABASE_URL;

const now = new Date("2030-01-01T00:00:00Z");
let r: typeof import("@/lib/registrations");

beforeAll(async () => {
  r = await import("@/lib/registrations");
  await r.getPlacesTaken(); // boots the embedded database once
}, 60_000);

describe("registrations", () => {
  it("confirms free registrations immediately and finds them by token only", async () => {
    const free = lecture({ slug: "free", paid: false });
    const result = await r.createRegistration({
      lecture: free,
      name: "A",
      email: "a@example.com",
      method: "free",
      paymentReference: null,
      now,
    });
    expect(result.ok && result.status).toBe("confirmed");
    if (!result.ok) return;
    expect((await r.getRegistrationByToken(result.token))?.email).toBe("a@example.com");
    expect(await r.getRegistrationByToken("wrong-token")).toBeNull();
  });

  it("rejects a second active registration for the same email, ignoring case", async () => {
    const l = lecture({ slug: "dup", paid: false });
    await r.createRegistration({ lecture: l, name: "B", email: "b@example.com", method: "free", paymentReference: null, now });
    const again = await r.createRegistration({
      lecture: l,
      name: "B",
      email: "B@example.com",
      method: "free",
      paymentReference: null,
      now,
    });
    expect(again).toEqual({ ok: false, reason: "duplicate" });
  });

  it("puts manual payments into verification and refuses reused references", async () => {
    const l = lecture({ slug: "paid" });
    const first = await r.createRegistration({
      lecture: l,
      name: "C",
      email: "c@example.com",
      method: "manual",
      paymentReference: "TX-123",
      fee: { amount: 500, currency: "PKR" },
      now,
    });
    expect(first.ok && first.status).toBe("pending_verification");
    const reused = await r.createRegistration({
      lecture: l,
      name: "D",
      email: "d@example.com",
      method: "manual",
      paymentReference: "tx-123",
      fee: { amount: 500, currency: "PKR" },
      now,
    });
    expect(reused).toEqual({ ok: false, reason: "reference-used" });
  });

  it("never exceeds capacity, even with concurrent submissions", async () => {
    const l = lecture({ slug: "small", paid: false, capacity: 3 });
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        r.createRegistration({
          lecture: l,
          name: `P${i}`,
          email: `p${i}@example.com`,
          method: "free",
          paymentReference: null,
          now,
        }),
      ),
    );
    expect(results.filter((x) => x.ok)).toHaveLength(3);
    expect((await r.getPlacesTaken()).get("small")).toBe(3);
  });

  it("refuses registration when the lecture is not open", async () => {
    const closed = lecture({ slug: "closed", registration: "closed", paid: false });
    const res = await r.createRegistration({
      lecture: closed,
      name: "F",
      email: "f@example.com",
      method: "free",
      paymentReference: null,
      now,
    });
    expect(res).toEqual({ ok: false, reason: "unavailable" });
  });

  it("only transitions from the expected status", async () => {
    const l = lecture({ slug: "transition" });
    const res = await r.createRegistration({
      lecture: l,
      name: "E",
      email: "e@example.com",
      method: "manual",
      paymentReference: "TX-9",
      fee: { amount: 200, currency: "USD" },
      now,
    });
    if (!res.ok) throw new Error("setup failed");
    expect(await r.transitionRegistration(res.id, ["pending_verification"], "confirmed")).toBe(true);
    expect(await r.transitionRegistration(res.id, ["pending_verification"], "rejected")).toBe(false);
  });

  it("stores private joining instructions per lecture", async () => {
    await r.setAccessInstructions("paid", "https://zoom.example/j/1");
    expect(await r.getAccessInstructions("paid")).toBe("https://zoom.example/j/1");
    await r.setAccessInstructions("paid", "  ");
    expect(await r.getAccessInstructions("paid")).toBeNull();
  });
  it("never registers a paid lecture for free, or charges for a free one", async () => {
    const paid = lecture({ slug: "guard-paid" });
    const free = lecture({ slug: "guard-free", paid: false });
    const asFree = await r.createRegistration({ lecture: paid, name: "G", email: "g@example.com", method: "free", paymentReference: null, now });
    const noFee = await r.createRegistration({ lecture: paid, name: "G", email: "g@example.com", method: "jazzcash", paymentReference: null, now });
    const charged = await r.createRegistration({
      lecture: free,
      name: "G",
      email: "g@example.com",
      method: "free",
      paymentReference: null,
      fee: { amount: 500, currency: "PKR" },
      now,
    });
    expect([asFree, noFee, charged]).toEqual([
      { ok: false, reason: "unavailable" },
      { ok: false, reason: "unavailable" },
      { ok: false, reason: "unavailable" },
    ]);
  });

  it("stores the optional WhatsApp number and the chosen regional fee", async () => {
    const res = await r.createRegistration({
      lecture: lecture({ slug: "whatsapp" }),
      name: "W",
      email: "w@example.com",
      whatsapp: "+923001234567",
      method: "jazzcash",
      paymentReference: null,
      fee: { amount: 500, currency: "PKR" },
      now,
    });
    if (!res.ok) throw new Error("setup failed");
    const saved = await r.getRegistrationByToken(res.token);
    expect(saved).toMatchObject({ whatsapp: "+923001234567", amount_minor: 500, currency: "PKR", status: "pending_payment" });
  });
});
