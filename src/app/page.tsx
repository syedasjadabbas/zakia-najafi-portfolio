import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Courses } from "@/components/courses";
import { Introduction } from "@/components/introduction";
import { LiveLectures } from "@/components/live-lectures";
import { Recordings } from "@/components/recordings";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";

function StructuredData() {
  // Only verified facts: name, qualification and official profiles.
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    hasCredential: { "@type": "EducationalOccupationalCredential", name: site.qualification },
    sameAs: site.social.map((link) => link.href),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Introduction />
        <About />
        <LiveLectures />
        <Courses />
        <Recordings />
        <Contact />
      </main>
      <SiteFooter />
      <StructuredData />
    </>
  );
}
