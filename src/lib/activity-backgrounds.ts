import type { Activity } from "@/data/products";

type ActivityBackground = {
  image: string;
  slug?: string;
  alt: string;
};

const fallbackActivityBackground: ActivityBackground = {
  image: "/share-hiking.jpg",
  alt: "Outdoor trail and mountain landscape",
};

export const activityBackgrounds: Record<Activity, ActivityBackground> = {
  登山: { image: "/share-hiking.jpg", alt: "Mountain hiking landscape" },
  徒步: { image: "/share-hiking.jpg", alt: "Hiking trail landscape" },
  露营: { image: "/share-camping.jpg", alt: "Outdoor camping site" },
  滑雪: { image: "/share-skiing.jpg", alt: "Skiing on a snowy mountain" },
  钓鱼: { image: "/fishing-hero.jpg", alt: "Fishing by the water" },
  自驾游: { image: "/share-hiking.jpg", alt: "Outdoor road trip landscape" },
  骑行: { image: "/activity/trail-running.jpg", alt: "Fast movement through an outdoor trail" },
  海边旅行: { image: "/activity/beach-camping.jpg", alt: "Beach and coastal outdoor scene" },
  越野跑: { image: "/activity/trail-running.jpg", slug: "trail-running", alt: "Trail running route" },
  重装徒步: { image: "/activity/backpacking.jpg", slug: "backpacking", alt: "Backpacking trail scene" },
  攀岩: { image: "/activity/climbing.jpg", slug: "climbing", alt: "Outdoor rock climbing route" },
  皮划艇: { image: "/activity/kayaking.jpg", slug: "kayaking", alt: "Kayakers paddling on a lake" },
  单板滑雪: { image: "/activity/snowboarding.jpg", slug: "snowboarding", alt: "Snowboarding on a snowy slope" },
  沙漠徒步: { image: "/activity/desert-hiking.jpg", slug: "desert-hiking", alt: "Desert hiking landscape" },
  冬季露营: { image: "/activity/winter-camping.jpg", slug: "winter-camping", alt: "Winter camping in snow" },
  海边露营: { image: "/activity/beach-camping.jpg", slug: "beach-camping", alt: "Beach camping by the coast" },
};

export const activityHeroImages: Record<Activity, string> = Object.fromEntries(
  Object.entries(activityBackgrounds).map(([activity, background]) => [activity, background.image]),
) as Record<Activity, string>;

export const activityHeroImagesBySlug: Record<string, string> = Object.fromEntries(
  Object.values(activityBackgrounds)
    .filter((background): background is ActivityBackground & { slug: string } => Boolean(background.slug))
    .map((background) => [background.slug, background.image]),
);

export function getActivityBackground(activity: Activity) {
  return activityBackgrounds[activity] ?? fallbackActivityBackground;
}

export function getActivityBackgroundBySlug(slug: string) {
  return Object.values(activityBackgrounds).find((background) => background.slug === slug) ?? fallbackActivityBackground;
}

export function getActivityHeroImage(activity: Activity) {
  return getActivityBackground(activity).image;
}

export function getSeoActivityImage(activity: Activity) {
  return getActivityBackground(activity).image;
}

export function getShareCardBackgroundImage(activity: Activity) {
  return getActivityBackground(activity).image;
}
