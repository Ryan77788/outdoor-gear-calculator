import type { Activity } from "@/data/products";

type ActivityBackground = {
  image: string;
  slug?: string;
  alt: string;
};

const fallbackActivityBackground: ActivityBackground = {
  image: "/activity/hiking.jpg",
  alt: "Outdoor trail and mountain landscape",
};

const neutralShareCardBackground: ActivityBackground = {
  image: "/neutral-outdoor.jpg",
  alt: "Neutral outdoor landscape",
};

export const activityBackgrounds: Record<Activity, ActivityBackground> = {
  登山: { image: "/activity/hiking.jpg", slug: "hiking", alt: "Mountain hiking landscape" },
  徒步: { image: "/activity/hiking.jpg", slug: "hiking-gear-checklist", alt: "Hiking trail landscape" },
  露营: { image: "/activity/camping.jpg", slug: "camping-gear-checklist", alt: "Tent campsite in the outdoors" },
  滑雪: { image: "/activity/skiing.jpg", slug: "skiing-gear-checklist", alt: "Skiing on a snowy mountain" },
  钓鱼: { image: "/activity/fishing.jpg", slug: "fishing-gear-checklist", alt: "Fishing by the water" },
  自驾游: { image: "/activity/road-trip.jpg", slug: "road-trip-gear-checklist", alt: "Road trip with vehicle on an open road" },
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

export const guideImagesBySlug: Record<string, string> = {
  hiking: "/activity/hiking.jpg",
  "hiking-gear-checklist": "/activity/hiking.jpg",
  "camping-gear-checklist": "/activity/camping.jpg",
  "skiing-gear-checklist": "/activity/skiing.jpg",
  "fishing-gear-checklist": "/activity/fishing.jpg",
  kayaking: "/activity/kayaking.jpg",
  "desert-hiking": "/activity/desert-hiking.jpg",
  climbing: "/activity/climbing.jpg",
  "road-trip-gear-checklist": "/activity/road-trip.jpg",
  roadtrip: "/activity/road-trip.jpg",
  "road-trip": "/activity/road-trip.jpg",
  "self-driving": "/activity/road-trip.jpg",
  backpacking: "/activity/backpacking.jpg",
  snowboarding: "/activity/snowboarding.jpg",
  "winter-camping": "/activity/winter-camping.jpg",
  "beach-camping": "/activity/beach-camping.jpg",
  "beach-travel-gear-checklist": "/activity/beach-camping.jpg",
  "trail-running": "/activity/trail-running.jpg",
  "cycling-gear-checklist": "/activity/trail-running.jpg",
};

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
  自驾游: { image: "/activity/road-trip.jpg", alt: "Outdoor road trip landscape" },
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
  const image = getGuideImage(slug);
  const background = Object.values(activityBackgrounds).find((item) => item.image === image || item.slug === slug);

  return background ? { ...background, image } : { ...fallbackActivityBackground, image };
}

export function getGuideImage(slug: string) {
  return guideImagesBySlug[normalizeActivityKey(slug)] ?? fallbackActivityBackground.image;
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
