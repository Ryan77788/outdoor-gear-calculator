import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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

function isAuthorized(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const submittedPassword = request.headers.get("x-admin-password");

  return Boolean(adminPassword) && submittedPassword === adminPassword;
}

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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const analytics = await getAnalyticsData();

  return NextResponse.json(analytics);
}
