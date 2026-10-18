import type { MetadataRoute } from "next";
import { getLectures } from "@/content/lectures";
import { site } from "@/content/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lectures = await getLectures();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...lectures.map((lecture) => ({
      url: `${site.url}/lectures/${lecture.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
