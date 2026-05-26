import { NextResponse } from "next/server";
import type { ProductLinkType, ProductReviewStatus } from "@/data/products";
import clientPromise from "@/lib/mongodb";
import { sanitizeProductOverride, type ProductOverrideInput } from "@/lib/product-overrides";

const PRODUCT_OVERRIDES_COLLECTION = "product_overrides";
const linkTypes: ProductLinkType[] = ["product", "search"];
const reviewStatuses: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];
const budgetTiers = ["low", "mid", "high"];

function isValidExpertRecommendation(value: ProductOverrideInput["bestFor"]) {
  if (value === undefined) return true;

  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray(value.zh) &&
    Array.isArray(value.en) &&
    value.zh.every((item) => typeof item === "string") &&
    value.en.every((item) => typeof item === "string")
  );
}

function isValidOverride(body: ProductOverrideInput) {
  return (
    typeof body.id === "string" &&
    body.id.trim().length > 0 &&
    (body.name === undefined || typeof body.name === "string") &&
    (body.nameEn === undefined || typeof body.nameEn === "string") &&
    (body.brand === undefined || typeof body.brand === "string") &&
    (body.activity === undefined || typeof body.activity === "string" || Array.isArray(body.activity)) &&
    (body.category === undefined || typeof body.category === "string") &&
    (body.merchant === undefined || typeof body.merchant === "string") &&
    (body.unit === undefined || typeof body.unit === "string") &&
    (body.linkType === undefined || linkTypes.includes(body.linkType)) &&
    (body.reviewStatus === undefined || reviewStatuses.includes(body.reviewStatus)) &&
    (body.reviewNote === undefined || typeof body.reviewNote === "string") &&
    (body.isCurated === undefined || typeof body.isCurated === "boolean") &&
    (body.isHidden === undefined || typeof body.isHidden === "boolean") &&
    (body.isDeleted === undefined || typeof body.isDeleted === "boolean") &&
    (body.imageReviewed === undefined || typeof body.imageReviewed === "boolean") &&
    (body.isCustomProduct === undefined || typeof body.isCustomProduct === "boolean") &&
    (body.budgetTier === undefined || budgetTiers.includes(body.budgetTier)) &&
    (body.price === undefined || (typeof body.price === "number" && Number.isFinite(body.price) && body.price >= 0)) &&
    isValidExpertRecommendation(body.bestFor) &&
    isValidExpertRecommendation(body.strengths) &&
    isValidExpertRecommendation(body.notIdealFor)
  );
}

type BulkProductOverridesInput = {
  overrides?: ProductOverrideInput[];
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const overrides = await db.collection(PRODUCT_OVERRIDES_COLLECTION).find({}).toArray();

    return NextResponse.json({
      success: true,
      overrides: overrides.map((override) => ({
        id: override.id,
        ...(typeof override.name === "string" ? { name: override.name } : {}),
        ...(typeof override.nameEn === "string" ? { nameEn: override.nameEn } : {}),
        ...(typeof override.brand === "string" ? { brand: override.brand } : {}),
        ...(typeof override.activity === "string" || Array.isArray(override.activity) ? { activity: override.activity } : {}),
        ...(typeof override.category === "string" ? { category: override.category } : {}),
        ...(typeof override.merchant === "string" ? { merchant: override.merchant } : {}),
        ...(typeof override.unit === "string" ? { unit: override.unit } : {}),
        ...(typeof override.buyUrl === "string" ? { buyUrl: override.buyUrl } : {}),
        ...(typeof override.affiliateLink === "string" ? { affiliateLink: override.affiliateLink } : {}),
        ...(typeof override.linkType === "string" ? { linkType: override.linkType } : {}),
        ...(typeof override.reviewStatus === "string" ? { reviewStatus: override.reviewStatus } : {}),
        ...(typeof override.reviewNote === "string" ? { reviewNote: override.reviewNote } : {}),
        ...(typeof override.isCurated === "boolean" ? { isCurated: override.isCurated } : {}),
        ...(typeof override.isHidden === "boolean" ? { isHidden: override.isHidden } : {}),
        ...(typeof override.isDeleted === "boolean" ? { isDeleted: override.isDeleted } : {}),
        ...(typeof override.imageReviewed === "boolean" ? { imageReviewed: override.imageReviewed } : {}),
        ...(typeof override.isCustomProduct === "boolean" ? { isCustomProduct: override.isCustomProduct } : {}),
        ...(typeof override.budgetTier === "string" && budgetTiers.includes(override.budgetTier)
          ? { budgetTier: override.budgetTier }
          : {}),
        ...(typeof override.price === "number" && Number.isFinite(override.price) ? { price: override.price } : {}),
        ...(override.bestFor !== undefined && isValidExpertRecommendation(override.bestFor) ? { bestFor: override.bestFor } : {}),
        ...(override.strengths !== undefined && isValidExpertRecommendation(override.strengths) ? { strengths: override.strengths } : {}),
        ...(override.notIdealFor !== undefined && isValidExpertRecommendation(override.notIdealFor)
          ? { notIdealFor: override.notIdealFor }
          : {}),
        ...(typeof override.image === "string" ? { image: override.image } : {}),
        updatedAt: override.updatedAt?.toISOString?.() ?? override.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to load product overrides:", error);

    return NextResponse.json({ success: true, overrides: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductOverrideInput | BulkProductOverridesInput;
    const inputOverrides = "overrides" in body && Array.isArray(body.overrides) ? body.overrides : [body as ProductOverrideInput];

    if (inputOverrides.length === 0 || inputOverrides.some((override) => !isValidOverride(override))) {
      return NextResponse.json({ success: false, error: "Invalid product override" }, { status: 400 });
    }

    const overrides = inputOverrides.map((override) => sanitizeProductOverride(override));
    const client = await clientPromise;
    const db = client.db("outdoor");
    const updatedAt = new Date();

    await db.collection(PRODUCT_OVERRIDES_COLLECTION).bulkWrite(
      overrides.map((override) => ({
        updateOne: {
          filter: { id: override.id },
          update: {
            $set: {
              ...override,
              updatedAt,
            },
          },
          upsert: true,
        },
      })),
    );

    const savedOverrides = overrides.map((override) => ({
      ...override,
      updatedAt: updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      override: savedOverrides[0],
      overrides: savedOverrides,
    });
  } catch (error) {
    console.error("Failed to save product override:", error);

    return NextResponse.json({ success: false, error: "Failed to save product override" }, { status: 500 });
  }
}
