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
    <section id="courses" aria-labelledby="courses-title" className="bg-sand py-20 md:py-24">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="eyebrow">Courses</p>
            <h2 id="courses-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
              Hawzah courses and Tafseer classes
            </h2>
          </div>
          <p className="max-w-[30rem] text-soft lg:col-span-5 lg:col-start-8 lg:pb-2">
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
    </section>
  );
}
