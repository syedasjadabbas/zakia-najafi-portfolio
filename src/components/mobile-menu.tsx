"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useActiveSection, type NavItem } from "./nav-links";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = useActiveSection(items);
  const primary = items.find((item) => item.primary);
  // In the panel, the primary destination comes first.
  const ordered = [...items.filter((item) => item.primary), ...items.filter((item) => !item.primary)];

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => desktop.matches && close(false);

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-5 lg:hidden">
      {primary ? (
        <Link
          href={primary.href}
          className="tap hidden whitespace-nowrap text-[0.9375rem] font-medium text-forest min-[420px]:inline"
        >
          {primary.label}
        </Link>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-end px-2 text-[0.9375rem] text-ink transition-colors hover:text-forest"
      >
        {open ? "Close" : "Menu"}
      </button>

      <div
        ref={panelRef}
        id={id}
        hidden={!open}
        // Below the sticky header; on short landscape screens the panel scrolls so every item stays reachable.
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain border-b border-line bg-ivory"
      >
        <nav aria-label="Main" className="container-page pb-8 pt-3">
          <ul>
            {ordered.map((item) => {
              const isActive = active === item.href.split("#")[1];
              return (
                <li key={item.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => close(false)}
                    aria-current={isActive ? "location" : undefined}
                    className={[
                      "flex items-baseline justify-between py-4 font-serif text-[1.5rem] leading-tight",
                      item.primary ? "text-forest" : "text-ink",
                    ].join(" ")}
                  >
                    {item.label}
                    {item.primary ? (
                      <span className="font-sans text-[0.875rem] text-soft">Upcoming sessions</span>
                    ) : isActive ? (
                      <span className="font-sans text-[0.875rem] text-soft">You are here</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
