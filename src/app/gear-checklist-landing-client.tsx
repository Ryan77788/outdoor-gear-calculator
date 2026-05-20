"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GearChecklistPage } from "@/app/gear-checklist-pages";
import { buildGearList, getRiskBlocks } from "@/lib/recommendation";
import { getGearTierMeta, getGearTierStyle } from "@/lib/gear-tier";
import { buildRecommendationAnalysis } from "@/lib/reasoning";
import { getActivityHeroImage } from "@/lib/activity-backgrounds";
import {
  getLanguageFromValue,
  localizeGearName,
  localizeRiskText,
  localizeValue,
  type Language,
} from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "language";

const guideLabels = {
  en: {
    analysis: "AI Recommendation Analysis",
    analysisTitle: "Why these gear priorities matter",
    bestFor: "Best For",
    checklist: "Checklist",
    coreGear: "Core Gear List",
    openPlanner: "Open Gear Planner",
    riskAware: "Risk-aware reasoning",
    riskNotes: "Risk Notes",
    riskTitle: "Common Risk Reminders",
    scenarios: "Suitable Scenarios",
  },
  zh: {
    analysis: "AI 推荐分析",
    analysisTitle: "为什么这些装备优先级重要",
    bestFor: "适合场景",
    checklist: "装备清单",
    coreGear: "核心装备清单",
    openPlanner: "打开装备规划器",
    riskAware: "风险感知推理",
    riskNotes: "风险提示",
    riskTitle: "常见风险提醒",
    scenarios: "适合场景",
  },
} as const;

const zhScenarioByActivity: Record<string, string[]> = {
  徒步: ["一日徒步和周末路线", "山地、林道和碎石路面", "雨天、降温或风口环境"],
  露营: ["周末营地和家庭露营", "需要睡眠、炉具和照明的过夜行程", "寒冷、雨天或多人营地"],
  滑雪: ["雪场一日滑雪", "寒冷和强反光环境", "需要头盔、雪镜和保暖层的行程"],
  钓鱼: ["湖边或河岸钓鱼", "长时间等待和遮阳需求", "需要保温、收纳和基础舒适度的场景"],
  自驾游: ["2-4 天自驾和营地活动", "多人共享装备和车辆补给", "需要电源、急救和车载工具的行程"],
  攀岩: ["户外岩壁和短线攀爬", "需要头部防护和路线安全的场景", "晴天或暴露地形下的活动"],
  皮划艇: ["湖面和近岸皮划艇", "需要防水收纳和防晒的水上活动", "一日轻量水上路线"],
  沙漠徒步: ["高温、强日照和开阔路线", "需要额外水量和电解质的徒步", "沙地、碎石和长时间暴露环境"],
  重装徒步: ["多日背包徒步", "需要睡眠、炉具和背负系统的路线", "天气变化和补给距离更长的行程"],
  单板滑雪: ["雪场单板滑雪", "寒冷、摔倒和强反光环境", "需要固定器、雪靴、头盔和雪镜的行程"],
  冬季露营: ["低温过夜营地", "需要睡眠保暖和炉具冗余的行程", "雪地、湿冷或长夜环境"],
  海边露营: ["海边过夜和沙地营地", "需要防晒、防水和食物保冷的行程", "风、沙和潮湿环境"],
  越野跑: ["山地和林道越野跑", "需要轻量补水和照明的路线", "炎热、碎石或上下坡较多的场景"],
  骑行: ["一日骑行和郊野路线", "需要头盔、补胎和照明的行程", "炎热或能见度变化的场景"],
  海边旅行: ["海边旅行和涉水活动", "需要防晒、防水袋和快干用品", "强紫外线、沙地和潮湿环境"],
  登山: ["山地路线和海拔变化行程", "需要防风雨和稳定支撑的路线", "碎石、泥地和天气突变环境"],
};

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const urlLanguage = new URLSearchParams(window.location.search).get("lang");

  if (urlLanguage === "zh" || urlLanguage === "en") return urlLanguage;

  return getLanguageFromValue(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function getZhIntro(page: GearChecklistPage) {
  const activity = localizeValue(page.analysisContext.activity, "zh");

  return `这份${activity}装备指南会结合活动场景、天气和行程长度，帮助你优先准备真正影响安全、舒适和完成度的装备。`;
}

function getLocalizedPage(page: GearChecklistPage, language: Language) {
  if (language === "en") {
    return {
      eyebrow: page.eyebrow,
      gear: page.gear,
      h1: page.h1,
      intro: page.intro,
      risks: page.risks,
      scenarios: page.scenarios,
    };
  }

  const gear = buildGearList(
    page.analysisContext.activity,
    page.analysisContext.tripDays,
    page.analysisContext.weather,
    page.analysisContext.peopleCount,
    5000,
  )
    .slice(0, 7)
    .map((item) => localizeGearName(item, "zh"));
  const risks = getRiskBlocks(page.analysisContext.activity, page.analysisContext.weather, page.analysisContext.tripDays)
    .slice(0, 3)
    .map((risk) => localizeRiskText(risk, "zh"));

  return {
    eyebrow: "活动指南",
    gear,
    h1: `${localizeValue(page.analysisContext.activity, "zh")}装备清单`,
    intro: getZhIntro(page),
    risks,
    scenarios: zhScenarioByActivity[page.analysisContext.activity] ?? [
      `${localizeValue(page.analysisContext.activity, "zh")}常规出行`,
      "天气变化和路线不确定的场景",
      "需要兼顾安全、预算和舒适度的行程",
    ],
  };
}

export function GearChecklistLandingClient({ page }: { page: GearChecklistPage }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const nextLanguage = getStoredLanguage();

    setLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const labels = guideLabels[language];
  const localizedPage = getLocalizedPage(page, language);
  const analysis = buildRecommendationAnalysis({ ...page.analysisContext, language });
  const tierMeta = getGearTierMeta(page.tier, language);
  const tierStyle = getGearTierStyle(page.tier);
  const heroImage = getActivityHeroImage(page.analysisContext.activity);
  const plannerHref = language === "zh" ? "/?lang=zh" : "/?lang=en";

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.36), rgba(22, 80, 45, 0.18), rgba(238, 243, 234, 0.92)), url("${heroImage}")`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,48,31,0.5),rgba(12,48,31,0.12)_55%,rgba(238,243,234,0.18)),linear-gradient(to_bottom,rgba(0,0,0,0.16),rgba(0,0,0,0.04)_42%,rgba(238,243,234,0.96))]"
        />

        <div className="mx-auto flex min-h-[390px] max-w-6xl flex-col justify-end px-6 pb-16 pt-20">
          <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            {localizedPage.eyebrow}
          </p>
          <p className={`mb-4 w-fit rounded-full border px-5 py-2 text-sm font-black shadow-lg shadow-black/10 ${tierStyle.badgeClass}`}>
            {tierMeta.shareTitle}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-white drop-shadow-sm sm:text-6xl">
            <span style={{ textShadow: "0 4px 22px rgba(0, 0, 0, 0.42)" }}>{localizedPage.h1}</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            {localizedPage.intro}
          </p>
          <p
            className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/82"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            {tierMeta.description}
          </p>
          <Link
            className="mt-8 w-fit rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            href={plannerHref}
          >
            {labels.openPlanner}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{labels.bestFor}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{labels.scenarios}</h2>
          <ul className="mt-5 space-y-3">
            {localizedPage.scenarios.map((item) => (
              <li key={item} className="flex gap-3 text-slate-700">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{labels.checklist}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{labels.coreGear}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {localizedPage.gear.map((item) => (
              <li key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-slate-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-lg shadow-amber-950/5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">{labels.riskNotes}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{labels.riskTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {localizedPage.risks.map((risk) => (
              <p key={risk} className="rounded-xl border border-amber-200 bg-white/75 p-4 text-sm leading-6 text-slate-700">
                {risk}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-slate-950 p-6 text-white shadow-lg shadow-emerald-950/10">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-lime-200">{labels.analysis}</p>
              <h2 className="mt-3 text-2xl font-black">{labels.analysisTitle}</h2>
            </div>
            <span className="rounded-full border border-amber-200/40 bg-amber-300/16 px-4 py-2 text-sm font-black text-amber-100">
              {labels.riskAware}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {analysis.map((item) => (
              <article
                className={`rounded-xl border p-4 ${
                  item.tone === "high"
                    ? "border-amber-300/45 bg-amber-300/12"
                    : item.tone === "elevated"
                      ? "border-lime-200/35 bg-lime-200/10"
                      : "border-white/18 bg-white/10"
                }`}
                key={item.title}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                      item.tone === "high" ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"
                    }`}
                  >
                    {item.icon.slice(0, 1).toUpperCase()}
                  </span>
                  <h3 className="font-black text-white">{item.title}</h3>
                </div>
                <ul className="space-y-2">
                  {item.bullets.map((bullet) => (
                    <li className="flex gap-2 text-sm leading-6 text-white/78" key={bullet}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-200" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
