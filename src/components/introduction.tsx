import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { site } from "@/content/site";
import { HeroCta } from "./hero-cta";
import { BookOpenIcon, BookTextIcon, PeopleIcon, PlayIcon, QuranIcon } from "./icons";

const teaching: { label: string; note: string; href: string; Icon: ComponentType<{ size?: number }> }[] = [
  { label: "Islamic lectures & majalis", note: "Live online and recorded", href: "#lectures", Icon: BookOpenIcon },
  { label: "Hawzah courses", note: "Seminary studies", href: "#courses", Icon: BookTextIcon },
  { label: "Tafseer classes", note: "Study of the Qur’an", href: "#courses", Icon: QuranIcon },
  { label: "Consultation", note: "How to request", href: "#contact", Icon: PeopleIcon },
];

/** Her portrait separated from the poster background (scripts/make-portrait-cutout.py). */
const cutout = { src: "/images/portrait-muharram-1448-cutout.png", width: 688, height: 548 };

/**
 * Supplied background: a cream wall with a white arch and deep-green interior
 * (1956×804). The arch's centre is at 72.9% of its width, so both the photo
 * and the portrait are positioned from that point.
 */
const background = { src: "/images/hero-arch-background.webp", width: 1956, height: 804 };

function HeroBackground({ className = "" }: { className?: string }) {
  return (
    <Image
      src={background.src}
      alt=""
      fill
      // The largest element on first load: fetch it ahead of scripts and fonts.
      preload
      fetchPriority="high"
      quality={90}
      sizes="100vw"
      className={`object-cover ${className}`}
    />
  );
}

function Portrait({ className = "" }: { className?: string }) {
  return (
    <Image
      src={cutout.src}
      alt={site.portrait?.alt ?? site.name}
      width={cutout.width}
      height={cutout.height}
      preload
      quality={90}
      sizes="(min-width: 1024px) 43rem, 90vw"
      className={`absolute bottom-0 w-auto max-w-none -translate-x-1/2 ${className}`}
    />
  );
}

export function Introduction() {
  return (
    <section aria-labelledby="intro-title" className="relative overflow-hidden">
      {/* Phones and tablets: the arch scene above the text, with her centred in the arch. */}
      <div className="relative h-[26rem] overflow-hidden bg-[#efe7d9] sm:h-[32rem] lg:hidden">
        <HeroBackground className="object-[86%_100%] sm:object-[100%_100%]" />
        {/* left = where the arch centre lands for the image size at each breakpoint */}
        <Portrait className="left-[calc(0.86*(100%-1012px)+738px)] h-[88%] sm:left-[calc(100%-338px)] sm:h-[90%]" />
      </div>

      {/* Desktop: the photo covers the hero; the arch centre always sits at 72.9% across. */}
      <div className="relative lg:min-h-[clamp(36rem,34vw,44rem)]">
        <div aria-hidden className="absolute inset-0 hidden lg:block">
          <HeroBackground className="object-[72.9%_40%]" />
          {/* Up to ~1.1× the photo's native height, so she fills the arch without visible softening. */}
          <Portrait className="left-[72.9%] h-[88%] max-h-[600px]" />
        </div>

        <div className="container-page relative flex min-h-[inherit] items-center">
          <div className="w-full pb-12 pt-8 lg:w-[44%] lg:py-12 xl:w-[46%]">
            <p
              lang="ar"
              dir="rtl"
              className="text-left font-arabic text-[1.625rem] leading-none text-brass-dark md:text-[1.875rem]"
            >
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <h1
              id="intro-title"
              className="mt-6 text-[3.5rem] leading-[0.95] tracking-[-0.03em] text-ink sm:mt-8 sm:text-[4.75rem] lg:text-[4.5rem] xl:text-[5.5rem] 2xl:text-[6.25rem]"
            >
              Zakia Batool
              <span className="block italic text-forest">Najafi</span>
            </h1>

            <p className="mt-8 font-serif text-[1.375rem] leading-snug text-ink md:text-[1.5rem]">
              {site.qualification}
            </p>

            <p className="mt-5 max-w-[34rem] font-serif text-[1.1875rem] leading-[1.6] text-soft md:text-[1.3125rem]">
              {site.introduction}
            </p>

            {/* The one filled button on the page: registering for a live lecture. */}
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <HeroCta />
              <Link
                href="#recordings"
                className="group inline-flex min-h-[3.25rem] items-center gap-3 font-serif text-[1.25rem] text-soft transition-colors duration-200 hover:text-ink md:text-[1.3125rem] lg:text-[1.1875rem] xl:text-[1.25rem]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brass/70 text-brass-dark transition-colors duration-200 group-hover:border-forest group-hover:text-forest">
                  <PlayIcon size={9} className="ml-0.5" />
                </span>
                Watch recorded lectures
              </Link>
            </div>

            {site.heroTagline.length ? (
              <p className="mt-10 border-l-2 border-brass pl-4 font-serif text-[1.125rem] leading-[1.6] text-forest">
                {site.heroTagline.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <nav aria-label="Teaching" className="relative">
        <ul className="container-page grid border-t border-line sm:grid-cols-2 lg:grid-cols-4 lg:border-t-0">
          {teaching.map(({ label, note, href, Icon }, index) => (
            <li
              key={label}
              className={[
                "border-line",
                index === 1 ? "border-t sm:border-t-0" : "",
                index > 1 ? "border-t lg:border-t-0" : "",
                index % 2 === 1 ? "sm:border-l" : "",
                index === 2 ? "lg:border-l" : "",
                "lg:my-5",
              ].join(" ")}
            >
              <Link
                href={href}
                className={[
                  "group flex items-center gap-4 py-5 transition-colors hover:text-forest sm:py-6 lg:justify-center lg:py-1",
                  index === 0 ? "lg:justify-start" : "",
                  index % 2 === 1 ? "sm:pl-6 lg:pl-0" : "",
                ].join(" ")}
              >
                <span className="shrink-0 text-brass-dark transition-colors group-hover:text-forest">
                  <Icon size={36} />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[1.25rem] leading-snug">{label}</span>
                  <span className="block font-serif text-[0.9688rem] text-soft">{note}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
