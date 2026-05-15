import {
  productCatalog,
  type Activity,
  type BudgetWeight,
  type GearCategory,
  type Product,
  type ProductLevel,
  type ProductPriority,
  type ProductTemplate,
} from "@/data/products";

export type TripDays = "1天" | "2-3天" | "4天以上";
export type Weather = "晴天" | "雨天" | "寒冷" | "炎热";
export type GearPriority = "safety" | "weather" | "core" | "comfort";
export type RiskIconName = "activity" | "calendar" | "weather" | "people" | "budget" | "pack" | "spark" | "alert" | "check" | "shield" | "route" | "clock";

export type GearTemplate = {
  name: string;
  reason: string;
  priority: GearPriority;
};

export type GearItem = GearTemplate & {
  quantity: string;
};

export type RiskBlock = {
  icon: RiskIconName;
  title: string;
  text: string;
};

export type BudgetLevel = "low" | "mid" | "high" | "ultra";

export const tripDayOptions: TripDays[] = ["1天", "2-3天", "4天以上"];
export const weatherOptions: Weather[] = ["晴天", "雨天", "寒冷", "炎热"];

const priorityRank: Record<GearPriority, number> = {
  safety: 0,
  weather: 1,
  core: 2,
  comfort: 3,
};

const productPriorityRank: Record<ProductPriority, number> = {
  core: 0,
  important: 1,
  optional: 2,
};

const budgetWeightRank: Record<BudgetWeight, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const weatherBoostKeywords: Record<Weather, string[]> = {
  雨天: ["冲锋衣", "防水鞋", "防水袋", "速干衣", "速干毛巾", "保暖层"],
  寒冷: ["保暖层", "保暖衣", "手套", "滑雪手套", "暖宝宝", "保温", "睡袋", "滑雪服", "保暖内衣"],
  晴天: ["防晒霜", "太阳镜", "遮阳帽", "防晒帽"],
  炎热: ["防晒霜", "太阳镜", "遮阳帽", "防晒帽", "水袋"],
};

const weatherPenaltyKeywords: Record<Weather, string[]> = {
  雨天: ["防晒霜", "太阳镜", "遮阳帽", "防晒帽"],
  寒冷: ["轻量", "通风", "防晒霜", "太阳镜", "遮阳帽", "防晒帽"],
  晴天: [],
  炎热: ["保暖层", "保暖衣", "暖宝宝", "保温", "睡袋"],
};

const repeatableGearCategories = new Set<GearCategory>(["food", "water", "warmPatch", "consumable"]);

const activityCoreGearCategories: Record<Activity, GearCategory[]> = {
  登山: ["shellJacket", "shoes", "backpack", "pole", "headlamp"],
  露营: ["tent", "sleepingBag", "mat", "stove", "lighting"],
  徒步: ["shoes", "backpack", "water", "headlamp", "pole"],
  自驾游: ["power", "cooler", "vehicleTool"],
  钓鱼: ["fishingRod", "fishingLine", "chair"],
  滑雪: ["skiBoard", "skiBoots", "skiSuit", "goggles", "helmet"],
  骑行: ["helmet", "lighting", "repair", "gloves", "water"],
  海边旅行: ["dryBag", "sunHat", "sunglasses", "consumable"],
};

const longTripShelterCategories = new Set<GearCategory>(["tent", "sleepingBag", "mat"]);

function productText(product: ProductTemplate | Product) {
  return [product.name, product.category, ...product.tags].join(" ");
}

function matchesAnyProductKeyword(product: ProductTemplate | Product, keywords: string[]) {
  const text = productText(product);

  return keywords.some((keyword) => text.includes(keyword));
}

function isWeatherBoostedProduct(product: ProductTemplate | Product, weather: Weather) {
  return matchesAnyProductKeyword(product, weatherBoostKeywords[weather]);
}

function isWeatherPenaltyProduct(product: ProductTemplate | Product, weather: Weather) {
  return matchesAnyProductKeyword(product, weatherPenaltyKeywords[weather]);
}

function getEnvironmentRank(product: Product, weather: Weather) {
  if (isWeatherBoostedProduct(product, weather)) {
    return 0;
  }

  if (product.weatherFit.includes(weather === "炎热" ? "晴天" : weather)) {
    return 1;
  }

  if (isWeatherPenaltyProduct(product, weather)) {
    return 4;
  }

  return 2;
}

function getGearCategoryWeatherRank(product: Product, weather: Weather) {
  if (product.gearCategory !== "shoes") {
    return 0;
  }

  const text = productText(product);
  const waterproof = text.includes("防水") || text.includes("防雨");

  if (weather === "雨天") {
    return waterproof ? 0 : 1;
  }

  if (weather === "晴天" || weather === "炎热") {
    return waterproof ? 1 : 0;
  }

  return 0;
}

function isLongTripShelter(product: ProductTemplate | Product) {
  return longTripShelterCategories.has(product.gearCategory);
}

function isProductAllowedForActivity(product: ProductTemplate | Product, activity: Activity, days: TripDays) {
  if (!product.activities.includes(activity)) {
    return false;
  }

  if (isLongTripShelter(product)) {
    return activity === "露营" || (activity === "徒步" && days === "4天以上");
  }

  if (activity === "滑雪" && ["tent", "sleepingBag", "mat", "stove", "chair"].includes(product.gearCategory)) {
    return false;
  }

  return true;
}

function isActivityCoreProduct(product: ProductTemplate | Product, activity: Activity, days: TripDays) {
  return product.activityCore && isProductAllowedForActivity(product, activity, days) && activityCoreGearCategories[activity].includes(product.gearCategory);
}

function getActivityCoreRank(product: Product, activity: Activity, days: TripDays) {
  return isActivityCoreProduct(product, activity, days) ? 0 : 1;
}

function getActivityCoreCategoryRank(product: Product, activity: Activity) {
  const coreCategories = activityCoreGearCategories[activity];
  const index = coreCategories.indexOf(product.gearCategory);

  return index === -1 ? coreCategories.length : index;
}

function getBudgetUpgradeRank(product: Product) {
  const budgetWeightDiff = budgetWeightRank[product.budgetWeight] * 10;
  const levelDiff = product.activityCore ? 2 - levelRank(product.level) : levelRank(product.level);

  return budgetWeightDiff + levelDiff;
}

const activityGear: Record<Activity, GearTemplate[]> = {
  登山: [
    { name: "应急毯", reason: "失温或等待救援时提供基础保温。", priority: "safety" },
    { name: "头灯", reason: "清晨出发或晚归时保证照明。", priority: "safety" },
    { name: "冲锋衣", reason: "防风防雨，应对山地天气突变。", priority: "weather" },
    { name: "登山鞋", reason: "保护脚踝并提升复杂路面的抓地力。", priority: "core" },
    { name: "登山杖", reason: "减轻膝盖压力，提升上下坡稳定性。", priority: "core" },
    { name: "手套", reason: "保护手部，减少低温和岩石摩擦影响。", priority: "weather" },
    { name: "保暖层", reason: "海拔和风速变化时维持体温。", priority: "weather" },
  ],
  露营: [
    { name: "急救包", reason: "处理擦伤、扭伤和常见突发情况。", priority: "safety" },
    { name: "营地灯", reason: "夜间照明和营地活动更安全。", priority: "safety" },
    { name: "帐篷", reason: "提供夜间基础庇护和防风防雨能力。", priority: "core" },
    { name: "睡袋", reason: "保证夜间保暖和睡眠舒适度。", priority: "weather" },
    { name: "防潮垫", reason: "隔绝地面潮气和寒气。", priority: "weather" },
    { name: "炉具", reason: "便于烧水和制作简单餐食。", priority: "core" },
    { name: "折叠椅", reason: "提升营地休息体验。", priority: "comfort" },
    { name: "保温箱", reason: "保存饮品和食材，适合露营餐食。", priority: "comfort" },
  ],
  徒步: [
    { name: "头灯", reason: "应对晚归、山路和临时照明。", priority: "safety" },
    { name: "急救包", reason: "处理擦伤、扭伤和水泡等常见小伤。", priority: "safety" },
    { name: "徒步背包", reason: "稳定携带补给和个人物品。", priority: "core" },
    { name: "登山鞋", reason: "长距离行走时减少脚部疲劳。", priority: "core" },
    { name: "水袋", reason: "行进中补水更方便。", priority: "core" },
    { name: "速干衣", reason: "排汗快，降低汗湿后的失温风险。", priority: "weather" },
    { name: "登山杖", reason: "缓解膝盖压力并提升稳定性。", priority: "core" },
  ],
  自驾游: [
    { name: "车载急救包", reason: "处理行车和营地中的轻微伤情。", priority: "safety" },
    { name: "充气泵", reason: "应对胎压不足和长途补气。", priority: "safety" },
    { name: "户外电源", reason: "为手机、灯具和小电器提供续航。", priority: "core" },
    { name: "车载冰箱", reason: "长途保存食材和饮品更稳定。", priority: "comfort" },
    { name: "折叠桌椅", reason: "提升停车休息和营地用餐体验。", priority: "comfort" },
    { name: "保温箱", reason: "低成本保存冷饮和食材。", priority: "comfort" },
  ],
  钓鱼: [
    { name: "急救包", reason: "处理鱼钩划伤、擦伤等小伤。", priority: "safety" },
    { name: "防滑鞋", reason: "湿滑岸边站立更稳。", priority: "safety" },
    { name: "鱼竿", reason: "钓鱼活动的核心工具。", priority: "core" },
    { name: "防晒帽", reason: "减少水面反光和暴晒影响。", priority: "weather" },
    { name: "钓椅", reason: "长时间等待时保持舒适。", priority: "comfort" },
    { name: "保温箱", reason: "保存饮品、饵料或渔获。", priority: "comfort" },
  ],
  滑雪: [
    { name: "护具", reason: "降低摔倒时的关节和躯干损伤。", priority: "safety" },
    { name: "滑雪镜", reason: "减少雪盲和强光刺激。", priority: "safety" },
    { name: "滑雪服", reason: "防风防雪并保暖，是雪场核心装备。", priority: "weather" },
    { name: "滑雪手套", reason: "保暖并保护手部。", priority: "weather" },
    { name: "保暖内衣", reason: "维持基础体温并排汗。", priority: "weather" },
  ],
  骑行: [
    { name: "头盔", reason: "骑行安全的第一优先级装备。", priority: "safety" },
    { name: "车灯", reason: "提高夜间和隧道可见度。", priority: "safety" },
    { name: "补胎工具", reason: "应对扎胎，避免中途被迫终止。", priority: "safety" },
    { name: "骑行手套", reason: "提升握把稳定性并缓冲震动。", priority: "core" },
    { name: "骑行水壶", reason: "行进中便捷补水。", priority: "core" },
  ],
  海边旅行: [
    { name: "防晒霜", reason: "海边紫外线和反光强，需要加强防晒。", priority: "weather" },
    { name: "遮阳帽", reason: "降低头面部暴晒。", priority: "weather" },
    { name: "防水袋", reason: "保护手机、证件和电子设备。", priority: "safety" },
    { name: "沙滩垫", reason: "坐卧休息更舒适，减少沙土附着。", priority: "comfort" },
    { name: "速干毛巾", reason: "游泳或涉水后快速擦干。", priority: "comfort" },
  ],
};

const weatherGear: Record<Weather, GearTemplate[]> = {
  晴天: [
    { name: "太阳镜", reason: "减少强光刺激，保护眼睛。", priority: "weather" },
    { name: "防晒霜", reason: "长时间暴露时降低晒伤风险。", priority: "weather" },
    { name: "遮阳帽", reason: "保护头面部，降低中暑概率。", priority: "weather" },
  ],
  雨天: [
    { name: "雨衣", reason: "每人一件，避免雨天长时间淋湿。", priority: "weather" },
    { name: "防水鞋套", reason: "减少鞋袜湿透，提升行走舒适度。", priority: "weather" },
    { name: "防水收纳袋", reason: "保护衣物、证件和电子设备。", priority: "safety" },
  ],
  寒冷: [
    { name: "保暖衣", reason: "低温环境中维持核心体温。", priority: "weather" },
    { name: "暖宝宝", reason: "寒冷天气按人数和天数准备。", priority: "weather" },
    { name: "保温杯", reason: "热饮能帮助寒冷环境下补水和保暖。", priority: "comfort" },
  ],
  炎热: [
    { name: "补水电解质", reason: "补充出汗流失的盐分和矿物质。", priority: "safety" },
    { name: "防晒袖套", reason: "减少手臂暴晒。", priority: "weather" },
    { name: "冰袋", reason: "高温下辅助降温。", priority: "comfort" },
  ],
};

const durationGear: Record<TripDays, GearTemplate[]> = {
  "1天": [
    { name: "轻量背包", reason: "短途装下水、食物和应急物即可。", priority: "core" },
    { name: "能量棒", reason: "快速补充热量，适合短途机动补给。", priority: "core" },
  ],
  "2-3天": [
    { name: "备用电源", reason: "保障手机、头灯和导航设备续航。", priority: "safety" },
    { name: "简易药品", reason: "覆盖肠胃、过敏、感冒等常见情况。", priority: "safety" },
    { name: "换洗衣物", reason: "多日行程需要保持干爽和基础卫生。", priority: "comfort" },
  ],
  "4天以上": [
    { name: "备用电源", reason: "长线行程需要更高的通信与导航续航冗余。", priority: "safety" },
    { name: "备用照明", reason: "多日户外要准备照明冗余。", priority: "safety" },
    { name: "大容量背包", reason: "长线行程需要更高装载能力。", priority: "core" },
  ],
};

const commonGear: GearTemplate[] = [
  { name: "饮用水", reason: "按人数和天数估算，建议分装携带。", priority: "safety" },
  { name: "食物补给", reason: "按人数和行程长度准备，预留体力消耗。", priority: "safety" },
  { name: "餐具", reason: "按人数准备独立餐具，保持用餐卫生。", priority: "comfort" },
];

function getTripDaysCount(tripDays: TripDays) {
  if (tripDays === "1天") {
    return 1;
  }

  if (tripDays === "2-3天") {
    return 3;
  }

  return 4;
}

export function calculateGearQuantity(item: GearTemplate, people: number, days: TripDays, weather: Weather, budget = 0) {
  const itemName = item.name;
  const safePeople = Math.max(1, people);
  const dayCount = getTripDaysCount(days);
  const teamSmall = safePeople <= 4;

  switch (itemName) {
    case "冲锋衣":
    case "保暖层":
    case "保暖衣":
    case "雨衣":
    case "防水袋":
    case "速干衣":
    case "防晒袖套":
    case "保暖内衣":
      return `${safePeople}件`;
    case "换洗衣物":
    case "滑雪服":
    case "护具":
    case "登山杖":
    case "餐具":
    case "炉具":
      return `${itemName === "炉具" ? (teamSmall ? 1 : 2) : safePeople}套`;
    case "速干毛巾":
      return `${safePeople}条`;
    case "沙滩垫":
    case "防潮垫":
      return `${safePeople}张`;
    case "手套":
    case "滑雪手套":
    case "骑行手套":
    case "登山鞋":
    case "防滑鞋":
    case "防水鞋套":
    case "防水袜":
    case "拖鞋":
      return `${safePeople}双`;
    case "防晒帽":
    case "遮阳帽":
      return `${safePeople}顶`;
    case "太阳镜":
    case "滑雪镜":
      return `${safePeople}副`;
    case "头盔":
    case "水壶":
    case "水袋":
    case "骑行水壶":
    case "睡袋":
    case "头灯":
      return `${safePeople}个`;
    case "饮用水":
      return `${safePeople * dayCount * 3}L`;
    case "食物补给":
      return `${safePeople * dayCount * 2}份`;
    case "能量棒":
      return `${safePeople * dayCount * 2}根`;
    case "暖宝宝":
      return weather === "寒冷" ? `${safePeople * dayCount * 2}片` : "备用";
    case "防晒霜":
      return `${safePeople <= 2 ? 1 : safePeople <= 5 ? 2 : 3}瓶`;
    case "帐篷":
      return `${safePeople <= 2 ? 1 : safePeople <= 4 ? 2 : Math.ceil(safePeople / 2)}顶`;
    case "急救包":
    case "车载急救包":
    case "简易药品":
      return `${teamSmall ? 1 : 2}个`;
    case "营地灯":
      return `${safePeople <= 2 ? 1 : safePeople <= 4 ? 2 : 3}个`;
    case "户外电源":
    case "备用电源":
      return `${days === "4天以上" || budget >= 5000 ? 2 : 1}个`;
    case "备用照明":
      return `${safePeople > 4 || days === "4天以上" ? 2 : 1}个`;
    case "保温箱":
      return `${safePeople >= 5 ? 2 : 1}个`;
    case "折叠桌":
      return "1张";
    case "折叠椅":
    case "钓椅":
      return `${safePeople}把`;
    default:
      if (itemName.includes("防水袋")) {
        return `${safePeople}件`;
      }

      if (itemName.includes("换洗")) {
        return `${safePeople}套`;
      }

      if (itemName.includes("毛巾")) {
        return `${safePeople}条`;
      }

      if (itemName.includes("垫") && !itemName.includes("桌垫")) {
        return `${safePeople}张`;
      }

      if (itemName.includes("拖鞋")) {
        return `${safePeople}双`;
      }

      if (itemName.includes("餐具")) {
        return `${safePeople}套`;
      }

      return "1件";
  }
}

function mergeGear(items: GearTemplate[]) {
  const map = new Map<string, GearTemplate>();

  for (const item of items) {
    const existing = map.get(item.name);

    if (!existing || priorityRank[item.priority] < priorityRank[existing.priority]) {
      map.set(item.name, item);
    }
  }

  return Array.from(map.values());
}

export function buildGearList(
  activity: Activity,
  tripDays: TripDays,
  weather: Weather,
  peopleCount: number,
  budget: number,
): GearItem[] {
  return mergeGear([...commonGear, ...weatherGear[weather], ...activityGear[activity], ...durationGear[tripDays]])
    .map((item) => ({
      ...item,
      quantity: calculateGearQuantity(item, peopleCount, tripDays, weather, budget),
    }))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 12);
}

export function getProductQuantity(product: ProductTemplate, people: number, days: TripDays, weather: Weather) {
  const category = product.category;
  const safePeople = Math.max(1, people);
  const dayCount = getTripDaysCount(days);

  if (product.gearType === "perPerson") {
    return safePeople;
  }

  if (category.includes("帐篷")) {
    return Math.max(1, Math.ceil(safePeople / 3));
  }

  if (category.includes("炉具") || category.includes("折叠桌椅") || category.includes("营地灯")) {
    return safePeople <= 4 ? 1 : 2;
  }

  if (category.includes("急救包") || category.includes("充气泵") || category.includes("车载冰箱") || category.includes("车载急救包")) {
    return 1;
  }

  if (category.includes("户外电源")) {
    return days === "4天以上" ? 2 : 1;
  }

  if (category.includes("保温箱")) {
    return safePeople >= 5 ? 2 : 1;
  }

  if (category.includes("饮用水")) {
    return safePeople * dayCount * 2;
  }

  if (category.includes("食物补给")) {
    return safePeople * dayCount * 3;
  }

  if (category.includes("暖宝宝")) {
    return weather === "寒冷" ? safePeople * dayCount * 2 : safePeople;
  }

  if (category.includes("防晒霜")) {
    return safePeople <= 2 ? 1 : safePeople <= 5 ? 2 : 3;
  }

  if (category.includes("电解质")) {
    return safePeople * dayCount * 2;
  }

  return 1;
}

function getBudgetLevel(budget: number, peopleCount: number): BudgetLevel {
  const perPersonBudget = Math.max(0, budget) / Math.max(1, peopleCount);

  if (perPersonBudget < 1500) {
    return "low";
  }

  if (perPersonBudget < 3500) {
    return "mid";
  }

  if (perPersonBudget < 8000) {
    return "high";
  }

  return "ultra";
}

function getAccessoryPriceCap(productName: string) {
  if (productName.includes("手套")) {
    return 199;
  }

  if (productName.includes("帽")) {
    return 149;
  }

  if (productName.includes("毛巾")) {
    return 89;
  }

  if (productName.includes("暖宝宝")) {
    return 5;
  }

  if (productName.includes("防晒霜")) {
    return 129;
  }

  return Number.POSITIVE_INFINITY;
}

function capOptionalPrice(item: ProductTemplate, price: number) {
  return Math.min(price, getAccessoryPriceCap(item.name));
}

function chooseProductUnitPrice(item: ProductTemplate) {
  if (item.budgetWeight === "low") {
    return capOptionalPrice(item, item.price);
  }

  return item.price;
}

export function selectProductsByPriority(products: Product[], budget: number, weather: Weather, activity: Activity, days: TripDays) {
  const safeBudget = Math.max(0, budget);
  const maxAllowed = Math.floor(safeBudget * 1.1);
  const selectedProducts: Product[] = [];
  const selectedGearCategories = new Set<GearCategory>();
  let totalPrice = 0;
  const sortedProducts = [...products].sort((first, second) => {
    const activityCoreDiff = getActivityCoreRank(first, activity, days) - getActivityCoreRank(second, activity, days);

    if (activityCoreDiff !== 0) {
      return activityCoreDiff;
    }

    const activityCoreCategoryDiff = getActivityCoreCategoryRank(first, activity) - getActivityCoreCategoryRank(second, activity);

    if (activityCoreCategoryDiff !== 0) {
      return activityCoreCategoryDiff;
    }

    const environmentDiff = getEnvironmentRank(first, weather) - getEnvironmentRank(second, weather);

    if (environmentDiff !== 0) {
      return environmentDiff;
    }

    const budgetUpgradeDiff = getBudgetUpgradeRank(first) - getBudgetUpgradeRank(second);

    if (budgetUpgradeDiff !== 0) {
      return budgetUpgradeDiff;
    }

    const gearCategoryWeatherDiff = getGearCategoryWeatherRank(first, weather) - getGearCategoryWeatherRank(second, weather);

    if (gearCategoryWeatherDiff !== 0) {
      return gearCategoryWeatherDiff;
    }

    const priorityDiff = productPriorityRank[first.priority] - productPriorityRank[second.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return levelRank(first.level) - levelRank(second.level);
  });

  for (const product of sortedProducts) {
    if (!repeatableGearCategories.has(product.gearCategory) && selectedGearCategories.has(product.gearCategory)) {
      continue;
    }

    if (totalPrice + product.subtotal <= maxAllowed) {
      selectedProducts.push(product);
      selectedGearCategories.add(product.gearCategory);
      totalPrice += product.subtotal;
    }
  }

  return {
    selectedProducts,
    totalPrice,
    remainingBudget: Math.max(-Math.floor(safeBudget * 0.1), safeBudget - totalPrice),
  };
}

function createProduct(item: ProductTemplate, unitPrice: number, quantity: number): Product {
  return {
    id: item.id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    image: item.image,
    buyUrl: item.buyUrl,
    icon: getProductIcon(item.name),
    reason: item.reason,
    priority: item.priority,
    level: item.level,
    gearType: item.gearType,
    budgetWeight: item.budgetWeight,
    weatherFit: item.weatherFit,
    gearCategory: item.gearCategory,
    activityCore: item.activityCore,
    activities: item.activities,
    category: item.category,
    tags: item.tags,
    productUrl: item.buyUrl,
    unitPrice,
    quantity,
    unit: item.unit,
    subtotal: unitPrice * quantity,
  };
}

function getPreferredLevel(item: ProductTemplate, budgetLevel: BudgetLevel): ProductLevel {
  if (budgetLevel === "low") {
    return "basic";
  }

  if (budgetLevel === "mid") {
    return "standard";
  }

  return item.priority === "core" ? "premium" : "standard";
}

function levelRank(level: ProductLevel) {
  if (level === "basic") {
    return 0;
  }

  if (level === "standard") {
    return 1;
  }

  return 2;
}

function selectProductForCategory(items: ProductTemplate[], budgetLevel: BudgetLevel) {
  const reference = items[0];
  const preferredLevel = getPreferredLevel(reference, budgetLevel);
  const exactMatch = items.find((item) => item.level === preferredLevel);

  if (exactMatch) {
    return exactMatch;
  }

  const preferredRank = levelRank(preferredLevel);

  return [...items].sort((first, second) => {
    const firstDistance = Math.abs(levelRank(first.level) - preferredRank);
    const secondDistance = Math.abs(levelRank(second.level) - preferredRank);

    if (firstDistance !== secondDistance) {
      return firstDistance - secondDistance;
    }

    return first.price - second.price;
  })[0];
}

function selectProductLevelByBudget(items: ProductTemplate[], budgetLevel: BudgetLevel) {
  const groupedProducts = new Map<string, ProductTemplate[]>();

  for (const item of items) {
    const products = groupedProducts.get(item.category) ?? [];
    products.push(item);
    groupedProducts.set(item.category, products);
  }

  return Array.from(groupedProducts.values()).map((products) => selectProductForCategory(products, budgetLevel));
}

function getAllProductTemplates() {
  return Object.values(productCatalog).flat();
}

function mergeProductTemplates(primary: ProductTemplate[], extras: ProductTemplate[]) {
  const products = new Map<string, ProductTemplate>();

  for (const item of [...primary, ...extras]) {
    if (!products.has(item.id)) {
      products.set(item.id, item);
    }
  }

  return Array.from(products.values());
}

function getWeatherCriticalProductPool(activity: Activity, days: TripDays, weather: Weather) {
  return getAllProductTemplates().filter((product) => isProductAllowedForActivity(product, activity, days) && isWeatherBoostedProduct(product, weather));
}

function getLongTripShelterProductPool(activity: Activity, days: TripDays) {
  if (activity !== "徒步" || days !== "4天以上") {
    return [];
  }

  return getAllProductTemplates().filter((product) => isLongTripShelter(product) && isProductAllowedForActivity(product, activity, days));
}

function getActivityProductPool(activity: Activity, days: TripDays, weather: Weather) {
  const basePool = productCatalog[activity].filter((product) => isProductAllowedForActivity(product, activity, days));
  const weatherCriticalPool = getWeatherCriticalProductPool(activity, days, weather);
  const longTripShelterPool = getLongTripShelterProductPool(activity, days);

  return mergeProductTemplates(basePool, [...weatherCriticalPool, ...longTripShelterPool]);
}

function getProductIcon(productName: string) {
  if (productName.includes("滑雪板")) {
    return "🏂";
  }

  if (productName.includes("固定器")) {
    return "🔗";
  }

  if (productName.includes("鞋")) {
    return "🥾";
  }

  if (productName.includes("冲锋衣") || productName.includes("滑雪服") || productName.includes("保暖")) {
    return "🧥";
  }

  if (productName.includes("帐篷")) {
    return "⛺";
  }

  if (productName.includes("睡袋")) {
    return "🛏️";
  }

  if (productName.includes("鱼竿")) {
    return "🎣";
  }

  if (productName.includes("钓椅") || productName.includes("桌椅")) {
    return "🪑";
  }

  if (productName.includes("头灯") || productName.includes("灯")) {
    return "💡";
  }

  if (productName.includes("镜")) {
    return "🥽";
  }

  if (productName.includes("手套")) {
    return "🧤";
  }

  if (productName.includes("头盔")) {
    return "⛑️";
  }

  if (productName.includes("护具")) {
    return "🛡️";
  }

  if (productName.includes("包")) {
    return "🎒";
  }

  if (productName.includes("电源")) {
    return "🔋";
  }

  if (productName.includes("冰箱") || productName.includes("保温箱")) {
    return "🧊";
  }

  if (productName.includes("防晒")) {
    return "🧴";
  }

  return "🧰";
}

export function getProductPlan(activity: Activity, budget: number, peopleCount: number, days: TripDays, weather: Weather) {
  const budgetLevel = getBudgetLevel(budget, peopleCount);
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  const activityProductPool = getActivityProductPool(activity, days, weather);
  const productPool = selectProductLevelByBudget(activityProductPool, budgetLevel);
  let products = productPool.map((item) => {
    const quantity = getProductQuantity(item, peopleCount, days, weather);

    return createProduct(item, chooseProductUnitPrice(item), quantity);
  });
  const coreTotal = products
    .filter((product) => product.priority === "core")
    .reduce((sum, product) => sum + product.subtotal, 0);

  if (coreTotal > maxAllowed) {
    const fallbackProductPool = selectProductLevelByBudget(activityProductPool, "low");
    products = fallbackProductPool.map((item) => {
      const quantity = getProductQuantity(item, peopleCount, days, weather);

      return createProduct(item, chooseProductUnitPrice(item), quantity);
    });
  }

  return selectProductsByPriority(products, budget, weather, activity, days);
}

export function getRiskBlocks(activity: Activity, weather: Weather, tripDays: TripDays): RiskBlock[] {
  const activityRisk: Record<Activity, RiskBlock> = {
    登山: { icon: "route", title: "路线与撤退点", text: "登山前确认海拔、爬升和撤退点，不要只依赖单一导航。" },
    露营: { icon: "shield", title: "营地安全", text: "避开河道、落石坡和低洼积水区，夜间物品集中收纳。" },
    徒步: { icon: "route", title: "体力分配", text: "预留返程体力，遇到脚痛、补水不足或天气变差要及时缩短路线。" },
    自驾游: { icon: "shield", title: "车辆检查", text: "出发前检查胎压、机油、刹车、备胎和车载工具。" },
    钓鱼: { icon: "weather", title: "水边风险", text: "湿滑岸边不要单独行动，雷雨和涨水时及时撤离。" },
    滑雪: { icon: "shield", title: "摔倒防护", text: "按能力选择雪道，护具和热身能显著降低受伤风险。" },
    骑行: { icon: "clock", title: "可见度", text: "黄昏、夜间和隧道骑行要提前打开车灯，并穿高可见度衣物。" },
    海边旅行: { icon: "weather", title: "紫外线与潮汐", text: "关注潮汐、离岸流和紫外线指数，避免正午长时间暴晒。" },
  };

  const weatherRisk: Record<Weather, RiskBlock> = {
    晴天: { icon: "weather", title: "天气突变", text: "晴天也要关注山地或海边的实时天气变化，预留撤离时间。" },
    雨天: { icon: "shield", title: "雨天防滑", text: "降低行程强度，避开湿滑岩石、涉水路段和低洼积水区域。" },
    寒冷: { icon: "clock", title: "控制暴露", text: "减少低温中静止等待时间，出现发抖、迟钝等情况要及时撤离。" },
    炎热: { icon: "weather", title: "高温管理", text: "避开中午高温，准备电解质并安排有遮阴的休息点。" },
  };

  const durationRisk: Record<TripDays, RiskBlock> = {
    "1天": { icon: "clock", title: "返程时间", text: "短途也要设定最晚返程时间，避免天黑后仍在户外移动。" },
    "2-3天": { icon: "pack", title: "补给冗余", text: "多日行程建议多准备半天补给，应对路线延误。" },
    "4天以上": { icon: "route", title: "长线规划", text: "长线行程要拆分补给点、撤离点和每日里程。" },
  };

  return [activityRisk[activity], weatherRisk[weather], durationRisk[tripDays]];
}
