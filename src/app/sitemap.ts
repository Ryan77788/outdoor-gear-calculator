import type { MetadataRoute } from "next";
import { gearChecklistPages } from "@/app/gear-checklist-pages";

const siteUrl = "https://outdoor-gear-calculator.com";
const staticRoutes = ["/privacy", "/terms", "/affiliate-disclosure"];

export default function sitemap(): MetadataRoute.Sitemap {
  const checklistRoutes = Object.values(gearChecklistPages).map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));
  const staticPages = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.45,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...checklistRoutes,
    ...staticPages,
  ];
}
