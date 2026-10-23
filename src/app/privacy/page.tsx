import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";

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

          <Section title="How it is used">
            <p>
              Only to manage your registration: to confirm your place, check payment, show you the joining details for
              the lecture and, where needed, contact you about it. It is not sold, and it is not used or shared for
              marketing.
            </p>
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
            <p>These services may store data outside your country. They receive only what they need to provide their service.</p>
          </Section>

          <Section title="Recordings and cookies">
            <p>
              Recorded lectures are YouTube videos. Nothing is loaded from YouTube until you press play; the player
              then comes from YouTube&rsquo;s privacy-enhanced domain (youtube-nocookie.com), and YouTube&rsquo;s own
              privacy policy applies to it. Links that open YouTube, Instagram, Facebook, X or Threads take you to those
              sites, under their own policies.
            </p>
            <p>
              This website sets no tracking, analytics or advertising cookies. A single sign-in cookie is used only on
              the administration page.
            </p>
          </Section>

          <Section title="How long it is kept, and your choices">
            <p>
              Registration details are kept so that lectures can be run and records of who attended remain accurate.
              You can ask at any time to see, correct or delete your details
              {site.email ? (
                <>
                  {" "}
                  by writing to{" "}
                  <a className="link text-forest" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </>
              ) : (
                <>
                  {" "}
                  through the{" "}
                  <Link href="/#contact" className="link text-forest">
                    contact details on this website
                  </Link>
                </>
              )}
              .
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
