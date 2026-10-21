/**
 * Live lectures.
 *
 * Add a lecture by appending an object to `lectures`. Nothing here is private:
 * joining links and instructions are entered in the admin page (/admin) and
 * stored in the database, never in this file.
 *
 * Example (copy, then edit):
 *
 *   {
 *     slug: "tafseer-surah-al-asr",               // unique, used in the URL
 *     title: "Tafseer of Surah al-Asr",
 *     description: "A single session on ...",
 *     startsAt: "2026-11-21T19:00:00+00:00",      // ISO date with offset
 *     durationMinutes: 90,
 *     timeZone: "Europe/London",                  // shown to visitors
 *     language: "Urdu",
 *     platform: "Zoom",
 *     paid: true,                                 // fee and methods: src/lib/payment-options.ts
 *     capacity: 100,                              // optional
 *     registrationDeadline: "2026-11-21T12:00:00+00:00", // optional
 *     registration: "open",                       // "open" | "closed" | "not-yet-open"
 *   }
 */

export type Price = {
  /** Amount in the minor unit used by Intl.NumberFormat (cents for USD; PKR has none). */
  amount: number;
  /** ISO 4217 code, e.g. "GBP", "USD", "PKR". */
  currency: string;
};

export type Lecture = {
  slug: string;
  title: string;
  description: string;
  startsAt: string;
  durationMinutes: number;
  timeZone: string;
  language: string;
  platform: string;
  /** Paid lectures charge the fee for the payment region the visitor chooses. */
  paid: boolean;
  capacity?: number;
  registrationDeadline?: string;
  registration: "open" | "closed" | "not-yet-open";
};

/** Lectures defined in code. Most lectures are published from /admin instead. */
const lectures: Lecture[] = [];

/** Lectures published from the admin panel. Never breaks the page if the database is down. */
async function storedLectures(): Promise<Lecture[]> {
  try {
    const { listStoredLectures } = await import("@/lib/lecture-store");
    return await listStoredLectures();
  } catch (error) {
    console.error("Could not load lectures from the database", error);
    return [];
  }
}

/**
 * Returns all lectures: those published from /admin plus any defined above.
 * In development only, SHOW_EXAMPLE_LECTURES=true also loads clearly fictional
 * sample lectures so the registration flow can be tried out. They are never
 * used in production.
 */
export async function getLectures(): Promise<Lecture[]> {
  const all = [...(await storedLectures()), ...lectures];
  if (process.env.NODE_ENV !== "production" && process.env.SHOW_EXAMPLE_LECTURES === "true") {
    const { exampleLectures } = await import("./lectures.example");
    all.push(...exampleLectures);
  }
  return all;
}

export async function getLecture(slug: string): Promise<Lecture | undefined> {
  return (await getLectures()).find((lecture) => lecture.slug === slug);
}
