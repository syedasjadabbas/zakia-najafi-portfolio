import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import { RETENTION_MONTHS } from "@/lib/retention";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name}'s website uses the information given when registering for a lecture.`,
  alternates: { canonical: "/privacy" },
};

/** Update this date whenever the notice changes. */
const LAST_UPDATED = "23 October 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page max-w-[48rem] pb-24 pt-12 md:pt-16">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-4 text-[2.5rem] leading-tight tracking-[-0.015em] md:text-[3rem]">Your information</h1>
        <p className="mt-4 text-[0.9375rem] text-soft">Last updated {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-[1.0625rem] leading-[1.75] text-soft md:text-[1.125rem]">
          <Section title="Who is responsible">
            <p>
              This website belongs to {site.name}, who is responsible for the information collected through it.
            </p>
          </Section>

          <Section title="What is collected">
            <p>Personal information is collected only when you register for a live lecture:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>your name and email address;</li>
              <li>your WhatsApp number, if you choose to give it;</li>
              <li>the lecture you registered for, and when;</li>
              <li>
                for paid lectures, the payment method and amount, and the payment confirmation or reference from the
                payment provider.
              </li>
            </ul>
            <p>Card details, wallet PINs and one-time codes are entered only on the payment provider&rsquo;s own pages and never reach this website.</p>
          </Section>

          <Section title="Why it is used, and the legal basis">
            <p>
              Only to manage your registration: to confirm your place, check payment, show you the joining details for
              the lecture and, where needed, contact you about it. It is not sold, and it is not used or shared for
              marketing.
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Your name, email address and payment details are needed to provide the place you asked for. Without
                them you cannot be registered.
              </li>
              <li>
                Your WhatsApp number is optional and used only with your consent, which you can withdraw at any time.
              </li>
              <li>
                Keeping an accurate record of who registered and attended is in the legitimate interest of running the
                lectures fairly.
              </li>
            </ul>
            <p>No decisions about you are made automatically.</p>
          </Section>

          <Section title="Your private registration link">
            <p>
              After registering you receive a private link to your registration page, where your joining details
              appear once your place is confirmed. Anyone with that link can see the page, so please keep it to
              yourself.
            </p>
          </Section>

          <Section title="Who else handles it">
            <ul className="list-disc space-y-1 pl-6">
              <li>The website and its database are hosted by Vercel and a hosted PostgreSQL database service.</li>
              <li>If email notifications are switched on, messages to you are sent through Resend.</li>
              <li>Paid lectures are processed by the payment provider you choose (JazzCash, Easypaisa or a card payment provider).</li>
            </ul>
            <p>
              They receive only what they need to provide their service. Some of them store data outside your country,
              including in the United States; where they do, they protect it under their standard data-protection terms
              (such as standard contractual clauses).
            </p>
          </Section>

          <Section title="Recordings and cookies">
            <p>
              Recorded lectures are YouTube videos. Nothing is loaded from YouTube until you press play; the player
              then comes from YouTube&rsquo;s privacy-enhanced domain (youtube-nocookie.com), and YouTube&rsquo;s own
              privacy policy applies to it. Links that open YouTube, Instagram, Facebook, X or Threads take you to those
              sites, under their own policies.
            </p>
            <p>
              This website sets no tracking, analytics or advertising cookies. A single sign-in cookie, needed for
              security, is used only on the administration page.
            </p>
          </Section>

          <Section title="How long it is kept">
            <p>
              Registration details are deleted automatically {RETENTION_MONTHS} months after you register. You can ask
              for them to be deleted sooner.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can ask to see the information held about you, to have it corrected or deleted, to restrict or object
              to its use, or to receive a copy of it. To do so
              {site.email ? (
                <>
                  , write to{" "}
                  <a className="link text-forest" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </>
              ) : (
                <>
                  , use the{" "}
                  <Link href="/#contact" className="link text-forest">
                    contact details on this website
                  </Link>
                </>
              )}
              . Requests are answered within one month.
            </p>
            <p>
              If you are unhappy with how your information is handled, you can complain to the data protection
              authority where you live; in the United Kingdom, that is the Information Commissioner&rsquo;s Office
              (ico.org.uk).
            </p>
          </Section>

          <Section title="Changes to this notice">
            <p>
              If this notice changes, the new version is published here with a new date at the top.
            </p>
          </Section>

          <p>
            How registration works is described in the{" "}
            <Link href="/terms" className="link text-forest">
              terms
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-[1.5rem] leading-tight text-ink md:text-[1.75rem]">{title}</h2>
      {children}
    </section>
  );
}
