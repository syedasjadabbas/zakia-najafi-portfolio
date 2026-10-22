import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[44rem] px-5 pb-24 pt-16">
        <h1 className="font-serif text-[2.25rem]">Page not found</h1>
        <p className="font-serif text-[1.25rem] leading-relaxed mt-4">The page you were looking for is not here.</p>
        <p className="mt-8">
          <Link href="/" className="link tap">
            Return to the home page
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
