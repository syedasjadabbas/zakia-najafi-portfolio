import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

const teaching = [
  { label: "Islamic lectures & majalis", note: "Live online and recorded", href: "#lectures" },
  { label: "Hawzah courses", note: "Seminary studies", href: "#courses" },
  { label: "Tafseer classes", note: "Study of the Qur’an", href: "#courses" },
  { label: "Consultation", note: "How to request", href: "#contact" },
];

export function Introduction() {
  return (
    <section aria-labelledby="intro-title" className="relative overflow-hidden">
      <div className="container-page grid items-center gap-x-12 gap-y-10 pb-14 pt-8 md:grid-cols-12 md:pb-20 md:pt-16 lg:pt-20">
        <p
          lang="ar"
          dir="rtl"
          className="order-first -mb-4 text-left font-arabic text-[1.375rem] leading-none text-brass-dark md:hidden"
        >
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <div className="md:col-span-7 lg:col-span-7">
          <p lang="ar" dir="rtl" className="hidden text-left md:block font-arabic text-[1.375rem] leading-none text-brass-dark">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          <h1
            id="intro-title"
            className="md:mt-8 text-[3.25rem] leading-[0.98] tracking-[-0.025em] text-ink sm:text-[4.5rem] lg:text-[5.75rem]"
          >
            Zakia Batool <span className="italic text-forest">Najafi</span>
          </h1>

          <p className="mt-6 inline-flex items-center gap-3 text-[1rem] font-medium text-forest md:text-[1.0625rem]">
            <span aria-hidden className="h-px w-8 bg-brass" />
            {site.qualification}
          </p>

          <p className="lead mt-7 max-w-[34rem] text-soft">{site.introduction}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="#lectures" className="button">
              Upcoming live lectures
              <span aria-hidden className="arrow">
                →
              </span>
            </Link>
            <Link href="#recordings" className="button button-outline">
              <svg aria-hidden width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
                <path d="M0 0l11 6.5L0 13z" />
              </svg>
              Watch recorded lectures
            </Link>
          </div>
        </div>

        {site.portrait ? (
          <figure className="relative order-first w-full max-w-[11.5rem] md:order-none md:col-span-5 md:max-w-none lg:col-span-4 lg:col-start-9">
            <div className="relative mr-3 md:mr-5">
              {/* A plain surface offset behind the photograph gives depth without ornament. */}
              <div aria-hidden className="absolute -bottom-3 -right-3 left-6 top-6 bg-forest md:-bottom-5 md:-right-5 md:left-8 md:top-8" />
              <Image
                src={site.portrait.src}
                alt={site.portrait.alt}
                width={site.portrait.width}
                height={site.portrait.height}
                priority
                quality={90}
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 11.5rem"
                className="relative aspect-[4/5] w-full object-cover"
              />
            </div>
            {site.portrait.caption ? (
              <figcaption className="relative mt-6 hidden text-[0.875rem] text-soft md:mt-9 md:block">
                {site.portrait.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>

      <nav aria-label="Teaching" className="border-y border-line bg-sand">
        <ul className="container-page grid sm:grid-cols-2 lg:grid-cols-4">
          {teaching.map((item, index) => (
            <li
              key={item.label}
              className={[
                "border-line",
                index > 0 ? "border-t sm:border-t-0" : "",
                index > 1 ? "sm:border-t lg:border-t-0" : "",
                index % 2 === 1 ? "sm:border-l" : "",
                index === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <Link
                href={item.href}
                className={[
                  "group relative block py-4 pr-10 transition-colors hover:text-forest sm:flex sm:h-full sm:flex-col sm:justify-between sm:gap-2 sm:py-6 sm:pr-3",
                  index % 2 === 1 ? "sm:pl-6" : "",
                  index === 2 ? "lg:pl-6" : "",
                ].join(" ")}
              >
                <span className="block font-serif text-[1.25rem] leading-snug sm:text-[1.3125rem]">{item.label}</span>
                <span className="mt-0.5 flex items-center justify-between gap-3 text-[0.875rem] text-soft sm:mt-0">
                  {item.note}
                  <span
                    aria-hidden
                    className="arrow absolute right-1 top-1/2 -translate-y-1/2 text-brass sm:static sm:translate-y-0"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
