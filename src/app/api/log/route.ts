import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("outdoor");

    await db.collection("logs").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("写入日志失败:", error);

    return NextResponse.json(
      { success: false, error: "写入日志失败" },
      { status: 500 }
    );
  }
}