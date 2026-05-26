import type {
  Activity,
  Product,
  ProductExpertRecommendation,
  ProductLinkType,
  ProductReviewStatus,
  ProductActivity,
  ProductTemplate,
} from "@/data/products";

export type ProductBudgetTier = "low" | "mid" | "high";

export type ProductOverrideFields = {
  name?: string;
  nameEn?: string;
  brand?: string;
  activity?: ProductActivity[] | string;
  category?: string;
  merchant?: string;
  unit?: string;
  buyUrl?: string;
  affiliateLink?: string;
  linkType?: ProductLinkType;
  reviewStatus?: ProductReviewStatus;
  reviewNote?: string;
  isCurated?: boolean;
  isHidden?: boolean;
  isDeleted?: boolean;
  imageReviewed?: boolean;
  isCustomProduct?: boolean;
  budgetTier?: ProductBudgetTier;
  price?: number;
  bestFor?: ProductExpertRecommendation;
  strengths?: ProductExpertRecommendation;
  notIdealFor?: ProductExpertRecommendation;
  image?: string;
};

export type ProductOverride = ProductOverrideFields & {
  id: string;
  updatedAt?: string;
};

export type ProductOverrideInput = ProductOverrideFields & {
  id: string;
};

const activities: Activity[] = [
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

const gearCategoryByCategory: Record<string, ProductTemplate["gearCategory"]> = {
  shoes: "shoes",
  footwear: "shoes",
  鞋: "shoes",
  鞋靴: "shoes",
  backpack: "backpack",
  pack: "backpack",
  背包: "backpack",
  shell: "shellJacket",
  jacket: "shellJacket",
  冲锋衣: "shellJacket",
  rain: "raincoat",
  raincoat: "raincoat",
  雨衣: "raincoat",
  insulation: "insulation",
  保暖: "insulation",
  tent: "tent",
  帐篷: "tent",
  sleepingbag: "sleepingBag",
  sleeping: "sleepingBag",
  睡袋: "sleepingBag",
  mat: "mat",
  sleepingpad: "mat",
  垫: "mat",
  stove: "stove",
  炉具: "stove",
  light: "lighting",
  lighting: "lighting",
  灯: "lighting",
  headlamp: "headlamp",
  头灯: "headlamp",
  water: "water",
  水: "water",
  food: "food",
  食物: "food",
  firstaid: "firstAid",
  急救: "firstAid",
  helmet: "helmet",
  头盔: "helmet",
  gloves: "gloves",
  手套: "gloves",
};

function normalizeActivity(value: ProductOverrideFields["activity"]): ProductActivity[] {
  const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const normalized = rawValues.map((item) => item.trim()).filter(Boolean);
  const valid = normalized.filter((item): item is ProductActivity => activities.includes(item as Activity) || /^[a-z-]+$/.test(item));

  return valid.length > 0 ? valid : ["徒步"];
}

function inferGearCategory(category: string | undefined): ProductTemplate["gearCategory"] {
  const normalized = (category ?? "").toLowerCase().replace(/\s+/g, "");

  return gearCategoryByCategory[normalized] ?? "consumable";
}

export function sanitizeProductOverride(input: ProductOverrideInput): ProductOverrideInput {
  return {
    id: input.id.trim(),
    name: input.name?.trim(),
    nameEn: input.nameEn?.trim(),
    brand: input.brand?.trim(),
    activity: input.activity,
    category: input.category?.trim(),
    merchant: input.merchant?.trim(),
    unit: input.unit?.trim(),
    buyUrl: input.buyUrl?.trim(),
    affiliateLink: input.affiliateLink?.trim(),
    linkType: input.linkType,
    reviewStatus: input.reviewStatus,
    reviewNote: input.reviewNote?.trim(),
    isCurated: input.isCurated,
    isHidden: input.isHidden,
    isDeleted: input.isDeleted,
    imageReviewed: input.imageReviewed,
    isCustomProduct: input.isCustomProduct,
    budgetTier: input.budgetTier,
    price: typeof input.price === "number" && Number.isFinite(input.price) ? input.price : undefined,
    bestFor: sanitizeExpertRecommendation(input.bestFor),
    strengths: sanitizeExpertRecommendation(input.strengths),
    notIdealFor: sanitizeExpertRecommendation(input.notIdealFor),
    image: input.image?.trim(),
  };
}

function sanitizeRecommendationList(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function sanitizeExpertRecommendation(input: ProductExpertRecommendation | undefined) {
  if (!input) return undefined;

  return {
    zh: sanitizeRecommendationList(input.zh),
    en: sanitizeRecommendationList(input.en),
  };
}

function amazonSearchUrl(product: ProductTemplate | Product) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(`${product.brand} ${product.nameEn ?? product.name}`)}`;
}

function isReiUrl(value: string | undefined) {
  return Boolean(value && /^https?:\/\/([^/]+\.)?rei\.com\//i.test(value));
}

export function applyProductOverride<T extends ProductTemplate | Product>(product: T, override?: ProductOverride): T {
  const fallbackBuyUrl = product.merchant === "REI" && isReiUrl(product.buyUrl) ? amazonSearchUrl(product) : product.buyUrl;
  const fallbackSearchLink =
    product.merchant === "REI" && isReiUrl(product.searchLink) ? amazonSearchUrl(product) : product.searchLink;
  const fallbackSourceUrl =
    product.merchant === "REI" && isReiUrl(product.sourceUrl) ? amazonSearchUrl(product) : product.sourceUrl;
  const overrideBuyUrl =
    product.merchant === "REI" && isReiUrl(override?.buyUrl) ? amazonSearchUrl(product) : override?.buyUrl;

  if (!override) {
    return {
      ...product,
      buyUrl: fallbackBuyUrl,
      searchLink: fallbackSearchLink,
      sourceUrl: fallbackSourceUrl,
    };
  }

  const next = {
    ...product,
    ...(override.name !== undefined ? { name: override.name } : {}),
    ...(override.nameEn !== undefined ? { nameEn: override.nameEn } : {}),
    ...(override.brand !== undefined ? { brand: override.brand } : {}),
    ...(override.activity !== undefined ? { activity: normalizeActivity(override.activity) } : {}),
    ...(override.category !== undefined ? { category: override.category, gearCategory: inferGearCategory(override.category) } : {}),
    ...(override.merchant !== undefined ? { merchant: override.merchant } : {}),
    ...(override.unit !== undefined ? { unit: override.unit } : {}),
    buyUrl: overrideBuyUrl ?? fallbackBuyUrl,
    searchLink: fallbackSearchLink,
    sourceUrl: fallbackSourceUrl,
    ...(override.affiliateLink !== undefined ? { affiliateLink: override.affiliateLink } : {}),
    ...(override.linkType !== undefined ? { linkType: override.linkType } : {}),
    ...(override.reviewStatus !== undefined ? { reviewStatus: override.reviewStatus } : {}),
    ...(override.reviewNote !== undefined ? { reviewNote: override.reviewNote } : {}),
    ...(override.isCurated !== undefined ? { isCurated: override.isCurated } : {}),
    ...(override.isHidden !== undefined ? { isHidden: override.isHidden } : {}),
    ...(override.isDeleted !== undefined ? { isDeleted: override.isDeleted } : {}),
    ...(override.imageReviewed !== undefined ? { imageReviewed: override.imageReviewed } : {}),
    ...(override.isCustomProduct !== undefined ? { isCustomProduct: override.isCustomProduct } : {}),
    ...(override.budgetTier !== undefined ? { budgetTier: override.budgetTier } : {}),
    ...(override.price !== undefined ? { price: override.price } : {}),
    ...(override.bestFor !== undefined ? { bestFor: override.bestFor } : {}),
    ...(override.strengths !== undefined ? { strengths: override.strengths } : {}),
    ...(override.notIdealFor !== undefined ? { notIdealFor: override.notIdealFor } : {}),
    ...(override.image !== undefined ? { image: override.image } : {}),
  } as T & { productUrl?: string };

  if ("productUrl" in next) {
    next.productUrl = override.affiliateLink || override.buyUrl || next.productUrl;
  }

  if (override.price !== undefined && "unitPrice" in next && "quantity" in next && "subtotal" in next) {
    const pricedNext = next as typeof next & { unitPrice: number; quantity: number; subtotal: number };

    pricedNext.unitPrice = override.price;
    pricedNext.subtotal = override.price * pricedNext.quantity;
  }

  return next as T;
}

export function applyProductOverrides<T extends ProductTemplate | Product>(
  products: T[],
  overrides: ProductOverride[],
  options: { includeHidden?: boolean; includeDeleted?: boolean } = {},
): T[] {
  const overrideById = new Map(overrides.map((override) => [override.id, override]));

  return products
    .filter((product) => options.includeDeleted || overrideById.get(product.id)?.isDeleted !== true)
    .filter((product) => options.includeHidden || overrideById.get(product.id)?.isHidden !== true)
    .map((product) => applyProductOverride(product, overrideById.get(product.id)));
}

export function buildCustomProductsFromOverrides(
  overrides: ProductOverride[],
  options: { includeHidden?: boolean; includeDeleted?: boolean } = {},
): ProductTemplate[] {
  return overrides
    .filter((override) => override.isCustomProduct === true)
    .filter((override) => options.includeDeleted || override.isDeleted !== true)
    .filter((override) => options.includeHidden || override.isHidden !== true)
    .map((override) => {
      const name = override.name?.trim() || override.nameEn?.trim() || override.id;
      const nameEn = override.nameEn?.trim() || name;
      const category = override.category?.trim() || "自定义商品";
      const merchant = override.merchant?.trim() || "Custom";
      const buyUrl = override.buyUrl?.trim() || override.affiliateLink?.trim() || "#";
      const price = typeof override.price === "number" && Number.isFinite(override.price) ? override.price : 0;

      return {
        id: override.id,
        name,
        nameEn,
        brand: override.brand?.trim() || "Custom",
        category,
        categoryEn: category,
        gearCategory: inferGearCategory(category),
        activity: normalizeActivity(override.activity),
        currency: "CNY",
        weather: ["通用"],
        rating: 4.5,
        tags: ["custom"],
        difficulty: "easy",
        affiliate: Boolean(override.affiliateLink),
        affiliateLink: override.affiliateLink ?? "",
        affiliateProvider: override.affiliateLink ? "amazon" : "none",
        affiliateUrl: override.affiliateLink ?? "",
        merchant,
        linkType: override.linkType ?? (override.affiliateLink ? "product" : "search"),
        reviewStatus: override.reviewStatus ?? (override.affiliateLink ? "affiliate-ready" : "search-only"),
        searchLink: buyUrl,
        sourceUrl: buyUrl,
        isAffiliateReady: override.reviewStatus === "affiliate-ready",
        isCurated: override.isCurated ?? false,
        imageReviewed: override.imageReviewed ?? false,
        isCustomProduct: true,
        description: `${override.brand?.trim() || "Custom"} ${nameEn}`,
        level: "standard",
        priority: "important",
        productPriority: override.isCurated ? "high" : "normal",
        gearType: "perPerson",
        budgetWeight: override.budgetTier === "low" ? "low" : override.budgetTier === "high" ? "high" : "medium",
        price,
        unit: override.unit?.trim() || "件",
        image: override.image?.trim() || "/products/placeholder-camping.jpg",
        imageStatus: override.image ? "needsReview" : "placeholder",
        buyUrl,
        reason: override.reviewNote || "后台新增的运营商品。",
        reasonEn: override.reviewNote || "Custom product added from the admin catalog.",
        bestFor: override.bestFor ?? { zh: [], en: [] },
        strengths: override.strengths ?? { zh: [], en: [] },
        notIdealFor: override.notIdealFor ?? { zh: [], en: [] },
      };
    });
}
