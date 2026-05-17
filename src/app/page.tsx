"use client";

import Image from "next/image";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import { activityOptions, productUrl, type Activity, type Product } from "@/data/products";
import {
  buildGearList,
  getProductPlan,
  getRiskBlocks,
  tripDayOptions,
  weatherOptions,
  type GearItem,
  type RiskIconName,
  type RiskBlock,
  type TripDays,
  type Weather,
} from "@/lib/recommendation";

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

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

function formatSavedTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home() {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [savePlanStatus, setSavePlanStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);
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
  const hasMoreGear = gearList.length > 6;
  const risks = useMemo(
    () => getRiskBlocks(form.activity, form.weather, form.tripDays),
    [form.activity, form.weather, form.tripDays],
  );

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
        }),
      });

      if (!response.ok) {
        throw new Error(`Save plan failed with status ${response.status}`);
      }

      setSavePlanStatus("saved");
      await loadSavedPlans();
      window.setTimeout(() => setSavePlanStatus("idle"), 1600);
    } catch (error) {
      console.error("Failed to save plan:", error);
      setSavePlanStatus("idle");
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
      setCopiedPlanId(planId);
      window.setTimeout(() => setCopiedPlanId((current) => (current === planId ? null : current)), 1600);
    } catch (error) {
      console.error("Failed to copy share link:", error);
    }
  }

  async function handleGenerateShareImage() {
    if (!exportRef.current) {
      return;
    }

    setIsGeneratingShareImage(true);

    try {
      const exportElement = exportRef.current;

      exportElement.style.display = "block";
      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const canvas = await html2canvas(exportElement, {
        backgroundColor: "#ffffff",
        scale: Math.min(2, window.devicePixelRatio || 1),
      });
      const link = document.createElement("a");

      link.download = "outdoor-plan.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
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
    const url = product.productUrl || productUrl;

    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "product_click",
          data: {
            productName: product.name,
            unitPrice: product.unitPrice,
            quantity: product.quantity,
            unit: product.unit,
            subtotal: product.subtotal,
            activity: form.activity,
            days: form.tripDays,
            weather: form.weather,
            people: form.peopleCount,
            budget: form.budget,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to log product click:", error);
    } finally {
      window.open(url, "_blank");
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
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
            <span style={{ textShadow: "0 4px 22px rgba(0, 0, 0, 0.42)" }}>户外装备选择器</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            根据活动类型、天气、人数和整套预算，生成更贴近真实出行场景的装备清单与组合推荐。
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-12 max-w-6xl px-6">
        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <div className="grid gap-5 lg:grid-cols-5">
            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="activity" />
                活动类型
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.activity}
                onChange={(event) => updateField("activity", event.target.value as Activity)}
              >
                {activityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="calendar" />
                出行天数
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.tripDays}
                onChange={(event) => updateField("tripDays", event.target.value as TripDays)}
              >
                {tripDayOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="weather" />
                天气情况
              </span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 text-slate-900 outline-none transition group-hover:border-emerald-200 group-hover:bg-white focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                value={form.weather}
                onChange={(event) => updateField("weather", event.target.value as Weather)}
              >
                {weatherOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="group block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Icon className="h-4 w-4 text-emerald-700" name="people" />
                出行人数
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
                整套预算（元）
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
                预算按本次出行的整套装备计算，不是单人预算。
              </p>
              {form.peopleCount > 1 && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  当前为 {form.peopleCount} 人总预算，系统会按人数估算消耗品和个人装备数量。
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
              生成装备清单
            </button>
          </div>
        </div>
      </section>

      {showResult && (
        <>
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
                <h2 className="text-xl font-black text-slate-950">必备装备</h2>
                <p className="text-sm text-slate-500">
                  {form.activity} · {form.tripDays} · {form.peopleCount}人
                </p>
                <p className="mt-1 text-xs text-slate-500">按活动、天气、天数和人数动态生成。</p>
              </div>
            </div>
            {hasMoreGear && (
              <p className="mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                向下滚动查看更多装备
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
                      <p className="text-sm font-black text-slate-950">{item.name}</p>
                      <p className="mt-0.5 text-sm leading-snug text-slate-500">{item.reason}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                      {item.quantity}
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
                <h2 className="text-xl font-black text-slate-950">推荐商品</h2>
                <p className="text-sm text-slate-500">装备组合方案</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  整套预算：{formatCurrency(form.budget)} · 推荐组合总价：
                  {formatCurrency(productPlan.totalPrice)} ·{" "}
                  {productPlan.remainingBudget < 0 ? "小幅超出" : "剩余预算"}：
                  {formatCurrency(Math.abs(productPlan.remainingBudget))}
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-100 px-2 py-3">
                <p className="font-semibold text-slate-500">整套预算</p>
                <p className="mt-1 font-black text-slate-950">{formatCurrency(form.budget)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-2 py-3">
                <p className="font-semibold text-emerald-700">推荐组合总价</p>
                <p className="mt-1 font-black text-emerald-800">{formatCurrency(productPlan.totalPrice)}</p>
              </div>
              <div className="rounded-xl bg-amber-50 px-2 py-3">
                <p className="font-semibold text-amber-700">
                  {productPlan.remainingBudget < 0 ? "小幅超出" : "剩余预算"}
                </p>
                <p className="mt-1 font-black text-amber-800">
                  {formatCurrency(Math.abs(productPlan.remainingBudget))}
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
                {savePlanStatus === "saved" ? "已保存" : "保存本次方案"}
              </button>
              <button
                className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-sm font-bold text-lime-800 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isGeneratingShareImage}
                onClick={() => void handleGenerateShareImage()}
                type="button"
              >
                {isGeneratingShareImage ? "生成中..." : "生成分享图"}
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-share-scroll>
              {productPlan.selectedProducts.map((product, index) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  key={`${product.name}-${product.quantity}-${index}`}
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
                      <Image
                        alt={product.name}
                        className="object-cover"
                        fill
                        sizes="64px"
                        src={product.image}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-950">{product.name}</p>
                        <p className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-700">
                          小计 {formatCurrency(product.subtotal)}
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <span>单价：{formatCurrency(product.unitPrice)} / {product.unit}</span>
                        <span>
                          数量：{product.quantity}
                          {product.unit}
                        </span>
                        <span>小计：{formatCurrency(product.subtotal)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{product.reason}</p>
                    </div>
                  </div>
                  <button
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                    onClick={() => void handleProductClick(product)}
                    type="button"
                  >
                    查看商品
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
                <h2 className="text-xl font-black text-amber-950">风险提示</h2>
                <p className="text-sm text-amber-700">
                  {form.activity} · {form.weather} · {form.tripDays}
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
                    {risk.title}
                  </div>
                  <p className="text-sm leading-6 text-amber-900/80">{risk.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <div
          ref={exportRef}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            boxShadow: "none",
            color: "#0f172a",
            display: "none",
            fontFamily:
              'Arial, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
            left: "-9999px",
            padding: "40px",
            position: "fixed",
            top: "0",
            width: "900px",
            zIndex: "-1",
          }}
        >
          <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "24px" }}>
            <p style={{ color: "#047857", fontSize: "16px", fontWeight: 700, margin: "0 0 10px" }}>
              Outdoor Gear Planner
            </p>
            <h2 style={{ color: "#0f172a", fontSize: "42px", fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
              户外装备方案
            </h2>
            <p style={{ color: "#475569", fontSize: "18px", lineHeight: 1.6, margin: "14px 0 0" }}>
              {form.activity} · {form.weather} · {form.tripDays} · {form.peopleCount}人
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(5, 1fr)",
              marginTop: "24px",
            }}
          >
            {[
              ["活动", form.activity],
              ["天气", form.weather],
              ["天数", form.tripDays],
              ["人数", `${form.peopleCount}人`],
              ["预算", formatCurrency(form.budget)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  padding: "14px",
                }}
              >
                <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 700, margin: "0 0 6px" }}>
                  {label}
                </p>
                <p style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr", marginTop: "28px" }}>
            <section>
              <h3 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 900, margin: "0 0 14px" }}>
                必备装备
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {gearList.slice(0, 8).map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ alignItems: "center", display: "flex", gap: "10px", justifyContent: "space-between" }}>
                      <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, margin: 0 }}>
                        {index + 1}. {item.name}
                      </p>
                      <span style={{ color: "#047857", fontSize: "14px", fontWeight: 900 }}>{item.quantity}</span>
                    </div>
                    <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.55, margin: "6px 0 0" }}>
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 900, margin: "0 0 14px" }}>
                推荐商品
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {productPlan.selectedProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={`${product.name}-${index}`}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                      <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, margin: 0 }}>
                        {product.name}
                      </p>
                      <p style={{ color: "#047857", fontSize: "14px", fontWeight: 900, margin: 0 }}>
                        {formatCurrency(product.subtotal)}
                      </p>
                    </div>
                    <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.55, margin: "6px 0 0" }}>
                      数量：{product.quantity}
                      {product.unit} · 单价：{formatCurrency(product.unitPrice)}
                    </p>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "14px",
                  marginTop: "14px",
                  padding: "14px",
                }}
              >
                <p style={{ color: "#047857", fontSize: "16px", fontWeight: 900, margin: 0 }}>
                  推荐组合总价：{formatCurrency(productPlan.totalPrice)}
                </p>
              </div>
            </section>
          </div>

          <section style={{ marginTop: "28px" }}>
            <h3 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 900, margin: "0 0 14px" }}>
              风险提示
            </h3>
            <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {risks.slice(0, 3).map((risk, index) => (
                <div
                  key={`${risk.title}-${index}`}
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "14px",
                    padding: "14px",
                  }}
                >
                  <p style={{ color: "#78350f", fontSize: "16px", fontWeight: 900, margin: "0 0 8px" }}>
                    {risk.title}
                  </p>
                  <p style={{ color: "#92400e", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{risk.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                <Icon name="calendar" />
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-950">我的方案库</h2>
                <p className="text-sm text-slate-500">最近保存的装备方案</p>
              </div>
            </div>

            {savedPlans.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                暂无保存方案。
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
                        <p className="font-black text-slate-950">{plan.activity}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {plan.weather} · {plan.tripDays} · {plan.peopleCount}人
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        {formatCurrency(plan.totalPrice)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>预算：{formatCurrency(plan.budget)}</span>
                      <span>保存：{formatSavedTime(plan.createdAt)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                        onClick={() => handleLoadPlan(plan)}
                        type="button"
                      >
                        重新加载
                      </button>
                      <button
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={deletingPlanId === plan._id}
                        onClick={() => void handleDeletePlan(plan._id)}
                        type="button"
                      >
                        删除
                      </button>
                      <button
                        className="col-span-2 inline-flex h-9 items-center justify-center rounded-xl border border-lime-200 bg-lime-50 text-sm font-bold text-lime-800 transition hover:bg-lime-100"
                        onClick={() => void handleCopyShareLink(plan._id)}
                        type="button"
                      >
                        {copiedPlanId === plan._id ? "已复制" : "复制分享链接"}
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

