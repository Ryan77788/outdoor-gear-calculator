export type Activity = "登山" | "露营" | "徒步" | "自驾游" | "钓鱼" | "滑雪" | "骑行" | "海边旅行";
export type ProductPriority = "core" | "important" | "optional";
export type ProductLevel = "basic" | "standard" | "premium";
export type GearType = "perPerson" | "shared";
export type BudgetWeight = "high" | "medium" | "low";
export type ProductWeatherFit = "雨天" | "晴天" | "寒冷" | "通用";
export type GearCategory =
  | "shoes"
  | "shellJacket"
  | "raincoat"
  | "insulation"
  | "backpack"
  | "pole"
  | "headlamp"
  | "water"
  | "food"
  | "firstAid"
  | "tent"
  | "sleepingBag"
  | "mat"
  | "stove"
  | "chair"
  | "fishingRod"
  | "cooler"
  | "skiBoard"
  | "skiBoots"
  | "skiSuit"
  | "helmet"
  | "goggles"
  | "gloves"
  | "warmPatch"
  | "consumable"
  | "power"
  | "lighting"
  | "repair"
  | "dryBag"
  | "sunHat"
  | "sunglasses"
  | "skiBinding"
  | "fishingLine"
  | "vehicleTool"
  | "tableware"
  | "other";

export type ProductTemplate = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  buyUrl: string;
  priority: ProductPriority;
  level: ProductLevel;
  gearType: GearType;
  budgetWeight: BudgetWeight;
  weatherFit: ProductWeatherFit[];
  gearCategory: GearCategory;
  activityCore: boolean;
  activities: Activity[];
  category: string;
  tags: string[];
  unit: string;
  reason: string;
};

export type Product = ProductTemplate & {
  icon: string;
  productUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

type ProductSeed = {
  id: string;
  name: string;
  brand: string;
  price: number;
  priority: ProductPriority;
  level: ProductLevel;
  category: string;
  tags: string[];
  unit: string;
  reason: string;
};

export const activityOptions: Activity[] = ["登山", "露营", "徒步", "自驾游", "钓鱼", "滑雪", "骑行", "海边旅行"];

export const productUrl = "https://example.com";

const productSearchPlatforms = ["jd", "taobao", "amazon"] as const;

function product(seed: ProductSeed): ProductTemplate {
  const gearCategory = getGearCategory(seed.category, seed.tags);
  const activities = getProductActivities(seed.category, seed.tags, gearCategory);

  return {
    ...seed,
    gearType: getGearType(seed.category),
    budgetWeight: getBudgetWeight(seed.category, seed.priority),
    image: getProductImage(seed.category),
    buyUrl: getProductBuyUrl(seed.id, seed.name, seed.brand),
    weatherFit: getWeatherFit(seed.category, seed.tags),
    gearCategory,
    activityCore: getActivityCore(gearCategory),
    activities,
  };
}

function getWeatherFit(category: string, tags: string[]): ProductWeatherFit[] {
  const text = [category, ...tags].join(" ");
  const weatherFit: ProductWeatherFit[] = [];

  if (["冲锋衣", "防水", "防雨", "雨", "速干", "帐篷", "登山鞋", "滑雪服"].some((keyword) => text.includes(keyword))) {
    weatherFit.push("雨天");
  }

  if (["防晒", "遮阳", "太阳镜", "紫外线", "强光", "通风"].some((keyword) => text.includes(keyword))) {
    weatherFit.push("晴天");
  }

  if (["保暖", "保温", "暖宝宝", "低温", "睡袋", "滑雪服", "滑雪手套", "雪鞋", "手套", "热饮"].some((keyword) => text.includes(keyword))) {
    weatherFit.push("寒冷");
  }

  return weatherFit.length > 0 ? weatherFit : ["通用"];
}

function getGearCategory(category: string, tags: string[]): GearCategory {
  const text = [category, ...tags].join(" ");

  if (category.includes("滑雪服")) return "skiSuit";

  if (["防水鞋", "徒步鞋", "登山鞋", "防滑鞋"].some((keyword) => text.includes(keyword)) || category.includes("鞋")) {
    if (category.includes("雪鞋")) {
      return "skiBoots";
    }

    return "shoes";
  }

  if (category.includes("冲锋衣")) return "shellJacket";
  if (category.includes("雨衣")) return "raincoat";
  if (category.includes("保暖层") || category.includes("保暖衣") || category.includes("保暖内衣")) return "insulation";
  if (category.includes("背包")) return "backpack";
  if (category.includes("登山杖")) return "pole";
  if (category.includes("头灯")) return "headlamp";
  if (category.includes("水袋") || category.includes("水壶") || category.includes("饮用水")) return "water";
  if (category.includes("食物") || category.includes("能量棒")) return "food";
  if (category.includes("急救") || category.includes("药品")) return "firstAid";
  if (category.includes("帐篷")) return "tent";
  if (category.includes("睡袋")) return "sleepingBag";
  if (category.includes("垫")) return "mat";
  if (category.includes("炉具")) return "stove";
  if (category.includes("钓椅") || category.includes("桌椅") || category.includes("椅")) return "chair";
  if (category.includes("鱼竿")) return "fishingRod";
  if (category.includes("保温箱") || category.includes("车载冰箱")) return "cooler";
  if (category.includes("滑雪板")) return "skiBoard";
  if (category.includes("固定器")) return "skiBinding";
  if (category.includes("头盔")) return "helmet";
  if (category.includes("太阳镜")) return "sunglasses";
  if (category.includes("镜")) return "goggles";
  if (category.includes("手套")) return "gloves";
  if (category.includes("暖宝宝")) return "warmPatch";
  if (category.includes("防晒霜") || category.includes("毛巾")) return "consumable";
  if (category.includes("电源")) return "power";
  if (category.includes("营地灯") || category.includes("车灯")) return "lighting";
  if (category.includes("补胎")) return "repair";
  if (category.includes("防水袋")) return "dryBag";
  if (category.includes("遮阳帽") || category.includes("防晒帽")) return "sunHat";
  if (category.includes("鱼线")) return "fishingLine";
  if (category.includes("充气泵")) return "vehicleTool";
  if (category.includes("杯") || category.includes("餐具")) return "tableware";

  return "other";
}

function getProductActivities(category: string, tags: string[], gearCategory: GearCategory): Activity[] {
  const text = [category, ...tags].join(" ");

  switch (gearCategory) {
    case "skiBoard":
    case "skiBoots":
    case "skiSuit":
    case "skiBinding":
    case "goggles":
      return ["滑雪"];
    case "tent":
    case "sleepingBag":
    case "mat":
    case "stove":
      return ["露营", "徒步"];
    case "shellJacket":
    case "insulation":
      return ["登山", "徒步"];
    case "shoes":
      return text.includes("防滑") ? ["钓鱼", "登山", "徒步"] : ["登山", "徒步"];
    case "backpack":
    case "pole":
    case "headlamp":
      return ["登山", "徒步", "露营"];
    case "gloves":
      return ["登山", "徒步", "滑雪", "骑行"];
    case "warmPatch":
      return ["滑雪", "登山", "徒步", "露营"];
    case "fishingRod":
    case "fishingLine":
      return ["钓鱼"];
    case "chair":
      return text.includes("钓椅") ? ["钓鱼"] : ["露营", "自驾游"];
    case "cooler":
      return ["露营", "自驾游", "钓鱼"];
    case "power":
    case "vehicleTool":
      return ["自驾游", "露营"];
    case "lighting":
      return text.includes("车灯") ? ["骑行"] : ["露营", "登山", "徒步"];
    case "repair":
      return ["骑行"];
    case "dryBag":
      return ["海边旅行", "徒步", "登山", "钓鱼"];
    case "sunHat":
    case "sunglasses":
      return ["海边旅行", "钓鱼", "登山", "徒步"];
    case "helmet":
      return text.includes("骑行") ? ["骑行"] : ["滑雪", "骑行"];
    case "water":
    case "food":
    case "consumable":
      return ["登山", "露营", "徒步", "自驾游", "钓鱼", "滑雪", "骑行", "海边旅行"];
    default:
      return ["登山", "露营", "徒步", "自驾游", "钓鱼", "滑雪", "骑行", "海边旅行"];
  }
}

function getActivityCore(gearCategory: GearCategory) {
  return (
    [
      "shoes",
      "shellJacket",
      "backpack",
      "tent",
      "sleepingBag",
      "mat",
      "stove",
      "fishingRod",
      "fishingLine",
      "skiBoard",
      "skiBoots",
      "skiSuit",
      "helmet",
      "goggles",
      "power",
    ] as GearCategory[]
  ).includes(gearCategory);
}

function getGearType(category: string): GearType {
  if (
    [
      "帐篷",
      "炉具",
      "营地灯",
      "折叠桌椅",
      "保温箱",
      "户外电源",
      "车载冰箱",
      "充气泵",
      "防晒霜",
      "暖宝宝",
    ].some((keyword) => category.includes(keyword))
  ) {
    return "shared";
  }

  return "perPerson";
}

function getBudgetWeight(category: string, priority: ProductPriority): BudgetWeight {
  if (
    [
      "冲锋衣",
      "防水鞋",
      "保暖层",
      "登山鞋",
      "徒步背包",
      "滑雪板",
      "固定器",
      "雪鞋",
      "滑雪服",
      "帐篷",
      "睡袋",
      "炉具",
      "户外电源",
      "车载冰箱",
      "鱼竿",
      "钓椅",
      "鱼线装备",
    ].some((keyword) => category.includes(keyword))
  ) {
    return "high";
  }

  if (
    priority === "important" ||
    ["头盔", "滑雪镜", "头灯", "营地灯", "保温箱", "充气泵", "遮阳帽", "防水袋", "补胎工具", "车灯"].some((keyword) =>
      category.includes(keyword),
    )
  ) {
    return "medium";
  }

  return "low";
}

function getProductBuyUrl(id: string, name: string, brand: string) {
  const query = encodeURIComponent(`${brand} ${name}`);
  const sourceId = encodeURIComponent(id);
  const platform = productSearchPlatforms[Math.abs(hashString(id)) % productSearchPlatforms.length];

  if (platform === "taobao") {
    return `https://s.taobao.com/search?q=${query}&outdoorId=${sourceId}`;
  }

  if (platform === "amazon") {
    return `https://www.amazon.cn/s?k=${query}&ref=outdoor_${sourceId}`;
  }

  return `https://search.jd.com/Search?keyword=${query}&enc=utf-8&outdoorId=${sourceId}`;
}

function hashString(value: string) {
  return [...value].reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getProductImage(category: string) {
  if (category.includes("帐篷")) {
    return "/products/tent.jpg";
  }

  if (category.includes("钓椅") || category.includes("桌椅") || category.includes("椅")) {
    return "/products/camping-chair.jpg";
  }

  if (category.includes("鱼竿") || category.includes("鱼线") || category.includes("钓鱼")) {
    return "/products/fishing-rod.jpg";
  }

  if (category.includes("滑雪板") || category.includes("固定器") || category.includes("雪鞋") || category.includes("滑雪") || category.includes("雪镜")) {
    return "/products/ski-board.jpg";
  }

  if (category.includes("头灯") || category.includes("灯")) {
    return "/products/headlamp.jpg";
  }

  if (category.includes("鞋")) {
    return "/products/hiking-shoes.jpg";
  }

  return "/products/jacket.jpg";
}

const productCatalogSeed: Record<Activity, ProductSeed[]> = {
  登山: [
    { id: "decathlon-basic-shell", name: "迪卡侬入门冲锋衣", brand: "Decathlon 迪卡侬", price: 399, priority: "core", level: "basic", category: "冲锋衣", tags: ["防风", "防雨", "入门"], unit: "件", reason: "应对山地风雨和早晚温差，是登山外层核心。" },
    { id: "kailas-hard-shell-jacket", name: "凯乐石冲锋衣", brand: "Kailas 凯乐石", price: 899, priority: "core", level: "standard", category: "冲锋衣", tags: ["防风", "防雨", "外层"], unit: "件", reason: "应对山地风雨和早晚温差，是登山外层核心。" },
    { id: "arcteryx-beta-jacket", name: "始祖鸟 Beta 冲锋衣", brand: "Arc'teryx 始祖鸟", price: 1999, priority: "core", level: "premium", category: "冲锋衣", tags: ["高防护", "长线", "专业"], unit: "件", reason: "预算充足时优先升级外层防护，提升恶劣天气下的安全余量。" },
    { id: "decathlon-hiking-shoes-basic", name: "迪卡侬登山鞋", brand: "Decathlon 迪卡侬", price: 299, priority: "core", level: "basic", category: "登山鞋", tags: ["抓地", "入门", "徒步"], unit: "双", reason: "抓地、防滑和护踝能力直接影响安全。" },
    { id: "salomon-hiking-boots", name: "Salomon 登山鞋", brand: "Salomon 萨洛蒙", price: 1099, priority: "core", level: "standard", category: "登山鞋", tags: ["防滑", "护踝", "抓地"], unit: "双", reason: "抓地、防滑和护踝能力直接影响安全。" },
    { id: "la-sportiva-tx5-boots", name: "La Sportiva 高帮登山鞋", brand: "La Sportiva", price: 1899, priority: "core", level: "premium", category: "登山鞋", tags: ["高帮", "复杂路面", "专业"], unit: "双", reason: "高预算优先升级鞋底和支撑，复杂路面下更稳。" },
    { id: "blackdiamond-headlamp-basic", name: "Black Diamond 入门头灯", brand: "Black Diamond", price: 159, priority: "important", level: "basic", category: "头灯", tags: ["照明", "备用", "入门"], unit: "个", reason: "晚归、雾天和营地照明都能用上。" },
    { id: "blackdiamond-headlamp", name: "BlackDiamond 头灯", brand: "Black Diamond", price: 299, priority: "important", level: "standard", category: "头灯", tags: ["照明", "夜行", "备用"], unit: "个", reason: "晚归、雾天和营地照明都能用上。" },
    { id: "petzl-swift-headlamp", name: "Petzl 高亮头灯", brand: "Petzl", price: 699, priority: "important", level: "premium", category: "头灯", tags: ["高亮", "长续航", "夜行"], unit: "个", reason: "长线和夜行场景下，高亮和续航更可靠。" },
    { id: "decathlon-hiking-gloves", name: "迪卡侬登山手套", brand: "Decathlon 迪卡侬", price: 129, priority: "optional", level: "standard", category: "手套", tags: ["手部保护", "保暖", "防磨"], unit: "双", reason: "保护手部并改善低温下的操作感。" },
    { id: "naturehike-fleece-layer", name: "Naturehike 抓绒保暖层", brand: "Naturehike 挪客", price: 199, priority: "important", level: "standard", category: "保暖层", tags: ["保暖", "中层", "低温"], unit: "件", reason: "低温、降雨和等待时维持核心体温，降低失温风险。" },
    { id: "banana-boat-sunscreen", name: "Banana Boat 防晒霜", brand: "Banana Boat", price: 99, priority: "optional", level: "standard", category: "防晒霜", tags: ["防晒", "紫外线", "皮肤保护"], unit: "瓶", reason: "长时间暴露时降低晒伤风险。" },
  ],
  露营: [
    { id: "decathlon-camp-tent-basic", name: "迪卡侬入门帐篷", brand: "Decathlon 迪卡侬", price: 499, priority: "core", level: "basic", category: "帐篷", tags: ["庇护", "入门", "露营"], unit: "顶", reason: "决定夜间庇护、防雨和空间体验。" },
    { id: "naturehike-cloud-up-tent", name: "Naturehike 帐篷", brand: "Naturehike 挪客", price: 999, priority: "core", level: "standard", category: "帐篷", tags: ["庇护", "防雨", "双人"], unit: "顶", reason: "决定夜间庇护、防雨和空间体验。" },
    { id: "msr-hubba-tent", name: "MSR Hubba 帐篷", brand: "MSR", price: 2999, priority: "core", level: "premium", category: "帐篷", tags: ["轻量", "高防护", "长线"], unit: "顶", reason: "预算充足时优先升级帐篷，获得更好的抗风、防雨和重量表现。" },
    { id: "decathlon-sleeping-bag-basic", name: "迪卡侬睡袋", brand: "Decathlon 迪卡侬", price: 299, priority: "core", level: "basic", category: "睡袋", tags: ["睡眠", "保暖", "入门"], unit: "个", reason: "夜间保暖的关键装备。" },
    { id: "coleman-sleeping-bag", name: "Coleman 睡袋", brand: "Coleman", price: 599, priority: "core", level: "standard", category: "睡袋", tags: ["保暖", "睡眠", "露营"], unit: "个", reason: "夜间保暖的关键装备。" },
    { id: "sea-to-summit-sleeping-bag", name: "Sea to Summit 睡袋", brand: "Sea to Summit", price: 1599, priority: "core", level: "premium", category: "睡袋", tags: ["轻量", "高保暖", "长线"], unit: "个", reason: "高预算优先升级睡眠保暖，夜间恢复质量更好。" },
    { id: "naturehike-sleeping-mat", name: "Naturehike 防潮垫", brand: "Naturehike 挪客", price: 199, priority: "core", level: "standard", category: "防潮垫", tags: ["隔潮", "睡眠", "露营"], unit: "张", reason: "隔绝地面潮气和寒气，提升夜间保暖和睡眠稳定性。" },
    { id: "fire-maple-stove-basic", name: "火枫入门炉具", brand: "Fire-Maple 火枫", price: 199, priority: "core", level: "basic", category: "炉具", tags: ["烧水", "热餐", "入门"], unit: "套", reason: "烧水热餐，提高露营补给效率。" },
    { id: "fire-maple-stove", name: "火枫炉具", brand: "Fire-Maple 火枫", price: 299, priority: "core", level: "standard", category: "炉具", tags: ["烧水", "热餐", "炉具"], unit: "套", reason: "烧水热餐，提高露营补给效率。" },
    { id: "jetboil-stove-system", name: "Jetboil 炉具系统", brand: "Jetboil", price: 899, priority: "core", level: "premium", category: "炉具", tags: ["高效率", "烧水", "专业"], unit: "套", reason: "高预算升级炉具效率，低温和多人场景更稳。" },
    { id: "goalzero-camp-lantern", name: "Goal Zero 营地灯", brand: "Goal Zero", price: 399, priority: "important", level: "standard", category: "营地灯", tags: ["照明", "营地", "夜间"], unit: "个", reason: "营地活动和夜间行动更安全。" },
    { id: "kingcamp-table-chair-set", name: "KingCamp 折叠桌椅", brand: "KingCamp", price: 699, priority: "important", level: "standard", category: "折叠桌椅", tags: ["桌椅", "用餐", "营地"], unit: "张", reason: "让营地用餐和休息更稳定舒适。" },
    { id: "snowpeak-camping-mug", name: "Snow Peak 露营杯", brand: "Snow Peak", price: 129, priority: "optional", level: "standard", category: "露营杯", tags: ["饮水", "热饮", "杯具"], unit: "件", reason: "饮水和热饮更方便。" },
  ],
  徒步: [
    { id: "decathlon-hiking-shoes-basic", name: "迪卡侬徒步鞋", brand: "Decathlon 迪卡侬", price: 299, priority: "core", level: "basic", category: "登山鞋", tags: ["抓地", "入门", "徒步"], unit: "双", reason: "减少脚部疲劳并提升复杂路面稳定性。" },
    { id: "salomon-x-ultra-shoes", name: "Salomon 徒步鞋", brand: "Salomon 萨洛蒙", price: 899, priority: "core", level: "standard", category: "登山鞋", tags: ["抓地", "轻量", "徒步"], unit: "双", reason: "减少脚部疲劳并提升复杂路面稳定性。" },
    { id: "hoka-kaha-hiking-boots", name: "HOKA 高缓震徒步鞋", brand: "HOKA", price: 1599, priority: "core", level: "premium", category: "登山鞋", tags: ["缓震", "长距离", "轻量"], unit: "双", reason: "长距离徒步优先升级鞋的缓震和支撑。" },
    { id: "osprey-daylite-pack", name: "Osprey 徒步背包", brand: "Osprey", price: 599, priority: "core", level: "standard", category: "徒步背包", tags: ["背负", "日行", "补给"], unit: "件", reason: "背负系统影响整天行走的舒适度。" },
    { id: "decathlon-waterproof-hiking-shoes", name: "迪卡侬防水徒步鞋", brand: "Decathlon 迪卡侬", price: 499, priority: "core", level: "standard", category: "防水鞋", tags: ["防水", "防滑", "雨天"], unit: "双", reason: "雨天和湿滑路面优先保证脚部干燥与抓地稳定。" },
    { id: "blackdiamond-spot-headlamp", name: "Black Diamond 头灯", brand: "Black Diamond", price: 299, priority: "important", level: "standard", category: "头灯", tags: ["照明", "晚归", "备用"], unit: "个", reason: "晚归和临时照明的可靠备份。" },
    { id: "decathlon-quickdry-shirt", name: "迪卡侬速干衣", brand: "Decathlon 迪卡侬", price: 129, priority: "important", level: "standard", category: "速干衣", tags: ["速干", "排汗", "雨天"], unit: "件", reason: "汗湿或雨淋后更快排湿，降低失温风险。" },
    { id: "camelbak-hydration-bladder", name: "CamelBak 水袋", brand: "CamelBak", price: 199, priority: "optional", level: "standard", category: "水袋", tags: ["补水", "水袋", "长距离"], unit: "个", reason: "不用停下就能补水，更适合长距离徒步。" },
  ],
  自驾游: [
    { id: "ecoflow-river-basic", name: "EcoFlow 入门户外电源", brand: "EcoFlow 正浩", price: 999, priority: "core", level: "basic", category: "户外电源", tags: ["供电", "自驾", "入门"], unit: "个", reason: "为手机、灯具、小电器和车载设备补能。" },
    { id: "ecoflow-river-power-station", name: "EcoFlow 户外电源", brand: "EcoFlow 正浩", price: 1999, priority: "core", level: "standard", category: "户外电源", tags: ["供电", "自驾", "露营"], unit: "个", reason: "为手机、灯具、小电器和车载设备补能。" },
    { id: "ecoflow-delta-power-station", name: "EcoFlow Delta 户外电源", brand: "EcoFlow 正浩", price: 3999, priority: "core", level: "premium", category: "户外电源", tags: ["大容量", "自驾", "长线"], unit: "个", reason: "高预算优先升级电源容量，应对长途和多设备用电。" },
    { id: "alpicool-car-fridge", name: "Alpicool 车载冰箱", brand: "Alpicool", price: 1499, priority: "core", level: "standard", category: "车载冰箱", tags: ["冷藏", "车载", "长途"], unit: "个", reason: "长途保存食材和饮品更稳定。" },
    { id: "baseus-air-pump", name: "倍思充气泵", brand: "Baseus 倍思", price: 249, priority: "important", level: "standard", category: "充气泵", tags: ["胎压", "补气", "车载"], unit: "个", reason: "胎压不足时可快速补气。" },
    { id: "kingcamp-folding-table-chair", name: "KingCamp 折叠桌椅", brand: "KingCamp", price: 699, priority: "optional", level: "standard", category: "折叠桌椅", tags: ["桌椅", "自驾", "休息"], unit: "张", reason: "让停车休息、露营用餐更舒服。" },
  ],
  钓鱼: [
    { id: "decathlon-fishing-rod-basic", name: "迪卡侬入门鱼竿", brand: "Decathlon 迪卡侬", price: 199, priority: "core", level: "basic", category: "鱼竿", tags: ["鱼竿", "入门", "作钓"], unit: "件", reason: "根据目标鱼情选择长度和调性。" },
    { id: "daiwa-fishing-rod", name: "达瓦鱼竿", brand: "DAIWA 达瓦", price: 699, priority: "core", level: "standard", category: "鱼竿", tags: ["鱼竿", "作钓", "核心"], unit: "件", reason: "根据目标鱼情选择长度和调性。" },
    { id: "daiwa-premium-fishing-rod", name: "达瓦高端鱼竿", brand: "DAIWA 达瓦", price: 1599, priority: "core", level: "premium", category: "鱼竿", tags: ["轻量", "高灵敏", "核心"], unit: "件", reason: "预算充足时优先升级鱼竿，抛投、控鱼和手感更好。" },
    { id: "naturehike-fishing-chair", name: "折叠钓椅", brand: "Naturehike 挪客", price: 299, priority: "core", level: "standard", category: "钓椅", tags: ["钓椅", "折叠", "久坐"], unit: "把", reason: "长时间等待时保持舒适。" },
    { id: "daiwa-line-kit", name: "达瓦鱼线装备", brand: "DAIWA 达瓦", price: 199, priority: "core", level: "standard", category: "鱼线装备", tags: ["鱼线", "浮漂", "钓组"], unit: "套", reason: "鱼线、浮漂和基础钓组决定能否完整作钓。" },
    { id: "shimano-sun-hat", name: "Shimano 防晒帽", brand: "Shimano 禧玛诺", price: 129, priority: "important", level: "standard", category: "防晒帽", tags: ["防晒", "钓鱼", "遮阳"], unit: "顶", reason: "减少头面部暴晒和水面反光影响。" },
    { id: "decathlon-fishing-towel", name: "迪卡侬钓鱼毛巾", brand: "Decathlon 迪卡侬", price: 49, priority: "optional", level: "standard", category: "毛巾", tags: ["毛巾", "清洁", "水边"], unit: "条", reason: "擦手、清理水渍和保持装备干爽。" },
  ],
  滑雪: [
    { id: "decathlon-snowboard-basic", name: "迪卡侬入门滑雪板", brand: "Decathlon 迪卡侬", price: 1599, priority: "core", level: "basic", category: "滑雪板", tags: ["滑雪板", "入门", "雪场"], unit: "块", reason: "决定滑行基础体验和稳定性，是雪场核心装备。" },
    { id: "burton-process-snowboard", name: "Burton 滑雪板", brand: "Burton", price: 3499, priority: "core", level: "standard", category: "滑雪板", tags: ["滑雪板", "单板", "雪场"], unit: "块", reason: "决定滑行基础体验和稳定性，是雪场核心装备。" },
    { id: "burton-custom-snowboard", name: "Burton Custom 滑雪板", brand: "Burton", price: 4999, priority: "core", level: "premium", category: "滑雪板", tags: ["高响应", "进阶", "核心"], unit: "块", reason: "高预算优先升级滑雪板，提升稳定性、响应和成长空间。" },
    { id: "burton-mission-bindings", name: "Burton 固定器", brand: "Burton", price: 1299, priority: "core", level: "standard", category: "固定器", tags: ["固定器", "单板", "连接"], unit: "副", reason: "连接雪鞋和滑雪板，直接影响控制和安全。" },
    { id: "salomon-snowboard-boots", name: "Salomon 雪鞋", brand: "Salomon 萨洛蒙", price: 1499, priority: "core", level: "standard", category: "雪鞋", tags: ["雪鞋", "支撑", "固定"], unit: "双", reason: "直接影响固定、支撑和脚踝控制。" },
    { id: "phenix-ski-suit", name: "Phenix 滑雪服", brand: "Phenix", price: 1999, priority: "core", level: "standard", category: "滑雪服", tags: ["防风", "防雪", "保暖"], unit: "套", reason: "防风防雪并保暖，是雪场核心装备。" },
    { id: "poc-ski-helmet", name: "POC 头盔", brand: "POC", price: 799, priority: "core", level: "standard", category: "头盔", tags: ["头盔", "安全", "防护"], unit: "个", reason: "保护头部，是滑雪安全的基础装备。" },
    { id: "smith-ski-goggles", name: "Smith 滑雪镜", brand: "Smith", price: 699, priority: "important", level: "standard", category: "滑雪镜", tags: ["雪镜", "护眼", "强光"], unit: "副", reason: "减少强光刺激并保护眼睛。" },
    { id: "decathlon-ski-gloves", name: "迪卡侬滑雪手套", brand: "Decathlon 迪卡侬", price: 159, priority: "optional", level: "standard", category: "滑雪手套", tags: ["手套", "保暖", "防雪"], unit: "双", reason: "保暖、防雪，也能保护手部。" },
    { id: "kobayashi-warmers", name: "小林暖宝宝", brand: "小林制药", price: 5, priority: "optional", level: "standard", category: "暖宝宝", tags: ["暖宝宝", "低温", "热量"], unit: "片", reason: "低温等待时给手脚补充热量。" },
  ],
  骑行: [
    { id: "decathlon-cycling-helmet-basic", name: "迪卡侬骑行头盔", brand: "Decathlon 迪卡侬", price: 159, priority: "core", level: "basic", category: "头盔", tags: ["头盔", "骑行", "入门"], unit: "个", reason: "骑行安全最重要的一件装备。" },
    { id: "giant-cycling-helmet", name: "捷安特头盔", brand: "GIANT 捷安特", price: 399, priority: "core", level: "standard", category: "头盔", tags: ["头盔", "骑行", "安全"], unit: "个", reason: "骑行安全最重要的一件装备。" },
    { id: "poc-cycling-helmet-premium", name: "POC 骑行头盔", brand: "POC", price: 999, priority: "core", level: "premium", category: "头盔", tags: ["轻量", "通风", "高防护"], unit: "个", reason: "高预算优先升级头盔防护、通风和佩戴稳定性。" },
    { id: "cateye-bike-light", name: "CatEye 车灯", brand: "CatEye", price: 299, priority: "important", level: "standard", category: "车灯", tags: ["照明", "夜骑", "可见度"], unit: "个", reason: "夜间和隧道环境提升可见度。" },
    { id: "topeak-repair-kit", name: "Topeak 补胎工具", brand: "Topeak", price: 129, priority: "important", level: "standard", category: "补胎工具", tags: ["补胎", "维修", "工具"], unit: "套", reason: "处理扎胎，避免中途无法继续。" },
    { id: "giro-cycling-gloves", name: "Giro 骑行手套", brand: "Giro", price: 129, priority: "optional", level: "standard", category: "骑行手套", tags: ["手套", "防滑", "缓震"], unit: "双", reason: "防滑、缓震，并保护手掌。" },
  ],
  海边旅行: [
    { id: "banana-boat-sunscreen", name: "Banana Boat 防晒霜", brand: "Banana Boat", price: 99, priority: "optional", level: "standard", category: "防晒霜", tags: ["防晒", "海边", "紫外线"], unit: "瓶", reason: "海边紫外线强，防晒优先级很高。" },
    { id: "oakley-sunglasses", name: "Oakley 太阳镜", brand: "Oakley", price: 699, priority: "important", level: "standard", category: "太阳镜", tags: ["太阳镜", "强光", "防晒"], unit: "副", reason: "晴天强光和水面反光环境下保护眼睛。" },
    { id: "columbia-sun-hat", name: "Columbia 遮阳帽", brand: "Columbia 哥伦比亚", price: 129, priority: "important", level: "standard", category: "遮阳帽", tags: ["遮阳", "防晒", "海边"], unit: "顶", reason: "降低头面部暴晒。" },
    { id: "sea-to-summit-dry-bag", name: "Sea to Summit 防水袋", brand: "Sea to Summit", price: 159, priority: "important", level: "standard", category: "防水袋", tags: ["防水", "手机", "证件"], unit: "件", reason: "保护手机、证件和电子设备。" },
    { id: "decathlon-beach-mat", name: "迪卡侬沙滩垫", brand: "Decathlon 迪卡侬", price: 129, priority: "optional", level: "standard", category: "沙滩垫", tags: ["沙滩", "休息", "垫子"], unit: "张", reason: "休息更舒适，也减少沙土附着。" },
    { id: "naturehike-quickdry-towel", name: "Naturehike 速干毛巾", brand: "Naturehike 挪客", price: 79, priority: "optional", level: "standard", category: "速干毛巾", tags: ["速干", "毛巾", "涉水"], unit: "条", reason: "涉水或游泳后快速擦干。" },
  ],
};

export const productCatalog: Record<Activity, ProductTemplate[]> = Object.fromEntries(
  Object.entries(productCatalogSeed).map(([activity, products]) => [activity, products.map(product)]),
) as Record<Activity, ProductTemplate[]>;
