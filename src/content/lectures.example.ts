import type { Lecture } from "./lectures";

/**
 * FICTIONAL sample data for local development only (SHOW_EXAMPLE_LECTURES=true).
 * Dates are generated relative to today so every status can be seen.
 * Never shown in production builds.
 */

function daysFromNow(days: number, hourUtc = 18) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hourUtc, 0, 0, 0);
  return date.toISOString();
}

export const exampleLectures: Lecture[] = [
  {
    slug: "example-paid-lecture",
    title: "[Example] Paid online lecture",
    description: "Sample entry for testing the paid registration and payment selection.",
    startsAt: daysFromNow(14),
    durationMinutes: 90,
    timeZone: "Europe/London",
    language: "Urdu",
    platform: "Zoom",
    paid: true,
    capacity: 50,
    registrationDeadline: daysFromNow(13),
    registration: "open",
  },
  {
    slug: "example-free-lecture",
    title: "[Example] Free online lecture",
    description: "Sample entry for testing free registration.",
    startsAt: daysFromNow(21),
    durationMinutes: 60,
    timeZone: "Asia/Karachi",
    language: "English",
    platform: "Google Meet",
    paid: false,
    registration: "open",
  },
  {
    slug: "example-not-yet-open",
    title: "[Example] Registration opening soon",
    description: "Sample entry showing a lecture announced before registration opens.",
    startsAt: daysFromNow(40),
    durationMinutes: 60,
    timeZone: "Europe/London",
    language: "Urdu",
    platform: "Zoom",
    paid: true,
    registration: "not-yet-open",
  },
];

