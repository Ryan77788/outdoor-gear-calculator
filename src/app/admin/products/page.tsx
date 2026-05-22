import { productCatalog, type ProductReviewStatus } from "@/data/products";

type ProductFilter = "all" | ProductReviewStatus;

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
];

const statusLabels: Record<ProductReviewStatus, string> = {
  "search-only": "待人工确认",
  reviewed: "已确认商品",
  "affiliate-ready": "联盟商品",
};

function normalizeFilter(value: string | undefined): ProductFilter {
  if (value === "search-only" || value === "reviewed" || value === "affiliate-ready") {
    return value;
  }

  return "all";
}

function formatPrice(value: number) {
  return `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

export const metadata = {
  title: "商品审核后台 | Outdoor AI",
  description: "查看 Outdoor AI 商品数据的链接类型与审核状态。",
};

export default async function ProductsAdminPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeFilter = normalizeFilter(params.status);
  const products = Object.entries(productCatalog).flatMap(([activity, items]) =>
    items.map((product) => ({
      ...product,
      activityLabel: activity,
    })),
  );
  const filteredProducts =
    activeFilter === "all" ? products : products.filter((product) => product.reviewStatus === activeFilter);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Admin</p>
            <h1 className="mt-2 text-3xl font-black">商品审核后台</h1>
            <p className="mt-2 text-sm text-slate-600">
              共 {products.length} 个商品，当前显示 {filteredProducts.length} 个。
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

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">商品名</th>
                  <th className="px-4 py-3">品牌</th>
                  <th className="px-4 py-3">活动</th>
                  <th className="px-4 py-3">商家</th>
                  <th className="px-4 py-3">linkType</th>
                  <th className="px-4 py-3">reviewStatus</th>
                  <th className="px-4 py-3 text-right">price</th>
                  <th className="px-4 py-3">buyUrl</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr className="align-top hover:bg-slate-50/70" key={`${product.activityLabel}-${product.id}`}>
                    <td className="max-w-72 px-4 py-3 font-semibold text-slate-950">
                      <p>{product.name}</p>
                      {product.nameEn && <p className="mt-1 text-xs font-medium text-slate-500">{product.nameEn}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{product.brand}</td>
                    <td className="px-4 py-3 text-slate-700">{product.activityLabel}</td>
                    <td className="px-4 py-3 text-slate-700">{product.merchant}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                        {product.linkType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-black ${
                          product.reviewStatus === "affiliate-ready"
                            ? "bg-emerald-50 text-emerald-800"
                            : product.reviewStatus === "reviewed"
                              ? "bg-lime-50 text-lime-800"
                              : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {statusLabels[product.reviewStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-950">{formatPrice(product.price)}</td>
                    <td className="max-w-80 px-4 py-3">
                      <a
                        className="break-all text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                        href={product.buyUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {product.buyUrl}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
