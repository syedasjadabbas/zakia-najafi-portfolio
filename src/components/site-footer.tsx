import Link from "next/link";
import { site } from "@/content/site";
import { CurrentYear } from "./current-year";
import { BrandIcon } from "./icons";
import { navigation } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="bg-forest-deep text-ivory">
      <div className="container-page grid items-center gap-8 py-10 md:py-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-serif text-[1.5rem] leading-tight">{site.name}</p>
          <p className="mt-1 text-[0.9375rem] text-ivory/70">{site.qualification}</p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-5">
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ivory/80 transition-colors hover:text-brass-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex gap-2.5 lg:col-span-3 lg:justify-end">
          {site.social.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} (opens in a new tab)`}
                className="inline-flex rounded-full border border-ivory/25 text-ivory/85 transition-colors hover:border-brass-light hover:text-brass-light"
              >
                <BrandIcon name={link.label} size={38} tone="mono" />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-ivory/15">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-[0.875rem] text-ivory/65">
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-ivory">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ivory">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
