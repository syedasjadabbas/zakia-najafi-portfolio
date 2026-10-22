import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getLectures, type Lecture } from "@/content/lectures";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { isEmailConfigured } from "@/lib/email";
import { formatPrice, formatTime } from "@/lib/format";
import { getLiveMethodIds } from "@/lib/payment-gateways";
import {
  getAllAccessInstructions,
  listRegistrations,
  type Registration,
  type RegistrationStatus,
} from "@/lib/registrations";
import { isoToZonedParts, listStoredLectures } from "@/lib/lecture-store";
import {
  approveRegistration,
  deleteLecture,
  logout,
  rejectRegistration,
  saveAccessInstructions,
  setLectureRegistration,
} from "./actions";
import { LectureForm, type LectureFormValues } from "./lecture-form";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main id="main" className="container-page pb-24 pt-6 md:pt-8">
      <Suspense fallback={<p className="mt-10 text-soft">Loading…</p>}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function AdminContent({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await connection(); // configuration is read from the environment at request time
  if (!isAdminConfigured()) {
    return (
      <Gate>
        <p className="mt-3 text-soft">
          Administration is not configured. Set <code>ADMIN_PASSWORD</code> and a <code>SESSION_SECRET</code> of at
          least 32 characters in the environment, then restart the server.
        </p>
      </Gate>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Gate>
        <LoginForm />
      </Gate>
    );
  }

  const edit = (await searchParams).edit;
  return <Dashboard editSlug={typeof edit === "string" ? edit : null} />;
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-[12vh] max-w-[22rem]">
      <p className="eyebrow">Zakia Batool Najafi</p>
      <h1 className="mt-2 font-serif text-[2rem]">Administration</h1>
      {children}
      <p className="mt-10 text-[0.875rem]">
        <Link href="/" className="link tap text-soft">
          Back to the website
        </Link>
      </p>
    </div>
  );
}

const statusText: Record<RegistrationStatus, string> = {
  pending_payment: "Awaiting payment",
  pending_verification: "To verify",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const registrationText: Record<Lecture["registration"], string> = {
  open: "Registration open",
  closed: "Registration closed",
  "not-yet-open": "Opens later",
};

/** Today's date in Pakistan, for the form's default. */
function todayInKarachi() {
  return isoToZonedParts(new Date().toISOString(), "Asia/Karachi").date;
}

const hasEnded = (lecture: Lecture) =>
  new Date(lecture.startsAt).getTime() + lecture.durationMinutes * 60_000 < Date.now();

async function Dashboard({ editSlug }: { editSlug: string | null }) {
  const [lectures, registrations, access, stored] = await Promise.all([
    getLectures(),
    listRegistrations(),
    getAllAccessInstructions(),
    listStoredLectures(),
  ]);
  const storedSlugs = new Set(stored.map((l) => l.slug));
  const editing = editSlug ? stored.find((l) => l.slug === editSlug) : undefined;
  const formValues: LectureFormValues = editing
    ? {
        slug: editing.slug,
        title: editing.title,
        description: editing.description,
        ...isoToZonedParts(editing.startsAt, editing.timeZone),
        timeZone: editing.timeZone,
        duration: editing.durationMinutes,
        language: editing.language,
        platform: editing.platform,
        paid: editing.paid,
        capacity: editing.capacity ? String(editing.capacity) : "",
        registration: editing.registration,
        instructions: access.get(editing.slug) ?? "",
      }
    : {
        slug: "",
        title: "",
        description: "",
        date: todayInKarachi(),
        time: "22:00",
        timeZone: "Asia/Karachi",
        duration: 60,
        language: "Urdu",
        platform: "Zoom",
        paid: true,
        capacity: "",
        registration: "open",
        instructions: "",
      };

  const upcoming = lectures.filter((l) => !hasEnded(l));
  const past = lectures.filter(hasEnded).reverse();
  const toVerify = registrations.filter((r) => r.status === "pending_verification");
  const confirmed = registrations.filter((r) => r.status === "confirmed").length;
  const titles = new Map(lectures.map((l) => [l.slug, l.title]));
  const byLecture = (slug: string) => registrations.filter((r) => r.lecture_slug === slug);
  const paymentsLive = getLiveMethodIds().length > 0;

  const row = (lecture: Lecture) => (
    <LectureRow
      key={lecture.slug}
      lecture={lecture}
      registrations={byLecture(lecture.slug)}
      stored={storedSlugs.has(lecture.slug)}
      instructions={access.get(lecture.slug) ?? ""}
      editing={lecture.slug === editing?.slug}
    />
  );

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="eyebrow">Zakia Batool Najafi</p>
          <h1 className="font-serif text-[1.625rem] leading-tight">Administration</h1>
        </div>
        <div className="flex items-center gap-5 text-[0.9375rem]">
          <Link href="/" className="link tap text-soft" target="_blank">
            Website
          </Link>
          <form action={logout}>
            <button type="submit" className="link tap text-soft">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <dl className="grid grid-cols-3 border-b border-line">
        {[
          { label: "Upcoming", value: upcoming.length },
          { label: "Confirmed", value: confirmed },
          { label: "To verify", value: toVerify.length, alert: toVerify.length > 0 },
        ].map((stat, i) => (
          <div key={stat.label} className={`min-w-0 py-4 ${i ? "border-l border-line pl-4 md:pl-6" : ""}`}>
            <dt className="text-[0.8125rem] text-soft">{stat.label}</dt>
            <dd className={`mt-0.5 font-serif text-[1.75rem] leading-none ${stat.alert ? "text-brass-dark" : ""}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[0.8125rem] text-soft">
        Online payments {paymentsLive ? "live" : "coming soon"} · Email{" "}
        {isEmailConfigured() ? "sending" : "off, registrants keep their private link"}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <section aria-labelledby="form-title" id="lectures-admin" className="min-w-0 scroll-mt-6 lg:order-2 lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <h2 id="form-title" className="font-serif text-[1.375rem]">
              {editing ? "Edit lecture" : "New lecture"}
            </h2>
            <p className="mb-5 mt-1 text-[0.875rem] text-soft">
              {editing ? editing.title : "Goes live on the website as soon as you publish."}
            </p>
            <LectureForm key={editing?.slug ?? "new"} initial={formValues} />
          </div>
        </section>

        <div className="min-w-0 space-y-12 lg:order-1 lg:col-span-7">
          {toVerify.length ? (
            <section aria-labelledby="verify-title" className="border-l-2 border-brass pl-5">
              <h2 id="verify-title" className="font-serif text-[1.375rem]">
                Payments to verify
              </h2>
              <RegistrantList rows={toVerify} titles={titles} />
            </section>
          ) : null}

          <section aria-labelledby="upcoming-title">
            <h2 id="upcoming-title" className="font-serif text-[1.375rem]">
              Upcoming
            </h2>
            {upcoming.length ? (
              <ul className="mt-3 border-b border-line">{upcoming.map(row)}</ul>
            ) : (
              <p className="mt-3 text-soft">No upcoming lectures. Publish one and it appears here.</p>
            )}
          </section>

          {past.length ? (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-baseline gap-2 font-serif text-[1.375rem] [&::-webkit-details-marker]:hidden">
                Past <span className="text-[1rem] text-soft">({past.length})</span>
                <span aria-hidden className="ml-auto font-sans text-[1rem] text-soft transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="mt-3 border-b border-line">{past.map(row)}</ul>
            </details>
          ) : null}
        </div>
      </div>
    </>
  );
}

function LectureRow({
  lecture,
  registrations,
  stored,
  instructions,
  editing,
}: {
  lecture: Lecture;
  registrations: Registration[];
  stored: boolean;
  instructions: string;
  editing: boolean;
}) {
  const zoned = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: lecture.timeZone, ...options }).format(new Date(lecture.startsAt));
  const confirmed = registrations.filter((r) => r.status === "confirmed").length;

  return (
    <li className={`border-t border-line py-5 ${editing ? "bg-forest-tint/50 -mx-3 px-3" : ""}`}>
      <div className="flex gap-4 md:gap-5">
        <p className="w-12 shrink-0 text-center leading-none" aria-hidden>
          <span className="block font-serif text-[1.75rem]">{zoned({ day: "numeric" })}</span>
          <span className="mt-1 block text-[0.75rem] uppercase tracking-[0.1em] text-soft">{zoned({ month: "short" })}</span>
        </p>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-[1.1875rem] leading-snug">{lecture.title}</h3>
            <p className="shrink-0 text-[0.875rem] tabular-nums" title="Confirmed registrations">
              {confirmed}
              <span className="text-soft">{lecture.capacity ? ` / ${lecture.capacity}` : " confirmed"}</span>
            </p>
          </div>
          <p className="mt-0.5 text-[0.875rem] text-soft">
            <span className="sr-only">{zoned({ dateStyle: "long" })}, </span>
            {zoned({ weekday: "short" })} {formatTime(lecture.startsAt, lecture.timeZone)} · {lecture.paid ? "Paid" : "Free"} ·{" "}
            <span className={lecture.registration === "open" ? "text-forest" : ""}>{registrationText[lecture.registration]}</span>
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.875rem] [--tap-y:30px]">
            {stored ? (
              <>
                <Link href={`/admin?edit=${encodeURIComponent(lecture.slug)}#lectures-admin`} className="link tap text-forest">
                  Edit
                </Link>
                <form action={setLectureRegistration}>
                  <input type="hidden" name="slug" value={lecture.slug} />
                  <input type="hidden" name="registration" value={lecture.registration === "open" ? "closed" : "open"} />
                  <button type="submit" className="link tap text-forest">
                    {lecture.registration === "open" ? "Close registration" : "Open registration"}
                  </button>
                </form>
              </>
            ) : null}
            <Link href={`/lectures/${lecture.slug}`} className="link tap text-soft" target="_blank">
              View
            </Link>
            {stored && registrations.length === 0 ? (
              <form action={deleteLecture}>
                <input type="hidden" name="slug" value={lecture.slug} />
                <button type="submit" className="link tap text-alert">
                  Delete
                </button>
              </form>
            ) : null}
            {!instructions ? <span className="text-brass-dark">No joining link yet</span> : null}
          </div>

          {registrations.length || !stored ? (
            <details className="group mt-3">
              <summary className="tap cursor-pointer list-none text-[0.875rem] text-soft [--tap-y:36px] [&::-webkit-details-marker]:hidden">
                <span className="link">
                  {registrations.length ? `Registrations (${registrations.length})` : "Joining link"}
                </span>
              </summary>
              {!stored ? (
                <form action={saveAccessInstructions} className="mt-3">
                  <input type="hidden" name="slug" value={lecture.slug} />
                  <label htmlFor={`instructions-${lecture.slug}`} className="sr-only">
                    Joining link
                  </label>
                  <textarea
                    id={`instructions-${lecture.slug}`}
                    name="instructions"
                    rows={2}
                    defaultValue={instructions}
                    placeholder="Meeting link, ID, passcode"
                    className="field font-mono text-[0.875rem]"
                  />
                  <button type="submit" className="link mt-2 text-[0.875rem] text-forest">
                    Save joining link
                  </button>
                </form>
              ) : null}
              {registrations.length ? <RegistrantList rows={registrations} /> : null}
            </details>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function RegistrantList({ rows, titles }: { rows: Registration[]; titles?: Map<string, string> }) {
  return (
    <ul className="mt-3 divide-y divide-line border-y border-line text-[0.875rem]">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-3">
          <div className="min-w-0">
            <p>
              {r.name} <span className="text-soft">· {statusText[r.status]}</span>
            </p>
            <p className="break-all text-soft">
              {r.email}
              {r.whatsapp ? ` · WhatsApp ${r.whatsapp}` : ""}
            </p>
            <p className="text-soft">
              {titles ? `${titles.get(r.lecture_slug) ?? r.lecture_slug} · ` : ""}
              {r.amount_minor !== null && r.currency ? formatPrice({ amount: r.amount_minor, currency: r.currency }) : "Free"}
              {r.payment_method !== "free" && r.payment_method !== "manual"
                ? ` · ${{ stripe: "Card", jazzcash: "JazzCash", easypaisa: "Easypaisa" }[r.payment_method]}`
                : ""}
              {r.payment_reference ? <span className="font-mono"> · {r.payment_reference}</span> : null}
              {" · "}
              {new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <div className="flex gap-4">
            {r.status === "pending_verification" || (r.status === "rejected" && r.payment_method === "manual") ? (
              <form action={approveRegistration}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="link tap text-forest">
                  Approve<span className="sr-only"> {r.name}</span>
                </button>
              </form>
            ) : null}
            {r.status === "pending_verification" || r.status === "confirmed" ? (
              <form action={rejectRegistration}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="link tap text-alert">
                  {r.status === "confirmed" ? "Revoke" : "Reject"}
                  <span className="sr-only"> {r.name}</span>
                </button>
              </form>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
