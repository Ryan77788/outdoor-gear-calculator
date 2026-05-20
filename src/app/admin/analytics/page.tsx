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

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value.toLocaleString("en-US")}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function RankingTable({ title, items, emptyText }: { title: string; items: RankingItem[]; emptyText: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3 text-right">Count</th>
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
                  {emptyText}
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
        <h2 className="text-base font-black text-slate-950">Budget ranges</h2>
      </div>
      <div className="grid divide-y divide-slate-100">
        {buckets.map((bucket) => (
          <div className="flex items-center justify-between px-5 py-4" key={bucket.label}>
            <span className="font-semibold text-slate-700">{bucket.label}</span>
            <span className="font-black text-slate-950">{bucket.count.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
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
        setError("Incorrect password");
        return;
      }

      if (!response.ok) {
        throw new Error(`Analytics request failed with status ${response.status}`);
      }

      const data = (await response.json()) as AnalyticsData;

      localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, nextPassword);
      setAnalytics(data);
      setIsUnlocked(true);
      setUpdatedAt(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
    } catch (requestError) {
      console.error("Failed to load analytics:", requestError);
      setError("Unable to load analytics. Check MongoDB access and try again.");
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
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin / Analytics</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Enter password</h1>
          <label className="mt-6 block text-sm font-bold text-slate-700" htmlFor="admin-password">
            Password
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
            {isLoading ? "Checking..." : "View analytics"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-2 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin / Analytics</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Outdoor Gear Calculator</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Updated {updatedAt}</span>
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
              Lock
            </button>
          </div>
        </header>

        {analytics.error && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {analytics.error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard hint="Total calculator events" label="Total generations" value={analytics.totals.calculator} />
          <StatCard hint="Total product_click events" label="Product clicks" value={analytics.totals.productClick} />
          <StatCard hint="Total saved_plan events" label="Saved plans" value={analytics.totals.savedPlan} />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <RankingTable emptyText="No calculator activity logs yet." items={analytics.topActivities} title="Top activities" />
          <BudgetTable buckets={analytics.budgetBuckets} />
          <RankingTable emptyText="No product click logs yet." items={analytics.topProducts} title="Top productName" />
          <RankingTable emptyText="No merchant click logs yet." items={analytics.topMerchants} title="Top merchant" />
        </section>
      </div>
    </main>
  );
}
