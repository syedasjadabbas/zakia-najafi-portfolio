"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "./icons";

/**
 * Shows a still and loads the privacy-enhanced YouTube player only when the
 * visitor presses play, so the page stays light and nothing autoplays.
 */
export function YouTubePlayer({
  id,
  title,
  image,
  duration,
}: {
  id: string;
  title: string;
  image?: string;
  duration?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[6px] bg-forest-deep">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play: ${title}`}
        >
          <Image
            src={image ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-forest-deep/15 transition-colors group-hover:bg-forest-deep/25" />
          <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-forest shadow-[0_6px_24px_-8px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 md:h-[4.5rem] md:w-[4.5rem]">
            <PlayIcon size={20} className="ml-1" />
          </span>
          {duration ? (
            <span className="absolute bottom-3 right-3 rounded-[3px] bg-forest-deep/85 px-2 py-0.5 text-[0.8125rem] tabular-nums text-ivory">
              {duration}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
