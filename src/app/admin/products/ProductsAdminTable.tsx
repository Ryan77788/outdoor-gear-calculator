"use client";

import { Fragment, useMemo, useState } from "react";
import {
  activityOptions,
  type ProductActivity,
  type ProductExpertRecommendation,
  type ProductLinkType,
  type ProductReviewStatus,
  type ProductTemplate,
} from "@/data/products";
import {
  applyProductOverrides,
  buildCustomProductsFromOverrides,
  type ProductBudgetTier,
  type ProductOverride,
  type ProductOverrideInput,
} from "@/lib/product-overrides";

export type AdminProduct = ProductTemplate & {
  activityLabel: string;
  reviewNote?: string;
  budgetTier?: ProductBudgetTier;
  isHidden?: boolean;
  isDeleted?: boolean;
  imageReviewed?: boolean;
  isCustomProduct?: boolean;
};

type ProductFilter = "all" | ProductReviewStatus | "curated" | "hidden" | "deleted" | "missing-image" | "missing-affiliateLink";
type SortOption = "default" | "price-desc" | "price-asc" | "reviewStatus" | "merchant";

type ProductsAdminTableProps = {
  products: AdminProduct[];
  overrides: ProductOverride[];
  initialStatusFilter: ProductFilter;
};

type SaveState = {
  id: string;
  status: "saving" | "saved" | "error";
};

type BulkSaveState = "idle" | "saving" | "saved" | "error";
type ActionSaveState = SaveState;

const statusLabels: Record<ProductReviewStatus, string> = {
  "search-only": "待人工确认",
  reviewed: "已确认商品",
  "affiliate-ready": "联盟商品",
};

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "全部", value: "all" },
  { label: "待人工确认", value: "search-only" },
  { label: "已确认商品", value: "reviewed" },
  { label: "联盟商品", value: "affiliate-ready" },
  { label: "精选商品", value: "curated" },
  { label: "已隐藏商品", value: "hidden" },
  { label: "已删除商品", value: "deleted" },
  { label: "缺少图片", value: "missing-image" },
  { label: "缺少联盟链接", value: "missing-affiliateLink" },
];

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: "默认排序", value: "default" },
  { label: "价格从高到低", value: "price-desc" },
  { label: "价格从低到高", value: "price-asc" },
  { label: "按审核状态", value: "reviewStatus" },
  { label: "按商家", value: "merchant" },
];

const linkTypeOptions: ProductLinkType[] = ["product", "search"];
const reviewStatusOptions: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];
const budgetTierOptions: ProductBudgetTier[] = ["low", "mid", "high"];
const linkTypeLabels: Record<ProductLinkType, string> = {
  product: "商品链接",
  search: "搜索链接",
};
const budgetTierLabels: Record<ProductBudgetTier, string> = {
  low: "低预算",
  mid: "中预算",
  high: "高预算",
};
const recommendationFieldLabels = {
  bestFor: "适合人群",
  strengths: "商品优势",
  notIdealFor: "不适合人群",
} as const;

function formatPrice(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

function getBudgetTierFromPrice(price: number): ProductBudgetTier {
  if (price < 500) return "low";
  if (price < 1500) return "mid";
  return "high";
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value: string[] | undefined) {
  return (value ?? []).join("\n");
}

function updateRecommendationCopy(
  current: ProductExpertRecommendation | undefined,
  language: keyof ProductExpertRecommendation,
  value: string,
) {
  return {
    zh: current?.zh ?? [],
    en: current?.en ?? [],
    [language]: splitLines(value),
  };
}

function toDraft(product: AdminProduct): ProductOverrideInput {
  return {
    id: product.id,
    name: product.name,
    nameEn: product.nameEn ?? "",
    brand: product.brand,
    activity: product.activity,
    category: product.category,
    merchant: product.merchant,
    unit: product.unit,
    buyUrl: product.buyUrl,
    affiliateLink: product.affiliateLink ?? "",
    linkType: product.linkType,
    reviewStatus: product.reviewStatus,
    reviewNote: product.reviewNote ?? "",
    isCurated: product.isCurated,
    isHidden: product.isHidden,
    isDeleted: product.isDeleted,
    imageReviewed: product.imageReviewed,
    isCustomProduct: product.isCustomProduct,
    budgetTier: product.budgetTier ?? getBudgetTierFromPrice(product.price),
    price: product.price,
    bestFor: product.bestFor,
    strengths: product.strengths,
    notIdealFor: product.notIdealFor,
    image: product.image,
  };
}

function createEmptyCustomDraft(): ProductOverrideInput {
  return {
    id: "",
    name: "",
    nameEn: "",
    brand: "",
    activity: [activityOptions[0]],
    category: "",
    merchant: "",
    price: 0,
    unit: "件",
    image: "",
    buyUrl: "",
    affiliateLink: "",
    linkType: "search",
    reviewStatus: "search-only",
    budgetTier: "mid",
    isCurated: false,
    imageReviewed: false,
    isCustomProduct: true,
    bestFor: { zh: [], en: [] },
    strengths: { zh: [], en: [] },
    notIdealFor: { zh: [], en: [] },
    reviewNote: "",
  };
}

function statusClass(status: ProductReviewStatus) {
  if (status === "affiliate-ready") return "bg-emerald-50 text-emerald-800";
  if (status === "reviewed") return "bg-lime-50 text-lime-800";
  return "bg-amber-50 text-amber-800";
}

export function ProductsAdminTable({ products, overrides: initialOverrides, initialStatusFilter }: ProductsAdminTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ProductOverrideInput>>({});
  const [overrides, setOverrides] = useState<ProductOverride[]>(initialOverrides);
  const [saveState, setSaveState] = useState<SaveState | null>(null);
  const [actionSaveState, setActionSaveState] = useState<ActionSaveState | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<ProductOverrideInput>(() => createEmptyCustomDraft());
  const [createSaveState, setCreateSaveState] = useState<BulkSaveState>("idle");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>(initialStatusFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkReviewStatus, setBulkReviewStatus] = useState<ProductReviewStatus>("reviewed");
  const [bulkSaveState, setBulkSaveState] = useState<BulkSaveState>("idle");
  const productsWithCustomOverrides = useMemo(() => {
    const knownIds = new Set(products.map((product) => product.id));
    const customProducts = buildCustomProductsFromOverrides(overrides, { includeHidden: true, includeDeleted: true })
      .filter((product) => !knownIds.has(product.id))
      .map((product) => ({
        ...product,
        activityLabel: product.activity[0] ?? "自定义商品",
      })) as AdminProduct[];

    return [...products, ...customProducts];
  }, [products, overrides]);
  const displayProducts = useMemo(
    () => applyProductOverrides(productsWithCustomOverrides, overrides, { includeHidden: true, includeDeleted: true }),
    [productsWithCustomOverrides, overrides],
  );
  const stats = useMemo(
    () => {
      const deletedProducts = displayProducts.filter((product) => product.isDeleted === true);
      const hiddenProducts = displayProducts.filter((product) => product.isHidden === true && product.isDeleted !== true);
      const activeProducts = displayProducts.filter((product) => product.isHidden !== true && product.isDeleted !== true);
      const nonDeletedProducts = displayProducts.filter((product) => product.isDeleted !== true);

      return {
        total: activeProducts.length,
        searchOnly: activeProducts.filter((product) => product.reviewStatus === "search-only").length,
        reviewed: activeProducts.filter((product) => product.reviewStatus === "reviewed").length,
        affiliateReady: activeProducts.filter((product) => product.reviewStatus === "affiliate-ready").length,
        curated: activeProducts.filter((product) => product.isCurated).length,
        hidden: hiddenProducts.length,
        deleted: deletedProducts.length,
        imageReviewed: nonDeletedProducts.filter((product) => product.imageReviewed === true).length,
        imagePending: nonDeletedProducts.filter((product) => product.imageReviewed !== true).length,
        missingImage: activeProducts.filter((product) => product.imageStatus !== "matched" || !product.image.trim()).length,
        missingAffiliateLink: activeProducts.filter((product) => !product.affiliateLink?.trim()).length,
      };
    },
    [displayProducts],
  );
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = displayProducts
      .filter((product) => {
        if (statusFilter === "hidden") return product.isHidden === true && product.isDeleted !== true;
        if (statusFilter === "deleted") return product.isDeleted === true;
        if (product.isHidden || product.isDeleted) return false;
        if (statusFilter === "all") return true;
        if (statusFilter === "curated") return product.isCurated;
        if (statusFilter === "missing-image") return product.imageStatus !== "matched" || !product.image.trim();
        if (statusFilter === "missing-affiliateLink") return !product.affiliateLink?.trim();
        return product.reviewStatus === statusFilter;
      })
      .filter((product) => {
        if (!normalizedQuery) return true;

        return [
          product.name,
          product.nameEn ?? "",
          product.brand,
          product.activityLabel,
          product.merchant,
          product.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "reviewStatus") return a.reviewStatus.localeCompare(b.reviewStatus);
      if (sortBy === "merchant") return a.merchant.localeCompare(b.merchant);
      return (
        productsWithCustomOverrides.findIndex((product) => product.id === a.id) -
        productsWithCustomOverrides.findIndex((product) => product.id === b.id)
      );
    });
  }, [displayProducts, productsWithCustomOverrides, query, sortBy, statusFilter]);
  const selectedCount = selectedIds.size;
  const selectedNonDeletedCount = displayProducts.filter((product) => selectedIds.has(product.id) && product.isDeleted !== true).length;
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selectedIds.has(product.id));
  const filterCounts: Record<ProductFilter, number> = {
    all: stats.total,
    "search-only": stats.searchOnly,
    reviewed: stats.reviewed,
    "affiliate-ready": stats.affiliateReady,
    curated: stats.curated,
    hidden: stats.hidden,
    deleted: stats.deleted,
    "missing-image": stats.missingImage,
    "missing-affiliateLink": stats.missingAffiliateLink,
  };

  function goToNextSearchOnly() {
    const nextProduct = displayProducts.find(
      (product) => product.reviewStatus === "search-only" && product.isHidden !== true && product.isDeleted !== true,
    );

    if (!nextProduct) return;

    setQuery("");
    setStatusFilter("all");
    setEditingId(null);
    window.setTimeout(() => {
      document.getElementById(`product-row-${nextProduct.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  function startEdit(product: AdminProduct) {
    setEditingId((current) => (current === product.id ? null : product.id));
    setDrafts((current) => ({
      ...current,
      [product.id]: current[product.id] ?? toDraft(product),
    }));
    setSaveState(null);
  }

  function updateDraft<K extends keyof ProductOverrideInput>(id: string, field: K, value: ProductOverrideInput[K]) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        id,
        [field]: value,
      },
    }));
  }

  function updateCreateDraft<K extends keyof ProductOverrideInput>(field: K, value: ProductOverrideInput[K]) {
    setCreateDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setCreateSaveState("idle");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
    setBulkSaveState("idle");
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        visibleProducts.forEach((product) => next.delete(product.id));
      } else {
        visibleProducts.forEach((product) => next.add(product.id));
      }

      return next;
    });
    setBulkSaveState("idle");
  }

  async function saveDraft(id: string) {
    const draft = drafts[id];

    if (!draft) return;

    setSaveState({ id, status: "saving" });

    try {
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as { success: boolean; override?: ProductOverride };

      if (!response.ok || !data.success || !data.override) {
        throw new Error("Failed to save product override");
      }

      setOverrides((current) => [data.override!, ...current.filter((override) => override.id !== id)]);
      setSaveState({ id, status: "saved" });
      setEditingId(null);
    } catch {
      setSaveState({ id, status: "error" });
    }
  }

  async function saveCustomProduct() {
    if (!createDraft.id.trim() || !createDraft.name?.trim()) {
      setCreateSaveState("error");
      return;
    }

    setCreateSaveState("saving");

    try {
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createDraft, isCustomProduct: true }),
      });
      const data = (await response.json()) as { success: boolean; override?: ProductOverride };

      if (!response.ok || !data.success || !data.override) {
        throw new Error("Failed to save custom product");
      }

      setOverrides((current) => [data.override!, ...current.filter((override) => override.id !== data.override!.id)]);
      setCreateDraft(createEmptyCustomDraft());
      setShowCreateForm(false);
      setCreateSaveState("saved");
    } catch {
      setCreateSaveState("error");
    }
  }

  async function saveVisibility(product: AdminProduct, isHidden: boolean) {
    if (product.isDeleted) return;
    if (isHidden && !window.confirm("确定要隐藏这个商品吗？")) return;

    setActionSaveState({ id: product.id, status: "saving" });

    try {
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toDraft(product), isHidden, isDeleted: false }),
      });
      const data = (await response.json()) as { success: boolean; override?: ProductOverride };

      if (!response.ok || !data.success || !data.override) {
        throw new Error("Failed to save product override");
      }

      setOverrides((current) => [data.override!, ...current.filter((override) => override.id !== product.id)]);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
      setActionSaveState({ id: product.id, status: "saved" });
    } catch {
      setActionSaveState({ id: product.id, status: "error" });
    }
  }

  async function saveDeleted(product: AdminProduct, isDeleted: boolean) {
    if (isDeleted && !window.confirm("确定要永久删除这个商品吗？此操作不可恢复。")) return;

    setActionSaveState({ id: product.id, status: "saving" });

    try {
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toDraft(product), isHidden: isDeleted ? true : false, isDeleted }),
      });
      const data = (await response.json()) as { success: boolean; override?: ProductOverride };

      if (!response.ok || !data.success || !data.override) {
        throw new Error("Failed to save product override");
      }

      setOverrides((current) => [data.override!, ...current.filter((override) => override.id !== product.id)]);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
      setActionSaveState({ id: product.id, status: "saved" });
    } catch {
      setActionSaveState({ id: product.id, status: "error" });
    }
  }

  async function saveImageReviewed(product: AdminProduct, imageReviewed: boolean) {
    setActionSaveState({ id: product.id, status: "saving" });

    try {
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...toDraft(product), imageReviewed }),
      });
      const data = (await response.json()) as { success: boolean; override?: ProductOverride };

      if (!response.ok || !data.success || !data.override) {
        throw new Error("Failed to save product override");
      }

      setOverrides((current) => [data.override!, ...current.filter((override) => override.id !== product.id)]);
      setActionSaveState({ id: product.id, status: "saved" });
    } catch {
      setActionSaveState({ id: product.id, status: "error" });
    }
  }

  async function saveBulkReviewStatus() {
    const selectedProducts = displayProducts.filter((product) => selectedIds.has(product.id));

    if (selectedProducts.length === 0) return;

    setBulkSaveState("saving");

    try {
      const bulkDrafts = selectedProducts.map((product) => ({
        ...toDraft(product),
        reviewStatus: bulkReviewStatus,
      }));
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: bulkDrafts }),
      });
      const data = (await response.json()) as { success: boolean; overrides?: ProductOverride[] };

      if (!response.ok || !data.success || !data.overrides) {
        throw new Error("Failed to save product overrides");
      }

      setOverrides((current) => [...data.overrides!, ...current.filter((override) => !selectedIds.has(override.id))]);
      setDrafts((current) => {
        const next = { ...current };
        data.overrides!.forEach((override) => {
          if (next[override.id]) {
            next[override.id] = { ...next[override.id], reviewStatus: override.reviewStatus };
          }
        });
        return next;
      });
      setSelectedIds(new Set());
      setBulkSaveState("saved");
    } catch {
      setBulkSaveState("error");
    }
  }

  async function saveBulkHidden() {
    const selectedProducts = displayProducts.filter((product) => selectedIds.has(product.id) && product.isDeleted !== true);

    if (selectedProducts.length === 0) return;
    if (!window.confirm("确定要隐藏选中的商品吗？")) return;

    setBulkSaveState("saving");

    try {
      const bulkDrafts = selectedProducts.map((product) => ({
        ...toDraft(product),
        isHidden: true,
      }));
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: bulkDrafts }),
      });
      const data = (await response.json()) as { success: boolean; overrides?: ProductOverride[] };

      if (!response.ok || !data.success || !data.overrides) {
        throw new Error("Failed to save product overrides");
      }

      setOverrides((current) => [...data.overrides!, ...current.filter((override) => !selectedIds.has(override.id))]);
      setSelectedIds(new Set());
      setBulkSaveState("saved");
    } catch {
      setBulkSaveState("error");
    }
  }

  async function saveBulkRestored() {
    const selectedProducts = displayProducts.filter((product) => selectedIds.has(product.id) && product.isDeleted !== true);

    if (selectedProducts.length === 0) return;

    setBulkSaveState("saving");

    try {
      const bulkDrafts = selectedProducts.map((product) => ({
        ...toDraft(product),
        isHidden: false,
      }));
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: bulkDrafts }),
      });
      const data = (await response.json()) as { success: boolean; overrides?: ProductOverride[] };

      if (!response.ok || !data.success || !data.overrides) {
        throw new Error("Failed to save product overrides");
      }

      setOverrides((current) => [...data.overrides!, ...current.filter((override) => !selectedIds.has(override.id))]);
      setSelectedIds(new Set());
      setBulkSaveState("saved");
    } catch {
      setBulkSaveState("error");
    }
  }

  async function saveBulkImageReviewed(imageReviewed: boolean) {
    const selectedProducts = displayProducts.filter((product) => selectedIds.has(product.id) && product.isDeleted !== true);

    if (selectedProducts.length === 0) return;

    setBulkSaveState("saving");

    try {
      const bulkDrafts = selectedProducts.map((product) => ({
        ...toDraft(product),
        imageReviewed,
      }));
      const response = await fetch("/api/admin/product-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: bulkDrafts }),
      });
      const data = (await response.json()) as { success: boolean; overrides?: ProductOverride[] };

      if (!response.ok || !data.success || !data.overrides) {
        throw new Error("Failed to save product overrides");
      }

      setOverrides((current) => [...data.overrides!, ...current.filter((override) => !selectedIds.has(override.id))]);
      setSelectedIds(new Set());
      setBulkSaveState("saved");
    } catch {
      setBulkSaveState("error");
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">后台</p>
          <h1 className="mt-2 text-3xl font-black">商品运营后台</h1>
          <p className="mt-2 text-sm text-slate-600">
            共 {stats.total} 个可运营商品，已隐藏 {stats.hidden} 个，已删除 {stats.deleted} 个。
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="商品审核状态筛选">
          {filterOptions.map((option) => (
            <button
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                statusFilter === option.value
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              type="button"
            >
              {option.label} {filterCounts[option.value]}
            </button>
          ))}
        </nav>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-950">商品运营</p>
            <p className="mt-1 text-xs text-slate-500">新增商品会保存到商品覆盖表，并标记为自定义商品。</p>
          </div>
          <button
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800"
            onClick={() => setShowCreateForm((current) => !current)}
            type="button"
          >
            {showCreateForm ? "收起新增商品" : "新增商品"}
          </button>
        </div>
        {showCreateForm && (
          <div className="mt-4 grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs font-bold text-slate-600">
              商品 ID
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("id", event.target.value)} value={createDraft.id} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              中文名
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("name", event.target.value)} value={createDraft.name ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              英文名
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("nameEn", event.target.value)} value={createDraft.nameEn ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              品牌
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("brand", event.target.value)} value={createDraft.brand ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              活动
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("activity", [event.target.value as ProductActivity])} value={Array.isArray(createDraft.activity) ? createDraft.activity[0] : createDraft.activity ?? activityOptions[0]}>
                {activityOptions.map((activity) => <option key={activity} value={activity}>{activity}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-600">
              分类
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("category", event.target.value)} value={createDraft.category ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              商家
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("merchant", event.target.value)} value={createDraft.merchant ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              价格
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" min={0} onChange={(event) => updateCreateDraft("price", event.target.value === "" ? undefined : Number(event.target.value))} type="number" value={createDraft.price ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              单位
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("unit", event.target.value)} value={createDraft.unit ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              图片
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("image", event.target.value)} value={createDraft.image ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              购买链接
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("buyUrl", event.target.value)} value={createDraft.buyUrl ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              联盟链接
              <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("affiliateLink", event.target.value)} value={createDraft.affiliateLink ?? ""} />
            </label>
            <label className="text-xs font-bold text-slate-600">
              链接类型
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("linkType", event.target.value as ProductLinkType)} value={createDraft.linkType}>
                {linkTypeOptions.map((option) => <option key={option} value={option}>{linkTypeLabels[option]}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-600">
              审核状态
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("reviewStatus", event.target.value as ProductReviewStatus)} value={createDraft.reviewStatus}>
                {reviewStatusOptions.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-600">
              预算档位
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("budgetTier", event.target.value as ProductBudgetTier)} value={createDraft.budgetTier}>
                {budgetTierOptions.map((option) => <option key={option} value={option}>{budgetTierLabels[option]}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
              <input checked={Boolean(createDraft.isCurated)} className="h-4 w-4" onChange={(event) => updateCreateDraft("isCurated", event.target.checked)} type="checkbox" />
              精选商品
            </label>
            <div className="grid gap-3 xl:col-span-4 xl:grid-cols-2">
              {(["bestFor", "strengths", "notIdealFor"] as const).flatMap((field) =>
                (["zh", "en"] as const).map((language) => (
                  <label className="text-xs font-bold text-slate-600" key={`${field}-${language}`}>
                    {recommendationFieldLabels[field]}（{language === "zh" ? "中文" : "英文"}）
                    <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft(field, updateRecommendationCopy(createDraft[field], language, event.target.value))} value={joinLines(createDraft[field]?.[language])} />
                  </label>
                )),
              )}
            </div>
            <label className="text-xs font-bold text-slate-600 xl:col-span-4">
              审核备注
              <textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900" onChange={(event) => updateCreateDraft("reviewNote", event.target.value)} value={createDraft.reviewNote ?? ""} />
            </label>
            <div className="flex items-center gap-3 xl:col-span-4">
              <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-60" disabled={createSaveState === "saving"} onClick={() => void saveCustomProduct()} type="button">
                {createSaveState === "saving" ? "保存中..." : "保存新增商品"}
              </button>
              {createSaveState === "error" && <span className="text-sm font-bold text-rose-700">请填写商品 ID 和中文名，或检查字段。</span>}
            </div>
          </div>
        )}
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">当前可运营商品总数</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">待人工确认数量</p>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.searchOnly}</p>
        </div>
        <div className="rounded-xl border border-lime-100 bg-lime-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-lime-700">已确认商品数量</p>
          <p className="mt-2 text-2xl font-black text-lime-900">{stats.reviewed}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">联盟商品数量</p>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.affiliateReady}</p>
        </div>
        <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">已确认图片数量</p>
          <p className="mt-2 text-2xl font-black text-teal-900">{stats.imageReviewed}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-700">待确认图片数量</p>
          <p className="mt-2 text-2xl font-black text-rose-900">{stats.imagePending}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={stats.searchOnly === 0}
            onClick={goToNextSearchOnly}
            type="button"
          >
            下一条待审核
          </button>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            缺少图片 {stats.missingImage}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            缺少联盟链接 {stats.missingAffiliateLink}
          </span>
          <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
            精选商品 {stats.curated}
          </span>
          <span className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-800 ring-1 ring-rose-100">
            已隐藏 {stats.hidden}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            已删除 {stats.deleted}
          </span>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_13rem_13rem]">
          <label className="text-xs font-bold text-slate-600">
            搜索商品名、品牌、活动
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索商品"
              value={query}
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            状态筛选
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setStatusFilter(event.target.value as ProductFilter)}
              value={statusFilter}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            排序
            <select
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-bold text-slate-700">已选 {selectedCount} 个商品</p>
          <label className="text-xs font-bold text-slate-600">
            批量审核状态
            <select
              className="mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setBulkReviewStatus(event.target.value as ProductReviewStatus)}
              value={bulkReviewStatus}
            >
              {reviewStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {statusLabels[option]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="h-9 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedCount === 0 || bulkSaveState === "saving"}
            onClick={() => void saveBulkReviewStatus()}
            type="button"
          >
            {bulkSaveState === "saving" ? "保存中..." : "批量保存"}
          </button>
          <button
            className="h-9 rounded-lg bg-rose-700 px-4 text-sm font-black text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedNonDeletedCount === 0 || bulkSaveState === "saving"}
            onClick={() => void saveBulkHidden()}
            type="button"
          >
            批量隐藏选中商品
          </button>
          <button
            className="h-9 rounded-lg bg-teal-700 px-4 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedNonDeletedCount === 0 || bulkSaveState === "saving"}
            onClick={() => void saveBulkImageReviewed(true)}
            type="button"
          >
            批量确认图片
          </button>
          <button
            className="h-9 rounded-lg bg-slate-700 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedNonDeletedCount === 0 || bulkSaveState === "saving"}
            onClick={() => void saveBulkImageReviewed(false)}
            type="button"
          >
            批量取消图片确认
          </button>
          {statusFilter === "hidden" && (
            <button
              className="h-9 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedCount === 0 || bulkSaveState === "saving"}
              onClick={() => void saveBulkRestored()}
              type="button"
            >
              批量恢复选中商品
            </button>
          )}
          {bulkSaveState === "saved" && <span className="text-sm font-bold text-emerald-700">已保存</span>}
          {bulkSaveState === "error" && <span className="text-sm font-bold text-rose-700">保存失败</span>}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1940px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    aria-label="选择当前可见商品"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3">商品名</th>
                <th className="px-4 py-3">品牌</th>
                <th className="px-4 py-3">活动</th>
                <th className="px-4 py-3">商家</th>
                <th className="px-4 py-3">图片</th>
                <th className="px-4 py-3">联盟链接</th>
                <th className="px-4 py-3">链接类型</th>
                <th className="w-24 px-4 py-3">精选</th>
                <th className="w-32 px-4 py-3">审核状态</th>
                <th className="px-4 py-3">审核备注</th>
                <th className="px-4 py-3">预算档位</th>
                <th className="px-4 py-3 text-right">价格</th>
                <th className="px-4 py-3">购买链接</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleProducts.map((product) => {
                const isEditing = editingId === product.id;
                const draft = drafts[product.id] ?? toDraft(product);

                return (
                  <Fragment key={`${product.activityLabel}-${product.id}`}>
                    <tr className="align-top hover:bg-slate-50/70" id={`product-row-${product.id}`}>
                      <td className="px-4 py-3">
                        <input
                          aria-label={`选择 ${product.name}`}
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelected(product.id)}
                          type="checkbox"
                        />
                      </td>
                      <td className="max-w-72 px-4 py-3 font-semibold text-slate-950">
                        <p>{product.name}</p>
                        {product.nameEn && <p className="mt-1 text-xs font-medium text-slate-500">{product.nameEn}</p>}
                        <p className="mt-1 text-xs font-medium text-slate-400">{product.id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{product.brand}</td>
                      <td className="px-4 py-3 text-slate-700">{product.activityLabel}</td>
                      <td className="px-4 py-3 text-slate-700">{product.merchant}</td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                            <img alt={product.name} className="h-full w-full object-cover" loading="lazy" src={product.image} />
                          </div>
                          {product.imageReviewed ? (
                            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-800 ring-1 ring-emerald-100">
                              图片已确认
                            </span>
                          ) : (
                            <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2 py-1 text-[11px] font-black text-rose-700 ring-1 ring-rose-100">
                              图片待确认
                            </span>
                          )}
                          {!product.isDeleted && (
                            <button
                              className={`mt-2 block rounded-lg border px-2 py-1 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                product.imageReviewed
                                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              }`}
                              disabled={actionSaveState?.id === product.id && actionSaveState.status === "saving"}
                              onClick={() => void saveImageReviewed(product, !product.imageReviewed)}
                              type="button"
                            >
                              {product.imageReviewed ? "取消确认" : "确认图片"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {product.affiliateLink?.trim() ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800">
                            有
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                            缺失
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                          {linkTypeLabels[product.linkType]}
                        </span>
                      </td>
                      <td className="w-24 px-4 py-3">
                        {product.isCurated ? (
                          <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800 ring-1 ring-amber-100">
                            精选
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">-</span>
                        )}
                      </td>
                      <td className="w-32 px-4 py-3">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-black ${statusClass(product.reviewStatus)}`}>
                          {statusLabels[product.reviewStatus]}
                        </span>
                      </td>
                      <td className="max-w-56 px-4 py-3 text-xs leading-5 text-slate-600">
                        {product.reviewNote?.trim() || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const budgetTier = product.budgetTier ?? getBudgetTierFromPrice(product.price);

                          return (
                            <span className="whitespace-nowrap rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-800 ring-1 ring-sky-100">
                              {budgetTierLabels[budgetTier]}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-950">{formatPrice(product.price)}</td>
                      <td className="max-w-80 px-4 py-3">
                        <a
                          className="break-all text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                          href={product.buyUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {product.buyUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                          onClick={() => startEdit(product)}
                          type="button"
                        >
                          {isEditing ? "取消" : "编辑"}
                        </button>
                        {!product.isDeleted && (
                          <button
                            className={`mt-2 block rounded-lg border px-3 py-1.5 text-xs font-black transition ${
                              product.isHidden
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                            disabled={actionSaveState?.id === product.id && actionSaveState.status === "saving"}
                            onClick={() => void saveVisibility(product, !product.isHidden)}
                            type="button"
                          >
                            {actionSaveState?.id === product.id && actionSaveState.status === "saving"
                            ? "保存中..."
                              : product.isHidden
                                ? "恢复显示"
                                : "隐藏商品"}
                          </button>
                        )}
                        {statusFilter === "hidden" && product.isHidden && !product.isDeleted && (
                          <button
                            className="mt-2 block rounded-lg border border-slate-300 bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={actionSaveState?.id === product.id && actionSaveState.status === "saving"}
                            onClick={() => void saveDeleted(product, true)}
                            type="button"
                          >
                            删除商品
                          </button>
                        )}
                        {statusFilter === "deleted" && product.isDeleted && (
                          <button
                            className="mt-2 block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={actionSaveState?.id === product.id && actionSaveState.status === "saving"}
                            onClick={() => void saveDeleted(product, false)}
                            type="button"
                          >
                            恢复商品
                          </button>
                        )}
                        {actionSaveState?.id === product.id && actionSaveState.status === "error" && (
                          <span className="mt-1 block text-xs font-bold text-rose-700">保存失败</span>
                        )}
                      </td>
                    </tr>
                    {isEditing && (
                      <tr className="bg-emerald-50/40">
                        <td className="px-4 py-4" colSpan={15}>
                          <div className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
                            <label className="text-xs font-bold text-slate-600">
                              中文名
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "name", event.target.value)}
                                value={draft.name ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              英文名
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "nameEn", event.target.value)}
                                value={draft.nameEn ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              品牌
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "brand", event.target.value)}
                                value={draft.brand ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              活动
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "activity", [event.target.value as ProductActivity])}
                                value={Array.isArray(draft.activity) ? draft.activity[0] : draft.activity ?? product.activity[0]}
                              >
                                {activityOptions.map((activity) => (
                                  <option key={activity} value={activity}>
                                    {activity}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              分类
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "category", event.target.value)}
                                value={draft.category ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              商家
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "merchant", event.target.value)}
                                value={draft.merchant ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              单位
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "unit", event.target.value)}
                                value={draft.unit ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              购买链接
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "buyUrl", event.target.value)}
                                value={draft.buyUrl ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              联盟链接
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "affiliateLink", event.target.value)}
                                value={draft.affiliateLink ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              图片
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "image", event.target.value)}
                                value={draft.image ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              价格
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                min={0}
                                onChange={(event) =>
                                  updateDraft(
                                    product.id,
                                    "price",
                                    event.target.value === "" ? undefined : Number(event.target.value),
                                  )
                                }
                                type="number"
                                value={draft.price ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              预算档位
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "budgetTier", event.target.value as ProductBudgetTier)}
                                value={draft.budgetTier ?? getBudgetTierFromPrice(draft.price ?? product.price)}
                              >
                                {budgetTierOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {budgetTierLabels[option]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              链接类型
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "linkType", event.target.value as ProductLinkType)}
                                value={draft.linkType}
                              >
                                {linkTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {linkTypeLabels[option]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              审核状态
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "reviewStatus", event.target.value as ProductReviewStatus)}
                                value={draft.reviewStatus}
                              >
                                {reviewStatusOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {statusLabels[option]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">
                              <input
                                checked={Boolean(draft.isCurated)}
                                className="h-4 w-4"
                                onChange={(event) => updateDraft(product.id, "isCurated", event.target.checked)}
                                type="checkbox"
                              />
                              精选商品
                            </label>
                            <label className="text-xs font-bold text-slate-600 xl:col-span-5">
                              审核备注
                              <textarea
                                className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "reviewNote", event.target.value)}
                                value={draft.reviewNote ?? ""}
                              />
                            </label>
                            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 xl:col-span-5 xl:grid-cols-2">
                              <label className="text-xs font-bold text-slate-600">
                                适合人群（中文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "bestFor",
                                      updateRecommendationCopy(draft.bestFor, "zh", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.bestFor?.zh)}
                                />
                              </label>
                              <label className="text-xs font-bold text-slate-600">
                                适合人群（英文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "bestFor",
                                      updateRecommendationCopy(draft.bestFor, "en", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.bestFor?.en)}
                                />
                              </label>
                              <label className="text-xs font-bold text-slate-600">
                                商品优势（中文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "strengths",
                                      updateRecommendationCopy(draft.strengths, "zh", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.strengths?.zh)}
                                />
                              </label>
                              <label className="text-xs font-bold text-slate-600">
                                商品优势（英文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "strengths",
                                      updateRecommendationCopy(draft.strengths, "en", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.strengths?.en)}
                                />
                              </label>
                              <label className="text-xs font-bold text-slate-600">
                                不适合人群（中文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "notIdealFor",
                                      updateRecommendationCopy(draft.notIdealFor, "zh", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.notIdealFor?.zh)}
                                />
                              </label>
                              <label className="text-xs font-bold text-slate-600">
                                不适合人群（英文）
                                <textarea
                                  className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                                  onChange={(event) =>
                                    updateDraft(
                                      product.id,
                                      "notIdealFor",
                                      updateRecommendationCopy(draft.notIdealFor, "en", event.target.value),
                                    )
                                  }
                                  value={joinLines(draft.notIdealFor?.en)}
                                />
                              </label>
                            </div>
                            <div className="flex items-end gap-2 xl:col-span-5">
                              <button
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={saveState?.id === product.id && saveState.status === "saving"}
                                onClick={() => void saveDraft(product.id)}
                                type="button"
                              >
                                {saveState?.id === product.id && saveState.status === "saving" ? "保存中..." : "保存"}
                              </button>
                              {saveState?.id === product.id && saveState.status === "saved" && (
                                <span className="text-sm font-bold text-emerald-700">已保存</span>
                              )}
                              {saveState?.id === product.id && saveState.status === "error" && (
                                <span className="text-sm font-bold text-rose-700">保存失败</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
