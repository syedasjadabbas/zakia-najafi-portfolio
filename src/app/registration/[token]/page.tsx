import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLecture } from "@/content/lectures";
import { formatDate, formatPrice, formatTime, timeZoneLabel } from "@/lib/format";
import { getAccessInstructions, getRegistrationByToken, type RegistrationStatus } from "@/lib/registrations";

export const metadata: Metadata = {
  title: "Your registration",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RegistrationPage({ params }: PageProps<"/registration/[token]">) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[44rem] px-5 pb-24 pt-12 md:pt-16">
        <Suspense fallback={<p className="text-soft">Loading your registration…</p>}>
          <RegistrationDetails params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

const headline: Record<RegistrationStatus, string> = {
  pending_payment: "Awaiting payment",
  pending_verification: "Payment being verified",
  confirmed: "Your place is confirmed",
  rejected: "Registration not confirmed",
  cancelled: "Registration cancelled",
};

const explanation: Record<RegistrationStatus, string> = {
  pending_payment:
    "We have not yet received confirmation of your payment. If you have just paid, this page will update within a few minutes — please refresh it.",
  pending_verification:
    "Thank you. Your payment reference has been received and will be checked by hand. Once it is verified, this page will show your confirmation and joining instructions.",
  confirmed: "Thank you for registering.",
  rejected:
    "Your payment could not be verified, so this registration was not confirmed. If you believe this is a mistake, please get in touch.",
  cancelled: "The payment was not completed and this registration has been cancelled. You are welcome to register again.",
};

async function RegistrationDetails({ params }: { params: PageProps<"/registration/[token]">["params"] }) {
  await connection();
  const { token } = await params;
  const registration = await getRegistrationByToken(token);

  if (!registration) {
    return (
      <div>
        <h1 className="font-serif text-[2.25rem] leading-tight">Registration not found</h1>
        <p className="font-serif text-[1.25rem] leading-relaxed mt-4">
          This link is not valid. Please check that you copied the complete link from your confirmation.
        </p>
        <p className="mt-8">
          <Link href="/#lectures" className="link">
            View live lectures
          </Link>
        </p>
      </div>
    );
  }

  const lecture = await getLecture(registration.lecture_slug);
  const instructions =
    registration.status === "confirmed" ? await getAccessInstructions(registration.lecture_slug) : null;
  const price =
    registration.amount_minor !== null && registration.currency
      ? formatPrice({ amount: registration.amount_minor, currency: registration.currency })
      : "Free";

  return (
    <div>
      <p className="text-[0.9375rem] text-soft">Registration for {registration.name}</p>
      <h1 className="mt-2 font-serif text-[2.25rem] leading-tight tracking-[-0.01em] md:text-[2.625rem]">
        {headline[registration.status]}
      </h1>
      <p className="font-serif text-[1.25rem] leading-relaxed mt-4">{explanation[registration.status]}</p>

      <dl className="mt-10 grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-2 border-t border-line pt-6 text-[0.9375rem]">
        <dt className="text-soft">Lecture</dt>
        <dd>{lecture?.title ?? registration.lecture_slug}</dd>
        {lecture ? (
          <>
            <dt className="text-soft">When</dt>
            <dd>
              {formatDate(lecture.startsAt, lecture.timeZone)}, {formatTime(lecture.startsAt, lecture.timeZone)} (
              {timeZoneLabel(lecture.timeZone)})
            </dd>
            <dt className="text-soft">Platform</dt>
            <dd>{lecture.platform}</dd>
          </>
        ) : null}
        <dt className="text-soft">Fee</dt>
        <dd>{price}</dd>
        {registration.payment_reference ? (
          <>
            <dt className="text-soft">Reference</dt>
            <dd className="break-all">{registration.payment_reference}</dd>
          </>
        ) : null}
        <dt className="text-soft">Email</dt>
        <dd className="break-all">{registration.email}</dd>
      </dl>

      {registration.status === "confirmed" ? (
        <section aria-labelledby="joining-title" className="mt-12">
          <h2 id="joining-title" className="font-serif text-[1.5rem]">
            Joining instructions
          </h2>
          {instructions ? (
            <div className="mt-4 whitespace-pre-line border-l-2 border-forest bg-sand px-5 py-4">
              <Linkified text={instructions} />
            </div>
          ) : (
            <p className="mt-3 text-soft">
              Joining instructions will appear on this page before the lecture. Please return to this link
              closer to the time.
            </p>
          )}
          <p className="mt-4 text-[0.875rem] text-soft">
            These details are for you only. Please do not share them or this page.
          </p>
        </section>
      ) : null}

      <p className="mt-12 border-t border-line pt-6 text-[0.875rem] text-soft">
        Keep this page’s address safe — it is your private link to this registration.
      </p>
    </div>
  );
}

/** Renders plain text, turning http(s) URLs into links. */
function Linkified({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /https?:\/\/[^\s<>"]+/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    parts.push(text.slice(last, start));
    parts.push(
      <a key={start} href={match[0]} className="link break-all" target="_blank" rel="noopener noreferrer">
        {match[0]}
      </a>,
    );
    last = start + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
