import Link from "next/link";
import { site } from "@/content/site";
import { CurrentYear } from "./current-year";
import { navigation } from "./site-header";

export function SiteFooter() {
  return (
    <footer className="bg-forest-deep text-ivory">
      <div className="container-page grid gap-10 py-12 md:grid-cols-12 md:py-14">
        <div className="md:col-span-4">
          <p className="font-serif text-[1.5rem] leading-tight">{site.name}</p>
          <p className="mt-1 text-[0.9375rem] text-ivory/70">{site.qualification}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-4">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9375rem]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ivory/80 transition-colors hover:text-brass-light">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9375rem] md:col-span-4">
          {site.social.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/80 transition-colors hover:text-brass-light"
              >
                {link.label}
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
          <Link href="/privacy" className="transition-colors hover:text-ivory">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
