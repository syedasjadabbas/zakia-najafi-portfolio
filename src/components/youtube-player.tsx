"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Shows a still and loads the privacy-enhanced YouTube player only when the
 * visitor presses play, so the page stays light and nothing autoplays.
 */
export function YouTubePlayer({ id, title, image }: { id: string; title: string; image?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-forest-deep">
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
            sizes="(min-width: 1024px) 46rem, 100vw"
            unoptimized={!image}
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-forest-deep/45 via-transparent to-transparent" />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2.5 rounded-full bg-ivory py-1.5 pl-1.5 pr-4 text-[0.875rem] font-medium text-forest transition-colors group-hover:bg-brass-light sm:bottom-5 sm:right-5 sm:gap-3 sm:py-2.5 sm:pl-3 sm:pr-5 sm:text-[0.9375rem] md:bottom-7 md:right-7">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest text-ivory">
              <svg aria-hidden width="10" height="12" viewBox="0 0 10 12" fill="currentColor" className="ml-0.5">
                <path d="M0 0l10 6-10 6z" />
              </svg>
            </span>
            Play recording
          </span>
        </button>
      )}
    </div>
  );
}
