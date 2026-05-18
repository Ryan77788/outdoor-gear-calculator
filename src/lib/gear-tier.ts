import type { ProductLevel } from "@/data/products";
import type { Language } from "@/lib/i18n";

export type GearTier = "entry" | "mid" | "premium";

export const tierBrands: Record<GearTier, string[]> = {
  entry: ["Decathlon", "Naturehike", "Basecamp", "Coleman", "Shimano"],
  mid: ["Columbia", "Giro", "Salomon", "DAIWA", "Berkley", "Osprey"],
  premium: ["Arc'teryx", "Patagonia", "Burton", "Garmin", "YETI", "Dometic", "Jackery"],
};

export const tierPreferredLevel: Record<GearTier, ProductLevel> = {
  entry: "basic",
  mid: "standard",
  premium: "premium",
};

export function getGearTier(budget: number): GearTier {
  if (budget < 3000) return "entry";
  if (budget <= 8000) return "mid";
  return "premium";
}

export function getGearTierMeta(tier: GearTier, language: Language) {
  const meta = {
    entry: {
      en: {
        badge: "Entry Setup",
        shareTitle: "Entry Outdoor Setup",
        description: "Value-first essentials from approachable outdoor brands.",
      },
      zh: {
        badge: "Entry 入门装备",
        shareTitle: "Entry Outdoor Setup",
        description: "优先选择高性价比基础装备，控制预算但保留安全底线。",
      },
    },
    mid: {
      en: {
        badge: "Mid Setup",
        shareTitle: "Mid Outdoor Setup",
        description: "Balanced upgrades for durability, comfort, and reliable performance.",
      },
      zh: {
        badge: "Mid 进阶装备",
        shareTitle: "Mid Outdoor Setup",
        description: "在耐用性、舒适度和预算之间取得平衡。",
      },
    },
    premium: {
      en: {
        badge: "Premium Setup",
        shareTitle: "Premium Outdoor Setup",
        description: "High-performance gear for stronger protection and long-term use.",
      },
      zh: {
        badge: "Premium 高阶装备",
        shareTitle: "Premium Outdoor Setup",
        description: "优先升级高性能核心装备，提高保护、舒适和长期使用价值。",
      },
    },
  } satisfies Record<GearTier, Record<Language, { badge: string; shareTitle: string; description: string }>>;

  return meta[tier][language];
}

export function getGearTierStyle(tier: GearTier) {
  if (tier === "premium") {
    return {
      badgeClass: "border-amber-300/60 bg-slate-950 text-amber-200",
      cardClass: "border-amber-300/40 bg-slate-950 text-amber-100",
      shareColor: "#fbbf24",
    };
  }

  if (tier === "mid") {
    return {
      badgeClass: "border-cyan-200 bg-cyan-50 text-cyan-800",
      cardClass: "border-cyan-200 bg-cyan-50 text-cyan-900",
      shareColor: "#22d3ee",
    };
  }

  return {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    cardClass: "border-emerald-200 bg-emerald-50 text-emerald-900",
    shareColor: "#34d399",
  };
}

export function getProductTierAffinity(brand: string, level: ProductLevel, tier: GearTier) {
  const normalizedBrand = brand.toLowerCase();
  const brandMatchesTier = tierBrands[tier].some((tierBrand) => normalizedBrand.includes(tierBrand.toLowerCase()));
  const preferredLevel = tierPreferredLevel[tier];

  return (brandMatchesTier ? 0 : 2) + (level === preferredLevel ? 0 : 1);
}
