import Image from "next/image";
import { site } from "@/content/site";
import { videos, type Video } from "@/content/videos";
import { ArrowRightIcon, PlayIcon } from "./icons";
import { YouTubePlayer } from "./youtube-player";

function meta(video: Video) {
  return [video.occasion, video.venue].filter(Boolean).join(" · ");
}

export function Recordings() {
  const [featured, ...more] = videos;
  if (!featured) return null;

  return (
    <section id="recordings" aria-labelledby="recordings-title" className="py-20 md:py-24">
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
            className="group hidden items-center gap-2 text-[0.9688rem] font-medium text-forest sm:inline-flex"
          >
            <span className="link">All recordings on YouTube</span>
            <ArrowRightIcon className="arrow" />
          </a>
        </div>

        <figure className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <YouTubePlayer id={featured.id} title={featured.title} image={featured.image} duration={featured.duration} />
          </div>
          <figcaption className="lg:col-span-5">
            <span className="badge badge-brass">Featured</span>
            <h3 className="mt-4 text-[2.125rem] leading-tight md:text-[2.625rem]">{featured.label}</h3>
            <p className="mt-3 text-soft">
              {meta(featured)}
              {meta(featured) ? <br /> : null}
              {featured.date} · {featured.duration}
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${featured.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 text-[0.9688rem] font-medium text-forest"
            >
              <span className="link">Watch on YouTube</span>
              <ArrowRightIcon className="arrow" />
            </a>
          </figcaption>
        </figure>

        <ul className="mt-12 grid gap-y-6 sm:grid-cols-3 sm:gap-x-6">
          {more.map((video) => (
            <li key={video.id}>
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title={video.title}
                className="group grid grid-cols-[9rem_1fr] items-start gap-4 sm:block"
              >
                <span className="relative block aspect-video overflow-hidden rounded-[5px] bg-sand">
                  <Image
                    src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 24rem, 9rem"
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-forest-deep/85 py-1 pl-1 pr-2.5 text-[0.75rem] tabular-nums text-ivory">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ivory text-forest">
                      <PlayIcon size={8} className="ml-px" />
                    </span>
                    {video.duration}
                  </span>
                </span>
                <span className="block sm:mt-4">
                  <span className="block font-serif text-[1.3125rem] leading-snug transition-colors group-hover:text-forest">
                    {video.label}
                  </span>
                  {meta(video) ? <span className="mt-1 block text-[0.9375rem] text-soft">{meta(video)}</span> : null}
                  <span className="mt-0.5 block text-[0.875rem] text-soft">{video.date}</span>
                  <span className="sr-only"> (opens YouTube in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href={site.youtubeChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-outline mt-10 sm:hidden"
        >
          All recordings on YouTube
          <ArrowRightIcon className="arrow" />
        </a>
      </div>
    </section>
  );
}
