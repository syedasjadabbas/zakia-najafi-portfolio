import Link from "next/link";
import { Suspense } from "react";
import type { Lecture } from "@/content/lectures";
import { formatDuration, formatPrice, formatTime, timeZoneLabel } from "@/lib/format";
import { getLecturesWithStatus } from "@/lib/lecture-data";
import { statusLabel, type LectureStatus } from "@/lib/lecture-status";

export function LiveLectures() {
  return (
    <section id="lectures" aria-labelledby="lectures-title" className="bg-forest text-ivory">
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow text-brass-light">Online · with registration</p>
            <h2 id="lectures-title" className="mt-4 text-[2.5rem] leading-[1.05] tracking-[-0.015em] md:text-[3.5rem]">
              Live lectures
            </h2>
          </div>
          <p className="max-w-[26rem] text-ivory/80 md:col-span-5 md:justify-self-end">
            Register for an upcoming session. Joining details are shared privately with confirmed participants.
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <Suspense fallback={<p className="text-ivory/70">Loading lectures…</p>}>
            <LectureList />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function dateParts(lecture: Lecture) {
  const date = new Date(lecture.startsAt);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...options, timeZone: lecture.timeZone }).format(date);
  return { day: part({ day: "numeric" }), month: part({ month: "short" }), weekday: part({ weekday: "long" }) };
}

const statusDot: Record<LectureStatus, string> = {
  open: "bg-brass-light",
  live: "bg-[#9fd3a8]",
  upcoming: "bg-ivory/50",
  closed: "bg-ivory/35",
  full: "bg-ivory/35",
  completed: "bg-ivory/35",
};

async function LectureList() {
  const all = await getLecturesWithStatus();
  const current = all.filter((item) => item.status !== "completed");
  const past = all.filter((item) => item.status === "completed").slice(0, 3);

  if (!current.length) {
    return (
      <div className="grid gap-8 border-t border-ivory/20 pt-10 md:grid-cols-12">
        <p className="font-serif text-[1.75rem] leading-snug text-balance md:col-span-7 md:text-[2.25rem]">
          New lecture details will be announced here.
        </p>
        <div className="md:col-span-5 md:justify-self-end">
          <p className="max-w-[24rem] text-ivory/80">
            In the meantime, recent majalis are available to watch in full.
          </p>
          <Link href="#recordings" className="button button-ghost-light mt-5">
            Watch recorded lectures
            <span aria-hidden className="arrow">
              →
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="border-t border-ivory/20">
        {current.map(({ lecture, status }) => {
          const { day, month, weekday } = dateParts(lecture);
          const open = status === "open";
          return (
            <li
              key={lecture.slug}
              className="grid gap-x-10 gap-y-5 border-b border-ivory/20 py-8 sm:grid-cols-[6.5rem_1fr] md:py-10 lg:grid-cols-[7.5rem_1fr_15rem]"
            >
              <time dateTime={lecture.startsAt} className="flex items-baseline gap-3 sm:block">
                <span className="font-serif text-[3rem] leading-none text-brass-light md:text-[3.75rem]">{day}</span>
                <span className="text-[0.9375rem] font-medium uppercase tracking-[0.1em] sm:mt-2 sm:block">
                  {month}
                </span>
                <span className="text-[0.9375rem] text-ivory/75 sm:block">{weekday}</span>
              </time>

              <div className="min-w-0">
                <h3 className="text-[1.625rem] leading-[1.2] md:text-[2rem]">
                  <Link href={`/lectures/${lecture.slug}`} className="transition-colors hover:text-brass-light">
                    {lecture.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-[36rem] text-ivory/80">{lecture.description}</p>
                <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
                  <div>
                    <dt className="sr-only">Time</dt>
                    <dd>
                      {formatTime(lecture.startsAt, lecture.timeZone)}{" "}
                      <span className="text-ivory/65">({timeZoneLabel(lecture.timeZone)})</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Duration</dt>
                    <dd className="text-ivory/80">{formatDuration(lecture.durationMinutes)}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Language</dt>
                    <dd className="text-ivory/80">{lecture.language}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Platform</dt>
                    <dd className="text-ivory/80">{lecture.platform}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 sm:col-start-2 lg:col-start-auto lg:flex-col lg:items-end lg:justify-start lg:text-right">
                <div>
                  <p className="font-serif text-[1.75rem] leading-none">{formatPrice(lecture.price)}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-[0.9375rem] text-ivory/85">
                    <span aria-hidden className={`h-2 w-2 rounded-full ${statusDot[status]}`} />
                    {statusLabel[status]}
                  </p>
                </div>
                <Link
                  href={`/lectures/${lecture.slug}`}
                  className={`button ${open ? "button-light" : "button-ghost-light"} lg:mt-3`}
                >
                  {open ? "Register" : "View details"}
                  <span className="sr-only"> — {lecture.title}</span>
                  <span aria-hidden className="arrow">
                    →
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {past.length ? (
        <div className="mt-12">
          <h3 className="eyebrow text-brass-light">Recently held</h3>
          <ul className="mt-4 space-y-2">
            {past.map(({ lecture }) => {
              const { day, month } = dateParts(lecture);
              return (
                <li key={lecture.slug} className="text-ivory/85">
                  <span className="font-serif text-[1.25rem] text-ivory">{lecture.title}</span> — {day} {month}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
