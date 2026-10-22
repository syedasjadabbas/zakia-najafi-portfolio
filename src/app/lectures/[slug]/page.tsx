import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLecture } from "@/content/lectures";
import { formatDate, formatDuration, formatTime, timeZoneLabel } from "@/lib/format";
import { getLectureWithStatus } from "@/lib/lecture-data";
import { statusLabel } from "@/lib/lecture-status";
import { getLiveMethodIds } from "@/lib/payment-gateways";
import { RegistrationForm } from "./registration-form";

export async function generateMetadata({ params }: PageProps<"/lectures/[slug]">): Promise<Metadata> {
  await connection(); // lectures come from the database, so read them at request time
  const lecture = await getLecture((await params).slug);
  if (!lecture) return { title: "Lecture not found" };
  return {
    title: lecture.title,
    description: lecture.description,
    alternates: { canonical: `/lectures/${lecture.slug}` },
  };
}

export default function LecturePage({ params }: PageProps<"/lectures/[slug]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page pb-24 pt-10 md:pb-32 md:pt-14">
        <p className="text-[0.9375rem]">
          <Link href="/#lectures" className="link tap text-forest">
            ← All live lectures
          </Link>
        </p>
        <Suspense fallback={<p className="mt-10 text-soft">Loading lecture…</p>}>
          <LectureDetails params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function LectureDetails({ params }: { params: PageProps<"/lectures/[slug]">["params"] }) {
  const { slug } = await params;
  const item = await getLectureWithStatus(slug);
  if (!item) notFound();
  const { lecture, status } = item;

  const rows: [string, string][] = [
    ["Date", formatDate(lecture.startsAt, lecture.timeZone)],
    ["Time", `${formatTime(lecture.startsAt, lecture.timeZone)} (${timeZoneLabel(lecture.timeZone)})`],
    ["Duration", formatDuration(lecture.durationMinutes)],
    ["Language", lecture.language],
    ["Online platform", lecture.platform],
    ["Registration", lecture.paid ? "Paid, see payment options" : "Free"],
  ];
  if (lecture.registrationDeadline) {
    rows.push([
      "Registration closes",
      `${formatDate(lecture.registrationDeadline, lecture.timeZone)}, ${formatTime(lecture.registrationDeadline, lecture.timeZone)}`,
    ]);
  }
  rows.push(["Status", statusLabel[status]]);

  const liveMethodIds = lecture.paid ? getLiveMethodIds() : [];

  return (
    <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-12">
      {/* Stays in view beside the longer registration form on wide screens. */}
      <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
        <p className="eyebrow">Live lecture</p>
        <h1 className="mt-4 text-[2.5rem] leading-[1.06] tracking-[-0.018em] md:text-[3.25rem]">{lecture.title}</h1>
        <p className="lead mt-5 max-w-[30rem] text-soft">{lecture.description}</p>
        <dl className="mt-10 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 bg-sand p-6 sm:grid-cols-[9.5rem_1fr] text-[0.9688rem] md:p-8">
          {rows.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-soft">{term}</dt>
              <dd className={term === "Fee" ? "font-serif text-[1.25rem] leading-snug" : ""}>{value}</dd>
            </div>
          ))}
        </dl>

        {/* A real frame from her recording of the 3rd Majlis, Muharram 1448 (youtube.com/watch?v=NEbP26zAs6s), used only here. */}
        <figure className="mt-8 hidden max-w-[32rem] lg:block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-sand">
            <Image
              src="/images/majlis-3-muharram-1448.jpg"
              alt="Zakia Batool Najafi delivering a majlis"
              fill
              quality={90}
              sizes="32rem"
              className="object-cover"
            />
          </div>
        </figure>
      </div>

      <section aria-labelledby="register-title" className="lg:col-span-6 lg:col-start-7 lg:pt-10">
        <h2 id="register-title" className="sr-only">
          Registration
        </h2>
        {status === "open" ? (
          <RegistrationForm
            slug={lecture.slug}
            lectureTitle={lecture.title}
            paid={lecture.paid}
            liveMethodIds={liveMethodIds}
          />
        ) : (
          <div className="border-l-2 border-brass bg-sand px-6 py-7 md:px-8">
            <p className="font-serif text-[1.375rem] leading-relaxed">
              {status === "upcoming"
                  ? "Registration has not opened yet. Please check back soon."
                  : status === "full"
                    ? "This lecture is fully booked."
                    : status === "live"
                      ? "This lecture is in progress. Registered participants can find the joining instructions on their private registration page."
                      : status === "completed"
                        ? "This lecture has taken place."
                        : "Registration for this lecture is closed."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
