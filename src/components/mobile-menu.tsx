"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export function MobileMenu({ items }: { items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 inline-flex h-10 w-10 items-center justify-center text-forest"
      >
        <svg aria-hidden width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <path d="M5 5l12 12M17 5L5 17" />
          ) : (
            <path d="M3 7h16M3 15h16" />
          )}
        </svg>
      </button>
      <nav
        id={id}
        aria-label="Main"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[0_12px_24px_-16px_rgba(30,29,26,0.25)]"
      >
        <ul className="container-page py-4">
          {items.map((item) => (
            <li key={item.href} className="border-b border-line last:border-0">
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3.5 font-serif text-[1.375rem] text-ink"
              >
                {item.label}
                <span aria-hidden className="text-[1rem] text-brass">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
