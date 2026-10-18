import { site } from "@/content/site";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line bg-sand py-20 md:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow">Consultation &amp; contact</p>
          <h2 id="contact-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
            Get in touch
          </h2>
          <p className="lead mt-6 text-soft">
            {site.consultation.details ??
              (site.email
                ? `${site.name} offers consultation. To request one, please write by email.`
                : `${site.name} offers consultation. Details on how to request one will be published here.`)}
          </p>

          {site.email ? (
            <a href={`mailto:${site.email}`} className="button mt-8">
              Write by email
              <span aria-hidden className="arrow">
                →
              </span>
            </a>
          ) : null}
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="eyebrow">{site.email ? "Email and profiles" : "Official profiles"}</h3>
          <ul className="mt-5 border-t border-sand-deep">
            {site.email ? (
              <li className="border-b border-sand-deep">
                <a href={`mailto:${site.email}`} className="group flex items-baseline justify-between gap-4 py-5">
                  <span className="font-serif text-[1.5rem] transition-colors group-hover:text-forest">Email</span>
                  <span className="truncate text-soft">{site.email}</span>
                </a>
              </li>
            ) : null}
            {site.social.map((link) => (
              <li key={link.href} className="border-b border-sand-deep">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-4 py-4 md:py-5"
                >
                  <span className="font-serif text-[1.375rem] transition-colors group-hover:text-forest md:text-[1.5rem]">
                    {link.label}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-3 text-[0.9375rem] text-soft">
                    <span className="truncate">{link.handle}</span>
                    <span aria-hidden className="arrow text-brass">
                      ↗
                    </span>
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
