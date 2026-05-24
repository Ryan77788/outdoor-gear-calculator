import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { activityGuideCards } from "@/data/activity-guides";
import { SiteFooter } from "@/app/site-footer";
import { getLanguageFromValue, type Language } from "@/lib/i18n";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

const copy: Record<
  Language,
  {
    title: string;
    description: string;
    eyebrow: string;
    heading: string;
    intro: string;
    viewGuide: string;
    planner: string;
    english: string;
    chinese: string;
  }
> = {
  en: {
    title: "Outdoor Gear Guides | Outdoor AI",
    description: "Browse focused outdoor gear guides for hiking, camping, skiing, fishing, kayaking, desert hiking, climbing, and road trips.",
    eyebrow: "Activity Guides",
    heading: "Outdoor Gear Guides",
    intro: "Choose an activity guide, then use the planner to adapt gear priorities by weather, group size, trip length, and budget.",
    viewGuide: "View Guide",
    planner: "Gear Planner",
    english: "English",
    chinese: "Chinese",
  },
  zh: {
    title: "户外装备指南 | Outdoor AI",
    description: "浏览徒步、露营、滑雪、钓鱼、皮划艇、沙漠徒步、攀岩和自驾游户外装备指南。",
    eyebrow: "活动指南",
    heading: "户外装备指南",
    intro: "选择一个活动指南，再根据天气、人数、行程长度和预算生成更贴合的装备方案。",
    viewGuide: "查看指南",
    planner: "装备规划",
    english: "英文",
    chinese: "中文",
  },
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const language = getLanguageFromValue(query?.lang);
  const pageCopy = copy[language];
  const url = "https://outdoor-gear-calculator.com/guides";
  const zhUrl = `${url}?lang=zh`;
  const imageUrl = "https://outdoor-gear-calculator.com/og-image.jpg";

  return {
    title: pageCopy.title,
    description: pageCopy.description,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        zh: zhUrl,
        "x-default": url,
      },
    },
    openGraph: {
      title: pageCopy.title,
      description: pageCopy.description,
      type: "website",
      url,
      siteName: "Outdoor AI",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageCopy.title,
      description: pageCopy.description,
      images: [imageUrl],
    },
  };
}

export default async function GuidesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const language = getLanguageFromValue(query?.lang);
  const pageCopy = copy[language];

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-8">
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link className="text-lg font-black text-emerald-950" href={`/?lang=${language}`}>
            Outdoor AI
          </Link>
          <div className="flex items-center gap-2 text-sm font-black">
            <Link className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-emerald-800 shadow-sm transition hover:bg-emerald-50" href={`/?lang=${language}#gear-planner`}>
              {pageCopy.planner}
            </Link>
            <Link className="rounded-full bg-emerald-700 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-800" href="/guides?lang=en">
              {pageCopy.english}
            </Link>
            <Link className="rounded-full bg-emerald-700 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-800" href="/guides?lang=zh">
              {pageCopy.chinese}
            </Link>
          </div>
        </nav>

        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{pageCopy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{pageCopy.heading}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{pageCopy.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16" aria-label={pageCopy.heading}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {activityGuideCards.map((guide) => (
            <Link
              className="group relative isolate flex min-h-72 flex-col justify-between overflow-hidden rounded-lg border border-white/30 bg-slate-950 p-5 text-white shadow-lg shadow-emerald-950/10 ring-1 ring-slate-200/30 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/18"
              href={`${guide.href}?lang=${language}`}
              key={guide.key}
            >
              <Image
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 object-cover transition duration-500 group-hover:scale-105"
                fill
                priority={guide.key === "hiking-gear-checklist"}
                quality={70}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                src={guide.image}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.25)_0%,rgba(2,6,23,0.58)_48%,rgba(2,6,23,0.94)_100%),linear-gradient(90deg,rgba(6,78,59,0.42),rgba(15,23,42,0.16))]"
              />
              <div>
                <h2 className="text-2xl font-black leading-7 drop-shadow-sm">{guide.title[language]}</h2>
              </div>
              <div className="mt-8">
                <p className="text-sm leading-6 text-white/84 drop-shadow-sm">{guide.description[language]}</p>
                <span
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-50 px-4 text-sm font-black text-emerald-950 shadow-sm transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-lime-200/70"
                >
                  {pageCopy.viewGuide}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}
