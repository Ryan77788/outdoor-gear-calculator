"use client";

import Image from "next/image";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import { activityOptions, productUrl, type Activity, type GearCategory, type Product } from "@/data/products";
import {
  buildGearList,
  getOutdoorInsights,
  getProductPlan,
  getRiskBlocks,
  tripDayOptions,
  weatherOptions,
  type GearItem,
  type OutdoorInsightType,
  type RiskIconName,
  type RiskBlock,
  type TripDays,
  type Weather,
} from "@/lib/recommendation";
import { getGearTier, getGearTierMeta, getGearTierStyle, type GearTier } from "@/lib/gear-tier";
import { buildRecommendationAnalysis } from "@/lib/reasoning";
import {
  formatCurrency as formatLocalizedCurrency,
  formatQuantity,
  formatPeople,
  formatSavedTime as formatLocalizedSavedTime,
  formatUnit,
  localizeInsightReport,
  localizeGearName,
  localizeGearReason,
  localizeProductCategory,
  localizeProductName,
  localizeProductReason,
  localizeRiskText,
  localizeRiskTitle,
  localizeValue,
  translations,
  type Language,
} from "@/lib/i18n";
import { getActivityBackground, getShareCardBackground } from "@/lib/activity-backgrounds";

type IconName = RiskIconName;

type FormState = {
  activity: Activity;
  tripDays: TripDays;
  weather: Weather;
  peopleCount: number;
  budget: number;
};

type SavedPlan = FormState & {
  _id: string;
  gearTier?: GearTier;
  gearList: GearItem[];
  recommendedProducts: Product[];
  risks: RiskBlock[];
  totalPrice: number;
  createdAt: string;
};

type PlansResponse = {
  success: boolean;
  plans?: SavedPlan[];
};

type SavePlanResponse = {
  success: boolean;
  planId?: string;
  plan?: SavedPlan;
};

const insightIconNames: Record<OutdoorInsightType, IconName> = {
  gear: "pack",
  weather: "weather",
  budget: "budget",
  safety: "shield",
};

const iconPaths: Record<IconName, React.ReactNode> = {
  activity: <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />,
  calendar: (
    <>
      <path d="M8 2v4M16 2v4M3 10h18" />
      <rect width="18" height="18" x="3" y="4" rx="3" />
    </>
  ),
  weather: (
    <>
      <path d="M12 3v2M12 19v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M3 12h2M19 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  budget: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />,
  pack: (
    <>
      <path d="M6 7a6 6 0 0 1 12 0v2" />
      <path d="M5 9h14l1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L5 9z" />
      <path d="M9 13h6M9 17h6" />
    </>
  ),
  spark: <path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.8L12 15.5 6.4 19.6l2.1-6.8L3 8.8h6.8L12 2z" />,
  alert: (
    <>
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M12 19h3a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
};

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

const shareCoreCategories = new Set<GearCategory>([
  "shoes",
  "shellJacket",
  "backpack",
  "pole",
  "tent",
  "sleepingBag",
  "mat",
  "stove",
  "fishingRod",
  "fishingLine",
  "cooler",
  "skiBoard",
  "skiBinding",
  "skiBoots",
  "skiSuit",
  "goggles",
  "chair",
  "power",
  "firstAid",
  "vehicleTool",
  "repair",
  "tableChair",
]);

const shareMustShowCategories = new Set<GearCategory>([
  "skiBoard",
  "helmet",
  "goggles",
  "fishingRod",
  "tent",
  "sleepingBag",
  "shoes",
  "power",
  "firstAid",
  "vehicleTool",
]);

const shareSafetyCategories = new Set<GearCategory>([
  "firstAid",
  "headlamp",
  "lighting",
  "helmet",
  "gloves",
  "raincoat",
  "dryBag",
  "sunglasses",
  "vehicleTool",
  "repair",
]);

const shareLowSignalCategories = new Set<GearCategory>([
  "water",
  "food",
  "warmPatch",
  "sunscreen",
  "electrolyte",
  "towel",
  "consumable",
]);

const roadTripPriorityCategories = new Set<GearCategory>(["power", "firstAid", "vehicleTool", "cooler", "tableChair", "repair"]);

const premiumShareTitleByTier: Record<GearTier, string> = {
  entry: "Entry Setup",
  mid: "Mid Outdoor Setup",
  premium: "Pro Expedition Setup",
};

function getShareRiskLevel(risks: RiskBlock[], weather: Weather, tripDays: TripDays, language: Language) {
  const riskScore =
    risks.length +
    (weather === "雨天" ? 2 : 0) +
    (weather === "寒冷" || weather === "炎热" ? 1 : 0) +
    (tripDays === "4天以上" ? 1 : 0);

  if (riskScore >= 5) {
    return language === "zh" ? "高风险" : "High";
  }

  if (riskScore >= 3) {
    return language === "zh" ? "中等风险" : "Elevated";
  }

  return language === "zh" ? "标准风险" : "Standard";
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function getShareProductScore(product: Product, activity?: Activity) {
  const normalizedText = `${product.name} ${product.nameEn ?? ""} ${product.category} ${product.categoryEn ?? ""}`.toLowerCase();
  const namePenalty = /patch|disposable|water|food|towel|snack|bar|heat pack|暖贴|贴|饮用水|食物|毛巾|能量/.test(
    normalizedText,
  )
    ? 14000
    : 0;
  const priorityScore = product.priority === "core" ? 14000 : product.priority === "important" ? 6500 : 0;
  const mustShowScore = shareMustShowCategories.has(product.gearCategory) ? 9000 : 0;
  const categoryScore = shareCoreCategories.has(product.gearCategory)
    ? 5200
    : shareSafetyCategories.has(product.gearCategory)
      ? 2600
      : 0;
  const activityScore = activity === "自驾游" && roadTripPriorityCategories.has(product.gearCategory) ? 18000 : 0;
  const consumablePenalty = product.gearType === "consumable" || shareLowSignalCategories.has(product.gearCategory) ? 24000 : 0;
  const budgetWeightScore = product.budgetWeight === "high" ? 1200 : product.budgetWeight === "medium" ? 500 : 0;

  return activityScore + mustShowScore + priorityScore + categoryScore + budgetWeightScore + product.subtotal - consumablePenalty - namePenalty;
}

function getShareGearHighlights(products: Product[], activity?: Activity) {
  const dedupedByName = Array.from(
    products
      .reduce((map, product) => {
        const key = (product.nameEn ?? product.name).trim().toLowerCase();
        const current = map.get(key);

        if (!current || getShareProductScore(product, activity) > getShareProductScore(current, activity)) {
          map.set(key, product);
        }

        return map;
      }, new Map<string, Product>())
      .values(),
  );
  const sortedProducts = [...dedupedByName].sort((a, b) => getShareProductScore(b, activity) - getShareProductScore(a, activity));
  const primaryProducts = sortedProducts.filter(
    (product) =>
      product.priority === "core" ||
      shareMustShowCategories.has(product.gearCategory) ||
      shareCoreCategories.has(product.gearCategory),
  );
  const secondaryProducts = sortedProducts.filter((product) => !primaryProducts.includes(product));
  const highlights = [...primaryProducts, ...secondaryProducts].slice(0, 5);

  return highlights.length >= 4 ? highlights : sortedProducts.slice(0, Math.min(5, sortedProducts.length));
}

function getShareRecommendationReason(activity: Activity, tripDays: TripDays, peopleCount: number, language: Language) {
  if (language === "zh") {
    if (activity === "自驾游") return `适合 ${peopleCount} 人${tripDays}轻量化自驾与营地活动。`;
    if (activity === "沙漠徒步") return `适合高温、强日照和补水压力更高的${tripDays}路线。`;
    if (activity === "露营" || activity === "冬季露营" || activity === "海边露营") return `围绕睡眠、烹饪和营地安全构建的 ${peopleCount} 人营地方案。`;
    if (activity === "滑雪" || activity === "单板滑雪") return `优先覆盖防护、保暖和雪场核心装备的滑雪日方案。`;
    if (activity === "钓鱼") return `适合湖边等待、收纳和保温需求兼顾的钓鱼装备组合。`;
    if (activity === "皮划艇") return `兼顾防水收纳、防晒和水上安全的皮划艇方案。`;
    if (activity === "攀岩") return `突出头部防护、抓握和路线安全的攀岩装备组合。`;
    return `适合 ${peopleCount} 人${tripDays}户外出行的核心装备组合。`;
  }

  if (activity === "自驾游") return `Built for ${peopleCount} people on a ${tripDays} road trip with camp-ready essentials.`;
  if (activity === "沙漠徒步") return `Prepared for heat, sun exposure, hydration, and long exposed desert routes.`;
  if (activity === "露营" || activity === "冬季露营" || activity === "海边露营") return `A camp-ready setup built around sleep, cooking, comfort, and safety.`;
  if (activity === "滑雪" || activity === "单板滑雪") return `A snow-day setup focused on protection, warmth, and resort essentials.`;
  if (activity === "钓鱼") return `A lake fishing kit balancing tackle, cooling, shade, and waiting comfort.`;
  if (activity === "皮划艇") return `A kayaking setup focused on dry storage, sun protection, and on-water safety.`;
  if (activity === "攀岩") return `A climbing kit focused on head protection, grip, and route safety.`;
  return `A practical core gear setup for ${peopleCount} people and a ${tripDays} outdoor plan.`;
}

function getShareFeatureTags(products: Product[], weather: Weather, tripDays: TripDays, language: Language) {
  const tags = new Set<string>();
  const hasWaterproof = products.some((product) => product.tags.includes("waterproof") || product.weather.includes("雨天"));
  const hasLightweight = products.some((product) => product.tags.includes("lightweight") || product.gearCategory === "backpack");
  const hasWinter = weather === "寒冷" || products.some((product) => product.tags.includes("winter"));
  const hasSafety = products.some((product) => product.priority === "core" || shareSafetyCategories.has(product.gearCategory));
  const isLongTrip = tripDays === "4天以上";

  if (language === "zh") {
    if (hasWaterproof) tags.add("防水");
    if (hasLightweight) tags.add("轻量化");
    if (hasWinter) tags.add("抗寒");
    if (hasSafety) tags.add("安全优先");
    if (isLongTrip) tags.add("长线准备");
    if (tags.size < 3) tags.add("耐用");
  } else {
    if (hasWaterproof) tags.add("Waterproof");
    if (hasLightweight) tags.add("Lightweight");
    if (hasWinter) tags.add("Cold Resistant");
    if (hasSafety) tags.add("Safety Focused");
    if (isLongTrip) tags.add("Long Trip Ready");
    if (tags.size < 3) tags.add("Durable");
  }

  return [...tags].slice(0, 5);
}

export default function Home() {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [showResult, setShowResult] = useState(false);
  const [savePlanStatus, setSavePlanStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
  const [lastSavedPlanId, setLastSavedPlanId] = useState<string | null>(null);
  const [isGeneratingShareImage, setIsGeneratingShareImage] = useState(false);
  const [form, setForm] = useState<FormState>({
    activity: "露营",
    tripDays: "1天",
    weather: "晴天",
    peopleCount: 1,
    budget: 5000,
  });

  const gearList = useMemo(
    () => buildGearList(form.activity, form.tripDays, form.weather, form.peopleCount, form.budget),
    [form.activity, form.tripDays, form.weather, form.peopleCount, form.budget],
  );
  const productPlan = useMemo(
    () => getProductPlan(form.activity, form.budget, form.peopleCount, form.tripDays, form.weather),
    [form.activity, form.budget, form.peopleCount, form.tripDays, form.weather],
  );
  const gearTier = productPlan.gearTier ?? getGearTier(form.budget);
  const gearTierMeta = getGearTierMeta(gearTier, language);
  const gearTierStyle = getGearTierStyle(gearTier);
  const hasMoreGear = gearList.length > 6;
  const risks = useMemo(
    () => getRiskBlocks(form.activity, form.weather, form.tripDays),
    [form.activity, form.weather, form.tripDays],
  );
  const insightReport = useMemo(
    () => getOutdoorInsights(form.activity, form.weather, form.tripDays, form.peopleCount, form.budget),
    [form.activity, form.weather, form.tripDays, form.peopleCount, form.budget],
  );
  const localizedInsightReport = useMemo(
    () =>
      localizeInsightReport(insightReport, language, {
        activity: form.activity,
        weather: form.weather,
        tripDays: form.tripDays,
        peopleCount: form.peopleCount,
        budget: form.budget,
      }),
    [insightReport, language, form.activity, form.weather, form.tripDays, form.peopleCount, form.budget],
  );
  const recommendationAnalysis = useMemo(
    () =>
      buildRecommendationAnalysis({
        activity: form.activity,
        weather: form.weather,
        tripDays: form.tripDays,
        peopleCount: form.peopleCount,
        language,
      }),
    [form.activity, form.weather, form.tripDays, form.peopleCount, language],
  );
  const t = translations[language];
  const formatMoney = (value: number) => formatLocalizedCurrency(value, language);
  const displayValue = (value: string) => localizeValue(value, language);
  const shareRiskLevel = getShareRiskLevel(risks, form.weather, form.tripDays, language);
  const shareGearHighlights = useMemo(() => getShareGearHighlights(productPlan.selectedProducts, form.activity), [productPlan.selectedProducts, form.activity]);
  const shareFeatureTags = useMemo(
    () => getShareFeatureTags(productPlan.selectedProducts, form.weather, form.tripDays, language),
    [productPlan.selectedProducts, form.weather, form.tripDays, language],
  );
  const shareRecommendationReason = getShareRecommendationReason(form.activity, form.tripDays, form.peopleCount, language);
  const shareRemainingBudget = form.budget - productPlan.totalPrice;
  const shareCardBackground = getShareCardBackground(form.activity).image;
  const shareTierTitle = premiumShareTitleByTier[gearTier];
  const shareLabels =
    language === "zh"
      ? {
          activity: "活动",
          budget: "预算",
          category: "分类",
          features: "核心特点",
          gearHighlights: "推荐装备亮点",
          gearTier: "装备等级",
          quantity: "数量",
          reason: "推荐理由",
          remaining: "预算剩余",
          people: "人数",
          risk: "风险等级",
          slogan: "Plan smarter. Pack lighter. Go further.",
          subtotal: "小计",
          total: "推荐总价",
          tripDays: "行程",
          unitPrice: "单价",
          weather: "天气",
        }
      : {
          activity: "Activity",
          budget: "Budget",
          category: "Category",
          features: "Core Features",
          gearHighlights: "Recommended Gear Highlights",
          gearTier: "Gear Tier",
          quantity: "Qty",
          reason: "Why This Setup",
          remaining: "Budget Left",
          people: "People",
          risk: "Risk level",
          slogan: "Plan smarter. Pack lighter. Go further.",
          subtotal: "Subtotal",
          total: "Recommended total",
          tripDays: "Trip days",
          unitPrice: "Unit price",
          weather: "Weather",
        };

  function updateField<K extends keyof FormState>(name: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function loadSavedPlans() {
    try {
      const response = await fetch("/api/plans");

      if (!response.ok) {
        throw new Error(`Load plans failed with status ${response.status}`);
      }

      const result = (await response.json()) as PlansResponse;
      setSavedPlans(result.plans ?? []);
    } catch (error) {
      console.error("Failed to load saved plans:", error);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/plans", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Load plans failed with status ${response.status}`);
        }

        return response.json() as Promise<PlansResponse>;
      })
      .then((result) => {
        setSavedPlans(result.plans ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load saved plans:", error);
      });

    return () => controller.abort();
  }, []);

  async function handleGenerate() {
    setShowResult(true);

    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "calculator",
          data: {
            activity: form.activity,
            days: form.tripDays,
            weather: form.weather,
            people: form.peopleCount,
            budget: form.budget,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to log calculator usage:", error);
    }
  }

  async function handleSavePlan() {
    setSavePlanStatus("saving");
    setLastSavedPlanId(null);

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity: form.activity,
          tripDays: form.tripDays,
          weather: form.weather,
          peopleCount: form.peopleCount,
          budget: form.budget,
          gearList,
          recommendedProducts: productPlan.selectedProducts,
          risks,
          totalPrice: productPlan.totalPrice,
          gearTier,
        }),
      });

      if (!response.ok) {
        throw new Error(`Save plan failed with status ${response.status}`);
      }

      const result = (await response.json()) as SavePlanResponse;
      const planId = result.planId ?? result.plan?._id ?? null;

      setLastSavedPlanId(planId);
      setSavePlanStatus("saved");
      await loadSavedPlans();
    } catch (error) {
      console.error("Failed to save plan:", error);
      setSavePlanStatus("idle");
    }
  }

  async function logUserBehavior(type: string, data: Record<string, unknown>) {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      });
    } catch (error) {
      console.error(`Failed to log ${type}:`, error);
    }
  }

  function handleLoadPlan(plan: SavedPlan) {
    setForm({
      activity: plan.activity,
      tripDays: plan.tripDays,
      weather: plan.weather,
      peopleCount: plan.peopleCount,
      budget: plan.budget,
    });
    setShowResult(true);
    void logUserBehavior("reload_plan", {
      planId: plan._id,
      activity: plan.activity,
      weather: plan.weather,
      tripDays: plan.tripDays,
      peopleCount: plan.peopleCount,
      budget: plan.budget,
    });
  }

  async function handleDeletePlan(planId: string) {
    setDeletingPlanId(planId);

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete plan failed with status ${response.status}`);
      }

      setSavedPlans((current) => current.filter((plan) => plan._id !== planId));
    } catch (error) {
      console.error("Failed to delete saved plan:", error);
    } finally {
      setDeletingPlanId(null);
    }
  }

  async function handleCopyShareLink(planId: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/plan/${planId}`);
      await logUserBehavior("share_link_copy", {
        planId,
        activity: form.activity,
        weather: form.weather,
        tripDays: form.tripDays,
        peopleCount: form.peopleCount,
        budget: form.budget,
        language,
      });
      setCopiedPlanId(planId);
      window.setTimeout(() => setCopiedPlanId((current) => (current === planId ? null : current)), 1600);
    } catch (error) {
      console.error("Failed to copy share link:", error);
    }
  }

  function handleViewSavedPlan(planId: string) {
    const langParam = language === "zh" ? "?lang=zh" : "";
    window.open(`/plan/${planId}${langParam}`, "_blank");
  }

  async function handleGenerateShareImage() {
    if (!exportRef.current) {
      return;
    }

    setIsGeneratingShareImage(true);

    try {
      const exportElement = exportRef.current;
      const backgroundUrl = getShareCardBackground(form.activity).image;

      console.log("share-card-background", form.activity, backgroundUrl);

      exportElement.style.display = "block";
      await preloadImage(backgroundUrl);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const canvas = await html2canvas(exportElement, {
        backgroundColor: null,
        scale: Math.max(2, Math.min(3, window.devicePixelRatio || 2)),
        useCORS: true,
      });
      const link = document.createElement("a");

      link.download = "outdoor-ai-share-card.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      await logUserBehavior("share_image", {
        activity: form.activity,
        weather: form.weather,
        tripDays: form.tripDays,
        peopleCount: form.peopleCount,
        budget: form.budget,
        totalPrice: productPlan.totalPrice,
        language,
      });
    } catch (error) {
      console.error("Failed to generate share image:", error);
    } finally {
      if (exportRef.current) {
        exportRef.current.style.display = "none";
      }
      setIsGeneratingShareImage(false);
    }
  }

  async function handleProductClick(product: Product) {
    const clickedUrl = product.affiliateUrl || product.sourceUrl || product.buyUrl || product.productUrl || productUrl;
    const merchant = product.merchant || "Amazon";

    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "product_click",
          data: {
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            merchant,
            affiliateProvider: product.affiliateProvider,
            clickedUrl,
            activity: form.activity,
            budget: form.budget,
            timestamp: new Date().toISOString(),
            unitPrice: product.unitPrice,
            quantity: product.quantity,
            unit: product.unit,
            subtotal: product.subtotal,
            days: form.tripDays,
            weather: form.weather,
            people: form.peopleCount,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to log product click:", error);
    } finally {
      window.open(clickedUrl, "_blank");
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <div className="fixed right-4 top-4 z-50 rounded-full border border-white/70 bg-white/90 p-1 text-sm font-bold shadow-lg shadow-slate-900/10 backdrop-blur">
        <button
          className={`rounded-full px-3 py-1.5 transition ${
            language === "en" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setLanguage("en")}
          type="button"
        >
          {translations.en.languageEnglish}
        </button>
        <button
          className={`rounded-full px-3 py-1.5 transition ${
            language === "zh" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setLanguage("zh")}
          type="button"
        >
          {translations.zh.languageChinese}
        </button>
      </div>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.26), rgba(22, 80, 45, 0.12), rgba(255, 255, 255, 0.28)), url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=85")',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,48,31,0.42),rgba(12,48,31,0.08)_50%,rgba(255,255,255,0.12)),linear-gradient(to_bottom,rgba(0,0,0,0.22),rgba(0,0,0,0.06)_45%,rgba(255,255,255,0.18))]"
        />

        <div className="mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-6 py-16">
          <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            Outdoor Gear Planner
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-white drop-shadow-sm sm:text-6xl lg:text-7xl">
            <span style={{ textShadow: "0 4px 22px rgba(0, 0, 0, 0.42)" }}>{t.heroTitle}</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            {t.heroDescription}
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-6xl px-6">
        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <div className="grid gap-5 lg:grid-cols-5">
            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="activity" />
                {t.activityType}
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.activity}
                onChange={(event) => updateField("activity", event.target.value as Activity)}
              >
                {activityOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="calendar" />
                {t.tripDays}
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.tripDays}
                onChange={(event) => updateField("tripDays", event.target.value as TripDays)}
              >
                {tripDayOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="weather" />
                {t.weather}
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.weather}
                onChange={(event) => updateField("weather", event.target.value as Weather)}
              >
                {weatherOptions.map((option) => (
                  <option key={option} value={option}>
                    {displayValue(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="people" />
                {t.peopleCount}
              </span>
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                max={20}
                min={1}
                type="number"
                value={form.peopleCount}
                onChange={(event) => updateField("peopleCount", Math.max(1, Number(event.target.value) || 1))}
              />
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="budget" />
                {t.budget}
              </span>
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                min={0}
                step={50}
                type="number"
                value={form.budget}
                onChange={(event) => updateField("budget", Math.max(0, Number(event.target.value) || 0))}
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {t.budgetHint}
              </p>
              {form.peopleCount > 1 && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {t.groupBudgetHint.replace("{count}", String(form.peopleCount))}
                </p>
              )}
            </label>
          </div>

          <div className="mt-7 flex justify-center">
            <button
              className="inline-flex h-13 min-w-64 items-center justify-center rounded-xl bg-emerald-700 px-8 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              onClick={handleGenerate}
              type="button"
            >
              {t.generateGearList}
            </button>
          </div>
        </div>
      </section>

      {showResult && (
        <>
        <section className="mx-auto max-w-6xl px-6 pt-8">
          <div className="rounded-2xl border border-white bg-white/94 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-emerald-950/10 backdrop-blur">
            <div className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-stretch">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">
                  AI Outdoor Insights
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{t.aiPanelTitle}</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-4 py-2 text-sm font-black shadow-sm ${gearTierStyle.badgeClass}`}>
                    {gearTierMeta.badge}
                  </span>
                  <span className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white shadow-sm">
                    {localizedInsightReport.profile}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                    {localizedInsightReport.strategy}
                  </span>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{localizedInsightReport.summary}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{gearTierMeta.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm">
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-xs font-bold text-slate-500">{t.activity}</p>
                  <p className="mt-1 font-black text-slate-950">{displayValue(form.activity)}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-xs font-bold text-slate-500">{t.weather}</p>
                  <p className="mt-1 font-black text-slate-950">{displayValue(form.weather)}</p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-xs font-bold text-slate-500">{t.trip}</p>
                  <p className="mt-1 font-black text-slate-950">
                    {displayValue(form.tripDays)} · {formatPeople(form.peopleCount, language)}
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2">
                  <p className="text-xs font-bold text-slate-500">{t.exportBudget}</p>
                  <p className="mt-1 font-black text-slate-950">{formatMoney(form.budget)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {localizedInsightReport.insights.map((insight) => (
                <article
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  key={insight.type}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Icon className="h-4 w-4" name={insightIconNames[insight.type]} />
                    </span>
                    <h3 className="font-black text-slate-950">{insight.title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{insight.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-6">
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-slate-950/88 p-5 text-white shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-200/10 backdrop-blur-2xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-lime-200">AI Recommendation Analysis</p>
                <h2 className="mt-1 text-2xl font-black">
                  {language === "zh" ? "为什么推荐这些装备" : "Why these gear choices make sense"}
                </h2>
              </div>
              <span className="rounded-full border border-amber-200/40 bg-amber-300/16 px-4 py-2 text-sm font-black text-amber-100">
                {language === "zh" ? "风险高亮" : "Risk-aware reasoning"}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {recommendationAnalysis.map((item) => (
                <article
                  className={`rounded-xl border p-4 shadow-sm backdrop-blur ${
                    item.tone === "high"
                      ? "border-amber-300/45 bg-amber-300/12"
                      : item.tone === "elevated"
                        ? "border-lime-200/35 bg-lime-200/10"
                        : "border-white/18 bg-white/10"
                  }`}
                  key={item.title}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        item.tone === "high" ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" name={item.icon} />
                    </span>
                    <h3 className="font-black text-white">{item.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {item.bullets.map((bullet) => (
                      <li className="flex gap-2 text-sm leading-6 text-white/78" key={bullet}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-200" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-3"
          data-share-capture="result"
        >
          <article
            className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur"
            data-share-card
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                <Icon name="pack" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-950">{t.requiredGear}</h2>
                <p className="text-sm text-slate-500">
                  {displayValue(form.activity)} · {displayValue(form.tripDays)} · {formatPeople(form.peopleCount, language)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{t.requiredGearNote}</p>
              </div>
            </div>
            {hasMoreGear && (
              <p className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                {t.scrollMore}
              </p>
            )}
            <div className="min-h-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 p-2 pb-4">
              <ul className="max-h-[430px] space-y-1 overflow-y-auto overflow-x-hidden pr-1" data-share-scroll>
                {gearList.map((item, index) => (
                  <li
                    className="flex min-h-[72px] items-center gap-3 rounded-lg bg-white/70 px-3 py-2"
                    key={`${item.name}-${item.quantity}-${index}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Icon className="h-3.5 w-3.5" name="check" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-950">{localizeGearName(item, language)}</p>
                      <p className="mt-0.5 text-sm leading-snug text-slate-500">
                        {localizeGearReason(item, language)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                      {formatQuantity(item.quantity, language)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article
            className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur"
            data-share-card
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100 text-lime-700 shadow-sm">
                <Icon name="spark" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-950">{t.recommendedProducts}</h2>
                <p className="text-sm text-slate-500">{t.productPlan}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {t.totalBudget}：{formatMoney(form.budget)} · {t.recommendedTotal}：
                  {formatMoney(productPlan.totalPrice)} ·{" "}
                  {productPlan.remainingBudget < 0 ? t.slightlyOver : t.remainingBudget}：
                  {formatMoney(Math.abs(productPlan.remainingBudget))}
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-100 px-2 py-3">
                <p className="font-semibold text-slate-500">{t.totalBudget}</p>
                <p className="mt-1 font-black text-slate-950">{formatMoney(form.budget)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-2 py-3">
                <p className="font-semibold text-emerald-700">{t.recommendedTotal}</p>
                <p className="mt-1 font-black text-emerald-800">{formatMoney(productPlan.totalPrice)}</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-2 py-3">
                <p className="font-semibold text-amber-700">
                  {productPlan.remainingBudget < 0 ? t.slightlyOver : t.remainingBudget}
                </p>
                <p className="mt-1 font-black text-amber-800">
                  {formatMoney(Math.abs(productPlan.remainingBudget))}
                </p>
              </div>
            </div>

            <div className="mb-4 grid gap-2 sm:grid-cols-2" data-hide-in-share>
              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={savePlanStatus === "saving"}
                onClick={() => void handleSavePlan()}
                type="button"
              >
                {savePlanStatus === "saved" ? t.saved : t.savePlan}
              </button>
              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-sm font-bold text-lime-800 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isGeneratingShareImage}
                onClick={() => void handleGenerateShareImage()}
                type="button"
              >
                {isGeneratingShareImage && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-lime-800/25 border-t-lime-800" />
                )}
                {isGeneratingShareImage ? t.generating : t.generateShareImage}
              </button>
              {lastSavedPlanId && (
                <>
                  <button
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                    onClick={() => handleViewSavedPlan(lastSavedPlanId)}
                    type="button"
                  >
                    {t.viewSavedPlan}
                  </button>
                  <button
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-sm font-bold text-lime-800 transition hover:bg-lime-100"
                    onClick={() => void handleCopyShareLink(lastSavedPlanId)}
                    type="button"
                  >
                    {copiedPlanId === lastSavedPlanId ? t.copied : t.copyShareLink}
                  </button>
                </>
              )}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1" data-share-scroll>
              {productPlan.selectedProducts.map((product, index) => (
                <div
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  key={`${product.name}-${product.quantity}-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
                      <Image
                        alt={localizeProductName(product, language)}
                        className="object-cover"
                        fill
                        sizes="80px"
                        src={product.image}
                      />
                      {product.imageStatus !== "matched" && (
                        <span className="absolute bottom-1 left-1 right-1 rounded-md bg-slate-950/78 px-1.5 py-1 text-center text-[10px] font-black text-white">
                          {language === "zh" ? "图片待确认" : "Image pending"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-base font-black leading-6 text-slate-950 break-words">
                            {localizeProductName(product, language)}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {localizeProductCategory(product, language)}
                          </p>
                        </div>
                        <p className="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                          {formatMoney(product.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
                      <p className="font-bold text-slate-500">{t.unitPrice}</p>
                      <p className="mt-1 break-words font-black text-slate-900">
                        {formatMoney(product.unitPrice)} / {formatUnit(product.unit, language)}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
                      <p className="font-bold text-slate-500">{t.quantity}</p>
                      <p className="mt-1 break-words font-black text-slate-900">
                        {product.quantity}
                        {formatUnit(product.unit, language)}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                      <p className="font-bold text-emerald-700">{t.subtotal}</p>
                      <p className="mt-1 break-words font-black text-emerald-800">{formatMoney(product.subtotal)}</p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                    {localizeProductReason(product, language)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {language === "zh"
                      ? `来自 ${product.merchant || "Amazon"}`
                      : `Available on ${product.merchant || "Amazon"}`}
                    {" · "}
                    {language === "zh" ? "当前为搜索链接，具体商品以后人工确认。" : "Search result link, exact product may vary."}
                  </p>

                  <button
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                    onClick={() => void handleProductClick(product)}
                    type="button"
                  >
                    {t.viewProduct}
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article
            className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-amber-200/80 bg-amber-50/92 p-5 shadow-lg shadow-amber-950/5 ring-1 ring-white/70 backdrop-blur"
            data-share-card
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-200 text-amber-800 shadow-sm">
                <Icon name="alert" />
              </span>
              <div>
                <h2 className="text-xl font-black text-amber-950">{t.riskTips}</h2>
                <p className="text-sm text-amber-700">
                  {displayValue(form.activity)} · {displayValue(form.weather)} · {displayValue(form.tripDays)}
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-share-scroll>
              {risks.map((risk, index) => (
                <div
                  className="rounded-xl border border-amber-200/70 bg-white/78 p-4 shadow-sm"
                  key={`${risk.title}-${index}`}
                >
                  <div className="mb-2 flex items-center gap-2 font-bold text-amber-950">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Icon className="h-4 w-4" name={risk.icon} />
                    </span>
                    {localizeRiskTitle(risk, language)}
                  </div>
                  <p className="text-sm leading-6 text-amber-900/80">{localizeRiskText(risk, language)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <div
          ref={exportRef}
          style={{
            background: "#0f1f19",
            backgroundImage: `linear-gradient(115deg, rgba(4, 11, 18, 0.96) 0%, rgba(4, 11, 18, 0.82) 44%, rgba(4, 11, 18, 0.46) 100%), linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.08)), url("${shareCardBackground}")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            boxShadow: "none",
            color: "#ffffff",
            display: "none",
            fontFamily:
              'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
            height: "630px",
            left: "-9999px",
            overflow: "hidden",
            padding: "48px",
            position: "fixed",
            top: "0",
            width: "1200px",
            zIndex: "-1",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              height: "100%",
            }}
          >
            <header
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ alignItems: "center", display: "flex", gap: "14px" }}>
                <div
                  style={{
                    alignItems: "center",
                    background: "rgba(255, 255, 255, 0.16)",
                    border: "1px solid rgba(255, 255, 255, 0.34)",
                    borderRadius: "18px",
                    display: "flex",
                    height: "56px",
                    justifyContent: "center",
                    width: "56px",
                  }}
                >
                  <span style={{ color: "#d9f99d", fontSize: "28px", fontWeight: 900 }}>OA</span>
                </div>
                <div>
                  <p style={{ color: "#ffffff", fontSize: "20px", fontWeight: 900, margin: 0 }}>Outdoor AI</p>
                  <p style={{ color: "rgba(255, 255, 255, 0.74)", fontSize: "14px", fontWeight: 700, margin: "4px 0 0" }}>
                    {shareLabels.slogan}
                  </p>
                </div>
              </div>

              <div style={{ alignItems: "center", display: "flex", gap: "10px" }}>
                {[
                  `${shareLabels.gearTier}: ${gearTierMeta.shareTitle}`,
                  `${shareLabels.activity}: ${displayValue(form.activity)}`,
                  `${shareLabels.weather}: ${displayValue(form.weather)}`,
                  `${shareLabels.tripDays}: ${displayValue(form.tripDays)}`,
                  `${shareLabels.people}: ${formatPeople(form.peopleCount, language)}`,
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(255, 255, 255, 0.16)",
                      border: "1px solid rgba(255, 255, 255, 0.26)",
                      borderRadius: "999px",
                      color: "rgba(255, 255, 255, 0.88)",
                      fontSize: "13px",
                      fontWeight: 900,
                      padding: "9px 13px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  style={{
                    background: "rgba(217, 119, 6, 0.82)",
                    border: "1px solid rgba(253, 230, 138, 0.52)",
                    borderRadius: "999px",
                    color: "#d9f99d",
                    fontSize: "13px",
                    fontWeight: 900,
                    padding: "9px 13px",
                  }}
                >
                  {shareLabels.risk}: {shareRiskLevel}
                </span>
              </div>
            </header>

            <div style={{ display: "grid", flex: 1, gap: "24px", gridTemplateColumns: "1.38fr 0.62fr", minHeight: 0 }}>
              <section
                style={{
                  background: "rgba(8, 13, 20, 0.76)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "34px",
                  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.42)",
                  padding: "28px",
                }}
              >
                <p
                  style={{
                    color: "#bbf7d0",
                    fontSize: "14px",
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    margin: "0 0 10px",
                    textTransform: "uppercase",
                  }}
                >
                  {t.shareImageTitle}
                </p>
                <div style={{ alignItems: "end", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <h2 style={{ color: "#ffffff", fontSize: "44px", fontWeight: 900, lineHeight: 1, margin: 0 }}>
                    {shareLabels.gearHighlights}
                  </h2>
                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid rgba(167, 243, 208, 0.95)",
                      borderRadius: "20px",
                      color: "#047857",
                      minWidth: "188px",
                      padding: "13px 16px",
                      textAlign: "right",
                    }}
                  >
                    <p style={{ color: "#047857", fontSize: "12px", fontWeight: 900, margin: "0 0 5px" }}>
                      {shareLabels.total}
                    </p>
                    <p style={{ color: "#064e3b", fontSize: "28px", fontWeight: 900, lineHeight: 1, margin: 0 }}>
                      {formatMoney(productPlan.totalPrice)}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {shareGearHighlights.map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      style={{
                        alignItems: "center",
                        background: "rgba(255, 255, 255, 0.88)",
                        border: "1px solid rgba(255, 255, 255, 0.72)",
                        borderRadius: "18px",
                        color: "#0f172a",
                        display: "grid",
                        gap: "14px",
                        gridTemplateColumns: "38px 1.05fr 0.82fr 72px 106px 114px",
                        minHeight: "64px",
                        padding: "10px 14px",
                      }}
                    >
                      <span
                        style={{
                          alignItems: "center",
                          background: index === 0 ? "#064e3b" : "#10b981",
                          borderRadius: "14px",
                          color: "#ffffff",
                          display: "flex",
                          fontSize: "17px",
                          fontWeight: 900,
                          height: "40px",
                          justifyContent: "center",
                          width: "40px",
                        }}
                      >
                        {index + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "#0f172a", fontSize: "19px", fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
                          {localizeProductName(product, language)}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 800, margin: "5px 0 0" }}>
                          {product.brand}
                        </p>
                      </div>
                      <p style={{ color: "#334155", fontSize: "13px", fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
                        {shareLabels.category}: {localizeProductCategory(product, language)}
                      </p>
                      <p style={{ color: "#475569", fontSize: "16px", fontWeight: 900, margin: 0, textAlign: "right" }}>
                        {shareLabels.quantity} x{product.quantity}
                      </p>
                      <p style={{ color: "#475569", fontSize: "15px", fontWeight: 900, margin: 0, textAlign: "right" }}>
                        {formatMoney(product.unitPrice)}
                      </p>
                      <p style={{ color: "#047857", fontSize: "20px", fontWeight: 900, margin: 0, textAlign: "right" }}>
                        {formatMoney(product.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <aside
                style={{
                  background: "rgba(6, 12, 20, 0.82)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "34px",
                  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.24)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  padding: "26px",
                }}
              >
                <div>
                  <p style={{ color: "#bbf7d0", fontSize: "14px", fontWeight: 900, margin: "0 0 8px" }}>
                    {shareLabels.gearTier}
                  </p>
                  <p style={{ color: gearTierStyle.shareColor, fontSize: "31px", fontWeight: 900, lineHeight: 1, margin: 0 }}>
                    {shareTierTitle}
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.72)", fontSize: "13px", fontWeight: 800, lineHeight: 1.45, margin: "10px 0 0" }}>
                    {gearTierMeta.description}
                  </p>
                </div>

                <div>
                  <p style={{ color: "#bbf7d0", fontSize: "14px", fontWeight: 900, margin: "0 0 8px" }}>
                    {shareLabels.reason}
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.86)", fontSize: "18px", fontWeight: 900, lineHeight: 1.38, margin: 0 }}>
                    {shareRecommendationReason}
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.09)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    padding: "20px",
                  }}
                >
                  <p style={{ color: "#ffffff", fontSize: "22px", fontWeight: 900, margin: "0 0 18px" }}>
                    {shareLabels.features}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {shareFeatureTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(236, 253, 245, 0.92)",
                          borderRadius: "999px",
                          color: "#064e3b",
                          fontSize: "14px",
                          fontWeight: 900,
                          padding: "9px 12px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.09)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    display: "grid",
                    gap: "14px",
                    padding: "20px",
                  }}
                >
                  {[
                    [shareLabels.total, formatMoney(productPlan.totalPrice)],
                    [shareLabels.remaining, formatMoney(shareRemainingBudget)],
                  ].map(([label, value]) => (
                    <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                      <span style={{ color: "rgba(255, 255, 255, 0.72)", fontSize: "14px", fontWeight: 900 }}>
                        {label}
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "19px", fontWeight: 900 }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.92), rgba(132, 204, 22, 0.9))",
                    borderRadius: "24px",
                    color: "#052e1c",
                    marginTop: "auto",
                    padding: "20px",
                  }}
                >
                  <p style={{ fontSize: "13px", fontWeight: 900, margin: "0 0 8px", opacity: 0.75 }}>
                    {shareLabels.total}
                  </p>
                  <p style={{ fontSize: "38px", fontWeight: 900, lineHeight: 1, margin: 0 }}>
                    {formatMoney(productPlan.totalPrice)}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 900, margin: "10px 0 0", opacity: 0.78 }}>
                  {shareRiskLevel}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                <Icon name="calendar" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-950">{t.myPlans}</h2>
                <p className="text-sm text-slate-500">{t.recentPlans}</p>
              </div>
            </div>

            {savedPlans.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                {t.noSavedPlans}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {savedPlans.map((plan) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                    key={plan._id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">{localizeValue(plan.activity, language)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {localizeValue(plan.weather, language)} · {localizeValue(plan.tripDays, language)} ·{" "}
                          {formatPeople(plan.peopleCount, language)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        {formatMoney(plan.totalPrice)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>{t.exportBudget}：{formatMoney(plan.budget)}</span>
                      <span>{t.savedAt}：{formatLocalizedSavedTime(plan.createdAt, language)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                        onClick={() => handleLoadPlan(plan)}
                        type="button"
                      >
                        {t.reload}
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={deletingPlanId === plan._id}
                        onClick={() => void handleDeletePlan(plan._id)}
                        type="button"
                      >
                        {t.delete}
                      </button>
                      <button
                        className="col-span-2 inline-flex h-9 items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-sm font-bold text-lime-800 transition hover:bg-lime-100"
                        onClick={() => void handleCopyShareLink(plan._id)}
                        type="button"
                      >
                        {copiedPlanId === plan._id ? t.copied : t.copyShareLink}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        </>
      )}
    </main>
  );
}


