import Link from "next/link";
import { site } from "@/content/site";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, type NavItem } from "./nav-links";

/** Page sections in reading order; used by the header and footer. */
export const navigation: NavItem[] = [
  { label: "About", href: "/#about" },
  { label: "Live lectures", href: "/#lectures", primary: true },
  { label: "Courses", href: "/#courses" },
  { label: "Recordings", href: "/#recordings" },
  { label: "Contact", href: "/#contact" },
];

/** Header order: secondary links first, the primary destination last. */
const headerItems = [
  ...navigation.filter((item) => !item.primary),
  ...navigation.filter((item) => item.primary),
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <Link
          href="/"
          className="whitespace-nowrap font-serif text-[1.25rem] leading-none tracking-[-0.01em] text-white transition-colors hover:text-brass-light min-[400px]:text-[1.375rem] sm:text-[1.5rem]"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={headerItems} />
        </nav>

        <MobileMenu items={headerItems} />
      </div>
    </header>
  );
}
