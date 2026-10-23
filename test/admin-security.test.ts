import { beforeAll, describe, expect, it } from "vitest";
import { lecture } from "./fixtures";

process.env.PGLITE_DATA_DIR = "memory://";
delete process.env.DATABASE_URL;
process.env.ADMIN_PASSWORD = "first-password-from-env";
process.env.SESSION_SECRET = "a-test-session-secret-that-is-long-enough-123";

let auth: typeof import("@/lib/admin-auth");
let r: typeof import("@/lib/registrations");
let db: typeof import("@/lib/db");

beforeAll(async () => {
  auth = await import("@/lib/admin-auth");
  r = await import("@/lib/registrations");
  db = await import("@/lib/db");
  await db.getDb(); // boots the embedded database once
}, 60_000);

describe("sign-in attempt limit (shared through the database)", () => {
  it("pauses sign-in after five wrong passwords, and clears on success", async () => {
    for (let i = 1; i < auth.MAX_FAILURES; i++) {
      await auth.recordFailedSignIn();
      expect(await auth.isLockedOut()).toBe(false);
    }
    await auth.recordFailedSignIn();
    expect(await auth.isLockedOut()).toBe(true);

    await auth.clearFailedSignIns();
    expect(await auth.isLockedOut()).toBe(false);
  });

  it("forgets old failures after the window", async () => {
    for (let i = 1; i < auth.MAX_FAILURES; i++) await auth.recordFailedSignIn();
    await (await db.getDb()).query(`update sign_in_attempts set updated_at = now() - interval '1 hour'`);
    await auth.recordFailedSignIn(); // starts a fresh count instead of reaching five
    expect(await auth.isLockedOut()).toBe(false);
    await auth.clearFailedSignIns();
  });
});

describe("deleting a registration", () => {
  it("removes it permanently", async () => {
    const result = await r.createRegistration({
      lecture: lecture({ slug: "delete-me", paid: false }),
      name: "To Delete",
      email: "delete@example.com",
      method: "free",
      paymentReference: null,
      now: new Date("2030-01-01T00:00:00Z"),
    });
    if (!result.ok) throw new Error("registration failed");
    expect(await r.deleteRegistration(result.id)).toBe(true);
    expect(await r.getRegistration(result.id)).toBeNull();
    expect(await r.deleteRegistration(result.id)).toBe(false);
  });
});
