import { beforeAll, describe, expect, it } from "vitest";
import { lecture } from "./fixtures";

process.env.PGLITE_DATA_DIR = "memory://";
delete process.env.DATABASE_URL;

let r: typeof import("@/lib/registrations");
let db: typeof import("@/lib/db");
let retention: typeof import("@/lib/retention");

beforeAll(async () => {
  r = await import("@/lib/registrations");
  db = await import("@/lib/db");
  retention = await import("@/lib/retention");
  await db.getDb(); // boots the embedded database once
}, 60_000);

async function registerAt(email: string, createdAt: string) {
  const result = await r.createRegistration({
    lecture: lecture({ slug: "retention-lecture", paid: false }),
    name: "R",
    email,
    method: "free",
    paymentReference: null,
    now: new Date("2030-01-01T00:00:00Z"),
  });
  if (!result.ok) throw new Error("registration failed");
  await (await db.getDb()).query(`update registrations set created_at = $2 where email = $1`, [email, createdAt]);
}

describe("retention period from the privacy notice", () => {
  it("is twelve months", () => {
    expect(retention.RETENTION_MONTHS).toBe(12);
    expect(retention.retentionCutoff(new Date("2027-06-15T10:00:00Z")).toISOString()).toBe("2026-06-15T10:00:00.000Z");
  });

  it("deletes only registrations older than the retention period", async () => {
    await registerAt("old@example.com", "2025-01-01T00:00:00Z");
    await registerAt("recent@example.com", "2026-09-01T00:00:00Z");

    const removed = await r.deleteExpiredRegistrations(new Date("2026-10-23T00:00:00Z"));
    expect(removed).toBe(1);
    const left = (await r.listRegistrations()).map((x) => x.email);
    expect(left).toContain("recent@example.com");
    expect(left).not.toContain("old@example.com");
  });
});
