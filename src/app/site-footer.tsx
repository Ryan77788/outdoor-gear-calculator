import Link from "next/link";
import type { Language } from "@/lib/i18n";

type FooterLink = {
  href: string;
  label: Record<Language, string>;
};

const quickLinks: FooterLink[] = [
  { href: "/#gear-planner", label: { en: "Gear Planner", zh: "装备规划" } },
  { href: "/#activity-guides", label: { en: "Activity Guides", zh: "活动指南" } },
  { href: "/#saved-plans", label: { en: "Saved Plans", zh: "已保存方案" } },
];

const activityGuideLinks: FooterLink[] = [
  { href: "/hiking-gear-checklist", label: { en: "Hiking", zh: "徒步" } },
  { href: "/camping-gear-checklist", label: { en: "Camping", zh: "露营" } },
  { href: "/skiing-gear-checklist", label: { en: "Skiing", zh: "滑雪" } },
  { href: "/fishing-gear-checklist", label: { en: "Fishing", zh: "钓鱼" } },
  { href: "/kayaking", label: { en: "Kayaking", zh: "皮划艇" } },
  { href: "/road-trip-gear-checklist", label: { en: "Road Trip", zh: "自驾游" } },
];

const legalLinks: FooterLink[] = [
  { href: "/privacy", label: { en: "Privacy Policy", zh: "隐私政策" } },
  { href: "/terms", label: { en: "Terms", zh: "服务条款" } },
  { href: "/affiliate-disclosure", label: { en: "Affiliate Disclosure", zh: "联盟披露" } },
];

const footerLabels = {
  en: {
    brand: "Outdoor AI / Outdoor Gear Calculator",
    quickLinks: "Quick Links",
    activityGuides: "Activity Guides",
    legal: "Legal",
    note: "AI-assisted planning for outdoor gear decisions. Use local rules, weather, and judgment before every trip.",
  },
  zh: {
    brand: "Outdoor AI / Outdoor Gear Calculator",
    quickLinks: "快速链接",
    activityGuides: "活动指南",
    legal: "法律信息",
    note: "AI 辅助户外装备规划。出行前仍请结合当地规则、天气和个人判断。",
  },
} as const;

function withLanguage(href: string, language: Language) {
  if (href.startsWith("/#")) {
    const hash = href.slice(1);

    return `/?lang=${language}${hash}`;
  }

  if (href.includes("?")) {
    return `${href}&lang=${language}`;
  }

  return `${href}?lang=${language}`;
}

function FooterColumn({ title, links, language }: { title: string; links: FooterLink[]; language: Language }) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-lime-100">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-sm font-semibold text-emerald-50/78 transition hover:text-white" href={withLanguage(link.href, language)}>
              {link.label[language]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ language = "en" }: { language?: Language }) {
  const labels = footerLabels[language];

  return (
    <footer className="mt-auto border-t border-emerald-950/10 bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-9 px-6 py-10 md:grid-cols-[1.25fr_0.8fr_0.9fr_0.8fr]">
        <div>
          <p className="text-lg font-black">{labels.brand}</p>
          <p className="mt-3 text-base font-black text-lime-100">Plan smarter. Pack lighter. Go further.</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-50/72">{labels.note}</p>
        </div>

        <FooterColumn language={language} links={quickLinks} title={labels.quickLinks} />
        <FooterColumn language={language} links={activityGuideLinks} title={labels.activityGuides} />
        <FooterColumn language={language} links={legalLinks} title={labels.legal} />
      </div>
    </footer>
  );
}
