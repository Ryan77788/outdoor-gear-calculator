import type { Language } from "@/lib/i18n";

export type ActivityGuideCard = {
  key: string;
  href: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
};

export const activityGuideCards: ActivityGuideCard[] = [
  {
    key: "hiking",
    href: "/hiking-gear-checklist",
    title: { en: "Hiking", zh: "徒步" },
    description: {
      en: "Trail essentials for layers, hydration, navigation, and safety margin.",
      zh: "覆盖分层穿着、补水、导航和安全余量的徒步装备指南。",
    },
  },
  {
    key: "camping",
    href: "/camping-gear-checklist",
    title: { en: "Camping", zh: "露营" },
    description: {
      en: "Shelter, sleep, cooking, lighting, and campsite comfort planning.",
      zh: "规划帐篷睡眠、炉具照明和营地舒适度。",
    },
  },
  {
    key: "skiing",
    href: "/skiing-gear-checklist",
    title: { en: "Skiing", zh: "滑雪" },
    description: {
      en: "Snow-day layers, protection, warmth, and resort essentials.",
      zh: "整理雪场分层、防护、保暖和基础装备。",
    },
  },
  {
    key: "fishing",
    href: "/fishing-gear-checklist",
    title: { en: "Fishing", zh: "钓鱼" },
    description: {
      en: "Rod, tackle, shade, cooling, and waterside comfort essentials.",
      zh: "覆盖鱼竿线组、防晒、保温和水边舒适装备。",
    },
  },
  {
    key: "kayaking",
    href: "/kayaking",
    title: { en: "Kayaking", zh: "皮划艇" },
    description: {
      en: "Dry storage, sun protection, hydration, and on-water safety.",
      zh: "准备防水收纳、防晒补水和水上安全装备。",
    },
  },
  {
    key: "desert-hiking",
    href: "/desert-hiking",
    title: { en: "Desert Hiking", zh: "沙漠徒步" },
    description: {
      en: "Heat, sun, water capacity, electrolytes, and exposure planning.",
      zh: "面向高温、强日照、补水和电解质管理。",
    },
  },
  {
    key: "climbing",
    href: "/climbing",
    title: { en: "Climbing", zh: "攀岩" },
    description: {
      en: "Helmet, footwear, lighting, gloves, and route safety basics.",
      zh: "聚焦头盔、鞋、照明、手套和路线安全基础。",
    },
  },
  {
    key: "road-trip",
    href: "/road-trip-gear-checklist",
    title: { en: "Road Trip", zh: "自驾游" },
    description: {
      en: "Power, first aid, vehicle tools, cooling, and camp-ready gear.",
      zh: "规划电源、急救、车载工具、保温和营地装备。",
    },
  },
];
