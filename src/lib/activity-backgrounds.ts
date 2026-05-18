import type { Activity } from "@/data/products";

export const activityHeroImages: Record<Activity, string> = {
  登山: "/share-hiking.jpg",
  徒步: "/share-hiking.jpg",
  露营: "/share-camping.jpg",
  滑雪: "/share-skiing.jpg",
  钓鱼: "/fishing-hero.jpg",
  自驾游: "/share-hiking.jpg",
  骑行: "/activity/trail-running.jpg",
  海边旅行: "/activity/beach-camping.jpg",
  越野跑: "/activity/trail-running.jpg",
  重装徒步: "/activity/backpacking.jpg",
  攀岩: "/activity/climbing.jpg",
  皮划艇: "/activity/kayaking.jpg",
  单板滑雪: "/activity/snowboarding.jpg",
  沙漠徒步: "/activity/desert-hiking.jpg",
  冬季露营: "/activity/winter-camping.jpg",
  海边露营: "/activity/beach-camping.jpg",
};

export const activityHeroImagesBySlug: Record<string, string> = {
  "trail-running": activityHeroImages["越野跑"],
  backpacking: activityHeroImages["重装徒步"],
  climbing: activityHeroImages["攀岩"],
  kayaking: activityHeroImages["皮划艇"],
  snowboarding: activityHeroImages["单板滑雪"],
  "desert-hiking": activityHeroImages["沙漠徒步"],
  "winter-camping": activityHeroImages["冬季露营"],
  "beach-camping": activityHeroImages["海边露营"],
};

export function getActivityHeroImage(activity: Activity) {
  return activityHeroImages[activity] ?? "/share-hiking.jpg";
}
