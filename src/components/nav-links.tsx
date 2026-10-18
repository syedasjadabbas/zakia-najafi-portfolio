"use client";

import Link from "next/link";
import { ArrowRightIcon } from "./icons";
import { useEffect, useState } from "react";

export type NavItem = { label: string; href: string; primary?: boolean };

/**
 * Tracks which home-page section is in view so the matching link can show a
 * quiet active state. Other pages have none of these sections, so nothing is
 * marked active there.
 */
export function useActiveSection(items: NavItem[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.href.split("#")[1] ?? ""))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // The section nearest the top of the reading band wins.
        const next = [...visible.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? null;
        setActive(next);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return active;
}

export function NavLinks({ items }: { items: NavItem[] }) {
  const active = useActiveSection(items);

  return (
    <ul className="flex items-center gap-x-10 font-serif text-[1.125rem]">
      {items.map((item) => {
        const isActive = active === item.href.split("#")[1];
        return (
          <li key={item.href} className={item.primary ? "ml-4" : undefined}>
            <Link
              href={item.href}
              aria-current={isActive ? "location" : undefined}
              className={[
                "relative inline-flex items-center gap-2.5 py-2 transition-colors duration-200",
                "after:absolute after:left-0 after:bottom-0 after:h-px after:origin-left after:transition-transform after:duration-300",
                item.primary
                  ? "text-forest after:w-10 after:bg-forest after:transition-[width] hover:after:w-full"
                  : "after:right-0 after:bg-ink",
                !item.primary && (isActive ? "text-ink" : "text-ink/75 hover:text-ink"),
                !item.primary && (isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"),
              ].join(" ")}
            >
              {item.label}
              {item.primary ? <ArrowRightIcon size={17} className="arrow" /> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
