import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Lecture } from "@/content/lectures";
import { formatDate, formatDuration, formatTime, timeZoneLabel } from "@/lib/format";
import { getLecturesWithStatus } from "@/lib/lecture-data";
import type { LectureStatus } from "@/lib/lecture-status";
import { ArrowRightIcon, ClockIcon, GlobeIcon, HourglassIcon, ScreenIcon } from "./icons";

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
          <Suspense
            fallback={
              // Reserves the height of the finished content so the page doesn't jump
              // (and links to sections further down land in the right place).
              <div className="panel flex min-h-[487px] items-center p-8 text-soft md:min-h-[315px] md:p-10 xl:min-h-[274px]">
                Loading lectures…
              </div>
            }
          >
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

/** Short status label. Fees are shown only inside registration, never here. */
const statusText: Record<LectureStatus, string> = {
  open: "Registration open",
  live: "Live now",
  upcoming: "Opens soon",
  full: "Fully booked",
  closed: "Registration closed",
  completed: "Completed",
};

const actionText = (status: LectureStatus) => (status === "open" ? "Register" : "View details");

function Meta({ lecture, tone }: { lecture: Lecture; tone: "light" | "dark" }) {
  const icon = tone === "light" ? "text-brass-dark" : "text-brass-light";
  const muted = tone === "light" ? "text-soft" : "text-ivory/70";
  const items = [
    { Icon: ClockIcon, label: "Time", value: <>{formatTime(lecture.startsAt, lecture.timeZone)} <span className={muted}>({timeZoneLabel(lecture.timeZone)})</span></> },
    { Icon: HourglassIcon, label: "Duration", value: formatDuration(lecture.durationMinutes) },
    { Icon: ScreenIcon, label: "Platform", value: lecture.platform },
    { Icon: GlobeIcon, label: "Language", value: lecture.language },
  ];
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
      {items.map(({ Icon, label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <dt className={icon}>
            <Icon size={17} />
            <span className="sr-only">{label}</span>
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The next lecture, given a wide panel of its own. */
function FeaturedLecture({ lecture, status }: { lecture: Lecture; status: LectureStatus }) {
  const { day, month, weekday } = dateParts(lecture);
  const open = status === "open";
  return (
    <article className="panel grid overflow-hidden text-ink lg:grid-cols-[13rem_1fr_17rem]">
      <time
        dateTime={lecture.startsAt}
        className="flex items-baseline gap-3 border-b border-line px-6 py-4 sm:gap-4 sm:px-7 sm:py-6 lg:block lg:border-b-0 lg:border-r lg:px-8 lg:py-9"
      >
        <span className="block font-serif text-[2.75rem] leading-none text-brass-dark sm:text-[3.5rem] lg:text-[5rem]">{day}</span>
        {/* phones: month and weekday on one line beside the day; from sm, stacked */}
        <span className="flex items-baseline gap-2 sm:block lg:mt-3">
          <span className="block text-[0.875rem] font-medium uppercase tracking-[0.14em] text-forest">{month}</span>
          <span className="block text-[0.9375rem] text-soft sm:mt-0.5">{weekday}</span>
        </span>
      </time>

      <div className="px-6 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-9">
        <p className="eyebrow">Next lecture</p>
        <h3 className="mt-3 text-[1.875rem] leading-[1.15] md:text-[2.25rem]">
          <Link href={`/lectures/${lecture.slug}`} className="transition-colors hover:text-forest">
            {lecture.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-[40rem] text-soft">{lecture.description}</p>
        <div className="mt-6">
          <Meta lecture={lecture} tone="light" />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 border-t border-line bg-sand/50 px-6 py-6 sm:gap-6 sm:px-7 sm:py-7 lg:border-l lg:border-t-0 lg:px-8 lg:py-9">
        <div>
          <p className={`text-[0.8125rem] font-medium uppercase tracking-[0.12em] ${open ? "text-forest" : "text-brass-dark"}`}>
            {statusText[status]}
          </p>
          {open && lecture.registrationDeadline ? (
            <p className="mt-2 text-[0.9375rem] text-soft">
              Closes {formatDate(lecture.registrationDeadline, lecture.timeZone)}
            </p>
          ) : null}
          {!lecture.paid ? <p className="mt-2 text-[0.9375rem] text-soft">Free admission</p> : null}
        </div>
        <Link href={`/lectures/${lecture.slug}`} className="button w-full justify-between">
          {actionText(status)}
          <span className="sr-only"> — {lecture.title}</span>
          <ArrowRightIcon className="arrow" />
        </Link>
      </div>
    </article>
  );
}

/** Later lectures, as rows of a printed programme. */
function LectureRow({ lecture, status }: { lecture: Lecture; status: LectureStatus }) {
  const { day, month, weekday } = dateParts(lecture);
  return (
    <li className="border-b border-ivory/15">
      <Link
        href={`/lectures/${lecture.slug}`}
        className="group grid gap-x-8 gap-y-3 py-6 transition-colors hover:bg-ivory/[0.04] sm:grid-cols-[6rem_1fr] lg:grid-cols-[7rem_1fr_11rem_9rem] lg:items-center lg:px-2"
      >
        <time dateTime={lecture.startsAt} className="flex items-baseline gap-3 sm:block">
          <span className="font-serif text-[2.25rem] leading-none text-brass-light">{day}</span>
          <span className="text-[0.8125rem] uppercase tracking-[0.12em] text-ivory/80 sm:mt-1.5 sm:block">
            {month} · {weekday.slice(0, 3)}
          </span>
        </time>
        <div className="min-w-0">
          <span className="block font-serif text-[1.5rem] leading-snug transition-colors group-hover:text-brass-light">
            {lecture.title}
          </span>
          <div className="mt-2 text-ivory/85">
            <Meta lecture={lecture} tone="dark" />
          </div>
        </div>
        <span className="text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-ivory/70 sm:col-start-2 lg:col-start-auto">
          {statusText[status]}
          {!lecture.paid ? <span className="mt-1 block normal-case tracking-normal">Free admission</span> : null}
        </span>
        <span className="inline-flex items-center gap-2 font-serif text-[1.1875rem] sm:col-start-2 lg:col-start-auto lg:justify-end">
          <span className="underline decoration-ivory/40 decoration-1 underline-offset-[0.35em] group-hover:decoration-ivory">
            {actionText(status)}
          </span>
          <span className="sr-only"> — {lecture.title}</span>
          <ArrowRightIcon size={16} className="arrow" />
        </span>
      </Link>
    </li>
  );
}

async function LectureList() {
  const all = await getLecturesWithStatus();
  const current = all.filter((item) => item.status !== "completed");
  const past = all.filter((item) => item.status === "completed").slice(0, 3);

  if (!current.length) {
    return (
      <div className="panel grid overflow-hidden text-ink md:grid-cols-12">
        <div className="relative aspect-[16/10] md:col-span-5 md:aspect-auto md:min-h-[17rem]">
          <Image
            src="/images/live-lectures-desk.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover object-[40%_55%]"
          />
        </div>
        <div className="flex flex-col items-start justify-center gap-7 p-8 md:col-span-7 md:p-10 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-serif text-[1.625rem] leading-snug text-balance md:text-[2rem]">
              New lecture details will be announced here.
            </p>
            <p className="mt-2 max-w-[30rem] text-soft">
              In the meantime, recent majalis are available to watch in full.
            </p>
          </div>
          <Link href="#recordings" className="button shrink-0">
            Watch recorded lectures
            <ArrowRightIcon className="arrow" />
          </Link>
        </div>
      </div>
    );
  }

  const [next, ...later] = current;

  return (
    <div>
      <FeaturedLecture lecture={next.lecture} status={next.status} />

      {later.length ? (
        <div className="mt-14">
          <h3 className="eyebrow text-brass-light">Also coming up</h3>
          <ul className="mt-5 border-t border-ivory/15">
            {later.map(({ lecture, status }) => (
              <LectureRow key={lecture.slug} lecture={lecture} status={status} />
            ))}
          </ul>
        </div>
      ) : null}

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
