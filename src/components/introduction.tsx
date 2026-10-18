import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { site } from "@/content/site";
import { ArrowRightIcon, BookOpenIcon, BookTextIcon, PeopleIcon, PlayIcon, QuranIcon } from "./icons";

const teaching: { label: string; note: string; href: string; Icon: ComponentType<{ size?: number }> }[] = [
  { label: "Islamic lectures & majalis", note: "Live online and recorded", href: "#lectures", Icon: BookOpenIcon },
  { label: "Hawzah courses", note: "Seminary studies", href: "#courses", Icon: BookTextIcon },
  { label: "Tafseer classes", note: "Study of the Qur’an", href: "#courses", Icon: QuranIcon },
  { label: "Consultation", note: "How to request", href: "#contact", Icon: PeopleIcon },
];

function Bismillah({ className = "" }: { className?: string }) {
  return (
    <p lang="ar" dir="rtl" className={`text-left font-arabic text-[1.375rem] leading-none text-brass-dark ${className}`}>
      بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    </p>
  );
}

function Portrait() {
  if (!site.portrait) return null;
  return (
    <figure className="relative">
      <div className="relative mr-3 sm:mr-4">
        {/* Plain forest surface offset behind the photograph. */}
        <div aria-hidden className="absolute -bottom-3 -right-3 left-6 top-6 bg-forest sm:-bottom-4 sm:-right-4 sm:left-10 sm:top-10" />
        <Image
          src={site.portrait.src}
          alt={site.portrait.alt}
          width={site.portrait.width}
          height={site.portrait.height}
          priority
          quality={90}
          sizes="(min-width: 1024px) 22rem, 20rem"
          className="relative aspect-[4/5] w-full rounded-[3px] object-cover"
        />
      </div>
      {site.portrait.caption ? (
        <figcaption className="mt-7 text-[0.875rem] text-soft">
          {site.portrait.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Introduction() {
  return (
    <section aria-labelledby="intro-title" className="relative overflow-hidden">
      {/* Sand panel behind the photograph, running to the right edge on wide screens. */}
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[38%] bg-sand lg:block" />

      <div className="container-page relative grid items-center gap-y-10 pb-14 pt-8 lg:grid-cols-12 lg:gap-x-10 lg:py-20 xl:py-24">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Bismillah className="hidden lg:block" />
          <h1
            id="intro-title"
            className="text-[3.25rem] leading-[0.98] tracking-[-0.025em] text-ink sm:text-[4.5rem] lg:mt-8 lg:text-[4.75rem] xl:text-[5.5rem]"
          >
            Zakia Batool <span className="italic text-forest">Najafi</span>
          </h1>

          <p className="mt-6 text-[1rem] font-medium text-forest md:text-[1.0625rem]">
            {site.qualification}
          </p>

          <p className="mt-6 max-w-[33rem] text-[1.0625rem] leading-[1.75] text-soft md:text-[1.1875rem]">
            {site.introduction}
          </p>

          {/* Editorial text actions: typography carries the emphasis, not boxes. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-1">
            <Link
              href="#lectures"
              className="group inline-flex min-h-11 items-center gap-2.5 text-[1.0625rem] font-medium text-forest"
            >
              <span className="underline decoration-forest/35 decoration-1 underline-offset-[0.35em] transition-[text-decoration-color] duration-200 group-hover:decoration-forest">
                Explore live lectures
              </span>
              <ArrowRightIcon size={17} className="arrow" />
            </Link>
            <Link
              href="#recordings"
              className="group inline-flex min-h-11 items-center gap-2.5 text-[1.0625rem] text-soft transition-colors duration-200 hover:text-ink"
            >
              <PlayIcon size={10} className="text-brass-dark transition-colors duration-200 group-hover:text-forest" />
              Watch recorded lectures
            </Link>
          </div>

          {site.heroTagline.length ? (
            <p className="mt-10 border-l-2 border-brass pl-4 font-serif text-[1.125rem] leading-[1.6] text-forest">
              {site.heroTagline.join(" · ")}
            </p>
          ) : null}
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6">
          <Bismillah className="mb-7 lg:hidden" />
          {/* Shown no wider than the photograph's own 424px, so it is never stretched. */}
          <div className="mx-auto w-full max-w-[20rem] lg:ml-auto lg:mr-6 lg:max-w-[22rem] xl:mr-14">
            <Portrait />
          </div>
        </div>
      </div>

      <nav aria-label="Teaching" className="relative border-y border-line bg-sand">
        <ul className="container-page grid sm:grid-cols-2 lg:grid-cols-4">
          {teaching.map(({ label, note, href, Icon }, index) => (
            <li
              key={label}
              className={[
                "border-line",
                index === 1 ? "border-t sm:border-t-0" : "",
                index > 1 ? "border-t lg:border-t-0" : "",
                index % 2 === 1 ? "sm:border-l" : "",
                index === 2 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <Link
                href={href}
                className={[
                  "group flex items-center gap-4 py-5 transition-colors hover:text-forest sm:py-6",
                  index % 2 === 1 ? "sm:pl-6" : "",
                  index === 2 ? "lg:pl-6" : "",
                ].join(" ")}
              >
                <span className="shrink-0 text-brass-dark transition-colors group-hover:text-forest">
                  <Icon size={34} />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[1.1875rem] leading-snug">{label}</span>
                  <span className="block text-[0.875rem] text-soft">{note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
