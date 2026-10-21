import { site } from "@/content/site";
import { ArrowRightIcon, BrandIcon, MailIcon } from "./icons";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line bg-sand/60 py-20 md:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-5 lg:pr-12">
          <p className="eyebrow">Consultation &amp; contact</p>
          <h2 id="contact-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
            Get in touch
          </h2>
          <p className="mt-6 max-w-[28rem] text-[1.0625rem] leading-[1.75] text-soft md:text-[1.125rem]">
            {site.consultation.details ??
              (site.email
                ? `${site.name} offers consultation. To request one, please write by email.`
                : `${site.name} offers consultation. Details on how to request one will be published here.`)}
          </p>
          {site.email ? (
            <a href={`mailto:${site.email}`} className="button mt-8">
              <MailIcon size={18} />
              Write by email
              <ArrowRightIcon className="arrow" />
            </a>
          ) : null}
        </div>

        <div className="border-line lg:col-span-7 lg:border-l lg:pl-12">
          <h3 className="eyebrow">Follow</h3>
          <ul className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
            {site.social.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3.5 rounded-[6px] py-1"
                >
                  <BrandIcon name={link.label} size={42} />
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug transition-colors group-hover:text-forest">
                      {link.label}
                    </span>
                    <span className="block truncate text-[0.875rem] text-soft">{link.handle}</span>
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
