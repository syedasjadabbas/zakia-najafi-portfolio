"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { Video } from "@/content/videos";

const INITIAL = 6;

function meta(video: Video) {
  return [video.occasion, video.venue].filter(Boolean).join(" · ");
}

/** Recordings grid: the newest few are shown, the rest on request. */
export function RecordingGrid({ videos }: { videos: Video[] }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const shown = expanded ? videos : videos.slice(0, INITIAL);
  const hidden = videos.length - INITIAL;

  return (
    <>
      <ul id={id} className="mt-12 grid gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
        {shown.map((video) => (
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
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 9rem"
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </span>
              <span className="block sm:mt-4">
                <span className="block font-serif text-[1.3125rem] leading-snug transition-colors group-hover:text-forest">
                  {video.label}
                </span>
                {meta(video) ? <span className="mt-1 block text-[0.9375rem] text-soft">{meta(video)}</span> : null}
                <span className="mt-0.5 block text-[0.875rem] tabular-nums text-soft">
                  {video.date} · {video.duration}
                </span>
                <span className="sr-only"> (opens YouTube in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {hidden > 0 ? (
        <div className="mt-10 border-t border-line pt-6">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex min-h-11 items-center gap-2 font-serif text-[1.1875rem] text-forest underline decoration-forest/40 decoration-1 underline-offset-[0.4em] transition-[text-decoration-color] hover:decoration-forest"
          >
            {expanded ? "Show fewer recordings" : `Show all recordings (${videos.length})`}
          </button>
        </div>
      ) : null}
    </>
  );
}
