import {
  GearChecklistLanding,
  createChecklistMetadata,
  gearChecklistPages as sourceGearChecklistPages,
  type GearChecklistPage,
} from "@/app/gear-checklist-pages";
import { getGuideImage } from "@/lib/activity-backgrounds";
import { buildGearList, getRiskBlocks, type Weather } from "@/lib/recommendation";
import { localizeGearName, localizeRiskText, localizeValue, type Language } from "@/lib/i18n";

export type ActivityFaq = {
  question: string;
  answer: string;
};

export type ActivityContent = {
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  heroImage: string;
  guideUrl: string;
  relatedSlugs: string[];
  seoTitleEn: string;
  seoTitleZh: string;
  seoDescriptionEn: string;
  seoDescriptionZh: string;
  checklistEn: string[];
  checklistZh: string[];
  faqEn: ActivityFaq[];
  faqZh: ActivityFaq[];
  page: GearChecklistPage;
};

const relatedSlugsBySlug: Record<string, string[]> = {
  "hiking-gear-checklist": ["desert-hiking", "camping-gear-checklist", "climbing", "backpacking"],
  "camping-gear-checklist": ["hiking-gear-checklist", "road-trip-gear-checklist", "fishing-gear-checklist", "kayaking"],
  "skiing-gear-checklist": ["snowboarding", "winter-camping", "hiking-gear-checklist", "road-trip-gear-checklist"],
  "fishing-gear-checklist": ["kayaking", "camping-gear-checklist", "road-trip-gear-checklist"],
  kayaking: ["fishing-gear-checklist", "camping-gear-checklist", "road-trip-gear-checklist"],
  "desert-hiking": ["hiking-gear-checklist", "camping-gear-checklist", "climbing"],
  climbing: ["hiking-gear-checklist", "desert-hiking", "camping-gear-checklist"],
  "road-trip-gear-checklist": ["camping-gear-checklist", "hiking-gear-checklist", "fishing-gear-checklist", "kayaking"],
  backpacking: ["hiking-gear-checklist", "camping-gear-checklist", "desert-hiking", "climbing"],
  snowboarding: ["skiing-gear-checklist", "winter-camping", "road-trip-gear-checklist"],
  "winter-camping": ["camping-gear-checklist", "skiing-gear-checklist", "road-trip-gear-checklist"],
  "beach-camping": ["camping-gear-checklist", "kayaking", "fishing-gear-checklist", "road-trip-gear-checklist"],
  "beach-travel-gear-checklist": ["beach-camping", "kayaking", "fishing-gear-checklist"],
  "trail-running": ["hiking-gear-checklist", "desert-hiking", "climbing"],
  "cycling-gear-checklist": ["road-trip-gear-checklist", "hiking-gear-checklist", "camping-gear-checklist"],
};

function pageNameEn(page: GearChecklistPage) {
  return page.h1.replace(/\s+Gear Checklist$/i, "");
}

function checklistZh(page: GearChecklistPage) {
  return buildGearList(
    page.analysisContext.activity,
    page.analysisContext.tripDays,
    page.analysisContext.weather,
    page.analysisContext.peopleCount,
    5000,
  )
    .slice(0, 7)
    .map((item) => localizeGearName(item, "zh"));
}

function risksZh(page: GearChecklistPage) {
  return getRiskBlocks(page.analysisContext.activity, page.analysisContext.weather, page.analysisContext.tripDays)
    .slice(0, 3)
    .map((risk) => localizeRiskText(risk, "zh"));
}

function activityFaqs(page: GearChecklistPage, language: Language): ActivityFaq[] {
  const name = language === "zh" ? localizeValue(page.analysisContext.activity, "zh") : pageNameEn(page).toLowerCase();
  const checklist = language === "zh" ? checklistZh(page) : page.gear;
  const risks = language === "zh" ? risksZh(page) : page.risks;

  return [
    {
      question: language === "zh" ? `${name}需要准备哪些装备？` : `What gear do I need for ${name}?`,
      answer:
        language === "zh"
          ? `优先准备${checklist.slice(0, 3).join("、")}，再根据天气和行程长度补充安全与舒适装备。`
          : `Start with ${checklist.slice(0, 3).join(", ")}, then add safety and comfort items based on weather and trip length.`,
    },
    {
      question: language === "zh" ? `${name}新手最容易忽略什么？` : `What do beginners often forget for ${name}?`,
      answer: risks[0] ?? (language === "zh" ? "新手常常低估天气、路线和时间余量。" : "Beginners often underestimate weather, route conditions, and time margin."),
    },
  ];
}

function buildActivityContent(page: GearChecklistPage): ActivityContent {
  const nameEn = pageNameEn(page);
  const nameZh = localizeValue(page.analysisContext.activity, "zh");

  return {
    slug: page.slug,
    nameEn,
    nameZh,
    descriptionEn: page.intro,
    descriptionZh: `${nameZh}装备指南会结合活动场景、天气和行程长度，帮助你优先准备真正影响安全、舒适和完成度的装备。`,
    heroImage: getGuideImage(page.slug),
    guideUrl: `/${page.slug}`,
    relatedSlugs: relatedSlugsBySlug[page.slug] ?? ["hiking-gear-checklist", "camping-gear-checklist", "road-trip-gear-checklist"],
    seoTitleEn: page.title,
    seoTitleZh: `${nameZh}装备清单 | Outdoor Gear Calculator`,
    seoDescriptionEn: page.description,
    seoDescriptionZh: `${nameZh}装备清单，覆盖核心装备、风险提示、预算建议和常见问题。`,
    checklistEn: page.gear,
    checklistZh: checklistZh(page),
    faqEn: activityFaqs(page, "en"),
    faqZh: activityFaqs(page, "zh"),
    page,
  };
}

export { GearChecklistLanding, createChecklistMetadata };

export const activities = Object.fromEntries(
  Object.entries(sourceGearChecklistPages).map(([key, page]) => [key, buildActivityContent(page)]),
) as Record<keyof typeof sourceGearChecklistPages, ActivityContent>;

export const gearChecklistPages = Object.fromEntries(
  Object.entries(activities).map(([key, activity]) => [
    key,
    {
      ...activity.page,
      relatedSlugs: activity.relatedSlugs,
    },
  ]),
) as unknown as typeof sourceGearChecklistPages;

export const activitiesBySlug = Object.fromEntries(
  Object.values(activities).map((activity) => [activity.slug, activity]),
) as Record<string, ActivityContent>;

export const activityGuideCards = [
  activities.hiking,
  activities.camping,
  activities.skiing,
  activities.fishing,
  activities.kayaking,
  activities.desertHiking,
  activities.climbing,
  activities.roadTrip,
].map((activity) => ({
  key: activity.slug,
  href: activity.guideUrl,
  title: { en: activity.nameEn, zh: activity.nameZh },
  description: { en: activity.descriptionEn, zh: activity.descriptionZh },
}));

export function getRelatedActivities(slug: string) {
  return (activitiesBySlug[slug]?.relatedSlugs ?? [])
    .map((relatedSlug) => activitiesBySlug[relatedSlug])
    .filter((activity): activity is ActivityContent => Boolean(activity));
}

export type SeoLandingDifficulty = "beginner" | "standard" | "advanced";

export type SeoLandingVariant = {
  slug: string;
  activityKey: keyof typeof activities;
  weather?: Weather;
  people?: number;
  difficulty?: SeoLandingDifficulty;
  intent: "people" | "weather" | "beginner" | "checklist";
};

export type SeoLandingPage = SeoLandingVariant & {
  activity: ActivityContent;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  heroTitleEn: string;
  heroTitleZh: string;
  heroTextEn: string;
  heroTextZh: string;
  prioritiesEn: string[];
  prioritiesZh: string[];
  riskTipsEn: string[];
  riskTipsZh: string[];
  ctaEn: string;
  ctaZh: string;
};

export const seoLandingVariants: SeoLandingVariant[] = [
  { slug: "camping-gear-for-2-people", activityKey: "camping", people: 2, difficulty: "standard", intent: "people" },
  { slug: "camping-checklist-for-beginners", activityKey: "camping", people: 2, difficulty: "beginner", intent: "beginner" },
  { slug: "hiking-gear-for-rainy-weather", activityKey: "hiking", weather: "雨天", people: 2, difficulty: "standard", intent: "weather" },
  { slug: "hiking-checklist-for-beginners", activityKey: "hiking", weather: "晴天", people: 1, difficulty: "beginner", intent: "beginner" },
  { slug: "fishing-checklist-for-beginners", activityKey: "fishing", weather: "晴天", people: 1, difficulty: "beginner", intent: "beginner" },
  { slug: "skiing-gear-for-cold-weather", activityKey: "skiing", weather: "寒冷", people: 2, difficulty: "standard", intent: "weather" },
  { slug: "road-trip-gear-for-4-people", activityKey: "roadTrip", weather: "晴天", people: 4, difficulty: "standard", intent: "people" },
  { slug: "kayaking-checklist-for-beginners", activityKey: "kayaking", weather: "晴天", people: 2, difficulty: "beginner", intent: "beginner" },
  { slug: "desert-hiking-gear-for-hot-weather", activityKey: "desertHiking", weather: "炎热", people: 2, difficulty: "advanced", intent: "weather" },
];

const weatherLabelEn: Partial<Record<Weather, string>> = {
  晴天: "sunny weather",
  雨天: "rainy weather",
  寒冷: "cold weather",
  炎热: "hot weather",
};

const weatherLabelZh: Partial<Record<Weather, string>> = {
  晴天: "晴天",
  雨天: "雨天",
  寒冷: "寒冷天气",
  炎热: "炎热天气",
};

const difficultyLabelEn: Record<SeoLandingDifficulty, string> = {
  beginner: "beginners",
  standard: "regular trips",
  advanced: "more demanding trips",
};

const difficultyLabelZh: Record<SeoLandingDifficulty, string> = {
  beginner: "新手",
  standard: "常规出行",
  advanced: "进阶路线",
};

function variantContextEn(variant: SeoLandingVariant) {
  if (variant.intent === "people" && variant.people) return `for ${variant.people} people`;
  if (variant.intent === "weather" && variant.weather) return `for ${weatherLabelEn[variant.weather]}`;
  if (variant.intent === "beginner") return "for beginners";
  return "checklist";
}

function variantContextZh(variant: SeoLandingVariant) {
  if (variant.intent === "people" && variant.people) return `适合 ${variant.people} 人`;
  if (variant.intent === "weather" && variant.weather) return `适合${weatherLabelZh[variant.weather]}`;
  if (variant.intent === "beginner") return "适合新手";
  return "清单";
}

function landingPriorities(activity: ActivityContent, variant: SeoLandingVariant, language: Language) {
  const checklist = language === "zh" ? activity.checklistZh : activity.checklistEn;
  const base = checklist.slice(0, 3);

  if (language === "zh") {
    if (variant.weather === "雨天") return ["防雨与干燥收纳", "稳定移动", base[0] ?? "核心装备"];
    if (variant.weather === "寒冷") return ["保暖层", "防护装备", base[0] ?? "核心装备"];
    if (variant.weather === "炎热") return ["补水降温", "防晒保护", base[0] ?? "核心装备"];
    if (variant.difficulty === "beginner") return ["基础安全", "易用装备", base[0] ?? "核心装备"];
    if (variant.people && variant.people >= 4) return ["共享装备", "补给分配", "应急备份"];
    return base;
  }

  if (variant.weather === "雨天") return ["Rain protection", "Dry storage", base[0] ?? "Core gear"];
  if (variant.weather === "寒冷") return ["Warm layers", "Protection", base[0] ?? "Core gear"];
  if (variant.weather === "炎热") return ["Hydration", "Sun protection", base[0] ?? "Core gear"];
  if (variant.difficulty === "beginner") return ["Safety basics", "Easy-to-use gear", base[0] ?? "Core gear"];
  if (variant.people && variant.people >= 4) return ["Shared gear", "Supply split", "Emergency backup"];
  return base;
}

function landingRisks(activity: ActivityContent, variant: SeoLandingVariant, language: Language) {
  const risks = language === "zh" ? activity.page.risks.map(() => "").filter(Boolean) : activity.page.risks;
  const fallback = language === "zh" ? activity.faqZh.map((faq) => faq.answer) : activity.page.risks;
  const base = (language === "zh" ? activity.descriptionZh : risks[0]) || fallback[0];

  if (language === "zh") {
    return [
      variant.weather ? `${weatherLabelZh[variant.weather]}会改变装备优先级，先处理天气防护和安全余量。` : `${activity.nameZh}需要先确认路线、时间和关键装备。`,
      variant.people && variant.people > 1 ? `${variant.people} 人出行要提前分配共享装备、补给和应急物品。` : "单人或新手出行要保留更保守的返回时间。",
      base,
    ].filter(Boolean).slice(0, 3);
  }

  return [
    variant.weather ? `${weatherLabelEn[variant.weather]} changes the gear priority, so plan protection and margin first.` : `${activity.nameEn} plans should start with route, timing, and core gear checks.`,
    variant.people && variant.people > 1 ? `For ${variant.people} people, split shared gear, food, water, and emergency items before leaving.` : "Solo or beginner trips need a more conservative return window.",
    base,
  ].filter(Boolean).slice(0, 3);
}

export function buildSeoLandingPage(variant: SeoLandingVariant): SeoLandingPage {
  const activity = activities[variant.activityKey];
  const contextEn = variantContextEn(variant);
  const contextZh = variantContextZh(variant);
  const difficultyEn = difficultyLabelEn[variant.difficulty ?? "standard"];
  const difficultyZh = difficultyLabelZh[variant.difficulty ?? "standard"];
  const titleEn = `${activity.nameEn} gear ${contextEn} | Outdoor Gear Calculator`;
  const titleZh = `${activity.nameZh}装备${contextZh} | Outdoor Gear Calculator`;

  return {
    ...variant,
    activity,
    titleEn,
    titleZh,
    descriptionEn: `Plan ${activity.nameEn.toLowerCase()} gear ${contextEn} with priorities, risk tips, related guides, and a fast CTA to generate a custom gear plan.`,
    descriptionZh: `为${activity.nameZh}${contextZh}生成装备重点、风险提示、相关指南和装备方案入口。`,
    heroTitleEn: `${activity.nameEn} gear ${contextEn}`,
    heroTitleZh: `${activity.nameZh}装备${contextZh}`,
    heroTextEn: `A focused ${difficultyEn} landing page for ${activity.nameEn.toLowerCase()} planning, tuned by weather, group size, and trip complexity.`,
    heroTextZh: `面向${difficultyZh}的${activity.nameZh}装备页面，会根据天气、人数和难度调整重点。`,
    prioritiesEn: landingPriorities(activity, variant, "en"),
    prioritiesZh: landingPriorities(activity, variant, "zh"),
    riskTipsEn: landingRisks(activity, variant, "en"),
    riskTipsZh: landingRisks(activity, variant, "zh"),
    ctaEn: "Generate gear plan",
    ctaZh: "生成装备方案",
  };
}

export const seoLandingPages = seoLandingVariants.map((variant) => buildSeoLandingPage(variant));

export const seoLandingPagesBySlug = Object.fromEntries(
  seoLandingPages.map((page) => [page.slug, page]),
) as Record<string, SeoLandingPage>;
