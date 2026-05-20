import { NextResponse } from "next/server";
import type { Collection, Document, Filter } from "mongodb";
import clientPromise from "@/lib/mongodb";

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

const emptyAnalytics: AnalyticsData = {
  range: "7d",
  totals: {
    calculator: 0,
    productClick: 0,
    savedPlan: 0,
    shareImage: 0,
    shareLinkCopy: 0,
  },
  averages: {
    budget: 0,
    recommendedTotal: 0,
  },
  conversionRates: {
    productClick: 0,
    savedPlan: 0,
    share: 0,
  },
  topActivities: [],
  topProducts: [],
  topMerchants: [],
  topWeather: [],
  budgetBuckets: [
    { label: "0-1000", count: 0 },
    { label: "1000-3000", count: 0 },
    { label: "3000-8000", count: 0 },
    { label: "8000+", count: 0 },
  ],
  recentLogs: [],
};

function isAuthorized(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const submittedPassword = request.headers.get("x-admin-password");

  return Boolean(adminPassword) && submittedPassword === adminPassword;
}

function getTimeRange(request: Request): TimeRange {
  const range = new URL(request.url).searchParams.get("range");

  if (range === "today" || range === "7d" || range === "30d" || range === "all") {
    return range;
  }

  return "7d";
}

function getTimeMatch(range: TimeRange): Filter<Document> {
  if (range === "all") return {};

  const now = new Date();
  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);

    return { createdAt: { $gte: start } };
  }

  start.setDate(start.getDate() - (range === "7d" ? 7 : 30));

  return { createdAt: { $gte: start } };
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function rate(part: number, total: number) {
  return total > 0 ? part / total : 0;
}

async function getTopRanking(
  logs: Collection<Document>,
  baseMatch: Filter<Document>,
  field: "activity" | "productName" | "merchant" | "weather",
  type?: string,
) {
  const match: Filter<Document> = {
    ...baseMatch,
    [`data.${field}`]: { $exists: true, $nin: [null, ""] },
  };

  if (type) {
    match.type = type;
  }

  return logs
    .aggregate<RankingItem>([
      { $match: match },
      { $group: { _id: `$data.${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: { $toString: "$_id" }, count: 1 } },
    ])
    .toArray();
}

async function getBudgetBucketCount(logs: Collection<Document>, baseMatch: Filter<Document>, min: number, max?: number) {
  const budgetFilter = max === undefined ? { $gte: min } : { $gte: min, $lt: max };

  return logs.countDocuments({
    ...baseMatch,
    type: "calculator",
    "data.budget": budgetFilter,
  });
}

async function getAverage(logs: Collection<Document>, baseMatch: Filter<Document>, type: string, field: string) {
  const [result] = await logs
    .aggregate<{ average: number }>([
      { $match: { ...baseMatch, type, [field]: { $type: "number" } } },
      { $group: { _id: null, average: { $avg: `$${field}` } } },
      { $project: { _id: 0, average: 1 } },
    ])
    .toArray();

  return safeNumber(result?.average);
}

async function getRecentLogs(logs: Collection<Document>, baseMatch: Filter<Document>) {
  const recentLogs = await logs
    .aggregate<Document>([{ $match: baseMatch }, { $sort: { createdAt: -1 } }, { $limit: 20 }])
    .toArray();

  return recentLogs.map((log): RecentLog => {
    const data = (log.data && typeof log.data === "object" ? log.data : {}) as Record<string, unknown>;
    const createdAt = log.createdAt instanceof Date ? log.createdAt.toISOString() : "";

    return {
      createdAt,
      type: typeof log.type === "string" ? log.type : "-",
      activity: typeof data.activity === "string" ? data.activity : "-",
      productName: typeof data.productName === "string" ? data.productName : "-",
      merchant: typeof data.merchant === "string" ? data.merchant : "-",
      budget: typeof data.budget === "number" ? data.budget : null,
    };
  });
}

async function getAnalyticsData(range: TimeRange): Promise<AnalyticsData> {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const logs = db.collection("logs");
    const baseMatch = getTimeMatch(range);

    const [
      calculator,
      productClick,
      savedPlan,
      shareImage,
      shareLinkCopy,
      averageBudget,
      averageRecommendedTotal,
      topActivities,
      topProducts,
      topMerchants,
      topWeather,
      budget0To1000,
      budget1000To3000,
      budget3000To8000,
      budget8000Plus,
      recentLogs,
    ] = await Promise.all([
      logs.countDocuments({ ...baseMatch, type: "calculator" }),
      logs.countDocuments({ ...baseMatch, type: "product_click" }),
      logs.countDocuments({ ...baseMatch, type: "saved_plan" }),
      logs.countDocuments({ ...baseMatch, type: "share_image" }),
      logs.countDocuments({ ...baseMatch, type: "share_link_copy" }),
      getAverage(logs, baseMatch, "calculator", "data.budget"),
      getAverage(logs, baseMatch, "saved_plan", "data.totalPrice"),
      getTopRanking(logs, baseMatch, "activity", "calculator"),
      getTopRanking(logs, baseMatch, "productName", "product_click"),
      getTopRanking(logs, baseMatch, "merchant", "product_click"),
      getTopRanking(logs, baseMatch, "weather"),
      getBudgetBucketCount(logs, baseMatch, 0, 1000),
      getBudgetBucketCount(logs, baseMatch, 1000, 3000),
      getBudgetBucketCount(logs, baseMatch, 3000, 8000),
      getBudgetBucketCount(logs, baseMatch, 8000),
      getRecentLogs(logs, baseMatch),
    ]);

    const shareTotal = shareImage + shareLinkCopy;

    return {
      range,
      totals: {
        calculator,
        productClick,
        savedPlan,
        shareImage,
        shareLinkCopy,
      },
      averages: {
        budget: averageBudget,
        recommendedTotal: averageRecommendedTotal,
      },
      conversionRates: {
        productClick: rate(productClick, calculator),
        savedPlan: rate(savedPlan, calculator),
        share: rate(shareTotal, calculator),
      },
      topActivities,
      topProducts,
      topMerchants,
      topWeather,
      budgetBuckets: [
        { label: "0-1000", count: budget0To1000 },
        { label: "1000-3000", count: budget1000To3000 },
        { label: "3000-8000", count: budget3000To8000 },
        { label: "8000+", count: budget8000Plus },
      ],
      recentLogs,
    };
  } catch (error) {
    console.error("Failed to load analytics:", error);

    return {
      ...emptyAnalytics,
      range,
      error: "Unable to load MongoDB analytics data. Check MONGODB_URI and database access.",
    };
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const analytics = await getAnalyticsData(getTimeRange(request));

  return NextResponse.json(analytics);
}
