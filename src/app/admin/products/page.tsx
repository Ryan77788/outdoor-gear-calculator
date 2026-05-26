import { productCatalog, type ProductLinkType, type ProductReviewStatus } from "@/data/products";
import clientPromise from "@/lib/mongodb";
import { applyProductOverrides, type ProductOverride } from "@/lib/product-overrides";
import { ProductsAdminTable, type AdminProduct } from "@/app/admin/products/ProductsAdminTable";

type ProductFilter = "all" | ProductReviewStatus | "missing-image" | "missing-affiliateLink";

type ProductsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "全部", value: "all" },
  { label: "待人工确认", value: "search-only" },
  { label: "已确认商品", value: "reviewed" },
  { label: "联盟商品", value: "affiliate-ready" },
  { label: "缺少图片", value: "missing-image" },
  { label: "缺少 affiliateLink", value: "missing-affiliateLink" },
];
const linkTypes: ProductLinkType[] = ["product", "search"];
const reviewStatuses: ProductReviewStatus[] = ["search-only", "reviewed", "affiliate-ready"];

function normalizeFilter(value: string | undefined): ProductFilter {
  if (
    value === "search-only" ||
    value === "reviewed" ||
    value === "affiliate-ready" ||
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
      ...(typeof override.buyUrl === "string" ? { buyUrl: override.buyUrl } : {}),
      ...(typeof override.affiliateLink === "string" ? { affiliateLink: override.affiliateLink } : {}),
      ...(linkTypes.includes(override.linkType) ? { linkType: override.linkType } : {}),
      ...(reviewStatuses.includes(override.reviewStatus) ? { reviewStatus: override.reviewStatus } : {}),
      ...(typeof override.reviewNote === "string" ? { reviewNote: override.reviewNote } : {}),
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
  const products = Object.entries(productCatalog).flatMap(([activity, items]) =>
    items.map((product) => ({
      ...product,
      activityLabel: activity,
    })),
  ) as AdminProduct[];
  const productsWithOverrides = applyProductOverrides(products, overrides);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Admin</p>
            <h1 className="mt-2 text-3xl font-black">商品运营后台</h1>
            <p className="mt-2 text-sm text-slate-600">
              共 {products.length} 个商品，编辑和批量操作会保存到 MongoDB product_overrides。
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="商品审核状态筛选">
            {filterOptions.map((option) => (
              <a
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  activeFilter === option.value
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                href={option.value === "all" ? "/admin/products" : `/admin/products?status=${option.value}`}
                key={option.value}
              >
                {option.label}
              </a>
            ))}
          </nav>
        </header>

        <ProductsAdminTable products={productsWithOverrides} overrides={overrides} initialStatusFilter={activeFilter} />
      </div>
    </main>
  );
}
