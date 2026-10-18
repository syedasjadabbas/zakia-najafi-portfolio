"use client";

import Link from "next/link";
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
    <ul className="flex items-center gap-x-9 text-[0.9688rem]">
      {items.map((item) => {
        const isActive = active === item.href.split("#")[1];
        return (
          <li key={item.href} className={item.primary ? "ml-4" : undefined}>
            <Link
              href={item.href}
              aria-current={isActive ? "location" : undefined}
              className={[
                "relative inline-block py-2 transition-colors duration-200",
                "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:transition-transform after:duration-300",
                item.primary ? "font-medium text-brass-light after:bg-brass-light" : "after:bg-white",
                !item.primary && (isActive ? "text-white" : "text-white/70 hover:text-white"),
                isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
