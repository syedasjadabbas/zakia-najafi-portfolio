import Image from "next/image";
import Link from "next/link";
import { site, type Course } from "@/content/site";
import { ArrowRightIcon, BookTextIcon, QuranIcon } from "./icons";

function details(course: Course) {
  return [
    ["Schedule", course.schedule],
    ["Format", course.format],
    ["Enrolment", course.enrolment],
    ["How to join", course.registration],
  ].filter((row): row is [string, string] => Boolean(row[1]));
}

export function Courses() {
  return (
    <section id="courses" aria-labelledby="courses-title" className="relative overflow-hidden bg-sand pb-36 pt-36 sm:pb-40 sm:pt-40 lg:pb-44 lg:pt-44">
      {/*
        Background calligraphy, set in Amiri (not an image):
        Qur'an 20:114, and the hadith of the Prophet (s) recorded in al-Kafi and Sunan Ibn Majah.
      */}
      {/* Books photograph on the right (AI-generated still life, no people), fading into the sand. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] lg:block">
        <Image src="/images/courses-books.webp" alt="" fill sizes="46vw" quality={90} className="object-cover object-[70%_100%]" />
        <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-sand to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sand to-transparent" />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 select-none font-arabic text-brass-dark">
        <p
          lang="ar"
          dir="rtl"
          className="absolute left-[5%] top-8 whitespace-nowrap py-3 text-[3rem] leading-[1.5] opacity-[0.11] sm:top-6 sm:text-[4rem] lg:text-[5.5rem]"
        >
          وَقُل رَّبِّ زِدْنِي عِلْمًا
        </p>
        <p
          lang="ar"
          dir="rtl"
          className="absolute bottom-6 left-[5%] max-w-[90%] py-3 text-[2rem] leading-[1.5] opacity-[0.1] sm:bottom-4 sm:text-[3rem] lg:max-w-[50%] lg:whitespace-nowrap lg:text-[3.5rem]"
        >
          طَلَبُ العِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ
        </p>
      </div>

      <div className="container-page relative">
        <div className="lg:w-[58%]">
        <div>
          <div>
            <p className="eyebrow">Courses</p>
            <h2 id="courses-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
              Hawzah courses and Tafseer classes
            </h2>
          </div>
          <p className="mt-5 max-w-[34rem] text-soft">
            Structured study alongside the public lectures. Schedules and enrolment for each intake are published here.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {site.courses.map((course, index) => {
            const rows = details(course);
            const Icon = index === 0 ? BookTextIcon : QuranIcon;
            const action = site.email
              ? { href: `mailto:${site.email}?subject=${encodeURIComponent(course.title)}`, label: "Ask about a place" }
              : { href: "#contact", label: "Stay informed" };
            return (
              <li key={course.title} className="panel flex flex-col p-7 md:p-8">
                <div className="flex items-start gap-5">
                  <Icon size={40} className="shrink-0 text-brass-dark" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.75rem] leading-tight">{course.title}</h3>
                    {course.description ? <p className="mt-3 text-soft">{course.description}</p> : null}
                    {rows.length ? (
                      <dl className="mt-5 grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2 text-[0.9375rem]">
                        {rows.map(([term, value]) => (
                          <div key={term} className="contents">
                            <dt className="text-soft">{term}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-2 text-soft">Next intake to be announced.</p>
                    )}
                  </div>
                </div>
                <div aria-hidden className="min-h-6 flex-1" />
                <div className="border-t border-line pt-5">
                  <Link
                    href={action.href}
                    className="group inline-flex items-center gap-2 text-[0.9688rem] font-medium text-forest"
                  >
                    {action.label}
                    <span className="sr-only"> — {course.title}</span>
                    <ArrowRightIcon className="arrow" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        </div>

        {/* Phones and tablets: the books photograph below the courses. */}
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[6px] lg:hidden">
          <Image src="/images/courses-books.webp" alt="" fill sizes="100vw" quality={90} className="object-cover object-[75%_100%]" />
        </div>
      </div>
    </section>
  );
}
