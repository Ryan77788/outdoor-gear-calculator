import { categoryEnByGearCategory, type Activity, type Product } from "@/data/products";
import type { GearItem, OutdoorInsightReport, RiskBlock, TripDays, Weather } from "@/lib/recommendation";

export type Language = "en" | "zh";

export const translations = {
  en: {
    languageEnglish: "English",
    languageChinese: "中文",
    heroTitle: "Plan the Right Outdoor Gear in Seconds",
    heroDescription:
      "Choose your activity, weather, group size and budget. Get a practical gear checklist with product recommendations and risk notes.",
    activityType: "Activity",
    tripDays: "Trip length",
    weather: "Weather",
    peopleCount: "People",
    budget: "Total budget (CNY)",
    budgetHint: "Budget is calculated for the whole trip, not per person.",
    groupBudgetHint: "Current total budget is for {count} people. Consumables and personal gear scale with group size.",
    generateGearList: "Generate gear plan",
    aiPanelTitle: "Trip profile",
    activity: "Activity",
    trip: "Trip",
    requiredGear: "Essential gear",
    requiredGearNote: "Generated from activity, weather, trip length, and group size.",
    scrollMore: "Scroll down for more gear",
    recommendedProducts: "Recommended products",
    productPlan: "Gear combination",
    totalBudget: "Total budget",
    recommendedTotal: "Recommended total",
    remainingBudget: "Remaining",
    slightlyOver: "Slightly over",
    savePlan: "Save this plan",
    saved: "Saved",
    viewSavedPlan: "View saved plan",
    generateShareImage: "Generate share image",
    generating: "Generating...",
    unitPrice: "Unit price",
    quantity: "Qty",
    subtotal: "Subtotal",
    viewProduct: "View product",
    riskTips: "Risk notes",
    myPlans: "My plan library",
    recentPlans: "Recently saved gear plans",
    noSavedPlans: "No saved plans yet.",
    reload: "Reload",
    delete: "Delete",
    copyShareLink: "Copy share link",
    copied: "Copied",
    savedAt: "Saved",
    shareImageTitle: "Outdoor Gear Plan",
    exportActivity: "Activity",
    exportWeather: "Weather",
    exportDays: "Days",
    exportPeople: "People",
    exportBudget: "Budget",
    sharedPlan: "Shared gear plan",
    planNotFound: "Plan not found or deleted",
    planNotFoundDescription:
      "This share link cannot be opened. The link may be incomplete, or the original plan may have been deleted.",
    essentialGearList: "Essential gear list",
    essentialGearDescription: "Saved list based on this activity, weather, trip length, and group size.",
    recommendedProductList: "Recommended product list",
    savedTime: "Saved time",
  },
  zh: {
    languageEnglish: "English",
    languageChinese: "中文",
    heroTitle: "户外装备选择器",
    heroDescription: "根据活动类型、天气、人数和整套预算，生成更贴近真实出行场景的装备清单与组合推荐。",
    activityType: "活动类型",
    tripDays: "出行天数",
    weather: "天气情况",
    peopleCount: "出行人数",
    budget: "整套预算（元）",
    budgetHint: "预算按本次出行的整套装备计算，不是单人预算。",
    groupBudgetHint: "当前为 {count} 人总预算，系统会按人数估算消耗品和个人装备数量。",
    generateGearList: "生成装备清单",
    aiPanelTitle: "本次出行画像",
    activity: "活动",
    trip: "行程",
    requiredGear: "必备装备",
    requiredGearNote: "按活动、天气、天数和人数动态生成。",
    scrollMore: "向下滚动查看更多装备",
    recommendedProducts: "推荐商品",
    productPlan: "装备组合方案",
    totalBudget: "整套预算",
    recommendedTotal: "推荐组合总价",
    remainingBudget: "剩余预算",
    slightlyOver: "小幅超出",
    savePlan: "保存本次方案",
    saved: "已保存",
    viewSavedPlan: "查看已保存方案",
    generateShareImage: "生成分享图",
    generating: "生成中...",
    unitPrice: "单价",
    quantity: "数量",
    subtotal: "小计",
    viewProduct: "查看商品",
    riskTips: "风险提示",
    myPlans: "我的方案库",
    recentPlans: "最近保存的装备方案",
    noSavedPlans: "暂无保存方案。",
    reload: "重新加载",
    delete: "删除",
    copyShareLink: "复制分享链接",
    copied: "已复制",
    savedAt: "保存",
    shareImageTitle: "户外装备方案",
    exportActivity: "活动",
    exportWeather: "天气",
    exportDays: "天数",
    exportPeople: "人数",
    exportBudget: "预算",
    sharedPlan: "已分享的装备方案",
    planNotFound: "方案不存在或已被删除",
    planNotFoundDescription: "这个分享链接暂时无法打开。可能是链接不完整，或者原方案已经从方案库中删除。",
    essentialGearList: "必备装备列表",
    essentialGearDescription: "按本次活动、天气、天数和人数保存的清单。",
    recommendedProductList: "推荐商品列表",
    savedTime: "保存时间",
  },
} as const;

const valueLabels: Record<Language, Record<string, string>> = {
  en: {
    "登山": "Mountaineering",
    "徒步": "Hiking",
    "露营": "Camping",
    "滑雪": "Skiing",
    "钓鱼": "Fishing",
    "自驾游": "Road trip",
    "骑行": "Cycling",
    "海边旅行": "Beach trip",
    "越野跑": "Trail running",
    "重装徒步": "Backpacking",
    "攀岩": "Climbing",
    "皮划艇": "Kayaking",
    "单板滑雪": "Snowboarding",
    "沙漠徒步": "Desert hiking",
    "冬季露营": "Winter camping",
    "海边露营": "Beach camping",
    "晴天": "Sunny",
    "雨天": "Rainy",
    "寒冷": "Cold",
    "炎热": "Hot",
    "1天": "1 day",
    "2-3天": "2-3 days",
    "4天以上": "4+ days",
    "轻量短途型": "Light short-trip type",
    "多人共享型": "Group sharing type",
    "高预算舒适型": "High-budget comfort type",
    "极寒谨慎型": "Cold-weather cautious type",
    "长途耐力型": "Long-distance endurance type",
    "基础安全型": "Core safety type",
    "高温轻装型": "Hot-weather light type",
    "均衡探索型": "Balanced explorer type",
    "优先轻量化与耐力分配": "Prioritize low weight and endurance",
    "优先保暖与返程冗余": "Prioritize warmth and return-trip margin",
    "优先共享装备与协作效率": "Prioritize shared gear and coordination",
    "优先基础安全与高频装备": "Prioritize safety basics and high-use gear",
    "优先舒适性、轻量化和高性能装备": "Prioritize comfort, low weight, and performance",
    "优先防水、排水和营地稳定": "Prioritize waterproofing, drainage, and camp stability",
    "优先安全冗余与体验均衡": "Prioritize safety margin and balanced comfort",
    "装备取舍": "Gear priorities",
    "天气判断": "Weather read",
    "预算策略": "Budget strategy",
    "安全提醒": "Safety callout",
  },
  zh: {},
};

export function getLanguageFromValue(value: unknown): Language {
  return value === "zh" ? "zh" : "en";
}

export function localizeValue(value: string | number, language: Language) {
  if (typeof value === "number") return String(value);
  return valueLabels[language][value] ?? value;
}

export function formatPeople(count: number, language: Language) {
  return language === "en" ? `${count} ${count === 1 ? "person" : "people"}` : `${count}人`;
}

export function formatCurrency(value: number, language: Language) {
  return language === "en" ? `CNY ${value.toLocaleString("en-US")}` : `¥${value.toLocaleString("zh-CN")}`;
}

const quantityUnitEn: Record<string, string> = {
  个: "pcs",
  件: "pcs",
  根: "rods",
  把: "pcs",
  双: "pairs",
  副: "sets",
  顶: "pcs",
  张: "pcs",
  套: "sets",
  条: "pcs",
  瓶: "bottles",
  份: "portions",
  L: "L",
  片: "pcs",
};

const unitEn: Record<string, string> = {
  个: "pc",
  件: "pc",
  根: "rod",
  把: "pc",
  双: "pair",
  副: "set",
  顶: "pc",
  张: "pc",
  套: "set",
  条: "pc",
  瓶: "bottle",
  份: "portion",
  L: "L",
  片: "pc",
};

export function formatQuantity(quantity: string, language: Language) {
  if (language === "zh") return quantity;

  const match = quantity.match(/^(\d+(?:\.\d+)?)(.*)$/);

  if (!match) return quantity;

  const [, amount, unit] = match;
  const trimmedUnit = unit.trim();
  const unitLabel = quantityUnitEn[trimmedUnit] ?? trimmedUnit;

  return unitLabel ? `${amount} ${unitLabel}` : amount;
}

export function formatUnit(unit: string, language: Language) {
  if (language === "zh") return unit;
  return unitEn[unit.trim()] ?? unit;
}

export function formatSavedTime(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const gearNameEnFallbacks: Array<[string, string]> = [
  ["帐篷", "Tent"],
  ["睡袋", "Sleeping bag"],
  ["防潮垫", "Sleeping pad"],
  ["炉具", "Camp stove"],
  ["营地灯", "Camp light"],
  ["头灯", "Headlamp"],
  ["登山鞋", "Mountaineering shoes"],
  ["徒步鞋", "Hiking shoes"],
  ["冲锋衣", "Shell jacket"],
  ["背包", "Backpack"],
  ["登山杖", "Trekking poles"],
  ["饮用水", "Drinking water"],
  ["食物补给", "Trail food"],
  ["急救包", "First aid kit"],
  ["鱼竿", "Fishing rod"],
  ["钓椅", "Fishing chair"],
  ["滑雪板", "Ski board"],
  ["固定器", "Ski binding"],
  ["雪靴", "Ski boots"],
  ["滑雪服", "Ski suit"],
  ["头盔", "Helmet"],
  ["手套", "Gloves"],
  ["防晒", "Sunscreen"],
  ["遮阳帽", "Sun hat"],
  ["防水袋", "Dry bag"],
  ["速干毛巾", "Quick-dry towel"],
];

function matchEnglishFallback(value: string, fallbacks: Array<[string, string]>) {
  return fallbacks.find(([keyword]) => value.includes(keyword))?.[1];
}

export function localizeGearName(item: Pick<GearItem, "name" | "nameEn">, language: Language) {
  if (language === "zh") return item.name;
  return item.nameEn ?? matchEnglishFallback(item.name, gearNameEnFallbacks) ?? item.name;
}

export function localizeGearReason(item: Pick<GearItem, "reason" | "reasonEn">, language: Language) {
  if (language === "zh") return item.reason;
  return item.reasonEn ?? item.reason;
}

export function localizeProductName(product: Pick<Product, "name" | "nameEn" | "brand" | "gearCategory">, language: Language) {
  if (language === "zh") return product.name;
  return product.nameEn ?? `${product.brand} ${categoryEnByGearCategory[product.gearCategory]}`;
}

export function localizeProductReason(product: Pick<Product, "reason" | "reasonEn">, language: Language) {
  if (language === "zh") return product.reason;
  return product.reasonEn ?? product.reason;
}

export function localizeProductCategory(product: Pick<Product, "category" | "categoryEn" | "gearCategory">, language: Language) {
  if (language === "zh") return product.category;
  return product.categoryEn ?? categoryEnByGearCategory[product.gearCategory] ?? product.category;
}

const riskEnglishFallbacks: Record<string, { title: string; text: string }> = {
  activity: {
    title: "Activity fit",
    text: "Match the plan to the real terrain, pace, and skill level rather than the ideal version of the trip.",
  },
  calendar: {
    title: "Timing margin",
    text: "Keep a clear return window and avoid pushing the route when daylight or energy starts to run low.",
  },
  weather: {
    title: "Weather exposure",
    text: "Watch how sun, rain, wind, or heat changes the route over time, not just at the start.",
  },
  people: {
    title: "Group pacing",
    text: "Agree on pace, meetup points, and roles so the group does not spread out silently.",
  },
  budget: {
    title: "Budget focus",
    text: "Spend first on safety, weather protection, and high-use items before comfort upgrades.",
  },
  pack: {
    title: "Supply margin",
    text: "Carry enough water, food, and backup essentials for delays or a slower return.",
  },
  shield: {
    title: "Protection first",
    text: "Prioritize protective gear and conservative decisions when conditions become less predictable.",
  },
  route: {
    title: "Route planning",
    text: "Confirm route difficulty, exit points, and backup options before committing to the day.",
  },
  clock: {
    title: "Time control",
    text: "The safest plan has a latest turnaround time, not just a destination.",
  },
};

export function localizeRiskTitle(risk: Pick<RiskBlock, "icon" | "title" | "titleEn">, language: Language) {
  if (language === "zh") return risk.title;
  return risk.titleEn ?? riskEnglishFallbacks[risk.icon]?.title ?? risk.title;
}

export function localizeRiskText(risk: Pick<RiskBlock, "icon" | "text" | "descriptionEn">, language: Language) {
  if (language === "zh") return risk.text;
  return risk.descriptionEn ?? riskEnglishFallbacks[risk.icon]?.text ?? risk.text;
}

function getBudgetTone(budget: number, peopleCount: number) {
  const perPersonBudget = Math.max(0, budget) / Math.max(1, peopleCount);

  if (perPersonBudget < 900) return "tight";
  if (perPersonBudget < 2500) return "balanced";
  return "comfortable";
}

function getEnglishProfile(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") return "Cold-weather cautious type";
  if (tripDays === "4天以上") return "Long-distance endurance type";
  if (peopleCount >= 3) return "Group sharing type";
  if (budgetTone === "comfortable") return "High-budget comfort type";
  if (budgetTone === "tight") return "Core safety type";
  if (tripDays === "1天" && ["徒步", "钓鱼", "骑行"].includes(activity)) return "Light short-trip type";
  if (weather === "炎热") return "Hot-weather light type";
  return "Balanced explorer type";
}

function getEnglishStrategy(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") return "Prioritize warmth and return-trip margin";
  if (tripDays === "4天以上") return "Prioritize low weight and endurance";
  if (peopleCount >= 3) return "Prioritize shared gear and coordination";
  if (budgetTone === "tight") return "Prioritize safety basics and high-use gear";
  if (budgetTone === "comfortable") return "Prioritize comfort, low weight, and performance";
  if (activity === "露营" && weather === "雨天") return "Prioritize waterproofing, drainage, and camp stability";
  return "Prioritize safety margin and balanced comfort";
}

function getEnglishSummary(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") return "The risky part is usually not the start, but the return leg, waiting time, and cooling after fatigue sets in.";
  if (tripDays === "4天以上") return "For a long trip, steady energy matters more than a packed kit. Every extra item has to earn its weight.";
  if (peopleCount >= 3) return "For a group trip, do not simply multiply gear by headcount. Separate shared systems, personal gear, and roles.";
  if (budgetTone === "tight") return `For ${localizeValue(activity, "en").toLowerCase()}, buy fewer things but make the safety basics dependable.`;
  if (budgetTone === "comfortable") return "A higher budget is best spent on saved energy: lighter gear, better fit, stable protection, and recovery.";
  if (weather === "炎热") return "In hot weather, light packing is only the first step. Hydration rhythm and shade management decide the second half of the day.";
  return "This setup suits a balanced approach: lock in safety and core comfort first, then upgrade the nice-to-have details.";
}

function getEnglishInsights(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);
  const activityLabel = localizeValue(activity, "en").toLowerCase();

  return [
    {
      type: "gear" as const,
      title: "Gear priorities",
      text:
        tripDays === "4天以上"
          ? "For a longer route, every item should work repeatedly under fatigue. Low weight and durability matter more than one-off comfort."
          : peopleCount >= 3
            ? "Plan stoves, lights, power, first aid, and camp furniture as shared systems to reduce duplicate cost and pack weight."
            : weather === "寒冷"
              ? "Do not solve cold by adding bulk alone. A wicking base, warm mid layer, and windproof shell need to work as a system."
              : `For ${activityLabel}, start with the gear that protects movement, weather exposure, and recovery before adding accessories.`,
    },
    {
      type: "weather" as const,
      title: "Weather read",
      text:
        weather === "寒冷"
          ? "In cold conditions, the dangerous moments often happen on the return leg or during stops. Keep a dry warm layer for later."
          : weather === "雨天"
            ? "Rain is not just about getting wet. Slippery ground, soaked gear, and night cooling compound quickly, so separate wet and dry layers early."
            : weather === "炎热"
              ? "Heat rewards a lighter kit, but sunscreen, electrolytes, and shaded breaks are still part of the safety system."
              : "Sunny weather improves efficiency, but glare, dehydration, and exposed sections still call for sun and eye protection.",
    },
    {
      type: "budget" as const,
      title: "Budget strategy",
      text:
        budgetTone === "tight"
          ? `With a tight budget, keep the ${activityLabel} setup disciplined: share what can be shared and upgrade only safety-critical personal gear.`
          : budgetTone === "comfortable"
            ? "A higher budget should not just buy expensive big items. Spend it on fit, lower weight, sleep quality, and weather margin."
            : "This budget is best used evenly: stable core gear first, then selective comfort upgrades for items you will use often.",
    },
    {
      type: "safety" as const,
      title: "Safety callout",
      text:
        tripDays === "4天以上"
          ? "Long-trip safety comes from clear exit points, resupply windows, and a latest turnaround time for each day."
          : peopleCount >= 4
            ? "For a larger group, define lead, sweep, and meetup points. Real risk often starts when the team silently spreads out."
            : weather === "寒冷"
              ? "Move your safety boundary earlier in cold weather. Numb hands, slower movement, or longer stops are signs to shorten the plan."
              : "Share the route, weather window, and return time before departure. A good gear list still needs an exit plan.",
    },
  ];
}

export function localizeInsightReport(
  report: OutdoorInsightReport,
  language: Language,
  context: {
    activity: Activity;
    weather: Weather;
    tripDays: TripDays;
    peopleCount: number;
    budget: number;
  },
): OutdoorInsightReport {
  if (language === "zh") return report;

  return {
    profile: getEnglishProfile(context.activity, context.weather, context.tripDays, context.peopleCount, context.budget),
    strategy: getEnglishStrategy(context.activity, context.weather, context.tripDays, context.peopleCount, context.budget),
    summary: getEnglishSummary(context.activity, context.weather, context.tripDays, context.peopleCount, context.budget),
    insights: getEnglishInsights(context.activity, context.weather, context.tripDays, context.peopleCount, context.budget),
  };
}
