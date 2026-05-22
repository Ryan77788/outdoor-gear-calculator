import {
  productCatalog,
  categoryEnByGearCategory,
  type Activity,
  type BudgetWeight,
  type GearCategory,
  type GearType,
  type Product,
  type ProductDisplayPriority,
  type ProductLevel,
  type ProductPriority,
  type ProductTemplate,
} from "@/data/products";
import { getGearTier, getProductTierAffinity, type GearTier } from "@/lib/gear-tier";

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
  nameEn?: string;
  reason: string;
  reasonEn?: string;
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
  titleEn?: string;
  text: string;
  descriptionEn?: string;
};

export type OutdoorInsightType = "gear" | "weather" | "budget" | "safety";

export type OutdoorInsight = {
  type: OutdoorInsightType;
  title: string;
  text: string;
};

export type OutdoorInsightReport = {
  profile: string;
  strategy: string;
  summary: string;
  insights: OutdoorInsight[];
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

const productDisplayPriorityRank: Record<ProductDisplayPriority, number> = {
  featured: 0,
  high: 1,
  normal: 2,
  low: 3,
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
  越野跑: ["shoes", "backpack", "headlamp", "water", "electrolyte"],
  重装徒步: ["backpack", "shoes", "tent", "sleepingBag", "mat"],
  攀岩: ["shoes", "helmet", "headlamp", "gloves", "firstAid"],
  皮划艇: ["helmet", "dryBag", "sunHat", "sunglasses", "water"],
  单板滑雪: ["skiBoard", "skiBinding", "skiBoots", "helmet", "goggles"],
  沙漠徒步: ["shoes", "backpack", "sunHat", "water", "sunglasses"],
  冬季露营: ["tent", "sleepingBag", "mat", "stove", "lighting"],
  海边露营: ["tent", "dryBag", "sunHat", "cooler", "towel"],
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

const overnightGearCategories = new Set<GearCategory>(["tent", "sleepingBag", "mat"]);
const dayCampingCoreCategories: GearCategory[] = [
  "chair",
  "tableChair",
  "lighting",
  "cooler",
  "beachMat",
  "stove",
  "firstAid",
  "power",
  "sunHat",
  "sunscreen",
];
const dayTripPreferredCategories = new Set<GearCategory>([
  "water",
  "food",
  "sunscreen",
  "sunHat",
  "sunglasses",
  "firstAid",
  "headlamp",
  "lighting",
  "raincoat",
  "dryBag",
  "baseLayer",
]);

function getCoreGearCategoriesForDuration(activity: Activity, tripDays: TripDays) {
  if (activity === "露营" && tripDays === "1天") return dayCampingCoreCategories;
  return activityCoreGearCategories[activity];
}

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
  越野跑: [
    { name: "越野跑鞋", nameEn: "Trail running shoes", reason: "提升泥地、碎石和下坡路面的抓地与稳定。", reasonEn: "Improves grip and stability on dirt, rock, and descents.", priority: "core" },
    { name: "跑步背心", nameEn: "Running hydration vest", reason: "把补水、能量胶和轻量外层固定在身体附近。", reasonEn: "Keeps hydration, nutrition, and light layers close without bounce.", priority: "core" },
    { name: "头灯", reason: "清晨、傍晚或林线阴影下保持可见度。", priority: "safety" },
    { name: "电解质补水", reason: "高心率运动中补充盐分，降低抽筋和脱水风险。", priority: "safety" },
    { name: "速干衣", reason: "排汗更快，减少长时间湿冷摩擦。", priority: "weather" },
  ],
  重装徒步: [
    { name: "重装背包", nameEn: "Backpacking pack", reason: "承载帐篷、睡眠系统和多日补给，背负稳定性优先。", reasonEn: "Carries shelter, sleep system, and multi-day supplies with stable load transfer.", priority: "core" },
    { name: "徒步鞋", reason: "长距离负重时保护脚踝并降低水泡风险。", priority: "core" },
    { name: "帐篷", reason: "提供多日行程中的基础庇护和防雨空间。", priority: "core" },
    { name: "睡袋", reason: "保证夜间恢复，避免低温影响第二天体力。", priority: "weather" },
    { name: "防潮垫", reason: "隔绝地面冷湿，提升睡眠系统保暖效率。", priority: "weather" },
  ],
  攀岩: [
    { name: "攀岩鞋", nameEn: "Climbing shoes", reason: "提升踩点精度和脚部摩擦力。", reasonEn: "Improves foot precision and friction on holds.", priority: "core" },
    { name: "头盔", reason: "降低落石、磕碰和保护站附近冲击风险。", priority: "safety" },
    { name: "头灯", reason: "长线路线、下降或延误时提供照明冗余。", priority: "safety" },
    { name: "手套", reason: "保护手掌并提升绳索操作舒适度。", priority: "core" },
    { name: "急救包", reason: "处理擦伤、割伤和扭伤等常见岩壁风险。", priority: "safety" },
  ],
  皮划艇: [
    { name: "救生衣", nameEn: "Kayak PFD", reason: "水上活动的核心安全装备，必须优先覆盖。", reasonEn: "Core water-safety gear that should be covered first.", priority: "safety" },
    { name: "防水袋", reason: "保护手机、衣物和应急物品免受进水影响。", priority: "safety" },
    { name: "遮阳帽", reason: "长时间水面反光下减少头面部暴晒。", priority: "weather" },
    { name: "太阳镜", reason: "降低水面眩光，提升观察和划行舒适度。", priority: "weather" },
    { name: "水壶", reason: "水面活动容易忽略补水，需要固定携带。", priority: "core" },
  ],
  单板滑雪: [
    { name: "滑雪板", nameEn: "Snowboard", reason: "单板滑行的核心装备，决定控制和稳定性。", reasonEn: "The core snowboard setup item for control and stability.", priority: "core" },
    { name: "固定器", reason: "影响力量传递、转弯响应和摔倒释放体验。", priority: "core" },
    { name: "雪鞋", reason: "贴合度直接影响脚踝支撑和长时间舒适度。", priority: "core" },
    { name: "头盔", reason: "减少摔倒和碰撞造成的头部风险。", priority: "safety" },
    { name: "滑雪镜", reason: "提升雪面可视性并减少风雪刺激。", priority: "safety" },
  ],
  沙漠徒步: [
    { name: "透气徒步鞋", nameEn: "Breathable hiking shoes", reason: "兼顾热环境散热和沙石路面支撑。", reasonEn: "Balances hot-weather breathability with support on sand and rock.", priority: "core" },
    { name: "徒步背包", reason: "稳定携带大容量饮水、防晒和应急补给。", priority: "core" },
    { name: "遮阳帽", reason: "降低热辐射和中暑风险。", priority: "weather" },
    { name: "水袋", reason: "高温干燥环境下补水优先级最高。", priority: "safety" },
    { name: "太阳镜", reason: "减少沙地反光和风沙刺激。", priority: "weather" },
  ],
  冬季露营: [
    { name: "冬季帐篷", nameEn: "Winter tent", reason: "应对低温、风雪和更强营地防护需求。", reasonEn: "Handles cold, wind, snow, and stronger shelter demands.", priority: "core" },
    { name: "冬季睡袋", nameEn: "Winter sleeping bag", reason: "夜间保暖是冬季露营的核心安全边界。", reasonEn: "Overnight warmth is the main safety margin in winter camping.", priority: "weather" },
    { name: "防潮垫", reason: "提升地面隔热，避免睡眠系统热量流失。", priority: "weather" },
    { name: "炉具", reason: "用于热饮、热食和低温下的补给恢复。", priority: "core" },
    { name: "营地灯", reason: "冬季夜长，需要更可靠的营地照明。", priority: "safety" },
  ],
  海边露营: [
    { name: "海边帐篷", nameEn: "Beach camping tent", reason: "兼顾通风、防风和沙地固定。", reasonEn: "Balances ventilation, wind protection, and sand anchoring.", priority: "core" },
    { name: "防水袋", reason: "隔离潮气、沙粒和海水溅湿。", priority: "safety" },
    { name: "遮阳帽", reason: "降低白天强光和中暑风险。", priority: "weather" },
    { name: "保温箱", reason: "保存饮品和食材，提升海边营地补给稳定性。", priority: "comfort" },
    { name: "速干毛巾", reason: "涉水后快速擦干，减少潮湿不适。", priority: "comfort" },
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
  越野跑鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  跑步背心: { gearCategory: "backpack", gearType: "perPerson", unit: "个" },
  重装背包: { gearCategory: "backpack", gearType: "perPerson", unit: "个" },
  攀岩鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  救生衣: { gearCategory: "helmet", gearType: "perPerson", unit: "件" },
  透气徒步鞋: { gearCategory: "shoes", gearType: "perPerson", unit: "双" },
  冬季帐篷: { gearCategory: "tent", gearType: "shared", unit: "顶" },
  冬季睡袋: { gearCategory: "sleepingBag", gearType: "perPerson", unit: "个" },
  海边帐篷: { gearCategory: "tent", gearType: "shared", unit: "顶" },
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

function isGearAllowedForDuration(item: GearTemplate, tripDays: TripDays) {
  const gearCategory = gearQuantityRulesByName[item.name]?.gearCategory;

  if (!gearCategory) return true;
  if (tripDays === "1天") return !overnightGearCategories.has(gearCategory) && gearCategory !== "insulation";
  return true;
}

const gearReasonEnByPriority: Record<GearPriority, string> = {
  safety: "Adds practical safety margin for navigation, delays, or small incidents.",
  weather: "Helps manage exposure when weather shifts during the trip.",
  core: "Covers a high-use item that directly affects comfort and movement.",
  comfort: "Improves rest, organization, or comfort once the essentials are covered.",
};

function getGearEnglish(item: GearTemplate) {
  const rule = gearQuantityRulesByName[item.name];
  const categoryName = rule ? categoryEnByGearCategory[rule.gearCategory] : "essential outdoor gear";

  return {
    nameEn: item.nameEn ?? categoryName.replace(/^\w/, (char) => char.toUpperCase()),
    reasonEn: item.reasonEn ?? gearReasonEnByPriority[item.priority],
  };
}

export function buildGearList(
  activity: Activity,
  tripDays: TripDays,
  weather: Weather,
  peopleCount: number,
  budget: number,
): GearItem[] {
  return mergeGear([...weatherGear[weather], ...activityGear[activity], ...durationGear[tripDays]])
    .filter((item) => isGearAllowedForDuration(item, tripDays))
    .map((item) => ({
      ...item,
      ...getGearEnglish(item),
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

function preferredLevelForBase(budgetLevel: BudgetLevel, product: ProductTemplate, gearTier: GearTier) {
  if (gearTier === "entry") return "basic";
  if (gearTier === "premium" && product.priority === "core") return "premium";
  if (gearTier === "mid") return product.priority === "core" ? "standard" : "basic";
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

function isProductAllowedForDuration(product: ProductTemplate, tripDays: TripDays, weather: Weather) {
  if (tripDays !== "1天") return true;
  if (overnightGearCategories.has(product.gearCategory)) return false;
  if (product.gearCategory === "insulation") return weather === "寒冷" && product.level !== "premium";
  return true;
}

function productDurationSortPenalty(product: ProductTemplate, tripDays: TripDays) {
  if (tripDays !== "1天") return 0;
  if (dayTripPreferredCategories.has(product.gearCategory)) return -250000;
  if (product.gearType === "consumable") return -150000;
  return 0;
}

function productSortValue(product: ProductTemplate, activity: Activity, weather: Weather, gearTier: GearTier = "mid", tripDays?: TripDays) {
  const coreIndex = getCoreGearCategoriesForDuration(activity, tripDays ?? "2-3天").indexOf(product.gearCategory);
  const coreRank = coreIndex === -1 ? 50 : coreIndex;
  const tierAffinity = getProductTierAffinity(product.brand, product.level, gearTier);

  return (
    productDurationSortPenalty(product, tripDays ?? "2-3天") +
    productDisplayPriorityRank[product.productPriority] * 100000 +
    coreRank * 1000 +
    productWeatherRank(product, weather) * 100 +
    tierAffinity * 35 +
    productPriorityRank[product.priority] * 20 +
    budgetWeightRank[product.budgetWeight] * 5 +
    levelRankValue[product.level]
  );
}

function chooseBaseProduct(
  items: ProductTemplate[],
  budgetLevel: BudgetLevel,
  activity: Activity,
  weather: Weather,
  gearTier: GearTier,
) {
  const reference = items[0];
  const preferred = preferredLevelForBase(budgetLevel, reference, gearTier);
  const preferredRank = levelRankValue[preferred];

  return [...items].sort((a, b) => {
    const weatherDiff = productWeatherRank(a, weather) - productWeatherRank(b, weather);
    if (weatherDiff !== 0) return weatherDiff;

    const tierDiff = getProductTierAffinity(a.brand, a.level, gearTier) - getProductTierAffinity(b.brand, b.level, gearTier);
    if (tierDiff !== 0) return tierDiff;

    const levelDistance = Math.abs(levelRankValue[a.level] - preferredRank) - Math.abs(levelRankValue[b.level] - preferredRank);
    if (levelDistance !== 0) return levelDistance;

    const sortDiff = productSortValue(a, activity, weather, gearTier) - productSortValue(b, activity, weather, gearTier);
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
  gearTier: GearTier,
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
        const tierDiff =
          getProductTierAffinity(a.candidate.brand, a.candidate.level, gearTier) -
          getProductTierAffinity(b.candidate.brand, b.candidate.level, gearTier);
        if (tierDiff !== 0) return tierDiff;

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

  const gearTier = getGearTier(budget);

  for (const product of [...products]
    .filter((product) => isProductAllowedForDuration(product, days, weather))
    .sort((a, b) => productSortValue(a, activity, weather, gearTier, days) - productSortValue(b, activity, weather, gearTier, days))) {
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
  const gearTier = getGearTier(budget);
  const maxAllowed = Math.floor(Math.max(0, budget) * 1.1);
  const pool = productCatalog[activity]
    .filter((product) => product.activity.includes(activity))
    .filter((product) => isProductAllowedForDuration(product, days, weather));
  const grouped = groupByGearCategory(pool);
  const selected: Product[] = [];
  const selectedCategories = new Set<GearCategory>();

  for (const gearCategory of getCoreGearCategoriesForDuration(activity, days)) {
    const variants = grouped.get(gearCategory);

    if (!variants) continue;

    const baseProduct = chooseBaseProduct(variants, budgetLevel, activity, weather, gearTier);
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
    .sort((a, b) => productSortValue(a, activity, weather, gearTier, days) - productSortValue(b, activity, weather, gearTier, days));

  const currentCategories = new Set(selectedProducts.map((product) => product.gearCategory));

  for (const product of weatherProducts) {
    tryAddProduct(selectedProducts, currentCategories, product, maxAllowed);
  }

  selectedProducts = applyBudgetUpgrades(selectedProducts, grouped, budget, peopleCount, days, weather, gearTier);

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
      (a, b) => productSortValue(a, activity, weather, gearTier, days) - productSortValue(b, activity, weather, gearTier, days),
    ),
    totalPrice,
    remainingBudget: Math.max(-Math.floor(Math.max(0, budget) * 0.1), Math.max(0, budget) - totalPrice),
    gearTier,
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

const riskEnglishByIcon: Record<RiskIconName, { title: string; text: string }> = {
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
  spark: {
    title: "Comfort upgrade",
    text: "Upgrade comfort only after the essentials for safety, warmth, and movement are covered.",
  },
  alert: {
    title: "Risk control",
    text: "Set a simple condition for turning back before fatigue or weather makes the decision harder.",
  },
  check: {
    title: "Pre-trip check",
    text: "Check key gear before leaving so small omissions do not become route problems.",
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

function enrichRiskBlock(risk: RiskBlock): RiskBlock {
  const fallback = riskEnglishByIcon[risk.icon];

  return {
    ...risk,
    titleEn: risk.titleEn ?? fallback.title,
    descriptionEn: risk.descriptionEn ?? fallback.text,
  };
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
    越野跑: { icon: "clock", title: "配速与撤退", text: "越野跑要控制下坡速度，提前确认补水点、折返点和最晚返程时间。" },
    重装徒步: { icon: "pack", title: "负重管理", text: "重装行程要限制非必要物品，优先保证背负、鞋靴和睡眠系统可靠。" },
    攀岩: { icon: "shield", title: "坠落与落石", text: "攀岩前确认头盔、保护系统和下降方案，避开松动岩面和雷雨窗口。" },
    皮划艇: { icon: "weather", title: "水面变化", text: "关注风浪、水温和回岸路线，救生衣和防水收纳必须优先准备。" },
    单板滑雪: { icon: "shield", title: "摔倒防护", text: "单板滑雪摔倒频率高，头盔、雪镜、护具和热身要放在前面。" },
    沙漠徒步: { icon: "weather", title: "高温与迷航", text: "沙漠徒步要避开正午高温，携带冗余饮水并提前标记撤离点。" },
    冬季露营: { icon: "clock", title: "失温风险", text: "冬季露营要控制暴露时间，睡眠系统、干燥衣物和热饮能力决定安全边界。" },
    海边露营: { icon: "weather", title: "潮汐与强风", text: "海边露营要避开潮水线，帐篷固定、防水收纳和防晒都需要提前检查。" },
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

  return [activityRisk[activity], weatherRisk[weather], durationRisk[tripDays]].map(enrichRiskBlock);
}

function getTripLengthTone(tripDays: TripDays) {
  if (tripDays === "1天") return "短途";
  if (tripDays === "2-3天") return "多日";
  return "长线";
}

function getBudgetTone(budget: number, peopleCount: number) {
  const perPersonBudget = Math.max(0, budget) / Math.max(1, peopleCount);

  if (perPersonBudget < 900) return "tight";
  if (perPersonBudget < 2500) return "balanced";
  return "comfortable";
}

function getActivityGearAdvice(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number) {
  const lengthTone = getTripLengthTone(tripDays);

  if (activity === "露营" && weather === "雨天") {
    return "雨天露营先把防水和营地排水做好，帐篷、地布和干袋比装饰性装备更值得优先投入。";
  }

  if (activity === "露营" && peopleCount >= 3) {
    return "多人露营建议把炉具、照明和桌椅按共享装备规划，减少重复购买，也能让营地动线更顺。";
  }

  if (activity === "徒步" && weather === "晴天") {
    return "晴天徒步更适合轻量透气组合，鞋袜、背负和补水效率会直接影响后半程体感。";
  }

  if (activity === "钓鱼" && weather === "晴天") {
    return "晴天短途钓鱼更适合轻量装备，减少长时间持握和等待带来的疲劳。";
  }

  if (activity === "滑雪") {
    return "滑雪装备优先保证头盔、雪镜和雪靴贴合度，舒适度不足会很快转化为控制风险。";
  }

  if (activity === "登山") {
    return `${lengthTone}登山不要只看单件性能，鞋底抓地、背包稳定和照明冗余要一起考虑。`;
  }

  if (activity === "自驾游") {
    return "自驾出行的装备重点在供电、冷藏和车辆应急，舒适装备可以在核心保障之后再补。";
  }

  if (activity === "骑行") {
    return "骑行装备建议优先处理头盔、手套、车灯和补胎工具，它们比速度装备更能提升实际体验。";
  }

  if (activity === "海边旅行") {
    return "海边出行要把防晒、防水收纳和速干装备放在前面，避免阳光和潮气影响整天节奏。";
  }

  if (activity === "越野跑") {
    return "越野跑优先保证跑鞋抓地、补水背心和照明冗余，轻量化要建立在不牺牲撤退能力的基础上。";
  }

  if (activity === "重装徒步") {
    return "重装徒步的预算应先放在背包、鞋靴、帐篷和睡眠系统上，减重和舒适度会直接影响后几天状态。";
  }

  if (activity === "攀岩") {
    return "攀岩装备先覆盖鞋、头盔、照明和基础急救，保护与撤退能力比舒适配件更关键。";
  }

  if (activity === "皮划艇") {
    return "皮划艇要把救生衣、防水收纳、遮阳和补水前置，水面风浪变化会放大小失误。";
  }

  if (activity === "单板滑雪") {
    return "单板滑雪优先保证雪板、固定器、雪鞋和头盔雪镜的匹配度，控制感比堆配件更重要。";
  }

  if (activity === "沙漠徒步") {
    return "沙漠徒步的核心是防晒、补水和路线冗余，鞋和背包要兼顾透气与承载。";
  }

  if (activity === "冬季露营") {
    return "冬季露营先把帐篷、睡袋、防潮垫和炉具作为系统规划，夜间保暖比单件装备参数更重要。";
  }

  if (activity === "海边露营") {
    return "海边露营要兼顾通风、防风、防水和食物冷藏，沙地固定和潮汐位置比普通营地更关键。";
  }

  return `${lengthTone}${activity}建议先锁定鞋服、收纳和照明等高频装备，再按预算补足舒适项。`;
}

function getWeatherAdvice(activity: Activity, weather: Weather, tripDays: TripDays) {
  if (weather === "雨天") {
    return activity === "露营"
      ? "雨天营地尽量避开低洼和河道边，进帐前设置湿区，能明显降低夜间受潮概率。"
      : "雨天路面和装备都会变得更难管理，外层防水、备用干衣和电子设备收纳要提前分层。";
  }

  if (weather === "寒冷") {
    return tripDays === "4天以上"
      ? "长线寒冷环境要按分层穿着准备，保暖层和干燥备用衣物比单纯加厚更可靠。"
      : "寒冷天气别等到发冷再加衣，停留、等待和返程阶段才是体温下降最快的时候。";
  }

  if (weather === "炎热") {
    return "高温下装备越轻越好，但补水、电解质和遮阳不能省，行程最好避开正午强晒。";
  }

  return activity === "徒步"
    ? "晴天徒步也要保留防晒和风层，山地日照、风口和林荫温差会让体感快速变化。"
    : "晴天适合提高行动效率，但防晒、补水和眼部保护仍然是基础安全配置。";
}

function getBudgetAdvice(activity: Activity, budget: number, peopleCount: number, tripDays: TripDays) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (budgetTone === "tight") {
    return `当前预算更适合抓核心装备，${activity}场景下先保证安全、防护和必需消耗品，舒适升级可以后置。`;
  }

  if (peopleCount >= 3) {
    return "多人预算建议区分个人装备和共享装备，共享类优先买稳定耐用款，个人类按使用频率分档。";
  }

  if (tripDays === "4天以上") {
    return "长途出行预算不要全部花在大件上，预留补给、备用电力和应急替换会更稳。";
  }

  if (budgetTone === "comfortable") {
    return "预算余量充足时，优先升级鞋、外层防护和睡眠系统，这些装备对安全和恢复最有感。";
  }

  return "这个预算适合做均衡配置，核心装备选稳定款，低频配件不必追高规格。";
}

function getSafetyAdvice(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number) {
  if (tripDays === "4天以上") {
    return "长线行程建议提前拆分撤离点和补给点，并把每日最晚折返点写清楚。";
  }

  if (peopleCount >= 4) {
    return "多人同行最容易忽略节奏差异，建议指定集合点和队尾观察者，避免队伍被拉散。";
  }

  if (weather === "雨天") {
    return "雨天不要低估失温和滑坠风险，缩短强度、保留干燥层，比硬撑行程更专业。";
  }

  if (activity === "钓鱼") {
    return "水边活动尽量避免单独行动，湿滑岸线、涨水和雷雨变化都需要提前设撤离条件。";
  }

  if (activity === "骑行") {
    return "骑行前检查刹车、胎压和车灯，夜间或隧道场景下可见度比速度更重要。";
  }

  if (activity === "攀岩") {
    return "攀岩前要完成同伴互检，确认头盔、保护点和下降路线，天气转差时不要硬上长线路线。";
  }

  if (activity === "皮划艇") {
    return "皮划艇出发前确认回岸点、水温、风向和救生衣穿戴，手机与保暖层要进入防水袋。";
  }

  if (activity === "沙漠徒步") {
    return "沙漠徒步建议错开正午高温，饮水按冗余准备，并把路线与预计返回时间同步给同行者。";
  }

  if (activity === "冬季露营") {
    return "冬季露营要保持睡眠系统干燥，睡前补充热量，低温或强风加剧时优先缩短暴露时间。";
  }

  return "出发前把路线、天气窗口和返程时间同步给同行者，装备清单之外也要留出撤退预案。";
}

function getTripProfile(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") return "极寒谨慎型";
  if (tripDays === "4天以上") return "长途耐力型";
  if (peopleCount >= 3) return "多人共享型";
  if (budgetTone === "comfortable") return "高预算舒适型";
  if (budgetTone === "tight") return "基础安全型";
  if (tripDays === "1天" && (activity === "徒步" || activity === "钓鱼" || activity === "骑行")) return "轻量短途型";
  if (weather === "炎热") return "高温轻装型";

  return "均衡探索型";
}

function getGearStrategy(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") return "优先保暖与返程冗余";
  if (tripDays === "4天以上") return "优先轻量化与耐力分配";
  if (peopleCount >= 3) return "优先共享装备与协作效率";
  if (budgetTone === "tight") return "优先基础安全与高频装备";
  if (budgetTone === "comfortable") return "优先舒适性、轻量化和高性能装备";
  if (activity === "露营" && weather === "雨天") return "优先防水、排水和营地稳定";

  return "优先安全冗余与体验均衡";
}

function getProfileSummary(activity: Activity, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (weather === "寒冷") {
    return "这次真正需要管理的不是出发时的冷，而是返程、停留和体力下降后的失温风险。";
  }

  if (tripDays === "4天以上") {
    return "长途行程的关键在持续稳定，装备越重，后几天的决策和行动质量越容易被拖垮。";
  }

  if (peopleCount >= 3) {
    return "多人出行不只是把装备数量乘以人数，更重要的是分清公共装备、个人装备和协作角色。";
  }

  if (budgetTone === "tight") {
    return `当前预算下，${activity}更适合少买但买对，把基础安全和可重复使用装备放在前面。`;
  }

  if (budgetTone === "comfortable") {
    return "预算余量可以转化成更好的体力保存：轻量、贴合、稳定和睡眠恢复都值得升级。";
  }

  if (weather === "炎热") {
    return "高温环境里，轻装只是第一步，补水节奏和遮阳管理才决定后半程状态。";
  }

  return "这次配置适合走均衡路线，先稳住安全和核心体验，再用预算补足舒适细节。";
}

function personalizeGearAdvice(base: string, weather: Weather, tripDays: TripDays, peopleCount: number, budget: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (budgetTone === "tight") {
    return `${base} 预算偏紧时，不建议把钱分散到低频配件，先让鞋服、防护和应急物品足够可靠。`;
  }

  if (peopleCount >= 3) {
    return `${base} 多人同行可以把炉具、照明、电源和急救包集中规划，减少重复重量和重复花费。`;
  }

  if (tripDays === "4天以上") {
    return `${base} 长途场景下每一件装备都要经得起“连续使用”，轻量和耐用比单次体验更重要。`;
  }

  if (weather === "寒冷") {
    return `${base} 寒冷环境下别只堆厚衣服，贴身排汗、保暖层和防风外层要能连续配合。`;
  }

  return base;
}

function personalizeWeatherAdvice(base: string, weather: Weather, tripDays: TripDays) {
  if (weather === "寒冷") {
    return "寒冷环境下真正危险的阶段，往往发生在返程和停留时；建议把干燥保暖层留到后半程使用。";
  }

  if (weather === "雨天") {
    return "雨天不要只看降雨量，地面湿滑、装备吸水和夜间降温会叠加影响行程，防水分层要提前做好。";
  }

  if (tripDays === "4天以上") {
    return `${base} 长线行程还要关注天气窗口变化，最好为后两天保留路线调整空间。`;
  }

  return base;
}

function personalizeBudgetAdvice(base: string, activity: Activity, budget: number, peopleCount: number) {
  const budgetTone = getBudgetTone(budget, peopleCount);

  if (budgetTone === "tight") {
    return `低预算下的${activity}更需要克制：共享装备优先，个人装备只升级直接影响安全和体力的部分。`;
  }

  if (budgetTone === "comfortable") {
    return "高预算不要只买更贵的大件，真正提升体验的是轻量化、贴合度、睡眠恢复和恶劣天气余量。";
  }

  if (peopleCount >= 3) {
    return "多人预算最怕平均用力，公共装备买稳定款，个人装备按身高体力和使用频率拉开档位。";
  }

  return base;
}

function personalizeSafetyAdvice(base: string, weather: Weather, tripDays: TripDays, peopleCount: number) {
  if (weather === "寒冷") {
    return "寒冷天气的安全边界要往前放，出现手脚发麻、行动变慢或停留变久时，就该主动缩短行程。";
  }

  if (tripDays === "4天以上") {
    return "长途安全不是靠多带装备解决的，关键是每天都有撤退点、补给点和明确的最晚折返点。";
  }

  if (peopleCount >= 4) {
    return "多人队伍要提前约定队首、队尾和集合点，真正的风险常来自队伍被无声拉散。";
  }

  return base;
}

export function getOutdoorInsights(
  activity: Activity,
  weather: Weather,
  tripDays: TripDays,
  peopleCount: number,
  budget: number,
): OutdoorInsightReport {
  const gearAdvice = getActivityGearAdvice(activity, weather, tripDays, peopleCount);
  const weatherAdvice = getWeatherAdvice(activity, weather, tripDays);
  const budgetAdvice = getBudgetAdvice(activity, budget, peopleCount, tripDays);
  const safetyAdvice = getSafetyAdvice(activity, weather, tripDays, peopleCount);

  return {
    profile: getTripProfile(activity, weather, tripDays, peopleCount, budget),
    strategy: getGearStrategy(activity, weather, tripDays, peopleCount, budget),
    summary: getProfileSummary(activity, weather, tripDays, peopleCount, budget),
    insights: [
    {
      type: "gear",
      title: "装备取舍",
      text: personalizeGearAdvice(gearAdvice, weather, tripDays, peopleCount, budget),
    },
    {
      type: "weather",
      title: "天气判断",
      text: personalizeWeatherAdvice(weatherAdvice, weather, tripDays),
    },
    {
      type: "budget",
      title: "预算策略",
      text: personalizeBudgetAdvice(budgetAdvice, activity, budget, peopleCount),
    },
    {
      type: "safety",
      title: "安全提醒",
      text: personalizeSafetyAdvice(safetyAdvice, weather, tripDays, peopleCount),
    },
    ],
  };
}
