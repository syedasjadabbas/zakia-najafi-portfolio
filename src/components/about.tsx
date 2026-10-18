import { site } from "@/content/site";
import { videos } from "@/content/videos";
import { MortarboardIcon, PinIcon } from "./icons";

/** Venues named in her published recordings, newest first, without duplicates. */
function recordedVenues() {
  const seen = new Set<string>();
  return videos.flatMap((video) => {
    if (!video.venue || !video.occasion) return [];
    const key = `${video.occasion} ${video.venue}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ occasion: video.occasion, venue: video.venue, year: video.date.slice(-4) }];
  });
}

export function About() {
  const [first, ...rest] = site.biography.length
    ? site.biography
    : [
        `${site.name} holds a ${site.qualification}. She delivers Islamic lectures and majalis, teaches Hawzah courses and Tafseer classes, and offers consultation.`,
      ];
  const venues = recordedVenues();

  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-24">
      <div className="container-page grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">About</p>
          <h2 id="about-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
            Teaching the Islamic sciences
          </h2>
        </div>

        <div className="lg:col-span-7 lg:pt-9">
          <p className="max-w-[46rem] text-[1.1875rem] leading-[1.7] text-ink md:text-[1.3125rem]">{first}</p>
          {rest.length ? (
            <div className="mt-5 space-y-5 text-soft">
              {rest.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          ) : null}

          <dl className="mt-10 grid border-t border-line pt-8 sm:grid-cols-2">
            <div className="flex gap-4 pb-8 sm:pb-0 sm:pr-8">
              <MortarboardIcon size={32} className="shrink-0 text-brass-dark" />
              <div>
                <dt className="eyebrow">Qualification</dt>
                <dd className="mt-2 font-serif text-[1.3125rem] leading-snug">{site.qualification}</dd>
              </div>
            </div>
            {venues.length ? (
              <div className="flex gap-4 border-t border-line pt-8 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <PinIcon size={32} className="shrink-0 text-brass-dark" />
                <div>
                  <dt className="eyebrow">Recorded majalis</dt>
                  <dd className="mt-2">
                    <ul className="space-y-2.5">
                      {venues.map((v) => (
                        <li key={`${v.occasion}-${v.venue}`}>
                          <span className="block font-serif text-[1.3125rem] leading-snug">{v.venue}</span>
                          <span className="block text-[0.9375rem] text-soft">
                            {v.occasion} · {v.year}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}
