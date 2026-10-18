import Link from "next/link";
import { site } from "@/content/site";
import { MobileMenu } from "./mobile-menu";

export const navigation = [
  { label: "About", href: "/#about" },
  { label: "Live lectures", href: "/#lectures" },
  { label: "Courses", href: "/#courses" },
  { label: "Recordings", href: "/#recordings" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const links = navigation.filter((item) => item.href !== "/#lectures");

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/95 backdrop-blur-sm supports-[backdrop-filter]:bg-ivory/85">
      <div className="container-page flex h-[4.25rem] items-center justify-between gap-3 max-[359px]:px-4 sm:gap-4">
        <Link
          href="/"
          className="whitespace-nowrap font-serif text-[1.0625rem] leading-none min-[360px]:text-[1.125rem] tracking-[-0.01em] text-forest min-[400px]:text-[1.25rem] sm:text-[1.4375rem]"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          <ul className="flex items-center gap-8 text-[0.9688rem]">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative py-2 text-soft transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-forest after:transition-transform hover:text-forest hover:after:scale-x-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/#lectures" className="button min-h-[2.5rem] px-4 py-2 text-[0.9375rem]">
            Live lectures
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/#lectures" aria-label="Live lectures" className="button min-h-[2.375rem] whitespace-nowrap px-3 py-1.5 text-[0.875rem] min-[400px]:px-3.5 min-[400px]:text-[0.9375rem]">
            <span className="min-[360px]:hidden">Lectures</span>
            <span className="hidden min-[360px]:inline">Live lectures</span>
          </Link>
          <MobileMenu items={links} />
        </div>
      </div>
    </header>
  );
}
