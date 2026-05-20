import type { Metadata } from "next";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics Admin | Outdoor Gear Calculator",
  description: "User behavior analytics for Outdoor Gear Calculator.",
};

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

const emptyAnalytics: AnalyticsData = {
  totals: {
    calculator: 0,
    productClick: 0,
    savedPlan: 0,
  },
  topActivities: [],
  topProducts: [],
  topMerchants: [],
  budgetBuckets: [
    { label: "0-1000", count: 0 },
    { label: "1000-3000", count: 0 },
    { label: "3000-8000", count: 0 },
    { label: "8000+", count: 0 },
  ],
};

async function getTopRanking(field: "activity" | "productName" | "merchant", type?: string) {
  const client = await clientPromise;
  const db = client.db("outdoor");
  const match: Record<string, unknown> = {
    [`data.${field}`]: { $exists: true, $nin: [null, ""] },
  };

  if (type) {
    match.type = type;
  }

  return db
    .collection("logs")
    .aggregate<RankingItem>([
      { $match: match },
      { $group: { _id: `$data.${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 10 },
      { $project: { _id: 0, name: { $toString: "$_id" }, count: 1 } },
    ])
    .toArray();
}

async function getBudgetBucketCount(min: number, max?: number) {
  const client = await clientPromise;
  const db = client.db("outdoor");
  const budgetFilter = max === undefined ? { $gte: min } : { $gte: min, $lt: max };

  return db.collection("logs").countDocuments({
    type: "calculator",
    "data.budget": budgetFilter,
  });
}

async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const logs = db.collection("logs");

    const [
      calculator,
      productClick,
      savedPlan,
      topActivities,
      topProducts,
      topMerchants,
      budget0To1000,
      budget1000To3000,
      budget3000To8000,
      budget8000Plus,
    ] = await Promise.all([
      logs.countDocuments({ type: "calculator" }),
      logs.countDocuments({ type: "product_click" }),
      logs.countDocuments({ type: "saved_plan" }),
      getTopRanking("activity", "calculator"),
      getTopRanking("productName", "product_click"),
      getTopRanking("merchant", "product_click"),
      getBudgetBucketCount(0, 1000),
      getBudgetBucketCount(1000, 3000),
      getBudgetBucketCount(3000, 8000),
      getBudgetBucketCount(8000),
    ]);

    return {
      totals: {
        calculator,
        productClick,
        savedPlan,
      },
      topActivities,
      topProducts,
      topMerchants,
      budgetBuckets: [
        { label: "0-1000", count: budget0To1000 },
        { label: "1000-3000", count: budget1000To3000 },
        { label: "3000-8000", count: budget3000To8000 },
        { label: "8000+", count: budget8000Plus },
      ],
    };
  } catch (error) {
    console.error("Failed to load analytics:", error);

    return {
      ...emptyAnalytics,
      error: "Unable to load MongoDB analytics data. Check MONGODB_URI and database access.",
    };
  }
}

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

export default async function AnalyticsAdminPage() {
  const analytics = await getAnalyticsData();
  const updatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-2 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Admin / Analytics</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Outdoor Gear Calculator</h1>
          </div>
          <p className="text-sm text-slate-500">Updated {updatedAt}</p>
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
