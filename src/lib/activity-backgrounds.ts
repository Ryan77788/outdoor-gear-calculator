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

const neutralShareCardBackground: ActivityBackground = {
  image: "/neutral-outdoor.jpg",
  alt: "Neutral outdoor landscape",
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

const activityBackgroundAliases: Record<string, Activity> = {
  hiking: "徒步",
  camping: "露营",
  fishing: "钓鱼",
  skiing: "滑雪",
  roadtrip: "自驾游",
  "road trip": "自驾游",
  "self-driving": "自驾游",
  "self driving": "自驾游",
  "trail running": "越野跑",
  "trail-running": "越野跑",
  backpacking: "重装徒步",
  climbing: "攀岩",
  kayaking: "皮划艇",
  snowboarding: "单板滑雪",
  "desert hiking": "沙漠徒步",
  "desert-hiking": "沙漠徒步",
  "winter camping": "冬季露营",
  "winter-camping": "冬季露营",
  "beach camping": "海边露营",
  "beach-camping": "海边露营",
};

function normalizeActivityKey(activity: string) {
  return activity.trim().toLowerCase();
}

function resolveActivity(activity: Activity | string) {
  if (activity in activityBackgrounds) {
    return activity as Activity;
  }

  return activityBackgroundAliases[normalizeActivityKey(activity)];
}

const shareCardBackgrounds: Partial<Record<Activity, ActivityBackground>> = {
  登山: { image: "/share-hiking.jpg", alt: "Premium mountain hiking landscape" },
  徒步: { image: "/share-hiking.jpg", alt: "Premium hiking landscape" },
  露营: { image: "/share-camping.jpg", alt: "Forest campsite outdoor photography" },
  滑雪: { image: "/share-skiing.jpg", alt: "Snow mountain skiing photography" },
  钓鱼: { image: "/fishing-hero.jpg", alt: "Lake fishing outdoor photography" },
  自驾游: { image: "/share-roadtrip.jpg", alt: "Outdoor road trip landscape" },
  攀岩: { image: "/activity/climbing.jpg", alt: "Rock climbing wall photography" },
  皮划艇: { image: "/activity/kayaking.jpg", alt: "Kayaking on a lake photography" },
  单板滑雪: { image: "/activity/snowboarding.jpg", alt: "Snowboarding on a mountain slope" },
  沙漠徒步: { image: "/activity/desert-hiking.jpg", alt: "Desert hiking photography" },
  冬季露营: { image: "/activity/winter-camping.jpg", alt: "Winter campsite photography" },
  海边露营: { image: "/activity/beach-camping.jpg", alt: "Coastal campsite photography" },
  重装徒步: { image: "/activity/backpacking.jpg", alt: "Backpacking trail photography" },
  越野跑: { image: "/activity/trail-running.jpg", alt: "Trail running outdoor photography" },
};

export function getActivityBackground(activity: Activity | string) {
  const resolvedActivity = resolveActivity(activity);

  return resolvedActivity ? activityBackgrounds[resolvedActivity] : fallbackActivityBackground;
}

export function getShareCardBackground(activity: Activity | string) {
  const resolvedActivity = resolveActivity(activity);

  if (!resolvedActivity) return neutralShareCardBackground;

  return shareCardBackgrounds[resolvedActivity] ?? neutralShareCardBackground;
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
  return getShareCardBackground(activity).image;
}
