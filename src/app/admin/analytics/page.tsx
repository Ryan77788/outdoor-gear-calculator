"use client";

import { FormEvent, useEffect, useState } from "react";

type RankingItem = {
  name: string;
  count: number;
};

type BudgetBucket = {
  label: "0-1000" | "1000-3000" | "3000-8000" | "8000+";
  count: number;
};

type AnalyticsData = {
  totals: {
    calculator: number;
    productClick: number;
    savedPlan: number;
  };
  topActivities: RankingItem[];
  topProducts: RankingItem[];
  topMerchants: RankingItem[];
  budgetBuckets: BudgetBucket[];
  error?: string;
};

const ADMIN_PASSWORD_STORAGE_KEY = "ADMIN_PASSWORD";

const EMPTY_STATE_TEXT = "暂无数据，先回首页生成一次方案。";

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value.toLocaleString("en-US")}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function RankingTable({
  title,
  nameHeader,
  items,
}: {
  title: string;
  nameHeader: string;
  items: RankingItem[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">排名</th>
              <th className="px-5 py-3">{nameHeader}</th>
              <th className="px-5 py-3 text-right">次数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={`${title}-${item.name}`}>
                  <td className="px-5 py-3 font-bold text-slate-500">#{index + 1}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-5 py-3 text-right font-black text-slate-950">{item.count.toLocaleString("en-US")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-5 text-slate-500" colSpan={3}>
                  {EMPTY_STATE_TEXT}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BudgetTable({ buckets }: { buckets: BudgetBucket[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-black text-slate-950">预算分布</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">预算区间</th>
            <th className="px-5 py-3 text-right">次数</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {buckets.map((bucket) => (
            <tr key={bucket.label}>
              <td className="px-5 py-4 font-semibold text-slate-700">{bucket.label}</td>
              <td className="px-5 py-4 text-right font-black text-slate-950">{bucket.count.toLocaleString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function AnalyticsAdminPage() {
  const [password, setPassword] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  async function loadAnalytics(nextPassword: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        headers: {
          "x-admin-password": nextPassword,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
        setIsUnlocked(false);
        setAnalytics(null);
        setError("密码错误，请重新输入。");
        return;
      }

      if (!response.ok) {
        throw new Error(`Analytics request failed with status ${response.status}`);
      }

      const data = (await response.json()) as AnalyticsData;

      localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, nextPassword);
      setAnalytics(data);
      setIsUnlocked(true);
      setUpdatedAt(new Date().toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" }));
    } catch (requestError) {
      console.error("Failed to load analytics:", requestError);
      setError("无法加载数据，请检查 MongoDB 连接后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);

    if (storedPassword) {
      setPassword(storedPassword);
      void loadAnalytics(storedPassword);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadAnalytics(password);
  }

  if (!isUnlocked || !analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-950">
        <form className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">后台 / 数据分析</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">数据分析后台</h1>
          <p className="mt-2 text-sm text-slate-500">请输入后台密码查看行为数据。</p>
          <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="admin-password">
            密码
          </label>
          <input
            autoComplete="current-password"
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="admin-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          <button
            className="mt-5 h-11 w-full rounded-lg bg-slate-950 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isLoading || !password}
            type="submit"
          >
            {isLoading ? "验证中..." : "进入后台"}
          </button>
        </form>
      </main>
    );
  }

  const hasData = analytics.totals.calculator + analytics.totals.productClick + analytics.totals.savedPlan > 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-2 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">后台 / 数据分析</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">数据分析后台</h1>
            <p className="mt-3 text-sm text-slate-500">数据来自 MongoDB logs 集合</p>
            <p className="mt-1 text-sm text-slate-500">用于观察用户生成方案、点击商品和保存方案行为</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{updatedAt ? `更新时间 ${updatedAt}` : "尚未刷新"}</span>
            <button
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              disabled={isLoading}
              onClick={() => void loadAnalytics(password)}
              type="button"
            >
              {isLoading ? "刷新中..." : "刷新数据"}
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
                setAnalytics(null);
                setIsUnlocked(false);
                setPassword("");
              }}
              type="button"
            >
              锁定
            </button>
          </div>
        </header>

        {analytics.error && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {analytics.error}
          </div>
        )}

        {!hasData && (
          <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-600 shadow-sm">
            {EMPTY_STATE_TEXT}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard hint="用户点击生成方案的次数" label="总生成次数" value={analytics.totals.calculator} />
          <StatCard hint="用户点击查看商品的次数" label="商品点击次数" value={analytics.totals.productClick} />
          <StatCard hint="用户保存装备方案的次数" label="保存方案次数" value={analytics.totals.savedPlan} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <RankingTable items={analytics.topActivities} nameHeader="活动类型" title="热门活动" />
          <BudgetTable buckets={analytics.budgetBuckets} />
          <RankingTable items={analytics.topProducts} nameHeader="商品名称" title="热门商品" />
          <RankingTable items={analytics.topMerchants} nameHeader="商家" title="热门商家" />
        </section>
      </div>
    </main>
  );
}
