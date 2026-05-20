import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { Activity, Product } from "@/data/products";
import { getOutdoorInsights, type GearItem, type RiskBlock, type TripDays, type Weather } from "@/lib/recommendation";
import { getGearTier, getGearTierMeta, getGearTierStyle, type GearTier } from "@/lib/gear-tier";
import {
  formatCurrency,
  formatQuantity,
  formatPeople,
  formatSavedTime,
  formatUnit,
  getLanguageFromValue,
  localizeInsightReport,
  localizeGearName,
  localizeGearReason,
  localizeProductCategory,
  localizeProductName,
  localizeProductReason,
  localizeRiskText,
  localizeRiskTitle,
  localizeValue,
  translations,
  type Language,
} from "@/lib/i18n";
import { getActivityHeroImage } from "@/lib/activity-backgrounds";
import { PlanOpenLogger } from "./PlanOpenLogger";

export const dynamic = "force-dynamic";
const SAVED_PLANS_COLLECTION = "saved_plans";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

type SharedPlan = {
  _id: string;
  activity: Activity;
  tripDays: TripDays;
  weather: Weather;
  peopleCount: number;
  budget: number;
  gearList: GearItem[];
  recommendedProducts: Product[];
  risks: RiskBlock[];
  totalPrice: number;
  gearTier?: GearTier;
  createdAt: string;
};

type DbPlan = Omit<SharedPlan, "_id" | "createdAt"> & {
  _id: ObjectId;
  createdAt: Date | string;
};

const defaultMetadata: Metadata = {
  title: "Gear Plan | Outdoor Gear Planner",
  description: "View a shared outdoor gear plan.",
};

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
  const plan = await db.collection<DbPlan>(SAVED_PLANS_COLLECTION).findOne({ _id: new ObjectId(id) });

  return plan ? serializePlan(plan) : null;
}

function LanguageSwitch({ id, language }: { id: string; language: Language }) {
  return (
    <div className="fixed right-4 top-4 z-50 rounded-full border border-white/70 bg-white/90 p-1 text-sm font-bold shadow-lg shadow-slate-900/10 backdrop-blur">
      <Link
        className={`inline-flex rounded-full px-3 py-1.5 transition ${
          language === "en" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
        href={`/plan/${id}`}
      >
        English
      </Link>
      <Link
        className={`inline-flex rounded-full px-3 py-1.5 transition ${
          language === "zh" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
        href={`/plan/${id}?lang=zh`}
      >
        中文
      </Link>
    </div>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const language = getLanguageFromValue((await searchParams)?.lang);

  try {
    const plan = await getSharedPlan(id);

    if (!plan) {
      return defaultMetadata;
    }

    if (language === "zh") {
      return {
        title: `${plan.activity}装备方案｜户外装备选择器`,
        description: `${plan.peopleCount}人，${plan.tripDays}，${plan.weather}，预算${plan.budget}元的户外装备方案`,
      };
    }

    return {
      title: `${localizeValue(plan.activity, "en")} gear plan for ${formatPeople(
        plan.peopleCount,
        "en",
      )} | Outdoor Gear Calculator`,
      description: `${formatPeople(plan.peopleCount, "en")}, ${localizeValue(plan.tripDays, "en")}, ${localizeValue(
        plan.weather,
        "en",
      )}, ${formatCurrency(plan.budget, "en")} outdoor gear plan`,
    };
  } catch (error) {
    console.error("Failed to generate shared plan metadata:", error);
    return defaultMetadata;
  }
}

function EmptyState({ id, language }: { id: string; language: Language }) {
  const t = translations[language];

  return (
    <main className="min-h-screen bg-[#eef3ea] px-5 py-10 text-slate-900">
      <LanguageSwitch id={id} language={language} />
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
        <div className="w-full rounded-2xl border border-white bg-white/92 p-7 text-center shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Outdoor Gear Planner</p>
          <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">{t.planNotFound}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.planNotFoundDescription}</p>
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

export default async function SharedPlanPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const language = getLanguageFromValue((await searchParams)?.lang);
  const t = translations[language];
  let plan: SharedPlan | null = null;

  try {
    plan = await getSharedPlan(id);
  } catch (error) {
    console.error("Failed to load shared plan:", error);
  }

  if (!plan) {
    return <EmptyState id={id} language={language} />;
  }

  const remainingBudget = plan.budget - plan.totalPrice;
  const gearTier = plan.gearTier ?? getGearTier(plan.budget);
  const gearTierMeta = getGearTierMeta(gearTier, language);
  const gearTierStyle = getGearTierStyle(gearTier);
  const heroImage = getActivityHeroImage(plan.activity);
  const insightReport = localizeInsightReport(
    getOutdoorInsights(plan.activity, plan.weather, plan.tripDays, plan.peopleCount, plan.budget),
    language,
    {
      activity: plan.activity,
      weather: plan.weather,
      tripDays: plan.tripDays,
      peopleCount: plan.peopleCount,
      budget: plan.budget,
    },
  );

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <PlanOpenLogger
        activity={plan.activity}
        budget={plan.budget}
        peopleCount={plan.peopleCount}
        planId={plan._id}
        tripDays={plan.tripDays}
        weather={plan.weather}
      />
      <LanguageSwitch id={id} language={language} />
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.32), rgba(22, 80, 45, 0.12), rgba(238, 243, 234, 0.95)), url("${heroImage}")`,
          }}
        />
        <div className="mx-auto flex min-h-[300px] max-w-6xl flex-col justify-end px-5 pb-10 pt-16 sm:px-6">
          <p className="w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            {t.sharedPlan}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white drop-shadow-sm sm:text-5xl">
            {localizeValue(plan.activity, language)} {language === "en" ? "Gear Plan" : "装备方案"}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            {formatPeople(plan.peopleCount, language)} · {localizeValue(plan.tripDays, language)} ·{" "}
            {localizeValue(plan.weather, language)} · {t.savedAt} {formatSavedTime(plan.createdAt, language)}
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-6xl px-5 pb-12 sm:px-6">
        <div className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label={t.activityType} value={localizeValue(plan.activity, language)} />
            <InfoCard label={t.tripDays} value={localizeValue(plan.tripDays, language)} />
            <InfoCard label={t.weather} value={localizeValue(plan.weather, language)} />
            <InfoCard label={t.peopleCount} value={formatPeople(plan.peopleCount, language)} />
            <InfoCard label={t.exportBudget} value={formatCurrency(plan.budget, language)} />
            <InfoCard label={t.recommendedTotal} value={formatCurrency(plan.totalPrice, language)} />
            <InfoCard label={language === "zh" ? "装备等级" : "Gear Tier"} value={gearTierMeta.badge} />
            <InfoCard
              label={remainingBudget < 0 ? t.slightlyOver : t.remainingBudget}
              value={formatCurrency(Math.abs(remainingBudget), language)}
            />
            <InfoCard label={t.savedTime} value={formatSavedTime(plan.createdAt, language)} />
          </div>
        </div>

        <article className="mt-6 rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-emerald-950/10 backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">AI Outdoor Insights</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{t.aiPanelTitle}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{insightReport.summary}</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{gearTierMeta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-4 py-2 text-sm font-black ${gearTierStyle.badgeClass}`}>
                {gearTierMeta.badge}
              </span>
              <span className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white">
                {insightReport.profile}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">
                {insightReport.strategy}
              </span>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {insightReport.insights.map((insight) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4" key={insight.type}>
                <h3 className="font-black text-slate-950">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{insight.text}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">{t.essentialGearList}</h2>
              <p className="mt-1 text-sm text-slate-500">{t.essentialGearDescription}</p>
            </div>
            <ul className="space-y-2">
              {plan.gearList.map((item, index) => (
                <li className="rounded-xl border border-slate-200 bg-slate-50/75 p-3" key={`${item.name}-${index}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{localizeGearName(item, language)}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{localizeGearReason(item, language)}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      {formatQuantity(item.quantity, language)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white bg-white/92 p-5 shadow-lg shadow-slate-900/5 ring-1 ring-slate-200/70 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-xl font-black text-slate-950">{t.recommendedProductList}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t.recommendedTotal} {formatCurrency(plan.totalPrice, language)}, {t.exportBudget}{" "}
                {formatCurrency(plan.budget, language)}.
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
                      <Image
                        alt={localizeProductName(product, language)}
                        className="object-cover"
                        fill
                        sizes="72px"
                        src={product.image}
                      />
                      {product.imageStatus !== "matched" && (
                        <span className="absolute bottom-1 left-1 right-1 rounded-md bg-slate-950/78 px-1 py-0.5 text-center text-[9px] font-black text-white">
                          {language === "zh" ? "图片待确认" : "Image pending"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-black text-slate-950">{localizeProductName(product, language)}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {localizeProductCategory(product, language)}
                          </p>
                        </div>
                        <p className="w-fit shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-black text-emerald-700">
                          {t.subtotal} {formatCurrency(product.subtotal, language)}
                        </p>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                        <span>
                          {t.unitPrice}: {formatCurrency(product.unitPrice, language)} / {formatUnit(product.unit, language)}
                        </span>
                        <span>
                          {t.quantity}: {product.quantity}
                          {formatUnit(product.unit, language)}
                        </span>
                        <span>
                          {t.subtotal}: {formatCurrency(product.subtotal, language)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {localizeProductReason(product, language)}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        {language === "zh"
                          ? `来自 ${product.merchant || "Amazon"}`
                          : `Available on ${product.merchant || "Amazon"}`}
                        {" · "}
                        {language === "zh" ? "当前为搜索链接，具体商品以后人工确认。" : "Search result link, exact product may vary."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/92 p-5 shadow-lg shadow-amber-950/5 ring-1 ring-white/70 backdrop-blur">
          <div className="mb-4">
            <h2 className="text-xl font-black text-amber-950">{t.riskTips}</h2>
            <p className="mt-1 text-sm text-amber-700">
              {localizeValue(plan.activity, language)} · {localizeValue(plan.weather, language)} ·{" "}
              {localizeValue(plan.tripDays, language)}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plan.risks.map((risk, index) => (
              <div className="rounded-xl border border-amber-200/70 bg-white/78 p-4 shadow-sm" key={`${risk.title}-${index}`}>
                <p className="font-black text-amber-950">{localizeRiskTitle(risk, language)}</p>
                <p className="mt-2 text-sm leading-6 text-amber-900/80">{localizeRiskText(risk, language)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

