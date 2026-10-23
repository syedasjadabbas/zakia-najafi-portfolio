import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ScrollReset } from "@/components/scroll-reset";
import { site } from "@/content/site";
import "./globals.css";

// Fonts are self-hosted (OFL-1.1, via Fontsource 5.3.0) so builds and visitors
// never depend on Google Fonts.
const newsreader = localFont({
  variable: "--font-newsreader",
  display: "swap",
  src: [
    { path: "./_fonts/newsreader-wght-normal.woff2", weight: "200 800", style: "normal" },
    { path: "./_fonts/newsreader-wght-italic.woff2", weight: "200 800", style: "italic" },
  ],
});

const plex = localFont({
  variable: "--font-plex",
  display: "swap",
  src: [
    { path: "./_fonts/plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./_fonts/plex-sans-500.woff2", weight: "500", style: "normal" },
  ],
});

const amiri = localFont({
  variable: "--font-amiri",
  display: "swap",
  preload: false,
  // Only the Arabic letters the site shows; regenerate with scripts/subset-arabic-font.py after changing Arabic text.
  src: [{ path: "./_fonts/amiri-arabic-400-subset.woff2", weight: "400", style: "normal" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Islamic lectures, Hawzah courses and Tafseer`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: "/",
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", site: "@NajafiZakia", creator: "@NajafiZakia" },
};

export const viewport: Viewport = {
  themeColor: "#f8f4ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plex.variable} ${amiri.variable} antialiased`}>
      <head>
        {/* On a refresh, stop the browser restoring the old scroll position or #section
            before anything renders, so the page always opens at the top. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){history.scrollRestoration='manual';if(location.hash){history.replaceState(history.state,'',location.pathname+location.search)}window.scrollTo(0,0)}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-dvh bg-ivory text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ivory focus:px-4 focus:py-2 focus:text-forest"
        >
          Skip to content
        </a>
        <ScrollReset />
        {children}
      </body>
    </html>
  );
}
