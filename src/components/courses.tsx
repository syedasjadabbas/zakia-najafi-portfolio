import { site, type Course } from "@/content/site";

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
    <section id="courses" aria-labelledby="courses-title" className="bg-sand py-20 md:py-28">
      <div className="container-page">
        <div className="max-w-[40rem]">
          <p className="eyebrow">Courses</p>
          <h2 id="courses-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
            Hawzah courses and Tafseer classes
          </h2>
          <p className="mt-5 text-soft">
            Structured study alongside the public lectures. Schedules and enrolment for each intake are published here.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {site.courses.map((course, index) => {
            const rows = details(course);
            return (
              <article key={course.title} className="flex flex-col bg-ivory p-7 md:p-9">
                <p aria-hidden className="font-serif text-[1.125rem] italic text-brass-dark">
                  {index === 0 ? "I" : "II"}
                </p>
                <h3 className="mt-3 text-[1.875rem] leading-tight md:text-[2.125rem]">{course.title}</h3>
                {course.description ? <p className="mt-4 text-soft">{course.description}</p> : null}
                {rows.length ? (
                  <dl className="mt-6 grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2 border-t border-line pt-5 text-[0.9375rem]">
                    {rows.map(([term, value]) => (
                      <div key={term} className="contents">
                        <dt className="text-soft">{term}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-4 text-[0.9375rem] text-soft">
                    Next intake to be announced.
                    {site.email ? (
                      <>
                        {" "}
                        <a className="link text-forest" href={`mailto:${site.email}?subject=${encodeURIComponent(course.title)}`}>
                          Ask about a place
                        </a>
                      </>
                    ) : null}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
