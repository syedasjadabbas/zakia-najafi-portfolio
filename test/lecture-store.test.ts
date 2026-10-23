import { beforeAll, describe, expect, it } from "vitest";
import { lecture } from "./fixtures";

process.env.PGLITE_DATA_DIR = "memory://";
delete process.env.DATABASE_URL;

let store: typeof import("@/lib/lecture-store");
let content: typeof import("@/content/lectures");
let r: typeof import("@/lib/registrations");

beforeAll(async () => {
  store = await import("@/lib/lecture-store");
  content = await import("@/content/lectures");
  r = await import("@/lib/registrations");
  await r.getPlacesTaken(); // boots the embedded database once
}, 60_000);

describe("time zones", () => {
  it("reads the form's time in the chosen zone", () => {
    expect(store.zonedTimeToIso("2026-11-04", "22:00", "Asia/Karachi")).toBe("2026-11-04T17:00:00.000Z");
    expect(store.zonedTimeToIso("2026-07-01", "19:30", "Europe/London")).toBe("2026-07-01T18:30:00.000Z"); // BST
    expect(store.zonedTimeToIso("2026-12-01", "19:30", "Europe/London")).toBe("2026-12-01T19:30:00.000Z"); // GMT
    expect(store.zonedTimeToIso("2026-11-04", "late", "Asia/Karachi")).toBeNull();
  });

  it("round-trips back to the same date and time for the form", () => {
    expect(store.isoToZonedParts("2026-11-04T17:00:00.000Z", "Asia/Karachi")).toEqual({ date: "2026-11-04", time: "22:00" });
  });
});

describe("lectures published from the admin panel", () => {
  it("makes readable, unique addresses", () => {
    expect(store.uniqueSlug("Tafseer of Surah al-Asr!", "2026-11-04T17:00:00.000Z", [])).toBe(
      "tafseer-of-surah-al-asr-2026-11-04",
    );
    expect(store.uniqueSlug("Tafseer", "2026-11-04T17:00:00.000Z", ["tafseer-2026-11-04"])).toBe("tafseer-2026-11-04-2");
  });

  it("appears on the site as soon as it is saved, and can be edited", async () => {
    await store.saveStoredLecture(lecture({ slug: "admin-lecture", title: "First title", capacity: 40 }));
    expect((await content.getLecture("admin-lecture"))?.title).toBe("First title");

    await store.saveStoredLecture(lecture({ slug: "admin-lecture", title: "New title", paid: false }));
    const saved = await content.getLecture("admin-lecture");
    expect(saved).toMatchObject({ title: "New title", paid: false, capacity: undefined, startsAt: "2030-01-10T18:00:00.000Z" });
  });

  it("keeps each paid lecture's own fees, and drops them when it becomes free", async () => {
    await store.saveStoredLecture(lecture({ slug: "fee-lecture", paid: true, fees: { pkr: 1500, usdCents: 550 } }));
    expect((await content.getLecture("fee-lecture"))?.fees).toEqual({ pkr: 1500, usdCents: 550 });

    await store.saveStoredLecture(lecture({ slug: "fee-lecture", paid: false, fees: { pkr: 1500, usdCents: 550 } }));
    expect((await content.getLecture("fee-lecture"))?.fees).toBeUndefined();
  });

  it("can close and reopen registration", async () => {
    await store.setStoredLectureRegistration("admin-lecture", "closed");
    expect((await store.getStoredLecture("admin-lecture"))?.registration).toBe("closed");
  });

  it("can only be deleted while nobody has registered", async () => {
    await store.saveStoredLecture(lecture({ slug: "with-people", paid: false }));
    await r.createRegistration({
      lecture: lecture({ slug: "with-people", paid: false }),
      name: "R",
      email: "r@example.com",
      method: "free",
      paymentReference: null,
      now: new Date("2030-01-01T00:00:00Z"),
    });
    expect(await store.deleteStoredLecture("with-people")).toBe(false);
    expect(await store.getStoredLecture("with-people")).toBeDefined();

    expect(await store.deleteStoredLecture("admin-lecture")).toBe(true);
    expect(await content.getLecture("admin-lecture")).toBeUndefined();
  });
});
