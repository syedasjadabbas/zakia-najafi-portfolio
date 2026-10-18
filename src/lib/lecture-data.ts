import "server-only";

import { connection } from "next/server";
import { getLecture, getLectures, type Lecture } from "@/content/lectures";
import { getLectureStatus, sortLectures, type LectureStatus } from "./lecture-status";
import { getPlacesTaken } from "./registrations";

export type LectureWithStatus = { lecture: Lecture; status: LectureStatus; placesTaken: number };

/** Request-time lecture list with live statuses. Call inside a Suspense boundary. */
export async function getLecturesWithStatus(): Promise<LectureWithStatus[]> {
  await connection();
  const lectures = await getLectures();
  if (!lectures.length) return [];
  const taken = await safePlacesTaken();
  const now = new Date();
  return sortLectures(
    lectures.map((lecture) => {
      const placesTaken = taken.get(lecture.slug) ?? 0;
      return { lecture, placesTaken, status: getLectureStatus(lecture, now, placesTaken) };
    }),
  );
}

export async function getLectureWithStatus(slug: string): Promise<LectureWithStatus | null> {
  await connection();
  const lecture = await getLecture(slug);
  if (!lecture) return null;
  const placesTaken = (await safePlacesTaken()).get(slug) ?? 0;
  return { lecture, placesTaken, status: getLectureStatus(lecture, new Date(), placesTaken) };
}

/**
 * The public lecture list should still render if the database is briefly
 * unavailable; registration itself re-checks capacity inside a transaction.
 */
async function safePlacesTaken(): Promise<Map<string, number>> {
  try {
    return await getPlacesTaken();
  } catch (error) {
    console.error("Could not read registration counts", error);
    return new Map();
  }
}
