import { NextResponse } from "next/server";
import type { ProductLinkType, ProductReviewStatus } from "@/data/products";
import clientPromise from "@/lib/mongodb";
import { sanitizeProductOverride, type ProductOverrideInput } from "@/lib/product-overrides";

const PRODUCT_OVERRIDES_COLLECTION = "product_overrides";
const linkTypes: ProductLinkType[] = ["product", "search"];
const reviewStatuses: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];

function isValidOverride(body: ProductOverrideInput) {
  return (
    typeof body.id === "string" &&
    body.id.trim().length > 0 &&
    (body.linkType === undefined || linkTypes.includes(body.linkType)) &&
    (body.reviewStatus === undefined || reviewStatuses.includes(body.reviewStatus))
  );
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const overrides = await db.collection(PRODUCT_OVERRIDES_COLLECTION).find({}).toArray();

    return NextResponse.json({
      success: true,
      overrides: overrides.map((override) => ({
        id: override.id,
        ...(typeof override.buyUrl === "string" ? { buyUrl: override.buyUrl } : {}),
        ...(typeof override.affiliateLink === "string" ? { affiliateLink: override.affiliateLink } : {}),
        ...(typeof override.linkType === "string" ? { linkType: override.linkType } : {}),
        ...(typeof override.reviewStatus === "string" ? { reviewStatus: override.reviewStatus } : {}),
        ...(typeof override.image === "string" ? { image: override.image } : {}),
        updatedAt: override.updatedAt?.toISOString?.() ?? override.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to load product overrides:", error);

    return NextResponse.json({ success: false, error: "Failed to load product overrides" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductOverrideInput;

    if (!isValidOverride(body)) {
      return NextResponse.json({ success: false, error: "Invalid product override" }, { status: 400 });
    }

    const override = sanitizeProductOverride(body);
    const client = await clientPromise;
    const db = client.db("outdoor");
    const updatedAt = new Date();

    await db.collection(PRODUCT_OVERRIDES_COLLECTION).updateOne(
      { id: override.id },
      {
        $set: {
          ...override,
          updatedAt,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      override: {
        ...override,
        updatedAt: updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to save product override:", error);

    return NextResponse.json({ success: false, error: "Failed to save product override" }, { status: 500 });
  }
}
