import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getRelatedActivities,
  seoLandingPages,
  seoLandingPagesBySlug,
  type SeoLandingPage,
} from "@/data/activities";
import { SiteFooter } from "@/app/site-footer";
import { getLanguageFromValue, type Language } from "@/lib/i18n";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

function localized(page: SeoLandingPage, language: Language) {
  return {
    title: language === "zh" ? page.titleZh : page.titleEn,
    description: language === "zh" ? page.descriptionZh : page.descriptionEn,
    heroTitle: language === "zh" ? page.heroTitleZh : page.heroTitleEn,
    heroText: language === "zh" ? page.heroTextZh : page.heroTextEn,
    priorities: language === "zh" ? page.prioritiesZh : page.prioritiesEn,
    riskTips: language === "zh" ? page.riskTipsZh : page.riskTipsEn,
    cta: language === "zh" ? page.ctaZh : page.ctaEn,
    labels:
      language === "zh"
        ? {
            priorities: "推荐重点",
            risks: "风险提示",
            related: "相关指南",
            allGuides: "返回全部指南",
          }
        : {
            priorities: "Recommended priorities",
            risks: "Risk tips",
            related: "Related guides",
            allGuides: "Back to all guides",
          },
  };
}

function createFaqJsonLd(page: SeoLandingPage, language: Language) {
  const faqs = language === "zh" ? page.activity.faqZh : page.activity.faqEn;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

function createBreadcrumbJsonLd(page: SeoLandingPage, language: Language, currentGuideName: string) {
  const siteUrl = "https://outdoor-gear-calculator.com";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: language === "zh" ? "首页" : "Home",
        item: `${siteUrl}/?lang=${language}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: language === "zh" ? "装备指南" : "Guides",
        item: `${siteUrl}/guides?lang=${language}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: currentGuideName,
        item: `${siteUrl}/guides/${page.slug}?lang=${language}`,
      },
    ],
  };
}

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const language = getLanguageFromValue(query?.lang);
  const page = seoLandingPagesBySlug[slug];

  if (!page) return {};

  const copy = localized(page, language);
  const url = `https://outdoor-gear-calculator.com/guides/${page.slug}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: "website",
      url,
      images: [{ url: new URL(page.activity.heroImage, url).toString() }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [new URL(page.activity.heroImage, url).toString()],
    },
  };
}

export default async function DynamicSeoGuidePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const language = getLanguageFromValue(query?.lang);
  const page = seoLandingPagesBySlug[slug];

  if (!page) notFound();

  const copy = localized(page, language);
  const related = getRelatedActivities(page.activity.slug).slice(0, 4);
  const plannerHref = `/?activity=${encodeURIComponent(page.activity.page.analysisContext.activity)}&lang=${language}`;
  const allGuidesHref = `/guides?lang=${language}`;
  const faqJsonLd = createFaqJsonLd(page, language);
  const breadcrumbJsonLd = createBreadcrumbJsonLd(page, language, copy.heroTitle);

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="relative isolate overflow-hidden">
        <Image
          alt={copy.heroTitle}
          className="absolute inset-0 -z-20 object-cover"
          fill
          priority
          quality={72}
          sizes="100vw"
          src={page.activity.heroImage}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,48,31,0.58),rgba(12,48,31,0.18)_58%,rgba(238,243,234,0.12)),linear-gradient(to_bottom,rgba(0,0,0,0.52),rgba(0,0,0,0.12)_45%,rgba(238,243,234,0.96))]"
        />
        <div className="mx-auto flex min-h-[390px] max-w-6xl flex-col justify-end px-6 pb-16 pt-20">
          <Link
            className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-black text-white shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/24"
            href={allGuidesHref}
          >
            {copy.labels.allGuides}
          </Link>
          <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            {language === "zh" ? "动态装备指南" : "Dynamic Gear Guide"}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-white drop-shadow-sm sm:text-6xl">
            <span style={{ textShadow: "0 4px 22px rgba(0, 0, 0, 0.42)" }}>{copy.heroTitle}</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            {copy.heroText}
          </p>
          <Link
            className="mt-8 w-fit rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            href={plannerHref}
          >
            {copy.cta}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{copy.labels.priorities}</p>
          <div className="mt-5 grid gap-3">
            {copy.priorities.map((priority) => (
              <p className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-black text-slate-800" key={priority}>
                {priority}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-lg shadow-amber-950/5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">{copy.labels.risks}</p>
          <div className="mt-5 grid gap-3">
            {copy.riskTips.map((risk) => (
              <p className="rounded-xl border border-amber-200 bg-white/75 p-4 text-sm leading-6 text-slate-700" key={risk}>
                {risk}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{copy.labels.related}</p>
            <Link className="text-sm font-black text-emerald-800 hover:text-emerald-950" href={allGuidesHref}>
              {copy.labels.allGuides}
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {related.map((activity) => (
              <Link
                className="group relative isolate min-h-[210px] overflow-hidden rounded-2xl border border-white/25 bg-slate-950 p-5 text-white shadow-lg shadow-emerald-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                href={`${activity.guideUrl}?lang=${language}`}
                key={activity.slug}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 -z-20 object-cover transition duration-500 group-hover:scale-105"
                  fill
                  loading="lazy"
                  quality={68}
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  src={activity.heroImage}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.55)_45%,rgba(2,6,23,0.92)_100%)]"
                />
                <h2 className="text-lg font-black">{language === "zh" ? activity.nameZh : activity.nameEn}</h2>
                <p className="mt-4 text-sm leading-6 text-white/82">
                  {language === "zh" ? activity.descriptionZh : activity.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}
