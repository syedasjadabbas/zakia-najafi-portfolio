"use client";

import { useEffect } from "react";

/**
 * A page refresh always opens at the top: the browser's remembered scroll
 * position and any section hash (e.g. #courses) are ignored on reload.
 * Ordinary links to a section (e.g. /#lectures from another page) still work.
 */
export function ScrollReset() {
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "reload") return;

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.location.hash) {
      history.replaceState(history.state, "", window.location.pathname + window.location.search);
    }

    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    toTop();
    // The browser may try to restore the old position once loading finishes.
    const frame = requestAnimationFrame(toTop);
    window.addEventListener("load", toTop, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", toTop);
    };
  }, []);

  return null;
}
