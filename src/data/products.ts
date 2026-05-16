export type Activity = "登山" | "徒步" | "露营" | "滑雪" | "钓鱼" | "自驾游" | "骑行" | "海边旅行";
export type ProductWeather = "晴天" | "雨天" | "寒冷" | "炎热" | "通用";
export type ProductLevel = "basic" | "standard" | "premium";
export type ProductPriority = "core" | "important" | "optional";
export type GearType = "perPerson" | "shared" | "consumable";
export type BudgetWeight = "high" | "medium" | "low";
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
  brand: string;
  category: string;
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
  buyUrl: string;
  reason: string;
};

export type Product = ProductTemplate & {
  icon: string;
  productUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export const activityOptions: Activity[] = ["登山", "徒步", "露营", "滑雪", "钓鱼", "自驾游", "骑行", "海边旅行"];

export const productUrl = "https://example.com";

const imageByCategory: Partial<Record<GearCategory, string>> = {
  tent: "/products/tent.jpg",
  skiBoard: "/products/ski-board.jpg",
  skiBinding: "/products/ski-board.jpg",
  skiBoots: "/products/ski-board.jpg",
  skiSuit: "/products/ski-board.jpg",
  goggles: "/products/ski-board.jpg",
  shoes: "/products/hiking-shoes.jpg",
  shellJacket: "/products/jacket.jpg",
  raincoat: "/products/jacket.jpg",
  insulation: "/products/jacket.jpg",
  baseLayer: "/products/jacket.jpg",
  headlamp: "/products/headlamp.jpg",
  lighting: "/products/headlamp.jpg",
  fishingRod: "/products/fishing-rod.jpg",
  fishingLine: "/products/fishing-rod.jpg",
  chair: "/products/camping-chair.jpg",
  tableChair: "/products/camping-chair.jpg",
};

function makeBuyUrl(id: string, brand: string, name: string) {
  return `https://search.jd.com/Search?keyword=${encodeURIComponent(`${brand} ${name}`)}&enc=utf-8&outdoorId=${encodeURIComponent(id)}`;
}

function p(product: Omit<ProductTemplate, "buyUrl" | "image"> & { image?: string }) {
  return {
    ...product,
    image: product.image ?? imageByCategory[product.gearCategory] ?? "/products/jacket.jpg",
    buyUrl: makeBuyUrl(product.id, product.brand, product.name),
  };
}

export const productCatalog: Record<Activity, ProductTemplate[]> = {
  登山: [
    p({ id: "mountain-shoe-basic", name: "入门防滑登山鞋", brand: "Decathlon", category: "登山鞋", gearCategory: "shoes", activity: ["登山"], weather: ["通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 399, unit: "双", reason: "登山鞋优先保证抓地、防滑和脚踝支撑，是山地安全的核心投入。" }),
    p({ id: "mountain-shoe-standard", name: "Salomon 中帮登山鞋", brand: "Salomon", category: "登山鞋", gearCategory: "shoes", activity: ["登山"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 999, unit: "双", reason: "中帮结构和防水鞋面更适合碎石、泥地和长时间上下坡。" }),
    p({ id: "mountain-shoe-premium", name: "La Sportiva 专业登山鞋", brand: "La Sportiva", category: "登山鞋", gearCategory: "shoes", activity: ["登山"], weather: ["雨天", "寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1699, unit: "双", reason: "高预算优先升级鞋底、支撑和防护，复杂路面下更稳定。" }),
    p({ id: "shell-basic", name: "入门三合一冲锋衣", brand: "Decathlon", category: "冲锋衣", gearCategory: "shellJacket", activity: ["登山"], weather: ["雨天", "寒冷"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 499, unit: "件", reason: "应对山地风雨和温差，外层防护是登山核心装备。" }),
    p({ id: "shell-standard", name: "Kailas 防水冲锋衣", brand: "Kailas", category: "冲锋衣", gearCategory: "shellJacket", activity: ["登山"], weather: ["雨天"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 999, unit: "件", reason: "更好的防风防雨性能，适合多变天气下的登山行程。" }),
    p({ id: "shell-premium", name: "Arc'teryx Beta 冲锋衣", brand: "Arc'teryx", category: "冲锋衣", gearCategory: "shellJacket", activity: ["登山"], weather: ["雨天", "寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2999, unit: "件", reason: "预算充足时优先升级外层防护，恶劣天气下安全余量更高。" }),
    p({ id: "mountain-pack-standard", name: "Osprey 36L 登山包", brand: "Osprey", category: "登山包", gearCategory: "backpack", activity: ["登山"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 899, unit: "个", reason: "稳定背负系统能承载衣物、补给和应急装备，减少肩背疲劳。" }),
    p({ id: "mountain-pole-standard", name: "Black Diamond 登山杖", brand: "Black Diamond", category: "登山杖", gearCategory: "pole", activity: ["登山"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 399, unit: "副", reason: "上下坡减轻膝盖压力，并提升湿滑或碎石路面的稳定性。" }),
    p({ id: "headlamp-standard", name: "Petzl 头灯", brand: "Petzl", category: "头灯", gearCategory: "headlamp", activity: ["登山"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 269, unit: "个", reason: "清晨出发、晚归或雾天都需要可靠照明。" }),
    p({ id: "mountain-insulation", name: "抓绒保暖层", brand: "Naturehike", category: "保暖层", gearCategory: "insulation", activity: ["登山"], weather: ["寒冷"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "medium", price: 239, unit: "件", reason: "寒冷天气加强中层保暖，降低静止等待时的失温风险。" }),
  ],
  徒步: [
    p({ id: "hike-shoe-basic", name: "轻量徒步鞋", brand: "Decathlon", category: "徒步鞋", gearCategory: "shoes", activity: ["徒步"], weather: ["晴天", "通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 329, unit: "双", reason: "徒步鞋减少脚部疲劳，并提升复杂路面的稳定性。" }),
    p({ id: "hike-shoe-standard", name: "Salomon X Ultra 徒步鞋", brand: "Salomon", category: "徒步鞋", gearCategory: "shoes", activity: ["徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 899, unit: "双", reason: "更好的抓地和缓震，适合一整天连续行走。" }),
    p({ id: "hike-shoe-rain", name: "防水徒步鞋", brand: "Columbia", category: "防水徒步鞋", gearCategory: "shoes", activity: ["徒步"], weather: ["雨天"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 799, unit: "双", reason: "雨天优先保证脚部干燥和抓地，避免湿滑路面带来的风险。" }),
    p({ id: "hike-pack-standard", name: "Osprey 24L 徒步背包", brand: "Osprey", category: "徒步背包", gearCategory: "backpack", activity: ["徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 599, unit: "个", reason: "稳定携带水、食物和外套，是日间徒步的基础承载装备。" }),
    p({ id: "hydration-bladder", name: "CamelBak 2L 水袋", brand: "CamelBak", category: "水袋", gearCategory: "water", activity: ["徒步"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 199, unit: "个", reason: "行进中不用停下即可补水，炎热天气下更容易保持饮水节奏。" }),
    p({ id: "quickdry-shirt", name: "速干徒步衣", brand: "Decathlon", category: "速干衣", gearCategory: "baseLayer", activity: ["徒步"], weather: ["雨天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 129, unit: "件", reason: "排汗和雨后干燥速度更好，降低汗湿后的不适和失温风险。" }),
    p({ id: "hike-pole-standard", name: "折叠登山杖", brand: "Black Diamond", category: "登山杖", gearCategory: "pole", activity: ["徒步"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 369, unit: "副", reason: "缓解膝盖压力，并提高长距离行走的稳定性。" }),
    p({ id: "hike-raincoat", name: "轻量雨衣", brand: "Naturehike", category: "雨衣", gearCategory: "raincoat", activity: ["徒步"], weather: ["雨天"], level: "basic", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 99, unit: "件", reason: "雨天作为轻量外层备份，保护身体和背包不被长时间淋湿。" }),
  ],
  露营: [
    p({ id: "tent-basic", name: "双人入门帐篷", brand: "Decathlon", category: "帐篷", gearCategory: "tent", activity: ["露营"], weather: ["通用"], level: "basic", priority: "core", gearType: "shared", budgetWeight: "high", price: 499, unit: "顶", reason: "帐篷决定夜间庇护、防雨和空间体验，是露营第一核心装备。" }),
    p({ id: "tent-standard", name: "Naturehike 云尚帐篷", brand: "Naturehike", category: "帐篷", gearCategory: "tent", activity: ["露营"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 999, unit: "顶", reason: "更好的防雨和抗风结构，适合常规周末露营。" }),
    p({ id: "tent-premium", name: "MSR Hubba 专业帐篷", brand: "MSR", category: "帐篷", gearCategory: "tent", activity: ["露营"], weather: ["雨天"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 2999, unit: "顶", reason: "高预算优先升级帐篷，获得更好的抗风、防雨和重量表现。" }),
    p({ id: "sleeping-bag-standard", name: "Coleman 三季睡袋", brand: "Coleman", category: "睡袋", gearCategory: "sleepingBag", activity: ["露营"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 499, unit: "个", reason: "睡袋决定夜间保暖和睡眠恢复质量。" }),
    p({ id: "sleeping-bag-premium", name: "Sea to Summit 羽绒睡袋", brand: "Sea to Summit", category: "睡袋", gearCategory: "sleepingBag", activity: ["露营"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1599, unit: "个", reason: "寒冷或高预算露营时，升级睡袋比升级小配件更有价值。" }),
    p({ id: "camp-mat", name: "充气防潮垫", brand: "Naturehike", category: "防潮垫", gearCategory: "mat", activity: ["露营"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 239, unit: "张", reason: "隔绝地面潮气和冷气，提升睡眠舒适度。" }),
    p({ id: "camp-stove-standard", name: "火枫炉具套装", brand: "Fire-Maple", category: "炉具", gearCategory: "stove", activity: ["露营"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 299, unit: "套", reason: "炉具用于烧水和热食，提高露营补给效率。" }),
    p({ id: "camp-stove-premium", name: "Jetboil 高效炉具系统", brand: "Jetboil", category: "炉具", gearCategory: "stove", activity: ["露营"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 899, unit: "套", reason: "高预算升级炉具效率，低温和多人场景更稳定。" }),
    p({ id: "camp-lantern", name: "Goal Zero 营地灯", brand: "Goal Zero", category: "营地灯", gearCategory: "lighting", activity: ["露营"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 299, unit: "个", reason: "夜间活动、取物和营地移动都需要稳定照明。" }),
  ],
  滑雪: [
    p({ id: "snowboard-basic", name: "入门滑雪板", brand: "Decathlon", category: "滑雪板", gearCategory: "skiBoard", activity: ["滑雪"], weather: ["寒冷", "通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1599, unit: "副", reason: "滑雪板决定基础滑行体验和稳定性，是雪场核心装备。" }),
    p({ id: "snowboard-standard", name: "Burton Process 滑雪板", brand: "Burton", category: "滑雪板", gearCategory: "skiBoard", activity: ["滑雪"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 3299, unit: "副", reason: "更好的响应和容错，适合进阶练习。" }),
    p({ id: "snowboard-premium", name: "Burton Custom 滑雪板", brand: "Burton", category: "滑雪板", gearCategory: "skiBoard", activity: ["滑雪"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 4999, unit: "副", reason: "高预算优先升级滑雪板，提升稳定性、响应和成长空间。" }),
    p({ id: "ski-binding-standard", name: "Burton Mission 固定器", brand: "Burton", category: "固定器", gearCategory: "skiBinding", activity: ["滑雪"], weather: ["寒冷", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1299, unit: "副", reason: "固定器连接雪鞋和雪板，直接影响控制和安全。" }),
    p({ id: "ski-boots-standard", name: "Salomon 雪鞋", brand: "Salomon", category: "雪鞋", gearCategory: "skiBoots", activity: ["滑雪"], weather: ["寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1499, unit: "双", reason: "雪鞋影响支撑、固定和脚部控制，是高价值核心装备。" }),
    p({ id: "ski-boots-premium", name: "Burton Ion 雪鞋", brand: "Burton", category: "雪鞋", gearCategory: "skiBoots", activity: ["滑雪"], weather: ["寒冷"], level: "premium", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 2499, unit: "双", reason: "高预算优先升级雪鞋支撑和包裹，提升控制精度。" }),
    p({ id: "ski-suit-standard", name: "Phenix 滑雪服", brand: "Phenix", category: "滑雪服", gearCategory: "skiSuit", activity: ["滑雪"], weather: ["寒冷", "雨天"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 1599, unit: "套", reason: "防风、防雪并保暖，是雪场核心防护装备。" }),
    p({ id: "ski-goggles-standard", name: "Smith 滑雪镜", brand: "Smith", category: "滑雪镜", gearCategory: "goggles", activity: ["滑雪"], weather: ["晴天", "寒冷"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 599, unit: "副", reason: "保护眼睛并减少雪盲和强光刺激。" }),
    p({ id: "ski-helmet-standard", name: "Giro 滑雪头盔", brand: "Giro", category: "头盔", gearCategory: "helmet", activity: ["滑雪"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 399, unit: "个", reason: "保护头部，是滑雪安全的基础装备。" }),
    p({ id: "ski-gloves", name: "防水滑雪手套", brand: "Decathlon", category: "滑雪手套", gearCategory: "gloves", activity: ["滑雪"], weather: ["寒冷"], level: "standard", priority: "important", gearType: "perPerson", budgetWeight: "low", price: 159, unit: "双", reason: "寒冷天气强化手部保暖和防雪，但不应挤占核心装备预算。" }),
    p({ id: "warm-patch", name: "暖宝宝", brand: "小林制药", category: "暖宝宝", gearCategory: "warmPatch", activity: ["滑雪"], weather: ["寒冷"], level: "basic", priority: "optional", gearType: "consumable", budgetWeight: "low", price: 5, unit: "片", reason: "低温等待时补充热量，按人数和天数准备即可。" }),
  ],
  钓鱼: [
    p({ id: "fishing-rod-basic", name: "入门鱼竿", brand: "Decathlon", category: "鱼竿", gearCategory: "fishingRod", activity: ["钓鱼"], weather: ["通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 199, unit: "根", reason: "鱼竿是钓鱼活动的核心工具，按目标鱼情选择长度和调性。" }),
    p({ id: "fishing-rod-standard", name: "DAIWA 综合鱼竿", brand: "DAIWA", category: "鱼竿", gearCategory: "fishingRod", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 699, unit: "根", reason: "中端鱼竿兼顾手感、抛投和耐用性。" }),
    p({ id: "fishing-chair", name: "折叠钓椅", brand: "Naturehike", category: "钓椅", gearCategory: "chair", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 249, unit: "把", reason: "长时间等待时保持稳定坐姿和舒适度。" }),
    p({ id: "fishing-line-kit", name: "鱼线组套装", brand: "DAIWA", category: "鱼线组", gearCategory: "fishingLine", activity: ["钓鱼"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 129, unit: "套", reason: "鱼线、浮漂和基础钓组决定能否完整作钓。" }),
    p({ id: "fishing-sun-hat", name: "防晒钓鱼帽", brand: "Shimano", category: "防晒帽", gearCategory: "sunHat", activity: ["钓鱼"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 129, unit: "顶", reason: "减少头面部暴晒和水面反光影响。" }),
    p({ id: "fishing-cooler", name: "保温箱", brand: "Coleman", category: "保温箱", gearCategory: "cooler", activity: ["钓鱼"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 499, unit: "个", reason: "保存饮品、饵料或渔获，炎热天气下尤其重要。" }),
  ],
  自驾游: [
    p({ id: "power-basic", name: "EcoFlow 入门户外电源", brand: "EcoFlow", category: "户外电源", gearCategory: "power", activity: ["自驾游"], weather: ["通用"], level: "basic", priority: "core", gearType: "shared", budgetWeight: "high", price: 999, unit: "个", reason: "为手机、灯具、小电器和车载设备补能，是自驾核心装备。" }),
    p({ id: "power-standard", name: "EcoFlow River 户外电源", brand: "EcoFlow", category: "户外电源", gearCategory: "power", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 1999, unit: "个", reason: "容量和输出更均衡，适合多人多设备自驾。" }),
    p({ id: "power-premium", name: "EcoFlow Delta 户外电源", brand: "EcoFlow", category: "户外电源", gearCategory: "power", activity: ["自驾游"], weather: ["通用"], level: "premium", priority: "core", gearType: "shared", budgetWeight: "high", price: 3999, unit: "个", reason: "高预算优先升级电源容量，应对长途和多设备用电。" }),
    p({ id: "car-fridge", name: "Alpicool 车载冰箱", brand: "Alpicool", category: "车载冰箱", gearCategory: "cooler", activity: ["自驾游"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "high", price: 1499, unit: "个", reason: "长途保存食材和饮品更稳定，炎热天气下价值更高。" }),
    p({ id: "car-first-aid", name: "车载急救包", brand: "Lifeline", category: "车载急救包", gearCategory: "firstAid", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 159, unit: "个", reason: "处理行车和营地中的轻微伤情，是团队基础安全装备。" }),
    p({ id: "folding-table-chair", name: "折叠桌椅套装", brand: "KingCamp", category: "折叠桌椅", gearCategory: "tableChair", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 699, unit: "套", reason: "提升停车休息和户外用餐体验。" }),
    p({ id: "air-pump", name: "车载充气泵", brand: "Baseus", category: "充气泵", gearCategory: "vehicleTool", activity: ["自驾游"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 249, unit: "个", reason: "胎压不足时可快速补气，降低长途行车风险。" }),
  ],
  骑行: [
    p({ id: "cycling-helmet-basic", name: "入门骑行头盔", brand: "Decathlon", category: "头盔", gearCategory: "helmet", activity: ["骑行"], weather: ["通用"], level: "basic", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 159, unit: "个", reason: "骑行头盔是最重要的安全装备。" }),
    p({ id: "cycling-helmet-standard", name: "GIANT 骑行头盔", brand: "GIANT", category: "头盔", gearCategory: "helmet", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "high", price: 399, unit: "个", reason: "兼顾防护、通风和佩戴稳定性，避免普通头盔占用过高预算。" }),
    p({ id: "cycling-gloves", name: "Giro 骑行手套", brand: "Giro", category: "骑行手套", gearCategory: "gloves", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 129, unit: "双", reason: "防滑、缓震并保护手掌，但预算权重低。" }),
    p({ id: "bike-light", name: "CatEye 车灯", brand: "CatEye", category: "车灯", gearCategory: "lighting", activity: ["骑行"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 229, unit: "个", reason: "夜骑、隧道和阴雨环境下提升可见度。" }),
    p({ id: "repair-kit", name: "Topeak 补胎工具", brand: "Topeak", category: "补胎工具", gearCategory: "repair", activity: ["骑行"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "medium", price: 129, unit: "套", reason: "处理扎胎，避免中途无法继续。" }),
    p({ id: "cycling-bottle", name: "骑行水壶", brand: "Elite", category: "骑行水壶", gearCategory: "water", activity: ["骑行"], weather: ["炎热", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 69, unit: "个", reason: "行进中快速补水，炎热天气尤其必要。" }),
  ],
  海边旅行: [
    p({ id: "beach-sunscreen", name: "高倍防晒霜", brand: "Banana Boat", category: "防晒霜", gearCategory: "sunscreen", activity: ["海边旅行"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "consumable", budgetWeight: "low", price: 99, unit: "瓶", reason: "海边紫外线和反光强，防晒是核心防护。" }),
    p({ id: "beach-sun-hat", name: "宽檐遮阳帽", brand: "Columbia", category: "遮阳帽", gearCategory: "sunHat", activity: ["海边旅行"], weather: ["晴天", "炎热"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 129, unit: "顶", reason: "降低头面部暴晒和中暑风险。" }),
    p({ id: "beach-dry-bag", name: "防水袋", brand: "Sea to Summit", category: "防水袋", gearCategory: "dryBag", activity: ["海边旅行"], weather: ["雨天", "通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "medium", price: 159, unit: "个", reason: "保护手机、证件和电子设备免受进水影响。" }),
    p({ id: "beach-mat", name: "沙滩垫", brand: "Decathlon", category: "沙滩垫", gearCategory: "beachMat", activity: ["海边旅行"], weather: ["通用"], level: "standard", priority: "core", gearType: "shared", budgetWeight: "low", price: 129, unit: "张", reason: "坐卧休息更舒适，也减少沙土附着。" }),
    p({ id: "quickdry-towel", name: "速干毛巾", brand: "Naturehike", category: "速干毛巾", gearCategory: "towel", activity: ["海边旅行"], weather: ["通用"], level: "standard", priority: "core", gearType: "perPerson", budgetWeight: "low", price: 69, unit: "条", reason: "涉水或游泳后快速擦干，便于重复使用。" }),
    p({ id: "beach-sunglasses", name: "偏光太阳镜", brand: "Oakley", category: "太阳镜", gearCategory: "sunglasses", activity: ["海边旅行"], weather: ["晴天"], level: "standard", priority: "optional", gearType: "perPerson", budgetWeight: "low", price: 299, unit: "副", reason: "晴天强光和水面反光下保护眼睛，但不应优先挤占核心预算。" }),
    p({ id: "electrolyte", name: "电解质补水片", brand: "Nuun", category: "电解质补水", gearCategory: "electrolyte", activity: ["海边旅行"], weather: ["炎热"], level: "basic", priority: "important", gearType: "consumable", budgetWeight: "low", price: 6, unit: "片", reason: "炎热天气补充出汗流失的盐分和矿物质。" }),
  ],
};
