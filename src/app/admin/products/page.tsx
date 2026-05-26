import { productCatalog, type ProductLinkType, type ProductReviewStatus } from "@/data/products";
import clientPromise from "@/lib/mongodb";
import { applyProductOverrides, buildCustomProductsFromOverrides, type ProductOverride } from "@/lib/product-overrides";
import { ProductsAdminTable, type AdminProduct } from "@/app/admin/products/ProductsAdminTable";

type ProductFilter = "all" | ProductReviewStatus | "curated" | "hidden" | "deleted" | "missing-image" | "missing-affiliateLink";

type ProductsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const linkTypes: ProductLinkType[] = ["product", "search"];
const reviewStatuses: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];
const budgetTiers = ["low", "mid", "high"];

function normalizeFilter(value: string | undefined): ProductFilter {
  if (
    value === "search-only" ||
    value === "reviewed" ||
    value === "affiliate-ready" ||
    value === "curated" ||
    value === "hidden" ||
    value === "deleted" ||
    value === "missing-image" ||
    value === "missing-affiliateLink"
  ) {
    return value;
  }

  return "all";
}

async function getProductOverrides(): Promise<ProductOverride[]> {
  try {
    const client = await clientPromise;
    const db = client.db("outdoor");
    const overrides = await db.collection("product_overrides").find({}).toArray();

    return overrides.map((override) => ({
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
      ...(linkTypes.includes(override.linkType) ? { linkType: override.linkType } : {}),
      ...(reviewStatuses.includes(override.reviewStatus) ? { reviewStatus: override.reviewStatus } : {}),
      ...(typeof override.reviewNote === "string" ? { reviewNote: override.reviewNote } : {}),
      ...(typeof override.isCurated === "boolean" ? { isCurated: override.isCurated } : {}),
      ...(typeof override.isHidden === "boolean" ? { isHidden: override.isHidden } : {}),
      ...(typeof override.isDeleted === "boolean" ? { isDeleted: override.isDeleted } : {}),
      ...(typeof override.imageReviewed === "boolean" ? { imageReviewed: override.imageReviewed } : {}),
      ...(typeof override.isCustomProduct === "boolean" ? { isCustomProduct: override.isCustomProduct } : {}),
      ...(budgetTiers.includes(override.budgetTier) ? { budgetTier: override.budgetTier } : {}),
      ...(typeof override.price === "number" ? { price: override.price } : {}),
      ...(override.bestFor ? { bestFor: override.bestFor } : {}),
      ...(override.strengths ? { strengths: override.strengths } : {}),
      ...(override.notIdealFor ? { notIdealFor: override.notIdealFor } : {}),
      ...(typeof override.image === "string" ? { image: override.image } : {}),
      updatedAt: override.updatedAt?.toISOString?.() ?? override.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to load product overrides:", error);

    return [];
  }
}

export const metadata = {
  title: "商品运营后台 | Outdoor AI",
  description: "查看、搜索、排序、批量编辑 Outdoor AI 商品链接、图片与审核状态。",
};

export default async function ProductsAdminPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeFilter = normalizeFilter(params.status);
  const overrides = await getProductOverrides();
  const customProducts = buildCustomProductsFromOverrides(overrides, { includeHidden: true, includeDeleted: true });
  const products = Object.entries(productCatalog).flatMap(([activity, items]) =>
    items.map((product) => ({
      ...product,
      activityLabel: activity,
    })),
  ) as AdminProduct[];
  const productsWithOverrides = applyProductOverrides(
    [
      ...products,
      ...customProducts.map((product) => ({
        ...product,
        activityLabel: product.activity[0] ?? "自定义商品",
      })),
    ] as AdminProduct[],
    overrides,
    { includeHidden: true, includeDeleted: true },
  );

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <ProductsAdminTable products={productsWithOverrides} overrides={overrides} initialStatusFilter={activeFilter} />
      </div>
    </main>
  );
}
