"use client";

import { Fragment, useMemo, useState } from "react";
import type { ProductLinkType, ProductReviewStatus, ProductTemplate } from "@/data/products";
import { applyProductOverrides, type ProductOverride, type ProductOverrideInput } from "@/lib/product-overrides";

export type AdminProduct = ProductTemplate & {
  activityLabel: string;
};

type ProductsAdminTableProps = {
  products: AdminProduct[];
  overrides: ProductOverride[];
};

type SaveState = {
  id: string;
  status: "saving" | "saved" | "error";
};

const statusLabels: Record<ProductReviewStatus, string> = {
  "search-only": "待人工确认",
  reviewed: "已确认商品",
  "affiliate-ready": "联盟商品",
};

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

export function ProductsAdminTable({ products, overrides: initialOverrides }: ProductsAdminTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ProductOverrideInput>>({});
  const [overrides, setOverrides] = useState<ProductOverride[]>(initialOverrides);
  const [saveState, setSaveState] = useState<SaveState | null>(null);
  const displayProducts = useMemo(() => applyProductOverrides(products, overrides), [products, overrides]);

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

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1360px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
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
            {displayProducts.map((product) => {
              const isEditing = editingId === product.id;
              const draft = drafts[product.id] ?? toDraft(product);

              return (
                <Fragment key={`${product.activityLabel}-${product.id}`}>
                  <tr className="align-top hover:bg-slate-50/70">
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
                          <img
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            src={product.image}
                          />
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
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          product.reviewStatus === "affiliate-ready"
                            ? "bg-emerald-50 text-emerald-800"
                            : product.reviewStatus === "reviewed"
                              ? "bg-lime-50 text-lime-800"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
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
                      <td className="px-4 py-4" colSpan={10}>
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
                              onChange={(event) =>
                                updateDraft(product.id, "reviewStatus", event.target.value as ProductReviewStatus)
                              }
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
  );
}
