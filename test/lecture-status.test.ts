import { describe, expect, it } from "vitest";
import { getLectureStatus, sortLectures } from "@/lib/lecture-status";
import { lecture } from "./fixtures";

const before = new Date("2030-01-01T00:00:00Z");

describe("getLectureStatus", () => {
  it("is open when registration is open and places remain", () => {
    expect(getLectureStatus(lecture({ capacity: 10 }), before, 9)).toBe("open");
  });
  it("is full when capacity is reached", () => {
    expect(getLectureStatus(lecture({ capacity: 10 }), before, 10)).toBe("full");
  });
  it("is closed after the registration deadline", () => {
    const l = lecture({ registrationDeadline: "2029-12-31T00:00:00Z" });
    expect(getLectureStatus(l, before, 0)).toBe("closed");
  });
  it("respects manual closed and not-yet-open settings", () => {
    expect(getLectureStatus(lecture({ registration: "closed" }), before, 0)).toBe("closed");
    expect(getLectureStatus(lecture({ registration: "not-yet-open" }), before, 0)).toBe("upcoming");
  });
  it("is live during the lecture and completed after it", () => {
    expect(getLectureStatus(lecture(), new Date("2030-01-10T18:30:00Z"), 0)).toBe("live");
    expect(getLectureStatus(lecture(), new Date("2030-01-10T19:00:00Z"), 0)).toBe("completed");
  });
});

describe("sortLectures", () => {
  it("puts upcoming first by date and completed last, newest first", () => {
    const items = [
      { lecture: lecture({ slug: "old", startsAt: "2020-01-01T00:00:00Z" }), status: "completed" as const },
      { lecture: lecture({ slug: "later", startsAt: "2030-02-01T00:00:00Z" }), status: "open" as const },
      { lecture: lecture({ slug: "soon", startsAt: "2030-01-01T00:00:00Z" }), status: "open" as const },
      { lecture: lecture({ slug: "recent", startsAt: "2021-01-01T00:00:00Z" }), status: "completed" as const },
    ];
    expect(sortLectures(items).map((i) => i.lecture.slug)).toEqual(["soon", "later", "recent", "old"]);
  });
});
