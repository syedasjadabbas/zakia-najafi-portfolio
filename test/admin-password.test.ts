import { beforeAll, describe, expect, it } from "vitest";

process.env.PGLITE_DATA_DIR = "memory://";
delete process.env.DATABASE_URL;
process.env.ADMIN_PASSWORD = "first-password-from-env";
process.env.SESSION_SECRET = "a-test-session-secret-that-is-long-enough-123";

let auth: typeof import("@/lib/admin-auth");
let db: typeof import("@/lib/db");

beforeAll(async () => {
  auth = await import("@/lib/admin-auth");
  db = await import("@/lib/db");
  await db.getDb(); // boots the embedded database once
}, 60_000);

describe("changing the admin password", () => {
  it("accepts the password from the environment until it is changed", async () => {
    expect(await auth.checkPassword("first-password-from-env")).toBe(true);
    expect(await auth.checkPassword("wrong")).toBe(false);
  });

  it("switches to the new password, and the old one stops working", async () => {
    await auth.setAdminPassword("a brand new password");
    expect(await auth.checkPassword("a brand new password")).toBe(true);
    expect(await auth.checkPassword("first-password-from-env")).toBe(false);
  });

  it("stores only a salted hash, never the password itself", async () => {
    const rows = await (await db.getDb()).query<{ value: string }>(`select value from admin_settings`);
    expect(rows).toHaveLength(1);
    expect(rows[0].value).toMatch(/^scrypt\$/);
    expect(rows[0].value).not.toContain("a brand new password");

    await auth.setAdminPassword("a brand new password");
    const again = await (await db.getDb()).query<{ value: string }>(`select value from admin_settings`);
    expect(again[0].value).not.toBe(rows[0].value); // fresh salt each time
    expect(await auth.checkPassword("a brand new password")).toBe(true);
  });
});
