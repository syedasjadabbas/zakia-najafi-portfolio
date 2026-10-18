import Image from "next/image";
import { site } from "@/content/site";
import { HomeLink } from "./home-link";
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
    <header className="sticky top-0 z-40 border-b border-line bg-ivory text-ink">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6 lg:h-[4.75rem]">
        <HomeLink
          className="group flex items-center gap-3 whitespace-nowrap font-serif text-[1.1875rem] leading-none tracking-[-0.01em] text-ink transition-colors hover:text-forest min-[400px]:text-[1.3125rem] sm:gap-5 sm:text-[1.5rem]"
        >
          <Image
            src={site.logo.onLight.src}
            alt=""
            width={site.logo.onLight.width}
            height={site.logo.onLight.height}
            priority
            sizes="56px"
            className="h-9 w-auto sm:h-11"
          />
          <span aria-hidden className="hidden h-9 w-px bg-line sm:block" />
          {site.name}
        </HomeLink>

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={headerItems} />
        </nav>

        <MobileMenu items={headerItems} />
      </div>
    </header>
  );
}
