import type { Lecture } from "@/content/lectures";

export function lecture(overrides: Partial<Lecture> = {}): Lecture {
  return {
    slug: "test-lecture",
    title: "Test lecture",
    description: "Fixture",
    startsAt: "2030-01-10T18:00:00+00:00",
    durationMinutes: 60,
    timeZone: "Europe/London",
    language: "Urdu",
    platform: "Zoom",
    price: { amount: 1000, currency: "GBP" },
    registration: "open",
    ...overrides,
  };
}
