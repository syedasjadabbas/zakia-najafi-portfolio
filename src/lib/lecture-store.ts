import "server-only";

import type { Lecture } from "@/content/lectures";
import { getDb } from "./db";

/**
 * Lectures published from the admin panel, stored in the database so they go
 * live instantly, with no code change or redeploy.
 */

type LectureRow = {
  slug: string;
  title: string;
  description: string;
  starts_at: Date | string;
  duration_minutes: number;
  time_zone: string;
  language: string;
  platform: string;
  paid: boolean;
  capacity: number | null;
  registration_deadline: Date | string | null;
  registration: Lecture["registration"];
};

const iso = (value: Date | string) => new Date(value).toISOString();

function toLecture(row: LectureRow): Lecture {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    startsAt: iso(row.starts_at),
    durationMinutes: Number(row.duration_minutes),
    timeZone: row.time_zone,
    language: row.language,
    platform: row.platform,
    paid: Boolean(row.paid),
    capacity: row.capacity === null ? undefined : Number(row.capacity),
    registrationDeadline: row.registration_deadline ? iso(row.registration_deadline) : undefined,
    registration: row.registration,
  };
}

export async function listStoredLectures(): Promise<Lecture[]> {
  const db = await getDb();
  const rows = await db.query<LectureRow>(`select * from lectures order by starts_at`);
  return rows.map(toLecture);
}

export async function getStoredLecture(slug: string): Promise<Lecture | undefined> {
  const db = await getDb();
  const rows = await db.query<LectureRow>(`select * from lectures where slug = $1`, [slug]);
  return rows[0] ? toLecture(rows[0]) : undefined;
}

export async function saveStoredLecture(lecture: Lecture): Promise<void> {
  const db = await getDb();
  await db.query(
    `insert into lectures
       (slug, title, description, starts_at, duration_minutes, time_zone, language, platform, paid,
        capacity, registration_deadline, registration)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     on conflict (slug) do update set
       title = excluded.title, description = excluded.description, starts_at = excluded.starts_at,
       duration_minutes = excluded.duration_minutes, time_zone = excluded.time_zone,
       language = excluded.language, platform = excluded.platform, paid = excluded.paid,
       capacity = excluded.capacity, registration_deadline = excluded.registration_deadline,
       registration = excluded.registration, updated_at = now()`,
    [
      lecture.slug,
      lecture.title,
      lecture.description,
      lecture.startsAt,
      lecture.durationMinutes,
      lecture.timeZone,
      lecture.language,
      lecture.platform,
      lecture.paid,
      lecture.capacity ?? null,
      lecture.registrationDeadline ?? null,
      lecture.registration,
    ],
  );
}

export async function setStoredLectureRegistration(slug: string, registration: Lecture["registration"]) {
  const db = await getDb();
  await db.query(`update lectures set registration = $2, updated_at = now() where slug = $1`, [slug, registration]);
}

/** Deletes a lecture only if nobody has registered for it. Returns false otherwise. */
export async function deleteStoredLecture(slug: string): Promise<boolean> {
  const db = await getDb();
  return db.transaction(async (q) => {
    const [{ n }] = await q<{ n: number }>(`select count(*)::int as n from registrations where lecture_slug = $1`, [slug]);
    if (Number(n) > 0) return false;
    await q(`delete from lecture_access where lecture_slug = $1`, [slug]);
    await q(`delete from lectures where slug = $1`, [slug]);
    return true;
  });
}

/** A unique, readable URL slug such as "tafseer-surah-al-asr-2026-11-04". */
export function uniqueSlug(title: string, startsAt: string, taken: string[]): string {
  const base =
    `${title}`
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .slice(0, 60)
      .replace(/-+$/, "") || "lecture";
  const stem = `${base}-${startsAt.slice(0, 10)}`;
  let slug = stem;
  for (let i = 2; taken.includes(slug); i++) slug = `${stem}-${i}`;
  return slug;
}

/**
 * Converts a wall-clock date and time in an IANA time zone (as typed in the
 * admin form) to an exact instant, e.g. ("2026-11-04", "22:00", "Asia/Karachi")
 * → 2026-11-04T17:00:00.000Z. Handles daylight-saving offsets.
 */
export function zonedTimeToIso(date: string, time: string, timeZone: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m || !t) return null;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
  const offsetAt = (instant: number) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .formatToParts(new Date(instant))
        .map((p) => [p.type, p.value]),
    );
    const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
    return asUtc - instant;
  };
  let instant = wall - offsetAt(wall);
  instant = wall - offsetAt(instant); // second pass settles daylight-saving edges
  return new Date(instant).toISOString();
}

/** The wall-clock date and time of an instant in a time zone, for pre-filling the form. */
export function isoToZonedParts(iso: string, timeZone: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
