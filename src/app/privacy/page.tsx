import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name}'s website uses the information given when registering for a lecture.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[44rem] px-5 pb-24 pt-12 md:pt-16">
        <h1 className="font-serif text-[2.25rem] leading-tight md:text-[2.625rem]">Privacy</h1>
        <div className="font-serif text-[1.25rem] leading-relaxed mt-8 space-y-5">
          <p>
            This website collects personal information only when you register for a live lecture: your name, your
            email address, the lecture you chose and, for paid lectures, the payment reference you provide or the
            confirmation sent by the card payment provider.
          </p>
          <p>
            This information is used to manage your registration, to verify payment, and to give you the joining
            instructions for the lecture. It is not sold or shared for marketing.
          </p>
          <p>
            Card payments, where offered, are handled by the payment provider on its own secure pages; card details
            never reach this website. Recorded lectures are played through YouTube, which loads only when you press
            play.
          </p>
          <p>
            The website sets no tracking or advertising cookies. An administrator sign-in cookie is used only on the
            administration page.
          </p>
          <p>
            To ask for your registration details to be corrected or deleted
            {site.email ? (
              <>
                , write to{" "}
                <a className="link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </>
            ) : (
              ", please get in touch through the contact details on this website"
            )}
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
