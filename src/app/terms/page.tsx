import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms for registering for ${site.name}'s live lectures.`,
  alternates: { canonical: "/terms" },
};

/*
 * These terms describe only how registration works on this website.
 * Fees, cancellations and refunds have not been supplied by the client and
 * must be added (and reviewed) before paid lectures are published.
 */
export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container-page max-w-[48rem] pb-24 pt-12 md:pt-16">
        <p className="eyebrow">Terms</p>
        <h1 className="mt-4 text-[2.5rem] leading-tight tracking-[-0.015em] md:text-[3rem]">Registering for a lecture</h1>
        <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] text-soft md:text-[1.125rem]">
          <p>
            A place on a live lecture is confirmed only when your registration page says it is confirmed. For paid
            lectures this happens after the payment has been verified.
          </p>
          <p>
            Joining instructions are shared on your private registration page and are for you alone. Please do not
            pass on the link to your registration page or the joining details. A registration may be cancelled if
            they are shared.
          </p>
          <p>
            Lecture details, including the date, time and platform, are shown on each lecture&rsquo;s page. If they
            change, the page is updated.
          </p>
          <p>
            Fees, cancellations and refunds for paid lectures will be set out here before paid registration opens.
          </p>
          <p>
            How your details are used is described in the{" "}
            <Link href="/privacy" className="link text-forest">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
