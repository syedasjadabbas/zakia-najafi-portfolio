import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getLectures } from "@/content/lectures";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { isEmailConfigured } from "@/lib/email";
import { formatPrice, formatShortDate, formatTime } from "@/lib/format";
import { getLiveMethodIds } from "@/lib/payment-gateways";
import { allPaymentMethods } from "@/lib/payment-options";
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
    <main id="main" className="container-page pb-24 pt-10">
      <p className="text-[0.9375rem]">
        <Link href="/" className="link text-soft">
          ← Website
        </Link>
      </p>
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
      <div className="mt-10 max-w-[36rem]">
        <h1 className="font-serif text-[2.25rem]">Administration</h1>
        <p className="mt-4">
          Administration is not configured. Set <code>ADMIN_PASSWORD</code> and a <code>SESSION_SECRET</code> of at
          least 32 characters in the environment, then restart the server.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) {
    return (
      <div className="mt-10">
        <h1 className="font-serif text-[2.25rem]">Administration</h1>
        <LoginForm />
      </div>
    );
  }

  const edit = (await searchParams).edit;
  return <Dashboard editSlug={typeof edit === "string" ? edit : null} />;
}

const statusText: Record<RegistrationStatus, string> = {
  pending_payment: "Awaiting payment",
  pending_verification: "To verify",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** Today's date in Pakistan, for the form's default. */
function todayInKarachi() {
  return isoToZonedParts(new Date().toISOString(), "Asia/Karachi").date;
}

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
  const toVerify = registrations.filter((r) => r.status === "pending_verification");
  const titles = new Map(lectures.map((l) => [l.slug, l.title]));

  return (
    <div className="mt-10 space-y-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-serif text-[2.25rem]">Administration</h1>
        <form action={logout}>
          <button type="submit" className="link text-[0.9375rem] text-soft">
            Sign out
          </button>
        </form>
      </div>

      <p className="-mt-12 text-[0.875rem] text-soft">
        Online payments:{" "}
        {allPaymentMethods
          .map((m) => `${m.label} ${getLiveMethodIds().includes(m.id) ? "live" : "coming soon"}`)
          .join(", ")}{" "}
        · Email:{" "}
        {isEmailConfigured() ? "sending" : "not configured (registrants rely on their private link)"}
      </p>

      <section id="lectures-admin" aria-labelledby="publish-title" className="scroll-mt-24">
        <h2 id="publish-title" className="font-serif text-[1.625rem]">
          {editing ? `Edit: ${editing.title}` : "Publish a lecture"}
        </h2>
        <p className="mt-2 max-w-[42rem] text-[0.9375rem] text-soft">
          {editing
            ? "Changes appear on the website as soon as you save. The lecture keeps its address, so links you have shared still work."
            : "Fill this in and press Publish: the lecture appears on the website straight away, and the hero button points to it."}
        </p>
        <LectureForm key={editing?.slug ?? "new"} initial={formValues} />
      </section>

      <section aria-labelledby="verify-title">
        <h2 id="verify-title" className="font-serif text-[1.625rem]">
          Payments to verify <span className="text-soft">({toVerify.length})</span>
        </h2>
        {toVerify.length ? (
          <RegistrationTable rows={toVerify} titles={titles} />
        ) : (
          <p className="mt-3 text-soft">Nothing waiting for verification.</p>
        )}
      </section>

      <section aria-labelledby="lectures-title">
        <h2 id="lectures-title" className="font-serif text-[1.625rem]">
          Lectures and joining instructions
        </h2>
        <p className="mt-2 max-w-[42rem] text-[0.9375rem] text-soft">
          Joining instructions are private: they are shown only to confirmed registrants on their own
          registration page. Where the platform allows it (for
          example Zoom registration or waiting rooms), enable participant controls as well — a shared link cannot
          be fully prevented.
        </p>
        {lectures.length ? (
          <ul className="mt-6 border-b border-line">
            {lectures.map((lecture) => {
              const forLecture = registrations.filter((r) => r.lecture_slug === lecture.slug);
              const confirmed = forLecture.filter((r) => r.status === "confirmed").length;
              return (
                <li key={lecture.slug} className="grid gap-6 border-t border-line py-6 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className="font-serif text-[1.25rem]">{lecture.title}</p>
                    <p className="mt-1 text-[0.875rem] text-soft">
                      {formatShortDate(lecture.startsAt, lecture.timeZone)} ·{" "}
                      {formatTime(lecture.startsAt, lecture.timeZone)} · {lecture.paid ? "Paid" : "Free"}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-soft">
                      {confirmed} confirmed{lecture.capacity ? ` of ${lecture.capacity}` : ""} · {forLecture.length}{" "}
                      total · Registration{" "}
                      {{ open: "open", closed: "closed", "not-yet-open": "opens later" }[lecture.registration]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem]">
                      <Link href={`/lectures/${lecture.slug}`} className="link text-soft" target="_blank">
                        View
                      </Link>
                      {storedSlugs.has(lecture.slug) ? (
                        <>
                          <Link href={`/admin?edit=${encodeURIComponent(lecture.slug)}#lectures-admin`} className="link text-forest">
                            Edit
                          </Link>
                          <form action={setLectureRegistration}>
                            <input type="hidden" name="slug" value={lecture.slug} />
                            <input
                              type="hidden"
                              name="registration"
                              value={lecture.registration === "open" ? "closed" : "open"}
                            />
                            <button type="submit" className="link text-forest">
                              {lecture.registration === "open" ? "Close registration" : "Open registration"}
                            </button>
                          </form>
                          {forLecture.length === 0 ? (
                            <form action={deleteLecture}>
                              <input type="hidden" name="slug" value={lecture.slug} />
                              <button type="submit" className="link text-alert">
                                Delete
                              </button>
                            </form>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-soft">Defined in code</span>
                      )}
                    </div>
                  </div>
                  <form action={saveAccessInstructions} className="md:col-span-8">
                    <input type="hidden" name="slug" value={lecture.slug} />
                    <label htmlFor={`instructions-${lecture.slug}`} className="block text-[0.875rem] font-medium">
                      Joining instructions
                    </label>
                    <textarea
                      id={`instructions-${lecture.slug}`}
                      name="instructions"
                      rows={4}
                      defaultValue={access.get(lecture.slug) ?? ""}
                      placeholder="Meeting link, meeting ID, passcode and any notes"
                      className="field mt-2 font-mono text-[0.875rem]"
                    />
                    <button type="submit" className="link mt-2 text-[0.9375rem] text-forest">
                      Save instructions
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-soft">No lectures yet. Publish one above.</p>
        )}
      </section>

      <section aria-labelledby="all-title">
        <h2 id="all-title" className="font-serif text-[1.625rem]">
          All registrations <span className="text-soft">({registrations.length})</span>
        </h2>
        {registrations.length ? (
          <RegistrationTable rows={registrations} titles={titles} />
        ) : (
          <p className="mt-3 text-soft">No registrations yet.</p>
        )}
      </section>
    </div>
  );
}

function RegistrationTable({ rows, titles }: { rows: Registration[]; titles: Map<string, string> }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left text-[0.875rem]">
        <thead className="text-soft">
          <tr className="border-b border-line">
            <th className="py-2 pr-4 font-normal">Name and email</th>
            <th className="py-2 pr-4 font-normal">Lecture</th>
            <th className="py-2 pr-4 font-normal">Payment</th>
            <th className="py-2 pr-4 font-normal">Status</th>
            <th className="py-2 font-normal">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line align-top">
              <td className="py-3 pr-4">
                {r.name}
                <br />
                <span className="text-soft">{r.email}</span>
                {r.whatsapp ? (
                  <>
                    <br />
                    <span className="text-soft">WhatsApp {r.whatsapp}</span>
                  </>
                ) : null}
              </td>
              <td className="py-3 pr-4">{titles.get(r.lecture_slug) ?? r.lecture_slug}</td>
              <td className="py-3 pr-4">
                {r.amount_minor !== null && r.currency
                  ? formatPrice({ amount: r.amount_minor, currency: r.currency })
                  : "Free"}
                {r.payment_reference ? (
                  <>
                    <br />
                    <span className="break-all font-mono text-soft">{r.payment_reference}</span>
                  </>
                ) : null}
                {r.payment_method !== "free" && r.payment_method !== "manual" ? (
                  <span className="text-soft">
                    {" "}
                    · {{ stripe: "Card", jazzcash: "JazzCash", easypaisa: "Easypaisa" }[r.payment_method]}
                  </span>
                ) : null}
              </td>
              <td className="py-3 pr-4">
                {statusText[r.status]}
                <br />
                <span className="text-soft">{new Date(r.created_at).toLocaleString("en-GB")}</span>
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-4">
                  {r.status === "pending_verification" || (r.status === "rejected" && r.payment_method === "manual") ? (
                    <form action={approveRegistration}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="link text-forest">
                        Approve<span className="sr-only"> {r.name}</span>
                      </button>
                    </form>
                  ) : null}
                  {r.status === "pending_verification" || r.status === "confirmed" ? (
                    <form action={rejectRegistration}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="link text-alert">
                        {r.status === "confirmed" ? "Revoke" : "Reject"}
                        <span className="sr-only"> {r.name}</span>
                      </button>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
