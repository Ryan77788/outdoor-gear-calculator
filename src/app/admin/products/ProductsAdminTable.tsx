"use client";

import { Fragment, useMemo, useState } from "react";
import type { ProductLinkType, ProductReviewStatus, ProductTemplate } from "@/data/products";
import { applyProductOverrides, type ProductOverride, type ProductOverrideInput } from "@/lib/product-overrides";

export type AdminProduct = ProductTemplate & {
  activityLabel: string;
};

type ProductFilter = "all" | ProductReviewStatus;
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
];

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: "Default", value: "default" },
  { label: "Price high to low", value: "price-desc" },
  { label: "Price low to high", value: "price-asc" },
  { label: "reviewStatus", value: "reviewStatus" },
  { label: "merchant", value: "merchant" },
];

const linkTypeOptions: ProductLinkType[] = ["product", "search"];
const reviewStatusOptions: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];

function formatPrice(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

function toDraft(product: AdminProduct): ProductOverrideInput {
  return {
    id: product.id,
    buyUrl: product.buyUrl,
    affiliateLink: product.affiliateLink ?? "",
    linkType: product.linkType,
    reviewStatus: product.reviewStatus,
    image: product.image,
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
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>(initialStatusFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkReviewStatus, setBulkReviewStatus] = useState<ProductReviewStatus>("reviewed");
  const [bulkSaveState, setBulkSaveState] = useState<BulkSaveState>("idle");
  const displayProducts = useMemo(() => applyProductOverrides(products, overrides), [products, overrides]);
  const stats = useMemo(
    () => ({
      total: displayProducts.length,
      searchOnly: displayProducts.filter((product) => product.reviewStatus === "search-only").length,
      reviewed: displayProducts.filter((product) => product.reviewStatus === "reviewed").length,
      affiliateReady: displayProducts.filter((product) => product.reviewStatus === "affiliate-ready").length,
    }),
    [displayProducts],
  );
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = displayProducts
      .filter((product) => statusFilter === "all" || product.reviewStatus === statusFilter)
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
      return products.findIndex((product) => product.id === a.id) - products.findIndex((product) => product.id === b.id);
    });
  }, [displayProducts, products, query, sortBy, statusFilter]);
  const selectedCount = selectedIds.size;
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selectedIds.has(product.id));

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

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">商品总数</p>
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
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_13rem_13rem]">
          <label className="text-xs font-bold text-slate-600">
            搜索商品名、品牌、活动
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
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
            批量 reviewStatus
            <select
              className="mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
              onChange={(event) => setBulkReviewStatus(event.target.value as ProductReviewStatus)}
              value={bulkReviewStatus}
            >
              {reviewStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
            {bulkSaveState === "saving" ? "Saving..." : "批量保存"}
          </button>
          {bulkSaveState === "saved" && <span className="text-sm font-bold text-emerald-700">Saved</span>}
          {bulkSaveState === "error" && <span className="text-sm font-bold text-rose-700">Save failed</span>}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1420px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    aria-label="Select all visible products"
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
                <th className="px-4 py-3">linkType</th>
                <th className="px-4 py-3">reviewStatus</th>
                <th className="px-4 py-3 text-right">price</th>
                <th className="px-4 py-3">buyUrl</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleProducts.map((product) => {
                const isEditing = editingId === product.id;
                const draft = drafts[product.id] ?? toDraft(product);

                return (
                  <Fragment key={`${product.activityLabel}-${product.id}`}>
                    <tr className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <input
                          aria-label={`Select ${product.name}`}
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
                          {product.imageStatus !== "matched" && (
                            <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2 py-1 text-[11px] font-black text-rose-700 ring-1 ring-rose-100">
                              图片待确认
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                          {product.linkType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(product.reviewStatus)}`}>
                          {statusLabels[product.reviewStatus]}
                        </span>
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
                      </td>
                    </tr>
                    {isEditing && (
                      <tr className="bg-emerald-50/40">
                        <td className="px-4 py-4" colSpan={11}>
                          <div className="grid gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
                            <label className="text-xs font-bold text-slate-600">
                              buyUrl
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "buyUrl", event.target.value)}
                                value={draft.buyUrl ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              affiliateLink
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "affiliateLink", event.target.value)}
                                value={draft.affiliateLink ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              image
                              <input
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "image", event.target.value)}
                                value={draft.image ?? ""}
                              />
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              linkType
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "linkType", event.target.value as ProductLinkType)}
                                value={draft.linkType}
                              >
                                {linkTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-xs font-bold text-slate-600">
                              reviewStatus
                              <select
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                                onChange={(event) => updateDraft(product.id, "reviewStatus", event.target.value as ProductReviewStatus)}
                                value={draft.reviewStatus}
                              >
                                {reviewStatusOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="flex items-end gap-2 xl:col-span-5">
                              <button
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={saveState?.id === product.id && saveState.status === "saving"}
                                onClick={() => void saveDraft(product.id)}
                                type="button"
                              >
                                {saveState?.id === product.id && saveState.status === "saving" ? "Saving..." : "Save"}
                              </button>
                              {saveState?.id === product.id && saveState.status === "saved" && (
                                <span className="text-sm font-bold text-emerald-700">Saved</span>
                              )}
                              {saveState?.id === product.id && saveState.status === "error" && (
                                <span className="text-sm font-bold text-rose-700">Save failed</span>
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
