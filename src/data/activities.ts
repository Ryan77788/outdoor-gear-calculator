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
      faqEn: activity.faqEn,
      faqZh: activity.faqZh,
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
  image: activity.heroImage,
  title: { en: activity.nameEn, zh: activity.nameZh },
  description: { en: activity.descriptionEn, zh: activity.descriptionZh },
}));

export function getRelatedActivities(slug: string) {
  return (activitiesBySlug[slug]?.relatedSlugs ?? [])
    .map((relatedSlug) => activitiesBySlug[relatedSlug])
    .filter((activity): activity is ActivityContent => Boolean(activity));
}

export type SeoLandingDifficulty = "beginner" | "standard" | "advanced";
export type SeoLandingScenario =
  | "budget"
  | "beginner"
  | "family"
  | "rainy"
  | "winter"
  | "lightweight"
  | "weekend"
  | "solo";

export type SeoLandingVariant = {
  slug: string;
  activityKey: keyof typeof activities;
  scenario: SeoLandingScenario;
  weather?: Weather;
  people?: number;
  difficulty?: SeoLandingDifficulty;
  intent: "people" | "weather" | "beginner" | "checklist";
};

type SeoLandingVariantInput = Omit<SeoLandingVariant, "slug"> & {
  slug?: string;
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

const seoLandingVariantSeeds: SeoLandingVariantInput[] = [
  { activityKey: "camping", scenario: "budget", people: 2, difficulty: "standard", intent: "people" },
  { activityKey: "hiking", scenario: "beginner", weather: "晴天", people: 1, difficulty: "beginner", intent: "beginner" },
  { activityKey: "roadTrip", scenario: "family", weather: "晴天", people: 4, difficulty: "standard", intent: "people" },
  { activityKey: "hiking", scenario: "rainy", weather: "雨天", people: 2, difficulty: "standard", intent: "weather" },
  { activityKey: "skiing", scenario: "winter", weather: "寒冷", people: 2, difficulty: "standard", intent: "weather" },
  { activityKey: "backpacking", scenario: "lightweight", weather: "晴天", people: 1, difficulty: "advanced", intent: "checklist" },
  { activityKey: "camping", scenario: "weekend", weather: "晴天", people: 2, difficulty: "standard", intent: "checklist" },
  { activityKey: "trailRunning", scenario: "solo", weather: "晴天", people: 1, difficulty: "advanced", intent: "checklist" },
  { slug: "camping-gear-for-2-people", activityKey: "camping", scenario: "weekend", people: 2, difficulty: "standard", intent: "people" },
  { slug: "camping-checklist-for-beginners", activityKey: "camping", scenario: "beginner", people: 2, difficulty: "beginner", intent: "beginner" },
  { slug: "hiking-gear-for-rainy-weather", activityKey: "hiking", scenario: "rainy", weather: "雨天", people: 2, difficulty: "standard", intent: "weather" },
  { slug: "fishing-checklist-for-beginners", activityKey: "fishing", scenario: "beginner", weather: "晴天", people: 1, difficulty: "beginner", intent: "beginner" },
  { slug: "desert-hiking-gear-for-hot-weather", activityKey: "desertHiking", scenario: "weekend", weather: "炎热", people: 2, difficulty: "advanced", intent: "weather" },
];

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

const scenarioLabelEn: Record<SeoLandingScenario, string> = {
  budget: "budget",
  beginner: "beginner",
  family: "family",
  rainy: "rainy",
  winter: "winter",
  lightweight: "lightweight",
  weekend: "weekend",
  solo: "solo",
};

const scenarioLabelZh: Record<SeoLandingScenario, string> = {
  budget: "低预算",
  beginner: "新手",
  family: "家庭",
  rainy: "雨天",
  winter: "冬季",
  lightweight: "轻量化",
  weekend: "周末",
  solo: "单人",
};

const activitySlugBase: Partial<Record<keyof typeof activities, string>> = {
  roadTrip: "road-trip",
  desertHiking: "desert-hiking",
  trailRunning: "trail-running",
};

const scenarioProfile: Record<
  SeoLandingScenario,
  {
    contextEn: (variant: SeoLandingVariant, activity: ActivityContent) => string;
    contextZh: (variant: SeoLandingVariant, activity: ActivityContent) => string;
    prioritiesEn: (base: string[], variant: SeoLandingVariant) => string[];
    prioritiesZh: (base: string[], variant: SeoLandingVariant) => string[];
    riskEn: (variant: SeoLandingVariant, activity: ActivityContent) => string[];
    riskZh: (variant: SeoLandingVariant, activity: ActivityContent) => string[];
    ctaEn: string;
    ctaZh: string;
  }
> = {
  budget: {
    contextEn: (variant) => `budget gear for ${variant.people ?? 2} people`,
    contextZh: (variant) => `适合 ${variant.people ?? 2} 人的低预算装备`,
    prioritiesEn: (base) => ["Borrow or share expensive items", "Buy safety essentials first", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["优先借用或共享高价装备", "先购买安全必需品", base[0] ?? "核心装备"],
    riskEn: (variant, activity) => [
      `Budget ${activity.nameEn.toLowerCase()} planning should cut comfort extras before safety gear.`,
      "Cheap rain, warmth, or lighting gear can fail quickly, so check reviews and backups.",
      variant.people && variant.people > 1 ? `Split shared items across ${variant.people} people before buying duplicates.` : "Keep a small reserve for repair, batteries, and emergency supplies.",
    ],
    riskZh: (variant, activity) => [
      `低预算${activity.nameZh}要先删舒适项，不要压缩安全装备。`,
      "低价防雨、保暖和照明装备更容易失效，要确认评价和备份。",
      variant.people && variant.people > 1 ? `${variant.people} 人出行先分配共享装备，避免重复购买。` : "保留一小部分预算给维修、电池和应急物品。",
    ],
    ctaEn: "Build a budget gear plan",
    ctaZh: "生成低预算装备方案",
  },
  beginner: {
    contextEn: () => "beginner checklist",
    contextZh: () => "新手清单",
    prioritiesEn: (base) => ["Simple setup", "Navigation and first aid", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["容易上手的装备", "导航与急救", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Beginner ${activity.nameEn.toLowerCase()} trips need conservative distance, timing, and bailout options.`,
      "Avoid specialist gear you have not tested at home or on a short route.",
      "Pack a small emergency layer, light, water, and first aid even for short plans.",
    ],
    riskZh: (_variant, activity) => [
      `新手${activity.nameZh}要把距离、时间和撤退路线设置得更保守。`,
      "不要第一次出行就依赖没有试用过的专业装备。",
      "短行程也要保留应急衣物、照明、饮水和急救。",
    ],
    ctaEn: "Create a beginner gear plan",
    ctaZh: "生成新手装备方案",
  },
  family: {
    contextEn: () => "family gear",
    contextZh: () => "家庭装备",
    prioritiesEn: () => ["Shared storage", "Kid-ready comfort", "Food, water, and cleanup"],
    prioritiesZh: () => ["共享收纳", "儿童舒适度", "食物、饮水和清洁"],
    riskEn: (variant) => [
      `Family trips need extra time margin, especially with ${variant.people ?? 4} people sharing stops and supplies.`,
      "Keep weather layers, snacks, and hygiene items reachable instead of buried in the trunk.",
      "Plan duplicate essentials for kids: water, warm layers, lights, and medications.",
    ],
    riskZh: (variant) => [
      `家庭出行要留出更多时间余量，尤其是 ${variant.people ?? 4} 人共用补给和休息点。`,
      "天气衣物、零食和清洁用品要放在随手可取的位置。",
      "儿童的饮水、保暖、照明和药品要准备冗余。",
    ],
    ctaEn: "Plan family gear",
    ctaZh: "生成家庭装备方案",
  },
  rainy: {
    contextEn: () => "rainy checklist",
    contextZh: () => "雨天清单",
    prioritiesEn: (base) => ["Rain shell and pack cover", "Dry bags for critical items", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["雨衣与背包防雨罩", "关键物品干燥袋", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Rainy ${activity.nameEn.toLowerCase()} plans should protect insulation, electronics, and spare clothes first.`,
      "Wet trails and roads slow the group down, so shorten distance or add time margin.",
      "Cotton layers stay wet and cold; choose quick-dry or insulating layers.",
    ],
    riskZh: (_variant, activity) => [
      `雨天${activity.nameZh}先保护保暖层、电子设备和备用衣物。`,
      "湿滑路线会拖慢整体速度，要缩短距离或增加时间余量。",
      "棉质衣物湿后很难保暖，优先选择速干或保温层。",
    ],
    ctaEn: "Build a rainy-day plan",
    ctaZh: "生成雨天装备方案",
  },
  winter: {
    contextEn: () => "winter gear",
    contextZh: () => "冬季装备",
    prioritiesEn: (base) => ["Layered insulation", "Glove and foot warmth", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["分层保暖", "手部与足部保暖", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Winter ${activity.nameEn.toLowerCase()} mistakes become serious faster because cold reduces dexterity and battery life.`,
      "Protect water, food, and electronics from freezing before you optimize comfort items.",
      "Check wind exposure and daylight window, not only the temperature forecast.",
    ],
    riskZh: (_variant, activity) => [
      `冬季${activity.nameZh}的失误会更快变严重，因为低温会影响操作和电池续航。`,
      "先保护饮水、食物和电子设备防冻，再考虑舒适项。",
      "除了温度，也要确认风力暴露和日照时间。",
    ],
    ctaEn: "Create a winter gear plan",
    ctaZh: "生成冬季装备方案",
  },
  lightweight: {
    contextEn: () => "lightweight gear",
    contextZh: () => "轻量化装备",
    prioritiesEn: (base) => ["Multi-use items", "Weight-to-warmth ratio", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["一物多用", "重量与保暖效率", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Lightweight ${activity.nameEn.toLowerCase()} setups should remove duplicate comfort, not emergency margin.`,
      "Test ultralight shelter, sleep, and rain systems before relying on them overnight.",
      "A lighter pack can still fail if water, navigation, or insulation is undersized.",
    ],
    riskZh: (_variant, activity) => [
      `轻量化${activity.nameZh}应该减少重复舒适项，不要削掉应急余量。`,
      "超轻帐篷、睡眠和防雨系统要先试用，再用于过夜路线。",
      "背包更轻不代表安全，饮水、导航和保暖不能缩水。",
    ],
    ctaEn: "Optimize a lightweight plan",
    ctaZh: "生成轻量化装备方案",
  },
  weekend: {
    contextEn: () => "weekend checklist",
    contextZh: () => "周末清单",
    prioritiesEn: (base) => ["Fast packing", "Sleep and meal basics", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["快速打包", "睡眠与餐食基础", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Weekend ${activity.nameEn.toLowerCase()} plans often fail from rushed packing, not complex conditions.`,
      "Confirm arrival time, campsite or route rules, and the last reliable water source.",
      "Keep a small repair and battery kit because short trips leave little time to replace gear.",
    ],
    riskZh: (_variant, activity) => [
      `周末${activity.nameZh}常见问题不是条件复杂，而是临时打包遗漏。`,
      "确认到达时间、营地或路线规则，以及最后可靠补水点。",
      "短行程也要带小型维修和电池包，因为临时补买空间更小。",
    ],
    ctaEn: "Plan a weekend kit",
    ctaZh: "生成周末装备方案",
  },
  solo: {
    contextEn: () => "solo checklist",
    contextZh: () => "单人清单",
    prioritiesEn: (base) => ["Self-rescue basics", "Navigation redundancy", base[0] ?? "Core gear"],
    prioritiesZh: (base) => ["自救基础", "冗余导航", base[0] ?? "核心装备"],
    riskEn: (_variant, activity) => [
      `Solo ${activity.nameEn.toLowerCase()} plans need more redundancy because no one else carries backup gear.`,
      "Share route, timing, and check-in expectations with someone before leaving.",
      "Carry lighting, first aid, weather protection, and navigation where you can reach them quickly.",
    ],
    riskZh: (_variant, activity) => [
      `单人${activity.nameZh}需要更多冗余，因为没有队友携带备份装备。`,
      "出发前把路线、时间和报平安约定告诉可信的人。",
      "照明、急救、防护和导航要放在能快速拿到的位置。",
    ],
    ctaEn: "Build a solo gear plan",
    ctaZh: "生成单人装备方案",
  },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function activitySlugPart(activityKey: keyof typeof activities, activity: ActivityContent) {
  return activitySlugBase[activityKey] ?? slugify(activity.nameEn);
}

function buildSeoLandingSlug(variant: SeoLandingVariantInput) {
  const activity = activities[variant.activityKey];
  const activityPart = activitySlugPart(variant.activityKey, activity);
  const scenario = scenarioLabelEn[variant.scenario];

  if (variant.scenario === "budget") return `${scenario}-${activityPart}-gear-for-${variant.people ?? 2}-people`;
  if (variant.scenario === "rainy") return `${scenario}-${activityPart}-checklist`;
  if (variant.scenario === "family") return `${scenario}-${activityPart}-gear`;
  if (variant.scenario === "beginner" || variant.scenario === "solo" || variant.scenario === "weekend") {
    return `${scenario}-${activityPart}-checklist`;
  }
  return `${scenario}-${activityPart}-gear`;
}

function normalizeSeoLandingVariant(variant: SeoLandingVariantInput): SeoLandingVariant {
  return {
    ...variant,
    slug: variant.slug ?? buildSeoLandingSlug(variant),
  };
}

export const seoLandingVariants: SeoLandingVariant[] = seoLandingVariantSeeds.map(normalizeSeoLandingVariant);

function variantContextEn(variant: SeoLandingVariant) {
  return scenarioProfile[variant.scenario].contextEn(variant, activities[variant.activityKey]);
}

function variantContextZh(variant: SeoLandingVariant) {
  return scenarioProfile[variant.scenario].contextZh(variant, activities[variant.activityKey]);
}

function landingPriorities(activity: ActivityContent, variant: SeoLandingVariant, language: Language) {
  const checklist = language === "zh" ? activity.checklistZh : activity.checklistEn;
  const base = checklist.slice(0, 3);

  if (language === "zh") return scenarioProfile[variant.scenario].prioritiesZh(base, variant).slice(0, 3);
  return scenarioProfile[variant.scenario].prioritiesEn(base, variant).slice(0, 3);
}

function landingRisks(activity: ActivityContent, variant: SeoLandingVariant, language: Language) {
  if (language === "zh") return scenarioProfile[variant.scenario].riskZh(variant, activity).slice(0, 3);
  return scenarioProfile[variant.scenario].riskEn(variant, activity).slice(0, 3);
}

function scenarioDescriptionEn(activity: ActivityContent, variant: SeoLandingVariant, contextEn: string) {
  const scenario = scenarioLabelEn[variant.scenario];
  return `Plan ${contextEn} for ${activity.nameEn.toLowerCase()} with ${scenario}-specific priorities, risk tips, related guides, and a fast gear planner CTA.`;
}

function scenarioDescriptionZh(activity: ActivityContent, variant: SeoLandingVariant, contextZh: string) {
  return `为${activity.nameZh}${contextZh}生成${scenarioLabelZh[variant.scenario]}场景的装备重点、风险提示、相关指南和装备方案入口。`;
}

export function buildSeoLandingPage(variant: SeoLandingVariant): SeoLandingPage {
  const activity = activities[variant.activityKey];
  const contextEn = variantContextEn(variant);
  const contextZh = variantContextZh(variant);
  const difficultyEn = difficultyLabelEn[variant.difficulty ?? "standard"];
  const difficultyZh = difficultyLabelZh[variant.difficulty ?? "standard"];
  const titleEn = `${activity.nameEn} ${contextEn} | Outdoor Gear Calculator`;
  const titleZh = `${activity.nameZh}${contextZh} | Outdoor Gear Calculator`;

  return {
    ...variant,
    activity,
    titleEn,
    titleZh,
    descriptionEn: scenarioDescriptionEn(activity, variant, contextEn),
    descriptionZh: scenarioDescriptionZh(activity, variant, contextZh),
    heroTitleEn: `${activity.nameEn} ${contextEn}`,
    heroTitleZh: `${activity.nameZh}${contextZh}`,
    heroTextEn: `A focused ${scenarioLabelEn[variant.scenario]} landing page for ${difficultyEn} ${activity.nameEn.toLowerCase()} planning, tuned by weather, group size, and trip complexity.`,
    heroTextZh: `面向${difficultyZh}${activity.nameZh}的${scenarioLabelZh[variant.scenario]}装备页面，会根据天气、人数和难度调整重点。`,
    prioritiesEn: landingPriorities(activity, variant, "en"),
    prioritiesZh: landingPriorities(activity, variant, "zh"),
    riskTipsEn: landingRisks(activity, variant, "en"),
    riskTipsZh: landingRisks(activity, variant, "zh"),
    ctaEn: scenarioProfile[variant.scenario].ctaEn,
    ctaZh: scenarioProfile[variant.scenario].ctaZh,
  };
}

export const seoLandingPages = seoLandingVariants.map((variant) => buildSeoLandingPage(variant));

export const seoLandingPagesBySlug = Object.fromEntries(
  seoLandingPages.map((page) => [page.slug, page]),
) as Record<string, SeoLandingPage>;
