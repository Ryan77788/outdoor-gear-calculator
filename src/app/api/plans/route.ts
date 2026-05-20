import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const PLANS_LIMIT = 20;
const SAVED_PLANS_COLLECTION = "saved_plans";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const plans = await db
      .collection(SAVED_PLANS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(PLANS_LIMIT)
      .toArray();

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        ...plan,
        _id: plan._id.toString(),
      })),
    });
  } catch (error) {
    console.error("读取方案库失败:", error);

    return NextResponse.json({ success: false, error: "读取方案库失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("outdoor");
    const createdAt = new Date();
    const plan = {
      activity: body.activity,
      tripDays: body.tripDays,
      weather: body.weather,
      peopleCount: body.peopleCount,
      budget: body.budget,
      gearList: body.gearList,
      recommendedProducts: body.recommendedProducts,
      risks: body.risks,
      totalPrice: body.totalPrice,
      gearTier: body.gearTier,
      createdAt,
    };
    const result = await db.collection(SAVED_PLANS_COLLECTION).insertOne(plan);
    const planId = result.insertedId.toString();

    await db.collection("logs").insertOne({
      type: "saved_plan",
      data: {
        planId,
        activity: body.activity,
        days: body.tripDays,
        weather: body.weather,
        people: body.peopleCount,
        budget: body.budget,
        totalPrice: body.totalPrice,
        gearTier: body.gearTier,
      },
      createdAt,
    });

    return NextResponse.json({
      success: true,
      planId,
      plan: {
        ...plan,
        _id: planId,
      },
    });
  } catch (error) {
    console.error("保存方案失败:", error);

    return NextResponse.json({ success: false, error: "保存方案失败" }, { status: 500 });
  }
}
