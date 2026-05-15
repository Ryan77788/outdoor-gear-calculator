"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { activityOptions, productUrl, type Activity, type Product } from "@/data/products";
import {
  buildGearList,
  getProductPlan,
  getRiskBlocks,
  tripDayOptions,
  weatherOptions,
  type RiskIconName,
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

export default function Home() {
  const [showResult, setShowResult] = useState(false);
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
        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-3">
          <article className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
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
              <ul className="max-h-[430px] space-y-1 overflow-y-auto overflow-x-hidden pr-1">
                {gearList.map((item) => (
                  <li className="flex min-h-[72px] items-center gap-3 rounded-lg bg-white/70 px-3 py-2" key={item.name}>
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

          <article className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
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

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {productPlan.selectedProducts.map((product) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  key={product.name}
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

          <article className="flex h-[620px] min-h-0 flex-col rounded-2xl border border-amber-200/80 bg-amber-50/92 p-5 shadow-lg shadow-amber-950/5 ring-1 ring-white/70 backdrop-blur">
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

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {risks.map((risk) => (
                <div className="rounded-xl border border-amber-200/70 bg-white/78 p-4 shadow-sm" key={risk.title}>
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
      )}
    </main>
  );
}

