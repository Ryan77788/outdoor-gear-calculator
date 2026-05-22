"use client";

import { FormEvent, useEffect, useState } from "react";

type TimeRange = "today" | "7d" | "30d" | "all";

type RankingItem = {
  name: string;
  count: number;
};

type BudgetBucket = {
  label: "0-1000" | "1000-3000" | "3000-8000" | "8000+";
  count: number;
};

type RecentLog = {
  createdAt: string;
  type: string;
  activity: string;
  productName: string;
  merchant: string;
  budget: number | null;
};

type AnalyticsData = {
  range: TimeRange;
  totals: {
    calculator: number;
    productClick: number;
    savedPlan: number;
    shareImage: number;
    shareLinkCopy: number;
  };
  averages: {
    budget: number;
    recommendedTotal: number;
  };
  conversionRates: {
    productClick: number;
    savedPlan: number;
    share: number;
  };
  topActivities: RankingItem[];
  topProducts: RankingItem[];
  topMerchants: RankingItem[];
  topWeather: RankingItem[];
  budgetBuckets: BudgetBucket[];
  recentLogs: RecentLog[];
  error?: string;
};

const ADMIN_PASSWORD_STORAGE_KEY = "ADMIN_PASSWORD";
const EMPTY_STATE_TEXT = "暂无数据，先回首页生成一次方案。";

const timeRangeOptions: Array<{ label: string; value: TimeRange }> = [
  { label: "今日", value: "today" },
  { label: "最近 7 天", value: "7d" },
  { label: "最近 30 天", value: "30d" },
  { label: "全部", value: "all" },
];

const logTypeLabels: Record<string, string> = {
  calculator: "生成方案",
  product_click: "商品点击",
  saved_plan: "保存方案",
  share_image: "生成分享图",
  share_link_copy: "复制分享链接",
};

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("zh-CN");
}

function formatMoney(value: number) {
  return value > 0 ? `¥${Math.round(value).toLocaleString("zh-CN")}` : "-";
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return value.toLocaleString("zh-CN");
  return value;
}

function reportClientError(message: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-9 w-28" />
      <SkeletonBlock className="mt-4 h-4 w-full" />
      <SkeletonBlock className="mt-2 h-4 w-2/3" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <SkeletonBlock className="h-5 w-40" />
      </div>
      <div className="p-5">
        <div className="grid grid-cols-[0.7fr_1.4fr_0.8fr] gap-4 border-b border-slate-100 pb-3">
          <SkeletonBlock className="h-4" />
          <SkeletonBlock className="h-4" />
          <SkeletonBlock className="h-4" />
        </div>
        <div className="space-y-4 pt-4">
          {Array.from({ length: rows }).map((_, index) => (
            <div className="grid grid-cols-[0.7fr_1.4fr_0.8fr] gap-4" key={index}>
              <SkeletonBlock className="h-4" />
              <SkeletonBlock className="h-4" />
              <SkeletonBlock className="h-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Loading analytics metrics">
        {Array.from({ length: 8 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Loading analytics tables">
        {Array.from({ length: 5 }).map((_, index) => (
          <TableSkeleton key={index} rows={index === 4 ? 4 : 5} />
        ))}
      </section>
      <section className="mt-6">
        <TableSkeleton rows={6} />
      </section>
    </>
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
          <thead className="bg-slate-50 text-xs text-slate-500">
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
                  <td className="px-5 py-3 font-semibold text-slate-900">{displayValue(item.name)}</td>
                  <td className="px-5 py-3 text-right font-black text-slate-950">{formatNumber(item.count)}</td>
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
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-5 py-3">预算区间</th>
            <th className="px-5 py-3 text-right">次数</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {buckets.map((bucket) => (
            <tr key={bucket.label}>
              <td className="px-5 py-4 font-semibold text-slate-700">{bucket.label}</td>
              <td className="px-5 py-4 text-right font-black text-slate-950">{formatNumber(bucket.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function RecentLogsTable({ logs }: { logs: RecentLog[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-black text-slate-950">最近行为</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3">时间</th>
              <th className="px-5 py-3">类型</th>
              <th className="px-5 py-3">活动类型</th>
              <th className="px-5 py-3">商品名称</th>
              <th className="px-5 py-3">商家</th>
              <th className="px-5 py-3 text-right">预算</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={`${log.createdAt}-${log.type}-${index}`}>
                  <td className="px-5 py-3 text-slate-600">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{logTypeLabels[log.type] ?? log.type ?? "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{displayValue(log.activity)}</td>
                  <td className="px-5 py-3 text-slate-700">{displayValue(log.productName)}</td>
                  <td className="px-5 py-3 text-slate-700">{displayValue(log.merchant)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">{formatMoney(log.budget ?? 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-5 text-slate-500" colSpan={6}>
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

export default function AnalyticsAdminPage() {
  const [password, setPassword] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  async function loadAnalytics(nextPassword: string, nextRange: TimeRange = timeRange) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/analytics?range=${nextRange}`, {
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
      reportClientError("Failed to load analytics:", requestError);
      setError("无法加载数据，请检查 MongoDB 连接后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedPassword = localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY);

    if (storedPassword) {
      setPassword(storedPassword);
      void loadAnalytics(storedPassword, timeRange);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadAnalytics(password, timeRange);
  }

  function handleRangeChange(nextRange: TimeRange) {
    setTimeRange(nextRange);

    if (isUnlocked) {
      void loadAnalytics(password, nextRange);
    }
  }

  if (isLoading && !analytics && password) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-5 flex flex-col gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500">后台 / 数据分析</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">数据分析后台</h1>
              <p className="mt-3 text-sm text-slate-500">正在加载 MongoDB logs 数据...</p>
            </div>
          </header>
          <section className="mb-5 flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <SkeletonBlock className="h-10 w-24" key={option.value} />
            ))}
          </section>
          <AnalyticsSkeleton />
        </div>
      </main>
    );
  }

  if (!isUnlocked || !analytics) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-950">
        <form className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
          <p className="text-xs font-bold text-slate-500">后台 / 数据分析</p>
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
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}
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

  const shareTotal = analytics.totals.shareImage + analytics.totals.shareLinkCopy;
  const hasData = analytics.totals.calculator + analytics.totals.productClick + analytics.totals.savedPlan + shareTotal > 0;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">后台 / 数据分析</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">数据分析后台</h1>
            <p className="mt-3 text-sm text-slate-500">数据来自 MongoDB logs 集合</p>
            <p className="mt-1 text-sm text-slate-500">用于观察用户生成方案、点击商品和保存方案行为</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{updatedAt ? `更新时间 ${updatedAt}` : "尚未刷新"}</span>
            <button
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              disabled={isLoading}
              onClick={() => void loadAnalytics(password, timeRange)}
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

        <section className="mb-5 flex flex-wrap gap-2">
          {timeRangeOptions.map((option) => (
            <button
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                timeRange === option.value
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              key={option.value}
              onClick={() => handleRangeChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </section>

        {analytics.error && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="alert">
            {analytics.error}
          </div>
        )}

        {isLoading ? (
          <AnalyticsSkeleton />
        ) : (
          <>
        {!hasData && (
          <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-600 shadow-sm">
            {EMPTY_STATE_TEXT}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard hint="用户点击生成方案的次数" label="总生成次数" value={formatNumber(analytics.totals.calculator)} />
          <StatCard hint="用户点击查看商品的次数" label="商品点击次数" value={formatNumber(analytics.totals.productClick)} />
          <StatCard hint="用户保存装备方案的次数" label="保存方案次数" value={formatNumber(analytics.totals.savedPlan)} />
          <StatCard hint="用户生成分享图的次数" label="分享图生成次数" value={formatNumber(analytics.totals.shareImage)} />
          <StatCard hint="用户复制分享链接的次数" label="分享链接复制次数" value={formatNumber(analytics.totals.shareLinkCopy)} />
          <StatCard hint="按生成方案日志计算" label="平均预算" value={formatMoney(analytics.averages.budget)} />
          <StatCard hint="按保存方案日志计算" label="平均推荐总价" value={formatMoney(analytics.averages.recommendedTotal)} />
          <StatCard hint="商品点击次数 / 生成次数" label="商品点击率" value={formatRate(analytics.conversionRates.productClick)} />
          <StatCard hint="保存方案次数 / 生成次数" label="保存率" value={formatRate(analytics.conversionRates.savedPlan)} />
          <StatCard hint="分享图和分享链接 / 生成次数" label="分享率" value={formatRate(analytics.conversionRates.share)} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <RankingTable items={analytics.topActivities} nameHeader="活动类型" title="热门活动 Top 5" />
          <RankingTable items={analytics.topProducts} nameHeader="商品名称" title="热门商品 Top 5" />
          <RankingTable items={analytics.topMerchants} nameHeader="商家" title="热门商家 Top 5" />
          <RankingTable items={analytics.topWeather} nameHeader="天气" title="热门天气 Top 5" />
          <BudgetTable buckets={analytics.budgetBuckets} />
        </section>

        <section className="mt-6">
          <RecentLogsTable logs={analytics.recentLogs} />
        </section>
          </>
        )}
      </div>
    </main>
  );
}
