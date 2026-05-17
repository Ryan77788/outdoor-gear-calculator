import type { Metadata } from "next";
import Image from "next/image";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { Product } from "@/data/products";
import type { GearItem, RiskBlock } from "@/lib/recommendation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SharedPlan = {
  _id: string;
  activity: string;
  tripDays: string;
  weather: string;
  peopleCount: number;
  budget: number;
  gearList: GearItem[];
  recommendedProducts: Product[];
  risks: RiskBlock[];
  totalPrice: number;
  createdAt: string;
};

type DbPlan = Omit<SharedPlan, "_id" | "createdAt"> & {
  _id: ObjectId;
  createdAt: Date | string;
};

const defaultMetadata = {
  title: "装备方案｜户外装备选择器",
  description: "查看已分享的户外装备方案。",
};

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

function formatSavedTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function serializePlan(plan: DbPlan): SharedPlan {
  return {
    ...plan,
    _id: plan._id.toString(),
    createdAt: new Date(plan.createdAt).toISOString(),
  };
}

async function getSharedPlan(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db("outdoor");
  const plan = await db.collection<DbPlan>("plans").findOne({ _id: new ObjectId(id) });

  return plan ? serializePlan(plan) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const plan = await getSharedPlan(id);

    if (!plan) {
      return defaultMetadata;
    }

    return {
      title: `${plan.activity}装备方案｜户外装备选择器`,
      description: `${plan.peopleCount}人，${plan.tripDays}，${plan.weather}，预算${plan.budget}元的户外装备方案`,
    };
  } catch (error) {
    console.error("生成分享页 metadata 失败:", error);
    return defaultMetadata;
  }
}

function EmptyState() {
  return (
    <main className="min-h-screen bg-[#eef3ea] px-5 py-10 text-slate-900">
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
        <div className="w-full rounded-2xl border border-white bg-white/92 p-7 text-center shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Outdoor Gear Planner</p>
          <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">方案不存在或已被删除</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            这个分享链接暂时无法打开。可能是链接不完整，或者原方案已经从方案库中删除。
          </p>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
    </div>
  );
}

export default async function SharedPlanPage({ params }: PageProps) {
  const { id } = await params;
  let plan: SharedPlan | null = null;

  try {
    plan = await getSharedPlan(id);
  } catch (error) {
    console.error("读取分享方案失败:", error);
  }

  if (!plan) {
    return <EmptyState />;
  }

  const remainingBudget = plan.budget - plan.totalPrice;

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 0.32), rgba(22, 80, 45, 0.12), rgba(238, 243, 234, 0.95)), url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85")',
          }}
        />
        <div className="mx-auto flex min-h-[300px] max-w-6xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6">
          <p className="w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            已分享的装备方案
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white drop-shadow-sm sm:text-5xl">
            {plan.activity}装备方案
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            {plan.peopleCount}人 · {plan.tripDays} · {plan.weather} · 保存于 {formatSavedTime(plan.createdAt)}
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-5 pb-12 sm:px-6">
        <div className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="活动类型" value={plan.activity} />
            <InfoCard label="出行天数" value={plan.tripDays} />
            <InfoCard label="天气" value={plan.weather} />
            <InfoCard label="出行人数" value={`${plan.peopleCount}人`} />
            <InfoCard label="预算" value={formatCurrency(plan.budget)} />
            <InfoCard label="推荐组合总价" value={formatCurrency(plan.totalPrice)} />
            <InfoCard
              label={remainingBudget < 0 ? "小幅超出" : "剩余预算"}
              value={formatCurrency(Math.abs(remainingBudget))}
            />
            <InfoCard label="保存时间" value={formatSavedTime(plan.createdAt)} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">必备装备列表</h2>
              <p className="mt-1 text-sm text-slate-500">按本次活动、天气、天数和人数保存的清单。</p>
            </div>
            <ul className="space-y-2">
              {plan.gearList.map((item, index) => (
                <li className="rounded-xl border border-slate-200 bg-slate-50/75 p-3" key={`${item.name}-${index}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.reason}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {item.quantity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">推荐商品列表</h2>
              <p className="mt-1 text-sm text-slate-500">
                推荐组合总价 {formatCurrency(plan.totalPrice)}，预算 {formatCurrency(plan.budget)}。
              </p>
            </div>
            <div className="space-y-3">
              {plan.recommendedProducts.map((product, index) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  key={`${product.id}-${product.name}-${index}`}
                >
                  <div className="flex gap-3">
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
                      <Image alt={product.name} className="object-cover" fill sizes="72px" src={product.image} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="font-black text-slate-950">{product.name}</p>
                        <p className="w-fit shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-700">
                          小计 {formatCurrency(product.subtotal)}
                        </p>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                        <span>单价：{formatCurrency(product.unitPrice)} / {product.unit}</span>
                        <span>
                          数量：{product.quantity}
                          {product.unit}
                        </span>
                        <span>小计：{formatCurrency(product.subtotal)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{product.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/92 p-5 shadow-lg shadow-amber-950/5 ring-1 ring-white/70 backdrop-blur">
          <div className="mb-4">
            <h2 className="text-xl font-black text-amber-950">风险提示</h2>
            <p className="mt-1 text-sm text-amber-700">
              {plan.activity} · {plan.weather} · {plan.tripDays}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plan.risks.map((risk, index) => (
              <div className="rounded-xl border border-amber-200/70 bg-white/78 p-4 shadow-sm" key={`${risk.title}-${index}`}>
                <p className="font-black text-amber-950">{risk.title}</p>
                <p className="mt-2 text-sm leading-6 text-amber-900/80">{risk.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
