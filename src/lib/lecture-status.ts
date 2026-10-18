import type { Lecture } from "@/content/lectures";

export type LectureStatus =
  | "open" // registration open
  | "upcoming" // announced, registration not yet open
  | "closed" // registration closed by the admin or deadline passed
  | "full" // capacity reached
  | "live" // in progress
  | "completed";

export const statusLabel: Record<LectureStatus, string> = {
  open: "Registration open",
  upcoming: "Registration opens soon",
  closed: "Registration closed",
  full: "Fully booked",
  live: "Live now",
  completed: "Completed",
};

/**
 * Derives a lecture's public status. Pure: pass the current time and the
 * number of places already taken (confirmed or awaiting verification).
 */
export function getLectureStatus(lecture: Lecture, now: Date, placesTaken: number): LectureStatus {
  const start = new Date(lecture.startsAt).getTime();
  const end = start + lecture.durationMinutes * 60_000;
  const t = now.getTime();

  if (t >= end) return "completed";
  if (t >= start) return "live";
  if (lecture.registration === "not-yet-open") return "upcoming";
  if (lecture.registration === "closed") return "closed";
  if (lecture.registrationDeadline && t > new Date(lecture.registrationDeadline).getTime()) {
    return "closed";
  }
  if (lecture.capacity !== undefined && placesTaken >= lecture.capacity) return "full";
  return "open";
}

/** Sorts upcoming and live lectures first (soonest first), completed last (most recent first). */
export function sortLectures<T extends { lecture: Lecture; status: LectureStatus }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDone = a.status === "completed";
    const bDone = b.status === "completed";
    if (aDone !== bDone) return aDone ? 1 : -1;
    const diff = new Date(a.lecture.startsAt).getTime() - new Date(b.lecture.startsAt).getTime();
    return aDone ? -diff : diff;
  });
}
