import Image from "next/image";
import { site } from "@/content/site";
import { videos, type Video } from "@/content/videos";
import { YouTubePlayer } from "./youtube-player";

function meta(video: Video) {
  return [video.occasion, video.venue].filter(Boolean).join(" · ");
}

export function Recordings() {
  const [featured, ...more] = videos;
  if (!featured) return null;

  return (
    <section id="recordings" aria-labelledby="recordings-title" className="py-20 md:py-28">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Recordings</p>
            <h2 id="recordings-title" className="mt-4 text-[2.375rem] leading-[1.08] tracking-[-0.015em] md:text-[3rem]">
              Recorded lectures
            </h2>
          </div>
          <a
            href={site.youtubeChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="link hidden text-forest sm:inline"
          >
            All recordings on YouTube
          </a>
        </div>

        <figure className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <YouTubePlayer id={featured.id} title={featured.title} image={featured.image} />
          </div>
          <figcaption className="lg:col-span-4 lg:pb-2">
            <p className="eyebrow">Featured · {featured.duration}</p>
            <h3 className="mt-3 text-[2rem] leading-tight md:text-[2.5rem]">{featured.label}</h3>
            <p className="mt-3 text-soft">
              {meta(featured)}
              {meta(featured) ? <br /> : null}
              {featured.date}
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${featured.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link mt-6 inline-block text-forest"
            >
              Open on YouTube
            </a>
          </figcaption>
        </figure>

        <div className="mt-16">
          <h3 className="eyebrow">More majalis</h3>
          <ul className="mt-5 grid gap-x-8 border-t border-line md:grid-cols-3">
            {more.map((video) => (
              <li key={video.id} className="border-b border-line md:border-b-0">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={video.title}
                  className="group grid grid-cols-[8.5rem_1fr] items-start gap-4 py-5 md:block md:py-6"
                >
                  <span className="relative block aspect-video overflow-hidden bg-sand">
                    <Image
                      src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 22rem, 8.5rem"
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </span>
                  <span className="block md:mt-4">
                    <span className="block font-serif text-[1.3125rem] leading-snug transition-colors group-hover:text-forest">
                      {video.label}
                    </span>
                    {meta(video) ? <span className="mt-1 block text-[0.9375rem] text-soft">{meta(video)}</span> : null}
                    <span className="mt-1 block text-[0.875rem] tabular-nums text-soft">
                      {video.date} · {video.duration}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={site.youtubeChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-outline mt-8 sm:hidden"
          >
            All recordings on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
