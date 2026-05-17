import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "无效的方案 ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("outdoor");
    const result = await db.collection("plans").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("删除方案失败:", error);

    return NextResponse.json({ success: false, error: "删除方案失败" }, { status: 500 });
  }
}
