"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Link to the home page. When already on the home page it scrolls back to the
 * top (and clears any #section from the address) instead of doing nothing.
 */
export function HomeLink({ onClick, ...props }: Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href="/"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || window.location.pathname !== "/") return;
        event.preventDefault();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
        if (window.location.hash) history.replaceState(history.state, "", "/");
      }}
    />
  );
}
