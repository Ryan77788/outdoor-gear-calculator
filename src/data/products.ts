export type Activity =
  | "登山"
  | "徒步"
  | "露营"
  | "滑雪"
  | "钓鱼"
  | "自驾游"
  | "骑行"
  | "海边旅行"
  | "越野跑"
  | "重装徒步"
  | "攀岩"
  | "皮划艇"
  | "单板滑雪"
  | "沙漠徒步"
  | "冬季露营"
  | "海边露营";
export type ProductWeather = "晴天" | "雨天" | "寒冷" | "炎热" | "通用";
export type ProductLevel = "basic" | "standard" | "premium";
export type ProductPriority = "core" | "important" | "optional";
export type GearType = "perPerson" | "shared" | "consumable";
export type BudgetWeight = "high" | "medium" | "low";
export type ImageStatus = "matched" | "placeholder" | "needsReview";
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
  | "lighting"
  | "chair"
  | "fishingRod"
  | "fishingLine"
  | "cooler"
  | "skiBoard"
  | "skiBinding"
  | "skiBoots"
  | "skiSuit"
  | "helmet"
  | "goggles"
  | "gloves"
  | "warmPatch"
  | "power"
  | "repair"
  | "dryBag"
  | "sunHat"
  | "sunglasses"
  | "vehicleTool"
  | "tableChair"
  | "beachMat"
  | "towel"
  | "baseLayer"
  | "sunscreen"
  | "electrolyte"
  | "consumable";

export type ProductTemplate = {
  id: string;
  name: string;
  nameEn?: string;
  brand: string;
  category: string;
  categoryEn?: string;
  gearCategory: GearCategory;
  activity: Activity[];
  weather: ProductWeather[];
  level: ProductLevel;
  priority: ProductPriority;
  gearType: GearType;
  budgetWeight: BudgetWeight;
  price: number;
  unit: string;
  image: string;
  imageStatus: ImageStatus;
  buyUrl: string;
  reason: string;
  reasonEn?: string;
};

export type Product = ProductTemplate & {
  icon: string;
  productUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export const activityOptions: Activity[] = [
  "登山",
  "徒步",
  "露营",
  "滑雪",
  "钓鱼",
  "自驾游",
  "骑行",
  "海边旅行",
  "越野跑",
  "重装徒步",
  "攀岩",
  "皮划艇",
  "单板滑雪",
  "沙漠徒步",
  "冬季露营",
  "海边露营",
];

export const productUrl = "https://www.amazon.com/s?k=outdoor+gear";

const imageByCategory: Partial<Record<GearCategory, string>> = {
  backpack: "/products/placeholder-backpack.jpg",
  beachMat: "/products/placeholder-beach.jpg",
  chair: "/products/placeholder-camping.jpg",
  cooler: "/products/placeholder-camping.jpg",
  dryBag: "/products/placeholder-beach.jpg",
  electrolyte: "/products/placeholder-beach.jpg",
  fishingLine: "/products/placeholder-fishing.jpg",
  fishingRod: "/products/placeholder-fishing.jpg",
  food: "/products/placeholder-backpack.jpg",
  gloves: "/products/placeholder-ski.jpg",
  goggles: "/products/placeholder-ski.jpg",
  headlamp: "/products/placeholder-camping.jpg",
  helmet: "/products/placeholder-cycling.jpg",
  insulation: "/products/placeholder-jacket.jpg",
  lighting: "/products/placeholder-camping.jpg",
  mat: "/products/placeholder-camping.jpg",
  pole: "/products/placeholder-backpack.jpg",
  power: "/products/placeholder-camping.jpg",
  raincoat: "/products/placeholder-jacket.jpg",
  repair: "/products/placeholder-cycling.jpg",
  shellJacket: "/products/placeholder-jacket.jpg",
  shoes: "/products/placeholder-shoes.jpg",
  skiBinding: "/products/placeholder-ski.jpg",
  skiBoard: "/products/placeholder-ski.jpg",
  skiBoots: "/products/placeholder-ski.jpg",
  skiSuit: "/products/placeholder-ski.jpg",
  sleepingBag: "/products/placeholder-camping.jpg",
  stove: "/products/placeholder-camping.jpg",
  sunHat: "/products/placeholder-beach.jpg",
  sunglasses: "/products/placeholder-beach.jpg",
  sunscreen: "/products/placeholder-beach.jpg",
  tableChair: "/products/placeholder-camping.jpg",
  tent: "/products/placeholder-tent.jpg",
  towel: "/products/placeholder-beach.jpg",
  vehicleTool: "/products/placeholder-camping.jpg",
  warmPatch: "/products/placeholder-ski.jpg",
  water: "/products/placeholder-backpack.jpg",
  baseLayer: "/products/placeholder-jacket.jpg",
  consumable: "/products/placeholder-camping.jpg",
};

export const categoryEnByGearCategory: Record<GearCategory, string> = {
  shoes: "hiking shoes",
  shellJacket: "shell jacket",
  raincoat: "rain jacket",
  insulation: "insulation layer",
  backpack: "backpack",
  pole: "trekking poles",
  headlamp: "headlamp",
  water: "hydration gear",
  food: "trail food",
  firstAid: "first aid kit",
  tent: "tent",
  sleepingBag: "sleeping bag",
  mat: "sleeping pad",
  stove: "camp stove",
  lighting: "camp lighting",
  chair: "camping chair",
  fishingRod: "fishing rod",
  fishingLine: "fishing tackle",
  cooler: "cooler",
  skiBoard: "ski board",
  skiBinding: "ski binding",
  skiBoots: "ski boots",
  skiSuit: "ski suit",
  helmet: "helmet",
  goggles: "goggles",
  gloves: "gloves",
  warmPatch: "heat packs",
  power: "portable power station",
  repair: "repair kit",
  dryBag: "dry bag",
  sunHat: "sun hat",
  sunglasses: "sunglasses",
  vehicleTool: "vehicle tool",
  tableChair: "camp table and chairs",
  beachMat: "beach mat",
  towel: "quick-dry towel",
  baseLayer: "base layer",
  sunscreen: "sunscreen",
  electrolyte: "electrolytes",
  consumable: "consumables",
};

const categoryZhByGearCategory: Record<GearCategory, string> = {
  shoes: "户外鞋",
  shellJacket: "冲锋衣",
  raincoat: "雨衣",
  insulation: "保暖层",
  backpack: "背包",
  pole: "登山杖",
  headlamp: "头灯",
  water: "补水装备",
  food: "能量补给",
  firstAid: "急救包",
  tent: "帐篷",
  sleepingBag: "睡袋",
  mat: "睡垫",
  stove: "炉具",
  lighting: "营地照明",
  chair: "户外椅",
  fishingRod: "鱼竿",
  fishingLine: "钓组",
  cooler: "冷藏箱",
  skiBoard: "滑雪板",
  skiBinding: "固定器",
  skiBoots: "雪靴",
  skiSuit: "滑雪服",
  helmet: "头盔",
  goggles: "雪镜",
  gloves: "手套",
  warmPatch: "暖贴",
  power: "户外电源",
  repair: "维修工具",
  dryBag: "防水袋",
  sunHat: "遮阳帽",
  sunglasses: "太阳镜",
  vehicleTool: "车载工具",
  tableChair: "桌椅套装",
  beachMat: "沙滩垫",
  towel: "速干毛巾",
  baseLayer: "速干层",
  sunscreen: "防晒用品",
  electrolyte: "电解质",
  consumable: "消耗品",
};

type ProductInput = Omit<ProductTemplate, "buyUrl" | "image" | "imageStatus" | "category" | "categoryEn"> & {
  category?: string;
  categoryEn?: string;
  image?: string;
  imageStatus?: ImageStatus;
};

type CommercePlatform = "amazon" | "backcountry" | "evo" | "basspro" | "decathlon";

function searchUrl(platform: CommercePlatform, query: string) {
  const encodedQuery = encodeURIComponent(query);

  switch (platform) {
    case "backcountry":
      return `https://www.backcountry.com/search?q=${encodedQuery}`;
    case "evo":
      return `https://www.evo.com/shop?text=${encodedQuery}`;
    case "basspro":
      return `https://www.basspro.com/shop/en/search?searchTerm=${encodedQuery}`;
    case "decathlon":
      return `https://www.decathlon.com/search?query=${encodedQuery}`;
    case "amazon":
    default:
      return `https://www.amazon.com/s?k=${encodedQuery}`;
  }
}

function getCommercePlatform(product: ProductInput): CommercePlatform {
  const brand = product.brand.toLowerCase();

  if (brand.includes("decathlon") || brand.includes("naturehike")) {
    return "decathlon";
  }

  if (brand.includes("backcountry")) {
    return "backcountry";
  }

  if (product.activity.includes("钓鱼") || product.gearCategory === "fishingRod" || product.gearCategory === "fishingLine") {
    return ["daiwa", "shimano", "berkley", "yeti"].some((fishingBrand) => brand.includes(fishingBrand))
      ? "basspro"
      : "amazon";
  }

  if (
    product.activity.includes("滑雪") ||
    product.activity.includes("单板滑雪") ||
    ["skiBoard", "skiBinding", "skiBoots", "skiSuit", "goggles"].includes(product.gearCategory)
  ) {
    if (["burton", "union", "smith", "salomon", "giro", "hestra"].some((skiBrand) => brand.includes(skiBrand))) {
      return "evo";
    }

    return "amazon";
  }

  if (
    product.activity.includes("登山") ||
    product.activity.includes("徒步") ||
    product.activity.includes("越野跑") ||
    product.activity.includes("重装徒步") ||
    product.activity.includes("攀岩") ||
    product.activity.includes("沙漠徒步") ||
    ["shoes", "shellJacket", "raincoat", "insulation", "backpack", "pole", "headlamp", "baseLayer"].includes(
      product.gearCategory,
    )
  ) {
    if (["arc'teryx", "patagonia", "la sportiva"].some((outdoorBrand) => brand.includes(outdoorBrand))) {
      return "backcountry";
    }

    return "amazon";
  }

  if (
    product.activity.includes("露营") ||
    product.activity.includes("冬季露营") ||
    product.activity.includes("海边露营") ||
    product.activity.includes("皮划艇") ||
    ["tent", "sleepingBag", "mat", "stove", "lighting", "chair", "tableChair"].includes(product.gearCategory)
  ) {
    if (["msr", "sea to summit", "helinox"].some((campingBrand) => brand.includes(campingBrand))) {
      return "backcountry";
    }

    return "amazon";
  }

  return "amazon";
}

function makeBuyUrl(product: ProductInput) {
  const query = `${product.brand} ${product.nameEn ?? product.name}`;

  return searchUrl(getCommercePlatform(product), query);
}

function p(product: ProductInput): ProductTemplate {
  return {
    ...product,
    category: product.category ?? categoryZhByGearCategory[product.gearCategory],
    categoryEn: product.categoryEn ?? categoryEnByGearCategory[product.gearCategory],
    image: product.image ?? imageByCategory[product.gearCategory] ?? "/products/placeholder-camping.jpg",
    imageStatus: product.imageStatus ?? (product.image ? "needsReview" : "placeholder"),
    buyUrl: makeBuyUrl(product),
  };
}

export const productCatalog: Record<Activity, ProductTemplate[]> = {
  登山: [
    p({ id: "mountaineering-salomon-quest-4", name: "Salomon Quest 4 防水登山鞋", nameEn: "Salomon Quest 4 GTX hiking boots", brand: "Salomon", gearCategory: "shoes", activity: ["登山"], weather: ["雨天", "寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1399, unit: "双", reason: "高帮结构和防水鞋面更适合碎石、泥地和长时间上下坡。", reasonEn: "A supportive waterproof boot for rocky trails, muddy terrain, and long climbs or descents." }),
    p({ id: "mountaineering-la-sportiva-trango", name: "La Sportiva Trango Tech 登山鞋", nameEn: "La Sportiva Trango Tech GTX boots", brand: "La Sportiva", gearCategory: "shoes", activity: ["登山"], weather: ["寒冷", "雨天"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2699, unit: "双", reason: "更强的支撑和保护适合技术性更高的山地线路。", reasonEn: "A technical boot with stronger support and protection for more demanding mountain routes." }),
    p({ id: "mountaineering-arcteryx-beta", name: "Arc'teryx Beta 防水冲锋衣", nameEn: "Arc'teryx Beta shell jacket", brand: "Arc'teryx", gearCategory: "shellJacket", activity: ["登山"], weather: ["雨天", "寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 3999, unit: "件", reason: "高强度防风防雨外层，适合天气变化快的山地环境。", reasonEn: "A high-performance shell for wind, rain, and fast-changing mountain weather." }),
    p({ id: "mountaineering-kailas-mont-x", name: "Kailas Mont X 冲锋衣", nameEn: "Kailas Mont X shell jacket", brand: "Kailas", gearCategory: "shellJacket", activity: ["登山"], weather: ["雨天", "寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1299, unit: "件", reason: "兼顾防水、透气和耐磨，是中高强度登山的稳妥外层。", reasonEn: "A balanced waterproof and breathable shell for regular mountain use." }),
    p({ id: "mountaineering-osprey-talon-36", name: "Osprey Talon 36 登山背包", nameEn: "Osprey Talon 36 backpack", brand: "Osprey", gearCategory: "backpack", activity: ["登山"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1199, unit: "个", reason: "36L 容量适合携带外层、补给、头灯和应急装备。", reasonEn: "A stable 36L pack for layers, food, lighting, and emergency essentials." }),
    p({ id: "mountaineering-black-diamond-poles", name: "Black Diamond Trail 登山杖", nameEn: "Black Diamond Trail trekking poles", brand: "Black Diamond", gearCategory: "pole", activity: ["登山"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 699, unit: "副", reason: "下坡和湿滑路段能明显减轻膝盖压力并提升稳定性。", reasonEn: "Reduces knee load and improves stability on descents, wet paths, and uneven ground." }),
    p({ id: "mountaineering-petzl-actik", name: "Petzl Actik Core 头灯", nameEn: "Petzl Actik Core headlamp", brand: "Petzl", gearCategory: "headlamp", activity: ["登山"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 599, unit: "个", reason: "清晨出发、晚归或雾天都需要可靠照明。", reasonEn: "Reliable lighting for early starts, late returns, fog, and emergency delays." }),
    p({ id: "mountaineering-patagonia-nano-puff", name: "Patagonia Nano Puff 保暖夹克", nameEn: "Patagonia Nano Puff insulated jacket", brand: "Patagonia", gearCategory: "insulation", activity: ["登山"], weather: ["寒冷"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "medium", price: 1499, unit: "件", reason: "静止等待、山顶风口和返程阶段能提供关键保暖。", reasonEn: "Adds key warmth during stops, exposed ridges, and the colder return leg." }),
  ],
  徒步: [
    p({ id: "hiking-merrell-moab-3", name: "Merrell Moab 3 徒步鞋", nameEn: "Merrell Moab 3 hiking shoes", brand: "Merrell", gearCategory: "shoes", activity: ["徒步"], weather: ["晴天", "通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 699, unit: "双", reason: "舒适耐穿，适合日常徒步和轻装路线。", reasonEn: "A comfortable and durable shoe for day hikes and light trekking routes." }),
    p({ id: "hiking-salomon-x-ultra-4", name: "Salomon X Ultra 4 徒步鞋", nameEn: "Salomon X Ultra 4 hiking shoes", brand: "Salomon", gearCategory: "shoes", activity: ["徒步"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1199, unit: "双", reason: "抓地和支撑更强，适合全天行走和复杂路面。", reasonEn: "Better grip and support for all-day hiking and mixed terrain." }),
    p({ id: "hiking-osprey-hikelite-26", name: "Osprey Hikelite 26 徒步背包", nameEn: "Osprey Hikelite 26 backpack", brand: "Osprey", gearCategory: "backpack", activity: ["徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 799, unit: "个", reason: "背负透气稳定，容量适合一日徒步的水、食物和外套。", reasonEn: "A ventilated daypack sized for water, food, layers, and small essentials." }),
    p({ id: "hiking-camelbak-crux-2l", name: "CamelBak Crux 2L 水袋", nameEn: "CamelBak Crux 2L reservoir", brand: "CamelBak", gearCategory: "water", activity: ["徒步"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 299, unit: "个", reason: "边走边补水，炎热或长距离徒步更容易保持节奏。", reasonEn: "Supports steady hydration while moving, especially in heat or longer routes." }),
    p({ id: "hiking-smartwool-base", name: "Smartwool 速干美利奴底层", nameEn: "Smartwool Merino base layer", brand: "Smartwool", gearCategory: "baseLayer", activity: ["徒步"], weather: ["雨天", "寒冷", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 599, unit: "件", reason: "排汗和控温更稳定，适合天气变化或出汗较多的路线。", reasonEn: "Manages sweat and temperature better across changing conditions." }),
    p({ id: "hiking-black-diamond-distance-poles", name: "Black Diamond Distance 登山杖", nameEn: "Black Diamond Distance trekking poles", brand: "Black Diamond", gearCategory: "pole", activity: ["徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 799, unit: "副", reason: "轻量折叠结构适合长距离徒步和频繁收纳。", reasonEn: "Light folding poles for longer routes and frequent stowing." }),
    p({ id: "hiking-marmot-precip", name: "Marmot PreCip 轻量雨衣", nameEn: "Marmot PreCip rain jacket", brand: "Marmot", gearCategory: "raincoat", activity: ["徒步"], weather: ["雨天"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 699, unit: "件", reason: "轻量防雨层适合突发降雨，也不会过度占用背包空间。", reasonEn: "A packable rain layer for sudden showers without taking much pack space." }),
    p({ id: "hiking-clif-bar", name: "Clif Bar 能量棒", nameEn: "Clif Bar energy bars", brand: "Clif Bar", gearCategory: "food", activity: ["徒步"], weather: ["通用"], level: "basic", priority: "important", gearType: "consumable", budgetWeight: "low", price: 18, unit: "份", reason: "长时间行走时快速补充能量，避免后半程状态下滑。", reasonEn: "Quick calories help maintain energy during longer walking days." }),
  ],
  露营: [
    p({ id: "camping-coleman-sundome", name: "Coleman Sundome 双人帐篷", nameEn: "Coleman Sundome 2-person tent", brand: "Coleman", gearCategory: "tent", activity: ["露营"], weather: ["晴天", "通用"], level: "basic", priority: "core", gearType: "shared", budgetWeight: "high", price: 699, unit: "顶", reason: "入门露营性价比高，适合晴天和常规营地。", reasonEn: "A good-value starter tent for fair-weather camping and established campsites." }),
    p({ id: "camping-naturehike-cloud-up", name: "Naturehike Cloud Up 帐篷", nameEn: "Naturehike Cloud Up tent", brand: "Naturehike", gearCategory: "tent", activity: ["露营"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 1099, unit: "顶", reason: "重量、空间和防雨能力均衡，适合周末露营。", reasonEn: "A balanced tent for weekend camping with reasonable weight, space, and rain protection." }),
    p({ id: "camping-msr-hubba-hubba", name: "MSR Hubba Hubba 帐篷", nameEn: "MSR Hubba Hubba tent", brand: "MSR", gearCategory: "tent", activity: ["露营"], weather: ["雨天", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 3999, unit: "顶", reason: "高预算露营可优先升级帐篷结构、抗风和耐用性。", reasonEn: "A premium shelter with stronger structure, durability, and weather confidence." }),
    p({ id: "camping-sea-to-summit-spark", name: "Sea to Summit Spark 睡袋", nameEn: "Sea to Summit Spark sleeping bag", brand: "Sea to Summit", gearCategory: "sleepingBag", activity: ["露营"], weather: ["寒冷", "通用"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2299, unit: "个", reason: "保暖和压缩体积表现好，适合冷夜或轻量露营。", reasonEn: "Warm, packable, and efficient for cold nights or lighter camping setups." }),
    p({ id: "camping-thermarest-neoair", name: "Therm-a-Rest NeoAir 睡垫", nameEn: "Therm-a-Rest NeoAir sleeping pad", brand: "Therm-a-Rest", gearCategory: "mat", activity: ["露营"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 1299, unit: "张", reason: "隔绝地面冷气并提升睡眠恢复质量。", reasonEn: "Improves insulation from the ground and helps recovery overnight." }),
    p({ id: "camping-jetboil-flash", name: "Jetboil Flash 高效炉具", nameEn: "Jetboil Flash cooking system", brand: "Jetboil", gearCategory: "stove", activity: ["露营"], weather: ["寒冷", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 999, unit: "套", reason: "烧水效率高，冷天和多人热饮场景更有价值。", reasonEn: "Fast boiling and efficient fuel use make it valuable in cold or group camp settings." }),
    p({ id: "camping-goal-zero-lighthouse", name: "Goal Zero Lighthouse 营地灯", nameEn: "Goal Zero Lighthouse camp lantern", brand: "Goal Zero", gearCategory: "lighting", activity: ["露营"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 499, unit: "个", reason: "稳定营地照明能让夜间取物、做饭和移动更安全。", reasonEn: "Stable camp lighting makes cooking, moving, and finding gear safer at night." }),
    p({ id: "camping-helinox-chair-one", name: "Helinox Chair One 露营椅", nameEn: "Helinox Chair One camping chair", brand: "Helinox", gearCategory: "chair", activity: ["露营"], weather: ["通用"], level: "standard", priority: "optional", gearType: "perPerson", budgetWeight: "low", price: 799, unit: "把", reason: "提升营地休息舒适度，但应排在帐篷、睡眠和炉具之后。", reasonEn: "Adds camp comfort, but should come after shelter, sleep, and cooking essentials." }),
  ],
  滑雪: [
    p({ id: "skiing-burton-process", name: "Burton Process 单板", nameEn: "Burton Process snowboard", brand: "Burton", gearCategory: "skiBoard", activity: ["滑雪"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 3299, unit: "副", reason: "适合进阶练习，稳定性和容错性比较均衡。", reasonEn: "A balanced snowboard for progressing riders who need stability and forgiveness." }),
    p({ id: "skiing-burton-custom", name: "Burton Custom 单板", nameEn: "Burton Custom snowboard", brand: "Burton", gearCategory: "skiBoard", activity: ["滑雪"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 5299, unit: "副", reason: "高预算优先升级雪板，提升响应、稳定和成长空间。", reasonEn: "A premium board with stronger response, edge hold, and room to grow." }),
    p({ id: "skiing-union-force", name: "Union Force 固定器", nameEn: "Union Force bindings", brand: "Union", gearCategory: "skiBinding", activity: ["滑雪"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1799, unit: "副", reason: "固定器影响控板和安全释放，不能只看价格。", reasonEn: "Bindings strongly affect control, comfort, and safe power transfer." }),
    p({ id: "skiing-salomon-dialogue", name: "Salomon Dialogue 雪靴", nameEn: "Salomon Dialogue snowboard boots", brand: "Salomon", gearCategory: "skiBoots", activity: ["滑雪"], weather: ["寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1899, unit: "双", reason: "雪靴贴合度直接影响脚感、支撑和控板。", reasonEn: "Boot fit directly shapes comfort, support, and board control." }),
    p({ id: "skiing-burton-ak-jacket", name: "Burton AK 滑雪服", nameEn: "Burton AK ski jacket", brand: "Burton", gearCategory: "skiSuit", activity: ["滑雪"], weather: ["寒冷", "雨天"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 3999, unit: "套", reason: "防风防雪和透气性更强，适合长时间雪场活动。", reasonEn: "High weather protection and breathability for full days on snow." }),
    p({ id: "skiing-smith-io-mag", name: "Smith I/O MAG 雪镜", nameEn: "Smith I/O MAG goggles", brand: "Smith", gearCategory: "goggles", activity: ["滑雪"], weather: ["晴天", "寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 1399, unit: "副", reason: "减少眩光和风雪刺激，提升雪面判断。", reasonEn: "Reduces glare, wind, and snow irritation while improving terrain visibility." }),
    p({ id: "skiing-giro-ledges", name: "Giro Ledge 滑雪头盔", nameEn: "Giro Ledge ski helmet", brand: "Giro", gearCategory: "helmet", activity: ["滑雪"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 699, unit: "个", reason: "头盔是滑雪基础安全装备，应优先配置。", reasonEn: "A ski helmet is a non-negotiable safety layer for falls and collisions." }),
    p({ id: "skiing-hestra-gloves", name: "Hestra 防水滑雪手套", nameEn: "Hestra waterproof ski gloves", brand: "Hestra", gearCategory: "gloves", activity: ["滑雪"], weather: ["寒冷"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 899, unit: "双", reason: "手部保暖和防水会明显影响全天体验。", reasonEn: "Warm waterproof gloves keep hands functional through a full snow day." }),
    p({ id: "skiing-kobayashi-warmers", name: "小林制药暖贴", nameEn: "Kobayashi disposable heat packs", brand: "Kobayashi", gearCategory: "warmPatch", activity: ["滑雪"], weather: ["寒冷"], level: "basic", priority: "optional", gearType: "consumable", budgetWeight: "low", price: 5, unit: "片", reason: "低温等待和休息时提供额外热量。", reasonEn: "Small backup warmth for lift lines, breaks, and low-activity moments." }),
  ],
  钓鱼: [
    p({ id: "fishing-shimano-sienna-combo", name: "Shimano Sienna 纺车轮竿套装", nameEn: "Shimano Sienna spinning combo", brand: "Shimano", gearCategory: "fishingRod", activity: ["钓鱼"], weather: ["通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 499, unit: "根", reason: "入门套装易上手，适合轻量短途钓鱼。", reasonEn: "An approachable starter combo for light, short fishing sessions." }),
    p({ id: "fishing-daiwa-bg", name: "DAIWA BG 海钓竿轮套装", nameEn: "DAIWA BG rod and reel combo", brand: "DAIWA", gearCategory: "fishingRod", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1299, unit: "根", reason: "更好的耐用性和拖拽性能，适合更长时间作钓。", reasonEn: "More durable with better drag performance for longer fishing sessions." }),
    p({ id: "fishing-helinox-chair", name: "Helinox 轻量钓椅", nameEn: "Helinox lightweight fishing chair", brand: "Helinox", gearCategory: "chair", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 799, unit: "把", reason: "长时间等待时保持坐姿稳定，减少疲劳。", reasonEn: "Keeps waiting time more comfortable and reduces fatigue during long sessions." }),
    p({ id: "fishing-berkley-tackle", name: "Berkley 基础钓组盒", nameEn: "Berkley tackle box kit", brand: "Berkley", gearCategory: "fishingLine", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 199, unit: "套", reason: "鱼线、钩组和小配件集中收纳，避免现场缺件。", reasonEn: "Keeps line, hooks, and small tackle organized so small missing parts do not stop the day." }),
    p({ id: "fishing-columbia-booney", name: "Columbia Bora Bora 防晒帽", nameEn: "Columbia Bora Bora booney hat", brand: "Columbia", gearCategory: "sunHat", activity: ["钓鱼"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "顶", reason: "水面反光强，头面部防晒比普通遮阳更重要。", reasonEn: "Water glare makes face and neck sun protection more important than usual." }),
    p({ id: "fishing-yeti-roadie", name: "YETI Roadie 冷藏箱", nameEn: "YETI Roadie cooler", brand: "YETI", gearCategory: "cooler", activity: ["钓鱼"], weather: ["炎热", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "medium", price: 2499, unit: "个", reason: "高温下保存饮品、饵料或渔获更稳定。", reasonEn: "Keeps drinks, bait, and catch stable in hot weather." }),
  ],
  自驾游: [
    p({ id: "roadtrip-ecoflow-river-2", name: "EcoFlow RIVER 2 户外电源", nameEn: "EcoFlow RIVER 2 portable power station", brand: "EcoFlow", gearCategory: "power", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 1999, unit: "个", reason: "为手机、灯具和小电器供电，是自驾露营的核心装备。", reasonEn: "Powers phones, lights, and small devices during car camping and road trips." }),
    p({ id: "roadtrip-jackery-1000", name: "Jackery Explorer 1000 户外电源", nameEn: "Jackery Explorer 1000 power station", brand: "Jackery", gearCategory: "power", activity: ["自驾游"], weather: ["通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 5999, unit: "个", reason: "更高容量适合多人、长途和多设备用电。", reasonEn: "Higher capacity for groups, longer drives, and multiple devices." }),
    p({ id: "roadtrip-dometic-cfx3", name: "Dometic CFX3 车载冰箱", nameEn: "Dometic CFX3 portable fridge", brand: "Dometic", gearCategory: "cooler", activity: ["自驾游"], weather: ["炎热", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 4999, unit: "个", reason: "长途保存食材和饮品更可靠，炎热天气价值更高。", reasonEn: "Reliable food and drink storage for long drives, especially in hot weather." }),
    p({ id: "roadtrip-lifeline-first-aid", name: "Lifeline 车载急救包", nameEn: "Lifeline vehicle first aid kit", brand: "Lifeline", gearCategory: "firstAid", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 199, unit: "个", reason: "处理轻微擦伤、扭伤和营地小意外。", reasonEn: "Covers minor cuts, sprains, and small camp or roadside incidents." }),
    p({ id: "roadtrip-kingcamp-table-chair", name: "KingCamp 折叠桌椅套装", nameEn: "KingCamp folding table and chair set", brand: "KingCamp", gearCategory: "tableChair", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 899, unit: "套", reason: "提升停车休息、户外用餐和营地整理效率。", reasonEn: "Improves roadside meals, rest stops, and camp organization." }),
    p({ id: "roadtrip-viair-compressor", name: "VIAIR 车载充气泵", nameEn: "VIAIR portable air compressor", brand: "VIAIR", gearCategory: "vehicleTool", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 699, unit: "个", reason: "胎压不足时可快速补气，降低长途行车风险。", reasonEn: "Restores tire pressure quickly and reduces road-trip risk." }),
    p({ id: "roadtrip-coleman-camp-chair", name: "Coleman 露营椅", nameEn: "Coleman camping chair", brand: "Coleman", gearCategory: "chair", activity: ["自驾游"], weather: ["通用"], level: "basic", priority: "optional", gearType: "perPerson", budgetWeight: "low", price: 199, unit: "把", reason: "低成本提升休息舒适度，适合预算有余时补充。", reasonEn: "A low-cost comfort upgrade for roadside stops and camp breaks." }),
  ],
  骑行: [
    p({ id: "cycling-giro-register", name: "Giro Register 骑行头盔", nameEn: "Giro Register cycling helmet", brand: "Giro", gearCategory: "helmet", activity: ["骑行"], weather: ["通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 399, unit: "个", reason: "头盔是骑行第一优先级安全装备。", reasonEn: "A helmet is the first safety priority for cycling." }),
    p({ id: "cycling-specialized-align", name: "Specialized Align II 头盔", nameEn: "Specialized Align II helmet", brand: "Specialized", gearCategory: "helmet", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 599, unit: "个", reason: "兼顾防护、通风和佩戴稳定性。", reasonEn: "Balances protection, ventilation, and stable fit." }),
    p({ id: "cycling-giro-jag", name: "Giro Jag 骑行手套", nameEn: "Giro Jag cycling gloves", brand: "Giro", gearCategory: "gloves", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 169, unit: "双", reason: "提升握把舒适度，并在摔车时保护手掌。", reasonEn: "Improves grip comfort and protects palms during a fall." }),
    p({ id: "cycling-cateye-ampp", name: "CatEye AMPP 车灯", nameEn: "CatEye AMPP front light", brand: "CatEye", gearCategory: "lighting", activity: ["骑行"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 299, unit: "个", reason: "夜骑、隧道和阴雨天气都需要提高可见度。", reasonEn: "Improves visibility for night riding, tunnels, and rainy conditions." }),
    p({ id: "cycling-topeak-mini-9", name: "Topeak Mini 9 维修工具", nameEn: "Topeak Mini 9 multi-tool", brand: "Topeak", gearCategory: "repair", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 159, unit: "套", reason: "处理中途小故障，避免扎胎或松动导致行程中断。", reasonEn: "Handles small mechanical issues before they end the ride." }),
    p({ id: "cycling-elite-fly-bottle", name: "Elite Fly 骑行水壶", nameEn: "Elite Fly cycling bottle", brand: "Elite", gearCategory: "water", activity: ["骑行"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 79, unit: "个", reason: "骑行中快速补水，炎热天气尤其必要。", reasonEn: "Enables quick hydration while riding, especially in hot weather." }),
    p({ id: "cycling-nuun-electrolyte", name: "Nuun 电解质片", nameEn: "Nuun electrolyte tablets", brand: "Nuun", gearCategory: "electrolyte", activity: ["骑行"], weather: ["炎热"], level: "basic", priority: "important", gearType: "consumable", budgetWeight: "low", price: 8, unit: "片", reason: "高温和长距离骑行时补充盐分，降低后半程疲劳。", reasonEn: "Replaces salts during hot or longer rides to reduce late-ride fatigue." }),
  ],
  海边旅行: [
    p({ id: "beach-banana-boat-sunscreen", name: "Banana Boat SPF50 防晒霜", nameEn: "Banana Boat SPF50 sunscreen", brand: "Banana Boat", gearCategory: "sunscreen", activity: ["海边旅行"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "consumable", budgetWeight: "low", price: 99, unit: "瓶", reason: "海边紫外线和反光强，防晒应优先准备。", reasonEn: "Strong UV and reflected sunlight make sunscreen a core beach item." }),
    p({ id: "beach-columbia-bora-bora", name: "Columbia Bora Bora 遮阳帽", nameEn: "Columbia Bora Bora sun hat", brand: "Columbia", gearCategory: "sunHat", activity: ["海边旅行"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "顶", reason: "减少头面部暴晒和中暑风险。", reasonEn: "Reduces sun exposure on the face and neck and helps manage heat." }),
    p({ id: "beach-sea-to-summit-drybag", name: "Sea to Summit 防水袋", nameEn: "Sea to Summit dry bag", brand: "Sea to Summit", gearCategory: "dryBag", activity: ["海边旅行"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 169, unit: "个", reason: "保护手机、证件和电子设备，避免进水。", reasonEn: "Protects phones, documents, and electronics from water and sand." }),
    p({ id: "beach-decathlon-mat", name: "Decathlon 沙滩垫", nameEn: "Decathlon beach mat", brand: "Decathlon", gearCategory: "beachMat", activity: ["海边旅行"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "low", price: 129, unit: "张", reason: "提供干净休息区域，减少沙土附着。", reasonEn: "Creates a cleaner rest area and keeps sand away from gear." }),
    p({ id: "beach-naturehike-towel", name: "Naturehike 速干毛巾", nameEn: "Naturehike quick-dry towel", brand: "Naturehike", gearCategory: "towel", activity: ["海边旅行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 79, unit: "条", reason: "涉水或游泳后快速擦干，便于重复使用。", reasonEn: "Dries quickly after swimming or rain and packs smaller than cotton towels." }),
    p({ id: "beach-oakley-holbrook", name: "Oakley Holbrook 偏光太阳镜", nameEn: "Oakley Holbrook polarized sunglasses", brand: "Oakley", gearCategory: "sunglasses", activity: ["海边旅行"], weather: ["晴天"], level: "standard", priority: "optional", gearType: "perPerson", budgetWeight: "low", price: 999, unit: "副", reason: "减少水面眩光，保护眼睛但不应挤占基础防晒预算。", reasonEn: "Cuts water glare and protects eyes, but should not replace core sun protection." }),
    p({ id: "beach-nuun-electrolyte", name: "Nuun 电解质片", nameEn: "Nuun electrolyte tablets", brand: "Nuun", gearCategory: "electrolyte", activity: ["海边旅行"], weather: ["炎热"], level: "basic", priority: "important", gearType: "consumable", budgetWeight: "low", price: 8, unit: "片", reason: "高温出汗后补充电解质，帮助维持状态。", reasonEn: "Helps replace salts after sweating in hot beach conditions." }),
  ],
  越野跑: [
    p({ id: "trailrun-salomon-speedcross", name: "Salomon Speedcross 越野跑鞋", nameEn: "Salomon Speedcross trail running shoes", brand: "Salomon", gearCategory: "shoes", activity: ["越野跑"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1099, unit: "双", reason: "深齿外底适合泥地、碎石和林道快速移动。", reasonEn: "Aggressive traction for mud, loose gravel, and fast forest trails." }),
    p({ id: "trailrun-salomon-vest", name: "Salomon ADV Skin 跑步背心", nameEn: "Salomon ADV Skin running vest", brand: "Salomon", gearCategory: "backpack", activity: ["越野跑"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 999, unit: "个", reason: "贴身携带水、能量胶、薄外套和急救小件。", reasonEn: "Carries water, fuel, a light shell, and small emergency items without bouncing." }),
    p({ id: "trailrun-petzl-bindi", name: "Petzl Bindi 轻量头灯", nameEn: "Petzl Bindi headlamp", brand: "Petzl", gearCategory: "headlamp", activity: ["越野跑"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 399, unit: "个", reason: "清晨、傍晚和林道阴影中保持可见度。", reasonEn: "Keeps visibility in early starts, dusk finishes, and shaded trails." }),
    p({ id: "trailrun-nuun-tabs", name: "Nuun 越野电解质片", nameEn: "Nuun trail electrolytes", brand: "Nuun", gearCategory: "electrolyte", activity: ["越野跑"], weather: ["炎热"], level: "basic", priority: "important", gearType: "consumable", budgetWeight: "low", price: 8, unit: "片", reason: "高强度出汗时补充盐分，降低抽筋和后程掉速。", reasonEn: "Replaces salts during hard efforts to reduce cramps and late-run fade." }),
  ],
  重装徒步: [
    p({ id: "backpacking-osprey-atmos", name: "Osprey Atmos 65 重装背包", nameEn: "Osprey Atmos 65 backpack", brand: "Osprey", gearCategory: "backpack", activity: ["重装徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2199, unit: "个", reason: "65L 容量和背负系统适合多日负重。", reasonEn: "A 65L load-hauling pack for multi-day backpacking." }),
    p({ id: "backpacking-salomon-quest", name: "Salomon Quest 4 重装徒步鞋", nameEn: "Salomon Quest 4 backpacking boots", brand: "Salomon", gearCategory: "shoes", activity: ["重装徒步"], weather: ["雨天", "寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1399, unit: "双", reason: "负重时需要更强脚踝支撑和抓地。", reasonEn: "Supportive boots add ankle stability and grip under load." }),
    p({ id: "backpacking-msr-tent", name: "MSR Hubba Hubba 轻量帐篷", nameEn: "MSR Hubba Hubba backpacking tent", brand: "MSR", gearCategory: "tent", activity: ["重装徒步"], weather: ["雨天", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 3999, unit: "顶", reason: "多日徒步需要可靠庇护和合理重量。", reasonEn: "Reliable shelter with backpacking-friendly weight for multi-day routes." }),
    p({ id: "backpacking-sea-summit-spark", name: "Sea to Summit Spark 睡袋", nameEn: "Sea to Summit Spark sleeping bag", brand: "Sea to Summit", gearCategory: "sleepingBag", activity: ["重装徒步"], weather: ["寒冷", "通用"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2299, unit: "个", reason: "压缩体积和保暖效率影响每日恢复。", reasonEn: "Warmth-to-weight and packability shape recovery on the trail." }),
    p({ id: "backpacking-thermarest-neoair", name: "Therm-a-Rest NeoAir 睡垫", nameEn: "Therm-a-Rest NeoAir sleeping pad", brand: "Therm-a-Rest", gearCategory: "mat", activity: ["重装徒步"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 1299, unit: "张", reason: "隔绝地面冷气，提升睡眠恢复质量。", reasonEn: "Ground insulation improves sleep and recovery." }),
  ],
  攀岩: [
    p({ id: "climbing-la-sportiva-tarantulace", name: "La Sportiva Tarantulace 攀岩鞋", nameEn: "La Sportiva Tarantulace climbing shoes", brand: "La Sportiva", gearCategory: "shoes", activity: ["攀岩"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 899, unit: "双", reason: "贴合的攀岩鞋直接影响踩点和发力。", reasonEn: "Climbing shoes directly affect edging, grip, and footwork." }),
    p({ id: "climbing-black-diamond-helmet", name: "Black Diamond Half Dome 头盔", nameEn: "Black Diamond Half Dome climbing helmet", brand: "Black Diamond", gearCategory: "helmet", activity: ["攀岩"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 499, unit: "个", reason: "防护落石、磕碰和保护站意外。", reasonEn: "Protects from rockfall, bumps, and belay-area accidents." }),
    p({ id: "climbing-petzl-headlamp", name: "Petzl Actik 攀岩头灯", nameEn: "Petzl Actik climbing headlamp", brand: "Petzl", gearCategory: "headlamp", activity: ["攀岩"], weather: ["通用"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "medium", price: 599, unit: "个", reason: "长路线、下降或晚归需要可靠照明。", reasonEn: "Useful for long routes, descents, and late returns." }),
    p({ id: "climbing-metolius-gloves", name: "Metolius 保护手套", nameEn: "Metolius belay gloves", brand: "Metolius", gearCategory: "gloves", activity: ["攀岩"], weather: ["通用"], level: "basic", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "双", reason: "保护放绳和下降时的手部。", reasonEn: "Protects hands while belaying and rappelling." }),
  ],
  皮划艇: [
    p({ id: "kayak-nrs-pfd", name: "NRS 皮划艇救生衣", nameEn: "NRS kayak PFD", brand: "NRS", gearCategory: "helmet", activity: ["皮划艇"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 899, unit: "件", reason: "水上活动必须优先保证浮力防护。", reasonEn: "A PFD is the first safety layer for paddling." }),
    p({ id: "kayak-sea-summit-drybag", name: "Sea to Summit 防水袋", nameEn: "Sea to Summit dry bag", brand: "Sea to Summit", gearCategory: "dryBag", activity: ["皮划艇"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 169, unit: "个", reason: "保护手机、衣物和补给不被打湿。", reasonEn: "Keeps phone, clothing, and supplies dry." }),
    p({ id: "kayak-columbia-sun-hat", name: "Columbia 水上遮阳帽", nameEn: "Columbia paddling sun hat", brand: "Columbia", gearCategory: "sunHat", activity: ["皮划艇"], weather: ["晴天", "炎热"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "顶", reason: "水面反光会增加头面部暴晒。", reasonEn: "Water glare increases sun exposure on the face and neck." }),
    p({ id: "kayak-oakley-sunglasses", name: "Oakley 偏光太阳镜", nameEn: "Oakley polarized sunglasses", brand: "Oakley", gearCategory: "sunglasses", activity: ["皮划艇"], weather: ["晴天"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 999, unit: "副", reason: "减少水面眩光，帮助观察水流和障碍。", reasonEn: "Cuts glare and helps read water and obstacles." }),
  ],
  单板滑雪: [
    p({ id: "snowboard-burton-custom", name: "Burton Custom 单板", nameEn: "Burton Custom snowboard", brand: "Burton", gearCategory: "skiBoard", activity: ["单板滑雪"], weather: ["寒冷", "通用"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 5299, unit: "副", reason: "响应和稳定性适合进阶单板滑雪。", reasonEn: "A responsive, stable snowboard for progressing riders." }),
    p({ id: "snowboard-union-force", name: "Union Force 固定器", nameEn: "Union Force snowboard bindings", brand: "Union", gearCategory: "skiBinding", activity: ["单板滑雪"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1799, unit: "副", reason: "固定器影响控板、传力和舒适度。", reasonEn: "Bindings shape board control, power transfer, and comfort." }),
    p({ id: "snowboard-salomon-dialogue", name: "Salomon Dialogue 单板雪靴", nameEn: "Salomon Dialogue snowboard boots", brand: "Salomon", gearCategory: "skiBoots", activity: ["单板滑雪"], weather: ["寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1899, unit: "双", reason: "雪靴贴合度决定脚感和控板。", reasonEn: "Boot fit shapes comfort, support, and board control." }),
    p({ id: "snowboard-giro-ledges", name: "Giro Ledge 单板头盔", nameEn: "Giro Ledge snowboard helmet", brand: "Giro", gearCategory: "helmet", activity: ["单板滑雪"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 699, unit: "个", reason: "摔倒和碰撞风险下头盔不可省。", reasonEn: "A helmet is essential for falls and collisions." }),
    p({ id: "snowboard-smith-goggles", name: "Smith I/O MAG 雪镜", nameEn: "Smith I/O MAG snowboard goggles", brand: "Smith", gearCategory: "goggles", activity: ["单板滑雪"], weather: ["晴天", "寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 1399, unit: "副", reason: "提升雪面判断并减少风雪刺激。", reasonEn: "Improves terrain read and protects eyes from wind and snow." }),
  ],
  沙漠徒步: [
    p({ id: "desert-merrell-moab", name: "Merrell Moab 透气徒步鞋", nameEn: "Merrell Moab breathable hiking shoes", brand: "Merrell", gearCategory: "shoes", activity: ["沙漠徒步"], weather: ["炎热", "晴天"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 699, unit: "双", reason: "高温砂石环境需要透气、耐磨和稳定支撑。", reasonEn: "Hot sandy terrain needs breathable, durable support." }),
    p({ id: "desert-osprey-hikelite", name: "Osprey Hikelite 透气背包", nameEn: "Osprey Hikelite desert daypack", brand: "Osprey", gearCategory: "backpack", activity: ["沙漠徒步"], weather: ["炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 799, unit: "个", reason: "携带大量饮水、防晒和应急用品。", reasonEn: "Carries extra water, sun protection, and emergency supplies." }),
    p({ id: "desert-columbia-sunhat", name: "Columbia 沙漠遮阳帽", nameEn: "Columbia desert sun hat", brand: "Columbia", gearCategory: "sunHat", activity: ["沙漠徒步"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "顶", reason: "降低头面部暴晒和中暑风险。", reasonEn: "Reduces sun exposure and heat stress." }),
    p({ id: "desert-camelbak-reservoir", name: "CamelBak 3L 水袋", nameEn: "CamelBak 3L hydration reservoir", brand: "CamelBak", gearCategory: "water", activity: ["沙漠徒步"], weather: ["炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 399, unit: "个", reason: "沙漠路线补水容量要比普通徒步更充足。", reasonEn: "Desert routes require more hydration capacity than normal hikes." }),
  ],
  冬季露营: [
    p({ id: "winter-msr-access", name: "MSR Access 冬季帐篷", nameEn: "MSR Access winter tent", brand: "MSR", gearCategory: "tent", activity: ["冬季露营"], weather: ["寒冷", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 4999, unit: "顶", reason: "冬季营地需要更强抗风、抗雪和结构稳定性。", reasonEn: "Winter camps need stronger wind, snow, and structure performance." }),
    p({ id: "winter-sea-summit-spark", name: "Sea to Summit 冬季睡袋", nameEn: "Sea to Summit winter sleeping bag", brand: "Sea to Summit", gearCategory: "sleepingBag", activity: ["冬季露营"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2999, unit: "个", reason: "夜间低温下睡袋温标是安全核心。", reasonEn: "Sleep-system warmth rating is central to winter safety." }),
    p({ id: "winter-thermarest-xtherm", name: "Therm-a-Rest XTherm 睡垫", nameEn: "Therm-a-Rest XTherm sleeping pad", brand: "Therm-a-Rest", gearCategory: "mat", activity: ["冬季露营"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1699, unit: "张", reason: "高 R 值睡垫能阻断地面冷量。", reasonEn: "A high R-value pad blocks ground cold." }),
    p({ id: "winter-jetboil-stove", name: "Jetboil Flash 冬季炉具", nameEn: "Jetboil Flash winter stove", brand: "Jetboil", gearCategory: "stove", activity: ["冬季露营"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 999, unit: "套", reason: "冷天热饮、融雪和热食依赖稳定炉具。", reasonEn: "Hot drinks, snow melting, and meals depend on a reliable stove." }),
  ],
  海边露营: [
    p({ id: "beachcamp-coleman-tent", name: "Coleman 海边露营帐篷", nameEn: "Coleman beach camping tent", brand: "Coleman", gearCategory: "tent", activity: ["海边露营"], weather: ["晴天", "通用"], level: "basic", priority: "core", gearType: "shared", budgetWeight: "high", price: 699, unit: "顶", reason: "提供遮蔽、隐私和基础防风空间。", reasonEn: "Provides shelter, privacy, and basic wind protection." }),
    p({ id: "beachcamp-sea-summit-drybag", name: "Sea to Summit 大号防水袋", nameEn: "Sea to Summit large dry bag", brand: "Sea to Summit", gearCategory: "dryBag", activity: ["海边露营"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 229, unit: "个", reason: "海边潮气和沙子会影响衣物、电子设备和睡眠装备。", reasonEn: "Moisture and sand can damage clothing, electronics, and sleep gear." }),
    p({ id: "beachcamp-columbia-sunhat", name: "Columbia 海边遮阳帽", nameEn: "Columbia beach sun hat", brand: "Columbia", gearCategory: "sunHat", activity: ["海边露营"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 249, unit: "顶", reason: "长时间海边活动需要稳定遮阳。", reasonEn: "Long beach days need reliable shade for the head and neck." }),
    p({ id: "beachcamp-yeti-cooler", name: "YETI Roadie 海边冷藏箱", nameEn: "YETI Roadie beach cooler", brand: "YETI", gearCategory: "cooler", activity: ["海边露营"], weather: ["炎热", "通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "medium", price: 2499, unit: "个", reason: "高温下稳定保存饮品和食物。", reasonEn: "Keeps drinks and food stable in beach heat." }),
    p({ id: "beachcamp-naturehike-towel", name: "Naturehike 速干毛巾", nameEn: "Naturehike quick-dry towel", brand: "Naturehike", gearCategory: "towel", activity: ["海边露营"], weather: ["通用"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 79, unit: "条", reason: "涉水后快速恢复干爽，减少夜间潮湿感。", reasonEn: "Dries quickly after swimming and reduces dampness at camp." }),
  ],
};
