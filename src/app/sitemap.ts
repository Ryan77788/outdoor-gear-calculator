import type { MetadataRoute } from "next";
import { gearChecklistPages } from "@/app/gear-checklist-pages";

const siteUrl = "https://outdoor-gear-calculator.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const checklistRoutes = Object.values(gearChecklistPages).map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...checklistRoutes,
  ];
}
