import Link from "next/link";
import { Suspense } from "react";
import type { Lecture } from "@/content/lectures";
import { formatDate, formatDuration, formatPrice, formatTime, timeZoneLabel } from "@/lib/format";
import { getLecturesWithStatus } from "@/lib/lecture-data";
import { statusLabel, type LectureStatus } from "@/lib/lecture-status";
import { ArrowRightIcon, BookOpenIcon, ClockIcon, GlobeIcon, HourglassIcon, ScreenIcon } from "./icons";

export function LiveLectures() {
  return (
    <section id="lectures" aria-labelledby="lectures-title" className="bg-forest text-ivory">
      <div className="container-page py-20 md:py-24">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow text-brass-light">Online · with registration</p>
            <h2 id="lectures-title" className="mt-4 text-[2.5rem] leading-[1.05] tracking-[-0.015em] md:text-[3.5rem]">
              Live lectures
            </h2>
          </div>
          <p className="max-w-[24rem] text-ivory/80 md:col-span-5 md:justify-self-end md:pb-3">
            Register for an upcoming session. Joining details are shared privately with confirmed participants.
          </p>
        </div>

        <div className="mt-12">
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
  return { day: part({ day: "2-digit" }), month: part({ month: "short" }), weekday: part({ weekday: "long" }) };
}

/** Badge text and style for a card. Open lectures show whether they are paid. */
function badge(lecture: Lecture, status: LectureStatus): { text: string; className: string } {
  if (status === "open") {
    return lecture.price ? { text: "Paid", className: "badge-paid" } : { text: "Free", className: "badge-free" };
  }
  const text: Record<Exclude<LectureStatus, "open">, string> = {
    upcoming: "Upcoming",
    live: "Live now",
    full: "Fully booked",
    closed: "Closed",
    completed: "Completed",
  };
  return { text: text[status], className: status === "live" ? "badge-free" : "badge-brass" };
}

async function LectureList() {
  const all = await getLecturesWithStatus();
  const current = all.filter((item) => item.status !== "completed");
  const past = all.filter((item) => item.status === "completed").slice(0, 3);

  if (!current.length) {
    return (
      <div className="panel flex flex-col gap-8 p-8 text-ink md:flex-row md:items-center md:justify-between md:p-10">
        <div className="flex gap-5">
          <BookOpenIcon size={40} className="shrink-0 text-brass-dark" />
          <div>
            <p className="font-serif text-[1.625rem] leading-snug text-balance md:text-[2rem]">
              New lecture details will be announced here.
            </p>
            <p className="mt-2 max-w-[30rem] text-soft">
              In the meantime, recent majalis are available to watch in full.
            </p>
          </div>
        </div>
        <Link href="#recordings" className="button shrink-0 self-start md:self-center">
          Watch recorded lectures
          <ArrowRightIcon className="arrow" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {current.map(({ lecture, status }) => {
          const { day, month, weekday } = dateParts(lecture);
          const open = status === "open";
          const label = badge(lecture, status);
          return (
            <li key={lecture.slug} className="panel relative flex flex-col p-6 text-ink md:p-7">
              <span className={`badge badge-dot absolute right-5 top-5 ${label.className}`}>
                {label.text}
                <span className="sr-only"> — {statusLabel[status]}</span>
              </span>

              <div className="grid grid-cols-[4.5rem_1fr] gap-x-3">
                <time dateTime={lecture.startsAt} className="block pt-1 leading-none">
                  <span className="block font-serif text-[2.625rem] text-brass-dark">{day}</span>
                  <span className="mt-2 block text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-forest">
                    {month}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-soft">{weekday}</span>
                </time>
                <div className="min-w-0 pt-9">
                  <h3 className="text-[1.4375rem] leading-[1.2]">
                    <Link href={`/lectures/${lecture.slug}`} className="transition-colors hover:text-forest">
                      {lecture.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.9375rem] text-soft">{lecture.description}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-2 text-[0.9375rem]">
                <div className="flex items-center gap-2.5">
                  <dt className="text-brass-dark">
                    <ClockIcon size={18} />
                    <span className="sr-only">Time</span>
                  </dt>
                  <dd>
                    {formatTime(lecture.startsAt, lecture.timeZone)}{" "}
                    <span className="text-soft">({timeZoneLabel(lecture.timeZone)})</span>
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <div className="flex items-center gap-2.5">
                    <dt className="text-brass-dark">
                      <HourglassIcon size={18} />
                      <span className="sr-only">Duration</span>
                    </dt>
                    <dd>{formatDuration(lecture.durationMinutes)}</dd>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <dt className="text-brass-dark">
                      <ScreenIcon size={18} />
                      <span className="sr-only">Platform</span>
                    </dt>
                    <dd>{lecture.platform}</dd>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <dt className="text-brass-dark">
                      <GlobeIcon size={18} />
                      <span className="sr-only">Language</span>
                    </dt>
                    <dd>{lecture.language}</dd>
                  </div>
                </div>
              </dl>

              {open && lecture.registrationDeadline ? (
                <p className="mt-4 text-[0.875rem] text-soft">
                  Registration closes {formatDate(lecture.registrationDeadline, lecture.timeZone)}
                </p>
              ) : null}

              <div aria-hidden className="min-h-6 flex-1" />
              <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
                <p className="font-serif text-[1.625rem] leading-none">{formatPrice(lecture.price)}</p>
                <Link href={`/lectures/${lecture.slug}`} className="button min-h-[2.75rem] px-4 py-2 text-[0.9375rem]">
                  {open ? "Register" : "View details"}
                  <span className="sr-only"> — {lecture.title}</span>
                  <ArrowRightIcon className="arrow" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

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
