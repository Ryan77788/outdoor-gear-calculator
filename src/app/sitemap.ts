import type { MetadataRoute } from "next";
import { activities, seoLandingPages } from "@/data/activities";

const siteUrl = "https://outdoor-gear-calculator.com";
const staticRoutes = ["/privacy", "/terms", "/affiliate-disclosure"];

export default function sitemap(): MetadataRoute.Sitemap {
  const checklistRoutes = Object.values(activities).map((activity) => ({
    url: `${siteUrl}/${activity.slug}`,
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
  const dynamicGuideRoutes = seoLandingPages.map((page) => ({
    url: `${siteUrl}/guides/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...checklistRoutes,
    ...dynamicGuideRoutes,
    ...staticPages,
  ];
}
