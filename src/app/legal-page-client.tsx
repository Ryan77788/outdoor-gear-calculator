"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/app/site-footer";
import type { Language } from "@/lib/i18n";

type LegalPageKey = "privacy" | "terms" | "affiliate";

type LegalContent = {
  title: string;
  body: string[];
};

const legalContent: Record<LegalPageKey, Record<Language, LegalContent>> = {
  privacy: {
    en: {
      title: "Privacy Policy",
      body: [
        "Outdoor Gear Calculator helps visitors plan outdoor equipment lists. We may store saved plans and basic usage data needed to operate and improve the service.",
        "We do not sell personal information. If analytics, affiliate links, or third-party services are used, they are intended to support site operation, product discovery, and performance measurement.",
        "You can avoid saving a plan if you do not want it stored. For privacy questions, contact the site owner through the published support channel.",
      ],
    },
    zh: {
      title: "隐私政策",
      body: [
        "Outdoor Gear Calculator 用于帮助用户规划户外装备清单。我们可能会保存用户主动保存的方案，以及用于网站运行和改进的基础使用数据。",
        "我们不会出售个人信息。如网站使用分析工具、联盟链接或第三方服务，其目的仅用于支持网站运行、产品发现和效果评估。",
        "如果你不希望保存方案，可以选择不使用保存功能。如有隐私相关问题，请通过网站公开的支持渠道联系站点所有者。",
      ],
    },
  },
  terms: {
    en: {
      title: "Terms",
      body: [
        "Outdoor Gear Calculator provides planning suggestions for informational purposes only. Outdoor conditions change quickly, and users remain responsible for final gear choices and trip safety.",
        "Product names, prices, availability, and recommendations may change. Always verify current details before purchasing or departing.",
        "By using this site, you agree to use its guidance as a planning aid rather than a substitute for professional instruction, local regulations, or real-time weather and route judgment.",
      ],
    },
    zh: {
      title: "服务条款",
      body: [
        "Outdoor Gear Calculator 提供的信息仅用于装备规划参考。户外环境变化很快，用户仍需自行负责最终装备选择和出行安全。",
        "产品名称、价格、库存和推荐内容都可能发生变化。购买或出发前，请始终核对最新信息。",
        "使用本网站即表示你理解本站内容是规划辅助工具，不能替代专业培训、当地法规、实时天气和路线判断。",
      ],
    },
  },
  affiliate: {
    en: {
      title: "Affiliate Disclosure",
      body: [
        "Outdoor Gear Calculator may use affiliate links to outdoor products or retailers. If you click a link and make a purchase, the site may earn a commission at no additional cost to you.",
        "Affiliate relationships do not remove the need to compare products, check fit, verify specifications, and decide what is appropriate for your route, weather, and experience level.",
        "Recommendations are designed to support practical trip planning and may be updated as products, prices, and availability change.",
      ],
    },
    zh: {
      title: "联盟披露",
      body: [
        "Outdoor Gear Calculator 可能会使用指向户外产品或零售商的联盟链接。如果你通过链接购买商品，本站可能获得佣金，且不会增加你的购买成本。",
        "联盟关系不代表你可以跳过产品比较、尺码确认、参数核对，以及结合路线、天气和经验水平做最终判断。",
        "推荐内容用于支持实际出行规划，并可能随着产品、价格和库存变化而更新。",
      ],
    },
  },
};

function normalizeLanguage(value: string | null): Language | null {
  return value === "zh" || value === "en" ? value : null;
}

export function LegalPageClient({ page }: { page: LegalPageKey }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const urlLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get("lang"));
    const storedLanguage = normalizeLanguage(window.localStorage.getItem("language"));
    const nextLanguage = urlLanguage ?? storedLanguage;

    if (nextLanguage) {
      setLanguage(nextLanguage);
      window.localStorage.setItem("language", nextLanguage);
      return;
    }

    setLanguage("en");
  }, []);

  const content = legalContent[page][language];

  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link className="text-sm font-black text-emerald-800 transition hover:text-emerald-950" href={`/?lang=${language}`}>
          Outdoor Gear Calculator
        </Link>
        <h1 className="mt-6 text-4xl font-black text-slate-950">{content.title}</h1>
        <div className="mt-6 space-y-5 text-base leading-7 text-slate-700">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
      <SiteFooter language={language} />
    </main>
  );
}
