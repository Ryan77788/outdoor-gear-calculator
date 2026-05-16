import {
  productCatalog,
  type Activity,
  type BudgetWeight,
  type GearCategory,
  type GearType,
  type Product,
  type ProductLevel,
  type ProductPriority,
  type ProductTemplate,
} from "@/data/products";

export type TripDays = "1天" | "2-3天" | "4天以上";
export type Weather = "晴天" | "雨天" | "寒冷" | "炎热";
export type GearPriority = "safety" | "weather" | "core" | "comfort";
export type RiskIconName =
  | "activity"
  | "calendar"
  | "weather"
  | "people"
  | "budget"
  | "pack"
  | "spark"
  | "alert"
  | "check"
  | "shield"
  | "route"
  | "clock";

export type GearTemplate = {
  name: string;
  reason: string;
  priority: GearPriority;
};

export type GearItem = GearTemplate & {
  quantity: string;
};

type GearQuantityRule = {
  gearCategory: GearCategory;
  gearType: GearType;
  unit: string;
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

const levelRankValue: Record<ProductLevel, number> = {
  basic: 0,
  standard: 1,
  premium: 2,
};

const repeatableGearCategories = new Set<GearCategory>(["water", "food", "warmPatch", "consumable"]);

const activityCoreGearCategories: Record<Activity, GearCategory[]> = {
  登山: ["shoes", "shellJacket", "backpack", "pole", "headlamp"],
  徒步: ["shoes", "backpack", "water", "baseLayer", "pole"],
  露营: ["tent", "sleepingBag", "mat", "stove", "lighting"],
  滑雪: ["skiBoard", "skiBinding", "skiBoots", "skiSuit", "goggles", "helmet"],
  钓鱼: ["fishingRod", "chair", "fishingLine", "sunHat", "cooler"],
  自驾游: ["power", "cooler", "firstAid", "tableChair", "vehicleTool"],
  骑行: ["helmet", "gloves", "lighting", "repair", "water"],
  海边旅行: ["sunscreen", "sunHat", "dryBag", "beachMat", "towel"],
};

const highValueUpgradeCategories = new Set<GearCategory>([
  "skiBoard",
  "skiBoots",
  "skiBinding",
  "skiSuit",
  "shoes",
  "shellJacket",
  "backpack",
  "tent",
  "sleepingBag",
  "stove",
  "power",
  "cooler",
  "fishingRod",
]);

const lowValueAccessoryCategories = new Set<GearCategory>([
  "gloves",
  "sunHat",
  "sunglasses",
  "towel",
  "sunscreen",
  "warmPatch",
  "electrolyte",
]);

const weatherBoostCategories: Record<Weather, GearCategory[]> = {
  雨天: ["shellJacket", "raincoat", "shoes", "dryBag", "baseLayer", "skiSuit", "lighting"],
  寒冷: ["insulation", "gloves", "warmPatch", "skiSuit", "skiBoots", "sleepingBag", "mat", "stove", "cooler"],
  晴天: ["sunscreen", "sunglasses", "sunHat", "goggles"],
  炎热: ["sunscreen", "electrolyte", "sunHat", "baseLayer", "water", "cooler"],
};

const weatherPenaltyCategories: Record<Weather, GearCategory[]> = {
  雨天: ["sunscreen", "sunglasses", "sunHat"],
  寒冷: ["sunscreen", "sunglasses", "sunHat", "electrolyte"],
  晴天: [],
  炎热: ["insulation", "warmPatch", "sleepingBag"],
};

const activityGear: Record<Activity, GearTemplate[]> = {
  登山: [
    { name: "登山鞋", reason: "保护脚踝并提升碎石、泥地和坡面的抓地力。", priority: "core" },
    { name: "冲锋衣", reason: "防风防雨，应对山地天气突变。", priority: "weather" },
    { name: "登山包", reason: "稳定携带补给、外套和应急装备。", priority: "core" },
    { name: "登山杖", reason: "减轻膝盖压力，提升上下坡稳定性。", priority: "core" },
    { name: "头灯", reason: "清晨出发、晚归或雾天时保证照明。", priority: "safety" },
  ],
  徒步: [
    { name: "徒步鞋", reason: "减少脚部疲劳并提升长距离行走稳定性。", priority: "core" },
    { name: "徒步背包", reason: "装下水、食物、外套和基础应急用品。", priority: "core" },
    { name: "水袋", reason: "行进中更容易保持饮水节奏。", priority: "core" },
    { name: "速干衣", reason: "排汗快，雨淋或出汗后更不容易失温。", priority: "weather" },
    { name: "登山杖", reason: "缓解膝盖压力并提高湿滑路面的稳定性。", priority: "core" },
  ],
  露营: [
    { name: "帐篷", reason: "提供夜间庇护、防雨和基础空间。", priority: "core" },
    { name: "睡袋", reason: "保证夜间保暖和睡眠恢复。", priority: "weather" },
    { name: "防潮垫", reason: "隔绝地面潮气和冷气。", priority: "weather" },
    { name: "炉具", reason: "用于烧水和热食，提高补给效率。", priority: "core" },
    { name: "营地灯", reason: "夜间活动和取物更安全。", priority: "safety" },
  ],
  滑雪: [
    { name: "滑雪板", reason: "决定滑行稳定性和基础体验。", priority: "core" },
    { name: "固定器", reason: "连接雪鞋和雪板，影响控制和安全。", priority: "core" },
    { name: "雪鞋", reason: "影响支撑、固定和脚部控制。", priority: "core" },
    { name: "滑雪服", reason: "防风防雪并保暖，是雪场核心防护。", priority: "weather" },
    { name: "滑雪镜", reason: "减少强光刺激并保护眼睛。", priority: "safety" },
    { name: "头盔", reason: "保护头部，是滑雪安全基础。", priority: "safety" },
  ],
  钓鱼: [
    { name: "鱼竿", reason: "钓鱼活动的核心工具。", priority: "core" },
    { name: "钓椅", reason: "长时间等待时保持舒适稳定。", priority: "comfort" },
    { name: "鱼线组", reason: "鱼线、浮漂和基础钓组决定能否完整作钓。", priority: "core" },
    { name: "防晒帽", reason: "降低头面部暴晒和水面反光影响。", priority: "weather" },
    { name: "保温箱", reason: "保存饮品、饵料或渔获。", priority: "comfort" },
  ],
  自驾游: [
    { name: "户外电源", reason: "为手机、灯具和小电器供电。", priority: "core" },
    { name: "车载冰箱", reason: "长途保存食材和饮品更稳定。", priority: "comfort" },
    { name: "车载急救包", reason: "处理行车和营地中的轻微伤情。", priority: "safety" },
    { name: "折叠桌椅", reason: "提升停车休息和户外用餐体验。", priority: "comfort" },
    { name: "充气泵", reason: "胎压不足时可快速补气。", priority: "safety" },
  ],
  骑行: [
    { name: "头盔", reason: "骑行安全的第一优先级装备。", priority: "safety" },
    { name: "骑行手套", reason: "防滑、缓震并保护手掌。", priority: "core" },
    { name: "车灯", reason: "提高夜间、隧道和雨天可见度。", priority: "safety" },
    { name: "补胎工具", reason: "应对扎胎，避免中途无法继续。", priority: "safety" },
    { name: "骑行水壶", reason: "行进中快速补水。", priority: "core" },
  ],
  海边旅行: [
    { name: "防晒霜", reason: "海边紫外线和反光强，防晒优先级很高。", priority: "weather" },
    { name: "遮阳帽", reason: "降低头面部暴晒和中暑风险。", priority: "weather" },
    { name: "防水袋", reason: "保护手机、证件和电子设备。", priority: "safety" },
    { name: "沙滩垫", reason: "坐卧休息更舒适，减少沙土附着。", priority: "comfort" },
    { name: "速干毛巾", reason: "涉水或游泳后快速擦干。", priority: "comfort" },
  ],
};

const weatherGear: Record<Weather, GearTemplate[]> = {
  晴天: [
    { name: "防晒霜", reason: "长时间暴露时降低晒伤风险。", priority: "weather" },
    { name: "太阳镜", reason: "减少强光刺激，保护眼睛。", priority: "weather" },
    { name: "遮阳帽", reason: "保护头面部，降低中暑概率。", priority: "weather" },
  ],
  雨天: [
    { name: "雨衣", reason: "避免雨天长时间淋湿。", priority: "weather" },
    { name: "防水鞋", reason: "减少鞋袜湿透，提升行走舒适度。", priority: "weather" },
    { name: "防水袋", reason: "保护衣物、证件和电子设备。", priority: "safety" },
  ],
  寒冷: [
    { name: "保暖层", reason: "低温环境中维持核心体温。", priority: "weather" },
    { name: "手套", reason: "保护手部并改善低温下的操作感。", priority: "weather" },
    { name: "暖宝宝", reason: "寒冷天气按人数和天数准备。", priority: "weather" },
  ],
  炎热: [
    { name: "防晒霜", reason: "高温强光下优先保护皮肤。", priority: "weather" },
    { name: "电解质补水", reason: "补充出汗流失的盐分和矿物质。", priority: "safety" },
    { name: "速干衣", reason: "排汗快，降低闷热感。", priority: "weather" },
  ],
};

const durationGear: Record<TripDays, GearTemplate[]> = {
  "1天": [
    { name: "饮用水", reason: "按人数和天数估算，建议分装携带。", priority: "safety" },
    { name: "食物补给", reason: "短途也要准备基础能量补给。", priority: "safety" },
  ],
  "2-3天": [
    { name: "饮用水", reason: "多日行程需要更稳定的补水计划。", priority: "safety" },
    { name: "食物补给", reason: "按人数和天数准备，并预留余量。", priority: "safety" },
    { name: "急救包", reason: "覆盖擦伤、扭伤和常见突发情况。", priority: "safety" },
  ],
  "4天以上": [
    { name: "饮用水", reason: "长线行程需要分段补水和补给计划。", priority: "safety" },
    { name: "食物补给", reason: "按每日消耗准备，并预留机动补给。", priority: "safety" },
    { name: "备用照明", reason: "长线户外要准备照明冗余。", priority: "safety" },
  ],
};

const gearQuantityRulesByName: Record<string, GearQuantityRule> = {
  登山鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  徒步鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  防水鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  冲锋衣: { gearCategory: "shellJacket", gearType: "perPerson", unit: "件" },
  雨衣: { gearCategory: "raincoat", gearType: "perPerson", unit: "件" },
  保暖层: { gearCategory: "insulation", gearType: "perPerson", unit: "件" },
  速干衣: { gearCategory: "baseLayer", gearType: "perPerson", unit: "件" },
  登山包: { gearCategory: "backpack", gearType: "perPerson", unit: "个" },
  徒步背包: { gearCategory: "backpack", gearType: "perPerson", unit: "个" },
  登山杖: { gearCategory: "pole", gearType: "perPerson", unit: "副" },
  头灯: { gearCategory: "headlamp", gearType: "perPerson", unit: "个" },
  备用照明: { gearCategory: "lighting", gearType: "shared", unit: "个" },
  营地灯: { gearCategory: "lighting", gearType: "shared", unit: "个" },
  车灯: { gearCategory: "lighting", gearType: "perPerson", unit: "个" },
  水袋: { gearCategory: "water", gearType: "perPerson", unit: "个" },
  骑行水壶: { gearCategory: "water", gearType: "perPerson", unit: "个" },
  水壶: { gearCategory: "water", gearType: "perPerson", unit: "个" },
  饮用水: { gearCategory: "water", gearType: "consumable", unit: "L" },
  食物补给: { gearCategory: "food", gearType: "consumable", unit: "份" },
  急救包: { gearCategory: "firstAid", gearType: "shared", unit: "个" },
  车载急救包: { gearCategory: "firstAid", gearType: "shared", unit: "个" },
  帐篷: { gearCategory: "tent", gearType: "shared", unit: "顶" },
  睡袋: { gearCategory: "sleepingBag", gearType: "perPerson", unit: "个" },
  防潮垫: { gearCategory: "mat", gearType: "perPerson", unit: "张" },
  炉具: { gearCategory: "stove", gearType: "shared", unit: "套" },
  餐具: { gearCategory: "consumable", gearType: "perPerson", unit: "套" },
  钓椅: { gearCategory: "chair", gearType: "perPerson", unit: "把" },
  鱼竿: { gearCategory: "fishingRod", gearType: "perPerson", unit: "根" },
  鱼线组: { gearCategory: "fishingLine", gearType: "perPerson", unit: "套" },
  保温箱: { gearCategory: "cooler", gearType: "shared", unit: "个" },
  车载冰箱: { gearCategory: "cooler", gearType: "shared", unit: "个" },
  滑雪板: { gearCategory: "skiBoard", gearType: "perPerson", unit: "副" },
  固定器: { gearCategory: "skiBinding", gearType: "perPerson", unit: "副" },
  雪鞋: { gearCategory: "skiBoots", gearType: "perPerson", unit: "双" },
  滑雪服: { gearCategory: "skiSuit", gearType: "perPerson", unit: "套" },
  头盔: { gearCategory: "helmet", gearType: "perPerson", unit: "个" },
  滑雪镜: { gearCategory: "goggles", gearType: "perPerson", unit: "副" },
  手套: { gearCategory: "gloves", gearType: "perPerson", unit: "双" },
  骑行手套: { gearCategory: "gloves", gearType: "perPerson", unit: "双" },
  暖宝宝: { gearCategory: "warmPatch", gearType: "consumable", unit: "片" },
  户外电源: { gearCategory: "power", gearType: "shared", unit: "个" },
  补胎工具: { gearCategory: "repair", gearType: "shared", unit: "套" },
  防水袋: { gearCategory: "dryBag", gearType: "perPerson", unit: "个" },
  防晒帽: { gearCategory: "sunHat", gearType: "perPerson", unit: "顶" },
  遮阳帽: { gearCategory: "sunHat", gearType: "perPerson", unit: "顶" },
  太阳镜: { gearCategory: "sunglasses", gearType: "perPerson", unit: "副" },
  充气泵: { gearCategory: "vehicleTool", gearType: "shared", unit: "个" },
  折叠桌椅: { gearCategory: "tableChair", gearType: "shared", unit: "套" },
  沙滩垫: { gearCategory: "beachMat", gearType: "shared", unit: "张" },
  速干毛巾: { gearCategory: "towel", gearType: "perPerson", unit: "条" },
  防晒霜: { gearCategory: "sunscreen", gearType: "consumable", unit: "瓶" },
  电解质补水: { gearCategory: "electrolyte", gearType: "consumable", unit: "片" },
};

function getTripDaysCount(tripDays: TripDays) {
  if (tripDays === "1天") return 1;
  if (tripDays === "2-3天") return 3;
  return 4;
}

export function calculateGearQuantity(item: GearTemplate, people: number, days: TripDays, weather: Weather, _budget = 0) {
  const rule = gearQuantityRulesByName[item.name];
  const safePeople = Math.max(1, people);

  if (rule) {
    return `${getGearQuantity(rule.gearCategory, rule.gearType, people, days, weather)}${rule.unit}`;
  }

  const name = item.name;

  if (name.includes("鱼竿")) return `${safePeople}根`;
  if (name.includes("钓椅")) return `${safePeople}把`;
  if (["登山鞋", "徒步鞋", "雪鞋", "防滑鞋", "拖鞋"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}双`;
  }
  if (["冲锋衣", "雨衣", "速干衣", "保暖层", "保暖衣", "滑雪服", "换洗衣物"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}件`;
  }
  if (name.includes("滑雪板")) return `${safePeople}副`;
  if (["头盔", "头灯", "水壶", "水袋", "防水袋"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}个`;
  }
  if (name.includes("手套")) return `${safePeople}双`;
  if (["太阳镜", "滑雪镜"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}副`;
  }
  if (["防晒帽", "遮阳帽"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}顶`;
  }
  if (name.includes("睡袋")) return `${safePeople}个`;
  if (["防潮垫", "沙滩垫"].some((keyword) => name.includes(keyword))) {
    return `${safePeople}张`;
  }
  if (name.includes("餐具")) return `${safePeople}套`;
  if (name.includes("速干毛巾")) return `${safePeople}条`;

  return "1件";
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
  return mergeGear([...weatherGear[weather], ...activityGear[activity], ...durationGear[tripDays]])
    .map((item) => ({
      ...item,
      quantity: item.name.includes("鱼竿")
        ? `${Math.max(1, peopleCount)}根`
        : calculateGearQuantity(item, peopleCount, tripDays, weather, budget),
    }))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, 12);
}

function getGearQuantity(gearCategory: GearCategory, gearType: GearType, people: number, days: TripDays, weather: Weather) {
  const safePeople = Math.max(1, people);
  const dayCount = getTripDaysCount(days);

  if (gearType === "perPerson") {
    return safePeople;
  }

  if (gearType === "consumable") {
    if (gearCategory === "warmPatch") {
      return weather === "寒冷" ? safePeople * dayCount * 2 : safePeople;
    }

    if (gearCategory === "sunscreen") {
      return safePeople <= 2 ? 1 : safePeople <= 5 ? 2 : 3;
    }

    if (gearCategory === "electrolyte") {
      return safePeople * dayCount * 2;
    }

    if (gearCategory === "water") {
      return safePeople * dayCount * 3;
    }

    if (gearCategory === "food") {
      return safePeople * dayCount * 2;
    }

    return safePeople * dayCount;
  }

  return getSharedQuantity(gearCategory, safePeople, days);
}

function getProductQuantity(product: ProductTemplate, people: number, days: TripDays, weather: Weather) {
  return getGearQuantity(product.gearCategory, product.gearType, people, days, weather);
}

function getSharedQuantity(gearCategory: GearCategory, people: number, days: TripDays) {
  switch (gearCategory) {
    case "tent":
      return Math.ceil(people / 2);
    case "stove":
      return people <= 4 ? 1 : 2;
    case "lighting":
      return people <= 2 ? 1 : people <= 4 ? 2 : 3;
    case "power":
      return days === "4天以上" ? 2 : 1;
    case "tableChair":
    case "beachMat":
      return Math.max(1, Math.ceil(people / 4));
    case "repair":
      return people <= 4 ? 1 : 2;
    default:
      return 1;
  }
}

function createProduct(item: ProductTemplate, quantity: number): Product {
  return {
    ...item,
    icon: getProductIcon(item.gearCategory),
    productUrl: item.buyUrl,
    unitPrice: item.price,
    quantity,
    subtotal: item.price * quantity,
  };
}

function getBudgetLevel(budget: number, peopleCount: number): BudgetLevel {
  const perPersonBudget = Math.max(0, budget) / Math.max(1, peopleCount);

  if (perPersonBudget < 1200) return "low";
  if (perPersonBudget < 3200) return "mid";
  if (perPersonBudget < 7000) return "high";
  return "ultra";
}

function preferredLevelForBase(budgetLevel: BudgetLevel, product: ProductTemplate) {
  if (budgetLevel === "low") return "basic";
  if (budgetLevel === "mid") return product.priority === "core" ? "standard" : "basic";
  return product.budgetWeight === "high" && product.priority === "core" ? "standard" : "basic";
}

function groupByGearCategory(products: ProductTemplate[]) {
  const grouped = new Map<GearCategory, ProductTemplate[]>();

  for (const product of products) {
    grouped.set(product.gearCategory, [...(grouped.get(product.gearCategory) ?? []), product]);
  }

  return grouped;
}

function productWeatherRank(product: ProductTemplate, weather: Weather) {
  if (product.weather.includes(weather)) return 0;
  if (weatherBoostCategories[weather].includes(product.gearCategory)) return 1;
  if (product.weather.includes("通用")) return 2;
  if (weatherPenaltyCategories[weather].includes(product.gearCategory)) return 5;
  return 3;
}

function productSortValue(product: ProductTemplate, activity: Activity, weather: Weather) {
  const coreIndex = activityCoreGearCategories[activity].indexOf(product.gearCategory);
  const coreRank = coreIndex === -1 ? 50 : coreIndex;

  return (
    coreRank * 1000 +
    productWeatherRank(product, weather) * 100 +
    productPriorityRank[product.priority] * 20 +
    budgetWeightRank[product.budgetWeight] * 5 +
    levelRankValue[product.level]
  );
}

function chooseBaseProduct(items: ProductTemplate[], budgetLevel: BudgetLevel, activity: Activity, weather: Weather) {
  const reference = items[0];
  const preferred = preferredLevelForBase(budgetLevel, reference);
  const preferredRank = levelRankValue[preferred];

  return [...items].sort((a, b) => {
    const weatherDiff = productWeatherRank(a, weather) - productWeatherRank(b, weather);
    if (weatherDiff !== 0) return weatherDiff;

    const levelDistance = Math.abs(levelRankValue[a.level] - preferredRank) - Math.abs(levelRankValue[b.level] - preferredRank);
    if (levelDistance !== 0) return levelDistance;

    const sortDiff = productSortValue(a, activity, weather) - productSortValue(b, activity, weather);
    if (sortDiff !== 0) return sortDiff;

    return a.price - b.price;
  })[0];
}

function canUseGearCategory(gearCategory: GearCategory, selectedCategories: Set<GearCategory>) {
  return repeatableGearCategories.has(gearCategory) || !selectedCategories.has(gearCategory);
}

function total(products: Product[]) {
  return products.reduce((sum, product) => sum + product.subtotal, 0);
}

function replaceProduct(products: Product[], replacement: Product) {
  return products.map((product) => (product.gearCategory === replacement.gearCategory ? replacement : product));
}

function tryAddProduct(
  selected: Product[],
  selectedCategories: Set<GearCategory>,
  product: Product,
  maxAllowed: number,
) {
  if (!canUseGearCategory(product.gearCategory, selectedCategories)) {
    return false;
  }

  if (total(selected) + product.subtotal > maxAllowed) {
    return false;
  }

  selected.push(product);
  selectedCategories.add(product.gearCategory);
  return true;
}

function buildCandidate(product: ProductTemplate, people: number, days: TripDays, weather: Weather) {
  return createProduct(product, getProductQuantity(product, people, days, weather));
}

function isBetterUpgrade(current: Product, candidate: Product, weather: Weather) {
  if (candidate.gearCategory !== current.gearCategory || candidate.id === current.id) {
    return false;
  }

  const categoryIsHighValue = highValueUpgradeCategories.has(candidate.gearCategory);
  const categoryIsLowValue = lowValueAccessoryCategories.has(candidate.gearCategory);

  if (categoryIsLowValue && candidate.price > current.price) {
    return false;
  }

  if (productWeatherRank(candidate, weather) < productWeatherRank(current, weather)) {
    return true;
  }

  return categoryIsHighValue && levelRankValue[candidate.level] > levelRankValue[current.level];
}

function applyWeatherReplacements(
  selected: Product[],
  grouped: Map<GearCategory, ProductTemplate[]>,
  budget: number,
  people: number,
  days: TripDays,
  weather: Weather,
) {
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  let currentSelection = selected;

  for (const product of currentSelection) {
    const variants = grouped.get(product.gearCategory) ?? [];
    const replacement = variants
      .map((variant) => buildCandidate(variant, people, days, weather))
      .filter((candidate) => isBetterUpgrade(product, candidate, weather))
      .sort((a, b) => {
        const weatherDiff = productWeatherRank(a, weather) - productWeatherRank(b, weather);
        if (weatherDiff !== 0) return weatherDiff;
        return a.subtotal - b.subtotal;
      })[0];

    if (replacement && total(currentSelection) - product.subtotal + replacement.subtotal <= maxAllowed) {
      currentSelection = replaceProduct(currentSelection, replacement);
    }
  }

  return currentSelection;
}

function applyBudgetUpgrades(
  selected: Product[],
  grouped: Map<GearCategory, ProductTemplate[]>,
  budget: number,
  people: number,
  days: TripDays,
  weather: Weather,
) {
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  let currentSelection = selected;
  let changed = true;

  while (changed) {
    changed = false;
    const upgradeOptions = currentSelection
      .filter((product) => highValueUpgradeCategories.has(product.gearCategory))
      .flatMap((product) => {
        const variants = grouped.get(product.gearCategory) ?? [];

        return variants
          .map((variant) => buildCandidate(variant, people, days, weather))
          .filter((candidate) => candidate.subtotal > product.subtotal && levelRankValue[candidate.level] > levelRankValue[product.level])
          .map((candidate) => ({ current: product, candidate, delta: candidate.subtotal - product.subtotal }));
      })
      .sort((a, b) => {
        const valueDiff =
          budgetWeightRank[a.candidate.budgetWeight] - budgetWeightRank[b.candidate.budgetWeight] ||
          levelRankValue[b.candidate.level] - levelRankValue[a.candidate.level];

        if (valueDiff !== 0) return valueDiff;
        return a.delta - b.delta;
      });

    for (const option of upgradeOptions) {
      if (total(currentSelection) - option.current.subtotal + option.candidate.subtotal <= maxAllowed) {
        currentSelection = replaceProduct(currentSelection, option.candidate);
        changed = true;
        break;
      }
    }
  }

  return currentSelection;
}

export function selectProductsByPriority(
  products: Product[],
  budget: number,
  weather: Weather,
  activity: Activity,
  days: TripDays,
) {
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  const selectedProducts: Product[] = [];
  const selectedGearCategories = new Set<GearCategory>();

  for (const product of [...products].sort((a, b) => productSortValue(a, activity, weather) - productSortValue(b, activity, weather))) {
    tryAddProduct(selectedProducts, selectedGearCategories, product, maxAllowed);
  }

  const totalPrice = total(selectedProducts);

  return {
    selectedProducts,
    totalPrice,
    remainingBudget: Math.max(-Math.floor(Math.max(0, budget) * 0.1), Math.max(0, budget) - totalPrice),
  };
}

export function getProductPlan(activity: Activity, budget: number, peopleCount: number, days: TripDays, weather: Weather) {
  const budgetLevel = getBudgetLevel(budget, peopleCount);
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  const pool = productCatalog[activity].filter((product) => product.activity.includes(activity));
  const grouped = groupByGearCategory(pool);
  const selected: Product[] = [];
  const selectedCategories = new Set<GearCategory>();

  for (const gearCategory of activityCoreGearCategories[activity]) {
    const variants = grouped.get(gearCategory);

    if (!variants) continue;

    const baseProduct = chooseBaseProduct(variants, budgetLevel, activity, weather);
    const candidate = buildCandidate(baseProduct, peopleCount, days, weather);

    if (!tryAddProduct(selected, selectedCategories, candidate, maxAllowed)) {
      const cheapest = variants
        .map((variant) => buildCandidate(variant, peopleCount, days, weather))
        .sort((a, b) => a.subtotal - b.subtotal)[0];

      tryAddProduct(selected, selectedCategories, cheapest, maxAllowed);
    }
  }

  let selectedProducts = applyWeatherReplacements(selected, grouped, budget, peopleCount, days, weather);

  const weatherProducts = pool
    .filter((product) => product.priority !== "core")
    .filter((product) => product.weather.includes(weather) || weatherBoostCategories[weather].includes(product.gearCategory))
    .filter((product) => !weatherPenaltyCategories[weather].includes(product.gearCategory))
    .map((product) => buildCandidate(product, peopleCount, days, weather))
    .sort((a, b) => productSortValue(a, activity, weather) - productSortValue(b, activity, weather));

  const currentCategories = new Set(selectedProducts.map((product) => product.gearCategory));

  for (const product of weatherProducts) {
    tryAddProduct(selectedProducts, currentCategories, product, maxAllowed);
  }

  selectedProducts = applyBudgetUpgrades(selectedProducts, grouped, budget, peopleCount, days, weather);

  const optionalProducts = pool
    .filter((product) => product.priority === "optional")
    .filter((product) => !weatherPenaltyCategories[weather].includes(product.gearCategory))
    .filter((product) => !lowValueAccessoryCategories.has(product.gearCategory) || budget < 5000 || product.price <= 300)
    .map((product) => buildCandidate(product, peopleCount, days, weather))
    .sort((a, b) => {
      const weatherDiff = productWeatherRank(a, weather) - productWeatherRank(b, weather);
      if (weatherDiff !== 0) return weatherDiff;
      return a.subtotal - b.subtotal;
    });

  const categoriesAfterUpgrade = new Set(selectedProducts.map((product) => product.gearCategory));

  for (const product of optionalProducts) {
    tryAddProduct(selectedProducts, categoriesAfterUpgrade, product, maxAllowed);
  }

  const totalPrice = total(selectedProducts);

  return {
    selectedProducts: selectedProducts.sort(
      (a, b) => productSortValue(a, activity, weather) - productSortValue(b, activity, weather),
    ),
    totalPrice,
    remainingBudget: Math.max(-Math.floor(Math.max(0, budget) * 0.1), Math.max(0, budget) - totalPrice),
  };
}

function getProductIcon(gearCategory: GearCategory) {
  const icons: Partial<Record<GearCategory, string>> = {
    shoes: "鞋",
    shellJacket: "衣",
    backpack: "包",
    pole: "杖",
    headlamp: "灯",
    tent: "帐",
    sleepingBag: "袋",
    skiBoard: "板",
    fishingRod: "竿",
    power: "电",
    helmet: "盔",
  };

  return icons[gearCategory] ?? "装";
}

export function getRiskBlocks(activity: Activity, weather: Weather, tripDays: TripDays): RiskBlock[] {
  const activityRisk: Record<Activity, RiskBlock> = {
    登山: { icon: "route", title: "路线与撤退点", text: "登山前确认海拔、爬升和撤退点，不要只依赖单一导航。" },
    徒步: { icon: "route", title: "体力分配", text: "预留返程体力，遇到脚痛、补水不足或天气变差要及时缩短路线。" },
    露营: { icon: "shield", title: "营地安全", text: "避开河道、落石坡和低洼积水区，夜间物品集中收纳。" },
    滑雪: { icon: "shield", title: "摔倒防护", text: "按能力选择雪道，头盔、雪镜和热身能显著降低受伤风险。" },
    钓鱼: { icon: "weather", title: "水边风险", text: "湿滑岸边不要单独行动，雷雨和涨水时及时撤离。" },
    自驾游: { icon: "shield", title: "车辆检查", text: "出发前检查胎压、机油、刹车、备胎和基础工具。" },
    骑行: { icon: "clock", title: "可见度", text: "黄昏、夜间和隧道骑行要提前打开车灯，并穿高可见度衣物。" },
    海边旅行: { icon: "weather", title: "紫外线与潮汐", text: "关注潮汐、离岸流和紫外线强度，避免正午长时间暴晒。" },
  };

  const weatherRisk: Record<Weather, RiskBlock> = {
    晴天: { icon: "weather", title: "强光暴晒", text: "晴天注意补水、防晒和眼部防护，山地或海边紫外线更强。" },
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
