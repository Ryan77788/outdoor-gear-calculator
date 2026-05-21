"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GearChecklistPage } from "@/app/gear-checklist-pages";
import type { Activity } from "@/data/products";
import { buildGearList, getRiskBlocks } from "@/lib/recommendation";
import { getGearTierMeta, getGearTierStyle } from "@/lib/gear-tier";
import { buildRecommendationAnalysis } from "@/lib/reasoning";
import { getGuideImage } from "@/lib/activity-backgrounds";
import {
  getLanguageFromValue,
  localizeGearName,
  localizeRiskText,
  localizeValue,
  type Language,
} from "@/lib/i18n";

const LANGUAGE_STORAGE_KEY = "language";

const activitySlugByActivity: Record<string, string> = {
  徒步: "hiking",
  登山: "hiking",
  露营: "camping",
  滑雪: "skiing",
  单板滑雪: "skiing",
  钓鱼: "fishing",
  皮划艇: "kayaking",
  沙漠徒步: "desert-hiking",
  攀岩: "climbing",
  自驾游: "roadtrip",
};

const guideLabels = {
  en: {
    analysis: "AI Recommendation Analysis",
    analysisTitle: "Why these gear priorities matter",
    bestFor: "Best For",
    budgetTips: "Budget Tips",
    checklist: "Checklist",
    commonMistakes: "Common Mistakes",
    coreGear: "Core Gear List",
    faq: "FAQ",
    openPlanner: "Open Gear Planner",
    packingStrategy: "Packing Strategy",
    relatedGuides: "Related Guides",
    riskAware: "Risk-aware reasoning",
    riskNotes: "Risk Notes",
    riskTitle: "Common Risk Reminders",
    scenarios: "Suitable Scenarios",
    viewGuide: "View Guide",
  },
  zh: {
    analysis: "AI 推荐分析",
    analysisTitle: "为什么这些装备优先级重要",
    bestFor: "适合场景",
    budgetTips: "预算建议",
    checklist: "装备清单",
    commonMistakes: "常见错误",
    coreGear: "核心装备清单",
    faq: "常见问题",
    openPlanner: "打开装备规划器",
    packingStrategy: "装备准备策略",
    relatedGuides: "相关指南",
    riskAware: "风险感知推理",
    riskNotes: "风险提示",
    riskTitle: "常见风险提醒",
    scenarios: "适合场景",
    viewGuide: "查看指南",
  },
} as const;

type BudgetTip = {
  level: string;
  advice: string;
};

type GuideFaq = {
  question: string;
  answer: string;
};

type GuideDepthContent = {
  packingStrategy: string[];
  commonMistakes: string[];
  budgetTips: BudgetTip[];
  faqs?: GuideFaq[];
};

type RelatedGuide = {
  slug: string;
  activity: Activity;
  title: Record<Language, string>;
  description: Record<Language, string>;
};

const relatedGuideCatalog: Record<string, RelatedGuide> = {
  hiking: {
    slug: "hiking-gear-checklist",
    activity: "徒步",
    title: { en: "Hiking Gear Checklist", zh: "徒步装备清单" },
    description: { en: "Plan footwear, layers, hydration, navigation, and safety gear for trail days.", zh: "规划鞋服、补水、导航和安全装备，适合山地和林道徒步。" },
  },
  camping: {
    slug: "camping-gear-checklist",
    activity: "露营",
    title: { en: "Camping Gear Checklist", zh: "露营装备清单" },
    description: { en: "Build a reliable camp setup for shelter, sleep, cooking, lighting, and food storage.", zh: "准备帐篷、睡眠、炉具、照明和食物收纳，搭建可靠营地。" },
  },
  skiing: {
    slug: "skiing-gear-checklist",
    activity: "滑雪",
    title: { en: "Skiing Gear Checklist", zh: "滑雪装备清单" },
    description: { en: "Prepare warm layers, snow protection, goggles, gloves, and mountain-day essentials.", zh: "准备保暖层、雪地防护、雪镜、手套和雪场一日装备。" },
  },
  fishing: {
    slug: "fishing-gear-checklist",
    activity: "钓鱼",
    title: { en: "Fishing Gear Checklist", zh: "钓鱼装备清单" },
    description: { en: "Organize rods, tackle, licenses, rain protection, storage, and water safety basics.", zh: "整理鱼竿、钓具、许可证、雨具、收纳和水边安全装备。" },
  },
  kayaking: {
    slug: "kayaking",
    activity: "皮划艇",
    title: { en: "Kayaking Gear Checklist", zh: "皮划艇装备清单" },
    description: { en: "Plan PFDs, dry bags, sun protection, quick-dry layers, and paddle safety gear.", zh: "准备救生衣、防水袋、防晒、速干层和水上安全装备。" },
  },
  desertHiking: {
    slug: "desert-hiking",
    activity: "沙漠徒步",
    title: { en: "Desert Hiking Gear Checklist", zh: "沙漠徒步装备清单" },
    description: { en: "Prioritize water capacity, sun protection, electrolytes, navigation, and heat safety.", zh: "优先规划水量、防晒、电解质、导航和高温风险余量。" },
  },
  climbing: {
    slug: "climbing",
    activity: "攀岩",
    title: { en: "Climbing Gear Checklist", zh: "攀岩装备清单" },
    description: { en: "Prepare safety gear, helmet, route planning, approach layers, and descent margin.", zh: "准备安全装备、头盔、路线信息、接近层和下降余量。" },
  },
  roadTrip: {
    slug: "road-trip-gear-checklist",
    activity: "自驾游",
    title: { en: "Road Trip Gear Checklist", zh: "自驾游装备清单" },
    description: { en: "Pack vehicle safety, charging, offline maps, food, comfort, and emergency readiness.", zh: "准备车辆安全、充电、离线地图、食物、舒适和应急装备。" },
  },
  backpacking: {
    slug: "backpacking",
    activity: "重装徒步",
    title: { en: "Backpacking Gear Checklist", zh: "重装徒步装备清单" },
    description: { en: "Plan shelter, sleep, cooking, water treatment, load carry, and multi-day trail margin.", zh: "规划庇护、睡眠、炉具、净水、背负和多日路线余量。" },
  },
  snowboarding: {
    slug: "snowboarding",
    activity: "单板滑雪",
    title: { en: "Snowboarding Gear Checklist", zh: "单板滑雪装备清单" },
    description: { en: "Prepare board setup, boots, helmet, goggles, fall protection, and winter layers.", zh: "准备雪板、雪靴、头盔、雪镜、防摔保护和冬季层次。" },
  },
  winterCamping: {
    slug: "winter-camping",
    activity: "冬季露营",
    title: { en: "Winter Camping Gear Checklist", zh: "冬季露营装备清单" },
    description: { en: "Build a cold-weather camp system for shelter, sleep insulation, cooking, and dry layers.", zh: "搭建寒冷环境下的庇护、睡眠保暖、炉具和干燥衣物系统。" },
  },
  beachCamping: {
    slug: "beach-camping",
    activity: "海边露营",
    title: { en: "Beach Camping Gear Checklist", zh: "海边露营装备清单" },
    description: { en: "Prepare for wind, sand, shade, dry storage, food cooling, and tide-aware campsites.", zh: "应对海风、沙地、遮阳、防水收纳、保冷和潮汐营地选择。" },
  },
  beachTravel: {
    slug: "beach-travel-gear-checklist",
    activity: "海边旅行",
    title: { en: "Beach Travel Gear Checklist", zh: "海边旅行装备清单" },
    description: { en: "Pack sun protection, dry storage, quick-dry clothing, beach comfort, and water safety.", zh: "准备防晒、防水收纳、速干衣物、海边舒适和涉水安全用品。" },
  },
  trailRunning: {
    slug: "trail-running",
    activity: "越野跑",
    title: { en: "Trail Running Gear Checklist", zh: "越野跑装备清单" },
    description: { en: "Plan shoes, hydration, lighting, nutrition, weather layers, and route safety.", zh: "规划跑鞋、补水、照明、补给、天气层和路线安全。" },
  },
  cycling: {
    slug: "cycling-gear-checklist",
    activity: "骑行",
    title: { en: "Cycling Gear Checklist", zh: "骑行装备清单" },
    description: { en: "Prepare helmet, repair kit, lights, hydration, nutrition, layers, and ride visibility.", zh: "准备头盔、维修包、车灯、补水、补给、衣物层和可见性装备。" },
  },
};

const relatedGuideKeysBySlug: Record<string, string[]> = {
  "hiking-gear-checklist": ["desertHiking", "camping", "climbing", "backpacking"],
  "camping-gear-checklist": ["hiking", "roadTrip", "fishing", "kayaking"],
  "skiing-gear-checklist": ["snowboarding", "winterCamping", "hiking", "roadTrip"],
  "fishing-gear-checklist": ["kayaking", "camping", "roadTrip"],
  kayaking: ["fishing", "camping", "roadTrip"],
  "desert-hiking": ["hiking", "camping", "climbing"],
  climbing: ["hiking", "desertHiking", "camping"],
  "road-trip-gear-checklist": ["camping", "hiking", "fishing", "kayaking"],
  backpacking: ["hiking", "camping", "desertHiking", "climbing"],
  snowboarding: ["skiing", "winterCamping", "roadTrip"],
  "winter-camping": ["camping", "skiing", "roadTrip"],
  "beach-camping": ["camping", "kayaking", "fishing", "roadTrip"],
  "beach-travel-gear-checklist": ["camping", "kayaking", "fishing"],
  "trail-running": ["hiking", "desertHiking", "climbing"],
  "cycling-gear-checklist": ["roadTrip", "hiking", "camping"],
};

const guideDepthContent: Record<Language, Record<string, GuideDepthContent>> = {
  en: {
    "hiking-gear-checklist": {
      packingStrategy: [
        "Build the kit around feet, water, navigation, and weather margin before adding comfort extras.",
        "Use layered clothing so you can adjust during climbs, exposed ridges, shaded descents, and unexpected wind.",
        "Keep small safety items easy to reach: headlamp, first aid, rain shell, snacks, and offline route information.",
      ],
      commonMistakes: [
        "Starting with new shoes or socks before testing them on shorter walks.",
        "Packing for the trailhead weather instead of the coldest or wettest point of the route.",
        "Relying only on phone signal and one battery source for navigation.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Spend first on footwear, rain protection, water capacity, and a headlamp; borrow or reuse packs and layers where possible." },
        { level: "Mid budget", advice: "Upgrade the pack fit, trekking poles, breathable shell, and blister care for longer routes." },
        { level: "High budget", advice: "Choose lighter footwear, premium waterproof layers, satellite communication, and a refined sleep system for multi-day trails." },
      ],
      faqs: [
        { question: "What gear do I need for hiking?", answer: "Start with supportive footwear, weather layers, water, navigation, snacks, a headlamp, and a small first-aid kit. Longer or colder routes need more insulation and emergency margin." },
        { question: "How much water should I carry on a hike?", answer: "Many hikers start with 0.5 to 1 liter per hour, then adjust for heat, elevation, distance, and refill options. Carry extra water when the route is dry or exposed." },
        { question: "What should beginners pack for a day hike?", answer: "Beginners should keep the kit simple: broken-in shoes, rain shell, water, food, phone with offline map, power bank, sun protection, and basic safety items." },
        { question: "Do I need trekking poles for hiking?", answer: "Trekking poles are optional, but they help on steep descents, loose terrain, stream crossings, and longer routes with a loaded pack." },
        { question: "What should I pack for rainy hiking?", answer: "Bring a waterproof shell, pack cover or liner, quick-dry layers, spare socks, dry bag for electronics, and enough insulation to stay warm when stopped." },
      ],
    },
    "camping-gear-checklist": {
      packingStrategy: [
        "Plan the campsite as zones: shelter, sleep, cooking, food storage, lighting, and cleanup.",
        "Prioritize warmth from the ground up with a suitable sleeping pad before chasing a warmer bag.",
        "Pack shared camp items by task so setup after dark is quick and no single bag holds every essential.",
      ],
      commonMistakes: [
        "Buying a large tent but forgetting stakes, guylines, footprint, or a repair plan.",
        "Underestimating nighttime temperature and ground cold at established campgrounds.",
        "Leaving food storage, trash, and dish cleanup until pests or rain become a problem.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Put money into a reliable tent, sleeping pad, and basic stove; use simple bins and household kitchen items." },
        { level: "Mid budget", advice: "Add better lighting, cooler performance, camp chairs, and weatherproof storage for a smoother group routine." },
        { level: "High budget", advice: "Invest in roomy shelter, premium sleep systems, power station, and organized camp kitchen modules." },
      ],
      faqs: [
        { question: "What gear do I need for camping?", answer: "A complete camping setup usually includes shelter, sleeping bag, sleeping pad, stove, lighting, water storage, food storage, warm layers, rain protection, and first aid." },
        { question: "How much should I budget for a camping trip?", answer: "A basic car camping kit can be built cheaply if you borrow shelter and cookware. Spend first on sleep warmth, weather protection, and safe cooking." },
        { question: "What should I pack for family camping?", answer: "Add extra lighting, simple meals, larger water capacity, organized bins, first-aid supplies, warm sleep clothes, and comfort items for kids or first-time campers." },
        { question: "What is the most important camping gear?", answer: "The most important items are a weather-ready tent, insulated sleeping pad, suitable sleeping bag, reliable light, water, food storage, and a safe stove setup." },
        { question: "What should I pack for camping in rain?", answer: "Pack a rainfly, footprint, extra tarp, waterproof storage, dry sleep clothes, spare socks, and a plan for cooking and moving around camp without soaking gear." },
      ],
    },
    "skiing-gear-checklist": {
      packingStrategy: [
        "Treat warmth and dryness as a system: base layer, insulation, shell, socks, gloves, and backup dry items.",
        "Confirm rentals, lift pass, boot fit, and helmet setup before thinking about accessories.",
        "Keep goggles, sunscreen, snacks, water, and hand warmers accessible without returning to the car.",
      ],
      commonMistakes: [
        "Wearing cotton base layers that hold moisture and chill quickly.",
        "Bringing only one pair of gloves or socks for a wet, cold day.",
        "Ignoring sun reflection, altitude, and dehydration because the weather feels cold.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Rent skis or board, but buy properly fitting socks, gloves, goggles, and thermal layers." },
        { level: "Mid budget", advice: "Upgrade helmet, shell, pants, and reusable warm layers that work across multiple winter trips." },
        { level: "High budget", advice: "Add custom-fit boots, premium goggles, technical outerwear, and avalanche-ready gear for appropriate terrain." },
      ],
      faqs: [
        { question: "What gear do I need for skiing?", answer: "You need skis or rentals, boots, poles, helmet, goggles, waterproof outerwear, warm layers, ski socks, gloves, sun protection, snacks, and water." },
        { question: "What should I wear skiing for the first time?", answer: "Wear a moisture-wicking base layer, warm midlayer, waterproof jacket and pants, ski socks, gloves, helmet, goggles, and a neck gaiter." },
        { question: "Should beginners rent or buy ski gear?", answer: "Most beginners should rent skis, boots, and poles first. Buying good socks, gloves, goggles, and base layers is usually a better early investment." },
        { question: "How much should I budget for a ski trip?", answer: "Budget for lift tickets, rentals or tuning, lessons if needed, winter clothing, food, lodging, and transport. Gear costs rise quickly if you buy boots and outerwear." },
        { question: "What should I pack for cold ski weather?", answer: "Bring extra gloves or liners, hand warmers, face covering, insulated midlayer, spare socks, lip balm, sunscreen, and a dry change of clothes." },
      ],
    },
    "fishing-gear-checklist": {
      packingStrategy: [
        "Match rod, line, bait, and lures to the water type, target species, and local regulations.",
        "Separate tackle, tools, license, sun protection, and fish handling gear so the bank or boat stays organized.",
        "Plan comfort for long stationary periods: shade, rain shell, seat, water, insect protection, and hand cleanup.",
      ],
      commonMistakes: [
        "Buying too much tackle before understanding local species, depth, and seasonal patterns.",
        "Forgetting license rules, catch limits, measuring tools, or bait restrictions.",
        "Ignoring slippery banks, hooks, sun exposure, and hydration during long sessions.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Choose one versatile rod and a small tackle box tailored to local water instead of many specialty lures." },
        { level: "Mid budget", advice: "Add polarized sunglasses, better rain protection, line tools, landing net, and organized storage." },
        { level: "High budget", advice: "Upgrade rod and reel sensitivity, fish finder or guide support, premium cooler, and weatherproof tackle systems." },
      ],
      faqs: [
        { question: "What gear do I need for fishing?", answer: "Most trips need a rod and reel, line, hooks, bait or lures, tackle box, license, pliers, line cutter, sun protection, water, and safe footwear." },
        { question: "What should I pack for rainy fishing?", answer: "Bring a rain shell, waterproof bag, non-slip footwear, dry towel, spare socks, protected tackle storage, and a way to keep your phone and license dry." },
        { question: "Do I need a fishing license?", answer: "In most places you need a valid fishing license, and rules may vary by species, season, water type, and catch method. Check local regulations before you go." },
        { question: "What fishing gear is best for beginners?", answer: "A versatile spinning rod, simple reel, basic hooks, bobbers, sinkers, a few local lures, pliers, and a small tackle box are enough for many beginners." },
        { question: "How much should I spend on fishing gear?", answer: "Start modestly with a reliable rod and local tackle. Upgrade later based on the species, water type, and techniques you actually use." },
      ],
    },
    kayaking: {
      packingStrategy: [
        "Start with safety: PFD, whistle, route plan, weather check, and a realistic return paddle.",
        "Use dry bags by priority so phone, keys, insulation, and first aid remain protected even after spray or capsize.",
        "Dress for water exposure rather than air temperature, especially in wind or early-season conditions.",
      ],
      commonMistakes: [
        "Assuming calm outbound conditions will stay the same for the return.",
        "Keeping phone, car key, or warm layer loose in the cockpit without waterproof backup.",
        "Skipping sun and glare protection because the trip is short.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Prioritize a certified PFD, dry bag, whistle, sunscreen, water, and basic paddle clothing." },
        { level: "Mid budget", advice: "Add better paddle comfort, quick-dry layers, deck storage, and a compact first-aid kit." },
        { level: "High budget", advice: "Invest in a lighter kayak or paddle, marine communication, quality dry wear, and route-specific rescue gear." },
      ],
      faqs: [
        { question: "What gear do I need for kayaking?", answer: "Every paddler needs a properly fitted PFD, paddle, whistle, dry bag, water, sun protection, suitable clothing, and a route plan." },
        { question: "What should beginners bring kayaking?", answer: "Beginners should bring a PFD, water, sunscreen, hat, sunglasses strap, dry bag, phone protection, quick-dry clothes, and a short route with easy return options." },
        { question: "Do I need a dry bag for kayaking?", answer: "Yes, a dry bag is strongly recommended for keys, phone, warm layers, first aid, and anything that should still work after spray or capsize." },
        { question: "What should I wear kayaking in cold water?", answer: "Dress for the water temperature with insulating layers, splash protection, or a wetsuit or drysuit when conditions require it." },
        { question: "How much should I budget for kayaking gear?", answer: "Prioritize PFD, dry storage, paddle comfort, and weather protection first. Buy or rent the kayak depending on how often you paddle." },
      ],
    },
    "desert-hiking": {
      packingStrategy: [
        "Plan water capacity first, then add electrolytes, shade, sun clothing, and route timing around heat exposure.",
        "Start early, identify turnaround points, and carry navigation that works without signal or visual landmarks.",
        "Use breathable protection for skin and eyes instead of relying only on sunscreen.",
      ],
      commonMistakes: [
        "Carrying normal hiking water amounts on a route with no reliable refill.",
        "Starting too late and reaching exposed terrain during peak heat.",
        "Underestimating how sand, glare, and dry wind increase fatigue.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Spend on water capacity, sun hat, sunglasses, electrolytes, and offline maps before luxury items." },
        { level: "Mid budget", advice: "Upgrade to UV clothing, breathable footwear, trekking poles, and a more stable hydration setup." },
        { level: "High budget", advice: "Add satellite messenger, premium sun layers, lightweight pack, and emergency shade for remote desert routes." },
      ],
      faqs: [
        { question: "What gear do I need for desert hiking?", answer: "Desert hiking requires extra water capacity, electrolytes, sun hat, sunglasses, sunscreen, UV clothing, breathable footwear, navigation, and emergency shade or insulation." },
        { question: "How much water should I carry for desert hiking?", answer: "Carry more than a normal hike and plan around heat, distance, and lack of water sources. Many hikers need several liters for even a day route." },
        { question: "What should I wear for desert hiking?", answer: "Wear breathable long sleeves, sun hat, sunglasses, light-colored layers, stable shoes, and socks that handle sand and heat well." },
        { question: "Is desert hiking safe for beginners?", answer: "It can be safe on short, marked routes in mild weather, but beginners should avoid peak heat, carry extra water, and choose routes with clear exit options." },
        { question: "What should I pack for hot weather hiking?", answer: "Pack water, electrolytes, salty snacks, sun protection, offline maps, headlamp, first-aid basics, and a backup layer for unexpected delays." },
      ],
    },
    climbing: {
      packingStrategy: [
        "Prioritize certified safety gear, helmet use, partner checks, route information, and descent planning.",
        "Keep approach, climb, and belay layers separate so exposure and waiting time do not create cold or fatigue.",
        "Pack small backups for delays: headlamp, tape, first aid, water, snacks, and a weather shell.",
      ],
      commonMistakes: [
        "Focusing on shoes and chalk while overlooking helmet, communication, and route logistics.",
        "Arriving without confirming anchors, descent, crowding, or local access rules.",
        "Starting late with no headlamp or margin for slow parties ahead.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Do not compromise on certified helmet, harness, belay device, and partner-critical gear; borrow non-safety extras." },
        { level: "Mid budget", advice: "Add better shoes, rope bag, approach layers, gloves, and route guide resources." },
        { level: "High budget", advice: "Invest in specialized rope systems, premium protection, lightweight packs, and training-focused footwear." },
      ],
      faqs: [
        { question: "What gear do I need for outdoor climbing?", answer: "Outdoor climbing commonly requires climbing shoes, harness, helmet, belay device, rope or partner rope system, chalk, route information, water, layers, and first aid." },
        { question: "Do I need a helmet for rock climbing?", answer: "Yes, a helmet is strongly recommended outdoors because of rockfall, dropped gear, crowded belays, and fall impacts." },
        { question: "What should beginners bring to a climbing day?", answer: "Beginners should bring personal safety gear, approach shoes, water, snacks, sun or cold protection, tape, and a clear plan with experienced partners." },
        { question: "How much should I budget for climbing gear?", answer: "Spend first on certified safety gear and properly fitting shoes. Ropes, protection, and advanced systems should match your climbing style and training." },
        { question: "What should I pack for climbing in changing weather?", answer: "Bring a wind shell, warm layer, headlamp, extra water, route information, and enough margin to retreat if wind, rain, or storms move in." },
      ],
    },
    "road-trip-gear-checklist": {
      packingStrategy: [
        "Prepare the vehicle first: documents, tire tools, emergency kit, lighting, charging, and offline navigation.",
        "Divide gear into driving, roadside emergency, food, sleep, and weather layers so urgent items are not buried.",
        "Plan resupply gaps, fuel stops, rest breaks, and backup routes before remote sections.",
      ],
      commonMistakes: [
        "Packing camp comfort while ignoring tire pressure, jumper cables, or roadside visibility.",
        "Depending on phone signal for maps, lodging, fuel, and emergency information.",
        "Driving too long without planned rest, food, hydration, and driver rotation.",
      ],
      budgetTips: [
        { level: "Low budget", advice: "Prioritize vehicle safety basics, first aid, water, charging cables, offline maps, and a simple cooler." },
        { level: "Mid budget", advice: "Add power bank, better storage bins, roadside tools, comfort layers, and food organization." },
        { level: "High budget", advice: "Upgrade to power station, recovery kit, premium cooler, roof or cargo storage, and remote communication." },
      ],
      faqs: [
        { question: "What gear do I need for a road trip?", answer: "A road trip kit should include documents, offline maps, chargers, water, snacks, cooler, first aid, roadside tools, flashlight, warm layer, and emergency contact plan." },
        { question: "What should I keep in my car for a long road trip?", answer: "Keep jumper cables, tire tools, flashlight, reflective warning gear, first aid, water, snacks, power bank, blanket, and basic medications within reach." },
        { question: "How much should I budget for a road trip?", answer: "Budget for fuel, lodging or campsite fees, food, park passes, tolls, vehicle checks, emergency margin, and any comfort or camping gear you still need." },
        { question: "What should I pack for a road trip with camping?", answer: "Add tent, sleep system, stove, cooler, lighting, camp chairs, water storage, trash bags, and weather layers to the usual vehicle safety kit." },
        { question: "How do I prepare for a remote road trip?", answer: "Check the vehicle, download offline maps, plan fuel stops, carry extra water, bring roadside tools, share your route, and prepare for limited cell coverage." },
      ],
    },
  },
  zh: {
    "hiking-gear-checklist": {
      packingStrategy: [
        "先围绕鞋、水、导航和天气余量来准备，再考虑拍照、餐具等舒适性装备。",
        "采用分层穿衣，方便在爬升、风口、林荫下坡和突发降温时快速调整。",
        "头灯、急救包、雨衣、补给和离线路线信息要放在容易拿到的位置。",
      ],
      commonMistakes: [
        "新鞋或新袜子没有提前磨合，就直接走长线。",
        "只按出发点天气打包，忽略山顶、风口或返程时的低温和雨水。",
        "完全依赖手机信号和单一电源做导航。",
      ],
      budgetTips: [
        { level: "低预算", advice: "优先买合脚鞋、防雨层、水具和头灯；背包、衣物可以先借用或复用。" },
        { level: "中预算", advice: "升级背包背负、登山杖、透气雨衣和防磨脚护理，适合更长路线。" },
        { level: "高预算", advice: "选择更轻的鞋、专业防水层、卫星通信和多日徒步睡眠系统。" },
      ],
      faqs: [
        { question: "徒步需要准备哪些装备？", answer: "基础徒步装备包括合脚鞋、天气层、水、导航、零食、头灯和小型急救包。路线越长、天气越复杂，保暖和应急余量越重要。" },
        { question: "徒步要带多少水？", answer: "很多人会按每小时 0.5 到 1 升估算，再根据温度、爬升、路线长度和补水点调整。干燥或暴露路线要多带。" },
        { question: "新手一日徒步应该带什么？", answer: "新手可以先准备磨合过的鞋、雨衣、水、食物、离线地图、充电宝、防晒和基础安全物品。" },
        { question: "徒步一定要登山杖吗？", answer: "不一定，但登山杖在陡下坡、碎石路、过溪和背包较重时能明显减轻膝盖和稳定身体。" },
        { question: "雨天徒步要准备什么？", answer: "建议带防水外壳、背包防雨罩或内胆、防水袋、速干层、备用袜子和停下来时能保暖的衣物。" },
      ],
    },
    "camping-gear-checklist": {
      packingStrategy: [
        "把营地拆成睡眠、遮蔽、做饭、食物收纳、照明和清洁几个区域来准备。",
        "保暖要先看地垫，再看睡袋；地面冷会明显影响夜间睡眠。",
        "多人露营时按任务分包，避免到营地后所有关键物品都在同一个箱子里。",
      ],
      commonMistakes: [
        "只买大帐篷，却忘了地布、营钉、风绳和修补方案。",
        "低估夜间温度和地面湿冷，尤其是水边或山谷营地。",
        "食物、垃圾和餐具清洁没有提前规划，容易引来小动物或被雨水打乱。",
      ],
      budgetTips: [
        { level: "低预算", advice: "优先保证帐篷、地垫和基础炉具可靠；收纳和厨具可以先用家用替代。" },
        { level: "中预算", advice: "增加更好的照明、保冷箱、营椅和防水收纳，提升多人营地效率。" },
        { level: "高预算", advice: "投入大空间帐篷、高质量睡眠系统、电源和模块化营地厨房。" },
      ],
      faqs: [
        { question: "露营需要准备哪些装备？", answer: "常见露营装备包括帐篷、睡袋、地垫、炉具、照明、水具、食物收纳、保暖层、防雨装备和急救用品。" },
        { question: "露营大概要多少预算？", answer: "低预算可以先借帐篷和厨具，把钱花在睡眠保暖和防雨上。预算越高，舒适性、收纳和营地效率会越好。" },
        { question: "家庭露营应该带什么？", answer: "家庭露营要增加照明、水量、收纳箱、简单餐食、急救用品、儿童保暖衣物和能降低混乱的备用物品。" },
        { question: "露营最重要的装备是什么？", answer: "最重要的是可靠帐篷、保暖地垫、合适睡袋、照明、水、食物收纳和安全炉具。" },
        { question: "雨天露营要准备什么？", answer: "需要雨布、地布、防水收纳、干燥睡衣、备用袜子，并提前规划雨中做饭和进出帐篷的方式。" },
      ],
    },
    "skiing-gear-checklist": {
      packingStrategy: [
        "把保暖和干燥当成系统：内层、中层、外壳、袜子、手套和备用干衣一起考虑。",
        "先确认租赁、雪票、雪靴合脚和头盔，再考虑其他小配件。",
        "雪镜、防晒、零食、水和暖宝宝要随身可取，不要全部放在车里。",
      ],
      commonMistakes: [
        "穿棉质内层，出汗后很难干，容易快速变冷。",
        "只带一副手套或袜子，湿了以后整天都会难受。",
        "因为天气冷就忽略高海拔、反光、防晒和补水。",
      ],
      budgetTips: [
        { level: "低预算", advice: "雪板雪鞋可以租，但合适的袜子、手套、雪镜和保暖内层值得自己买。" },
        { level: "中预算", advice: "升级头盔、雪服雪裤和可重复用于冬季旅行的保暖层。" },
        { level: "高预算", advice: "投入定制或高适配雪靴、高端雪镜、技术外壳，以及适用地形的雪崩装备。" },
      ],
      faqs: [
        { question: "滑雪需要准备哪些装备？", answer: "滑雪通常需要雪板或租赁装备、雪鞋、雪杖、头盔、雪镜、防水雪服、保暖层、滑雪袜、手套、防晒、零食和水。" },
        { question: "第一次滑雪穿什么？", answer: "建议穿排汗内层、保暖中层、防水外壳和雪裤，再搭配滑雪袜、手套、头盔、雪镜和护脸。" },
        { question: "新手滑雪应该租还是买装备？", answer: "多数新手适合先租雪板、雪鞋和雪杖；袜子、手套、雪镜和内层更适合自己购买。" },
        { question: "滑雪旅行预算怎么安排？", answer: "需要考虑雪票、租赁或保养、课程、衣物、交通、住宿和餐饮。如果购买雪靴和外层，预算会明显增加。" },
        { question: "寒冷天气滑雪要多带什么？", answer: "建议带备用手套或内胆、暖宝宝、护脸、保暖中层、备用袜子、润唇膏、防晒和干衣服。" },
      ],
    },
    "fishing-gear-checklist": {
      packingStrategy: [
        "根据水域、目标鱼种和当地法规匹配鱼竿、线组、饵和拟饵。",
        "把钓具、工具、证件、防晒和鱼获处理用品分区收纳，岸边或船上会更顺手。",
        "长时间等待要准备舒适性：遮阳、雨衣、座椅、水、防虫和手部清洁。",
      ],
      commonMistakes: [
        "还不了解本地鱼种、水深和季节，就买太多不适用的拟饵。",
        "忘记许可证、禁钓规则、尺寸限制、测量工具或饵料限制。",
        "忽略湿滑岸边、鱼钩、防晒和长时间补水。",
      ],
      budgetTips: [
        { level: "低预算", advice: "选一支通用鱼竿和少量本地常用钓组，不要一开始堆满特殊拟饵。" },
        { level: "中预算", advice: "增加偏光镜、雨具、剪线钳、抄网和更清晰的钓具收纳。" },
        { level: "高预算", advice: "升级更灵敏的竿轮、鱼探或向导、优质保冷箱和防水钓具系统。" },
      ],
      faqs: [
        { question: "钓鱼需要准备哪些装备？", answer: "基础装备包括鱼竿、渔轮、鱼线、鱼钩、鱼饵或拟饵、钓具盒、许可证、钳子、剪线工具、防晒、水和防滑鞋。" },
        { question: "雨天钓鱼要带什么？", answer: "需要雨衣、防水袋、防滑鞋、干毛巾、备用袜子、防水钓具收纳，并保护好手机和许可证。" },
        { question: "钓鱼需要许可证吗？", answer: "大多数地区需要有效钓鱼许可证，而且不同鱼种、季节、水域和钓法规则不同，出发前要查当地规定。" },
        { question: "新手适合买什么钓鱼装备？", answer: "一支通用纺车竿、基础渔轮、鱼钩、浮漂、铅坠、少量本地常用拟饵、钳子和小钓具盒就够开始。" },
        { question: "钓鱼装备应该花多少钱？", answer: "一开始不用买太多，先买可靠竿轮和本地适用钓组，之后根据目标鱼种和常用钓法升级。" },
      ],
    },
    kayaking: {
      packingStrategy: [
        "先准备安全装备：救生衣、哨子、路线计划、天气检查和可完成的返程距离。",
        "用防水袋按优先级收纳手机、钥匙、保暖层和急救用品，避免进水后全部失效。",
        "按水温准备衣物，而不是只看气温；有风或早春水域尤其重要。",
      ],
      commonMistakes: [
        "以为出发时水面平静，返程时也一定一样。",
        "手机、车钥匙或保暖衣物没有防水备份，直接散放在艇内。",
        "因为路线短就忽略防晒、反光和补水。",
      ],
      budgetTips: [
        { level: "低预算", advice: "优先买合规救生衣、防水袋、哨子、防晒、水和基础速干衣物。" },
        { level: "中预算", advice: "升级更舒适的桨、速干层、艇上收纳和小型急救包。" },
        { level: "高预算", advice: "投入更轻的艇或桨、水上通信、专业防水服和路线对应的救援装备。" },
      ],
      faqs: [
        { question: "皮划艇需要准备哪些装备？", answer: "每位划手都需要合身救生衣、桨、哨子、防水袋、水、防晒、合适衣物和清晰路线计划。" },
        { question: "新手皮划艇要带什么？", answer: "新手建议带救生衣、水、防晒、帽子、太阳镜绑绳、防水袋、手机防水保护、速干衣和容易返程的短路线。" },
        { question: "皮划艇一定要防水袋吗？", answer: "强烈建议带。手机、钥匙、保暖层、急救用品等都应该放入防水袋，避免进水后失效。" },
        { question: "冷水环境皮划艇穿什么？", answer: "要按水温穿衣，必要时使用保暖层、防泼水外壳、湿式服或干式服，而不是只看气温。" },
        { question: "皮划艇装备预算怎么安排？", answer: "优先保证救生衣、防水收纳、桨的舒适度和天气防护；艇可以根据使用频率选择租或买。" },
      ],
    },
    "desert-hiking": {
      packingStrategy: [
        "先规划水量，再加入电解质、遮阳、太阳防护衣物和避开高温的出发时间。",
        "提前设定折返点，使用不依赖信号和明显地标的导航方式。",
        "用透气的皮肤和眼睛防护，不要只依赖防晒霜。",
      ],
      commonMistakes: [
        "按普通徒步水量准备，却走没有可靠补水点的路线。",
        "出发太晚，在最热时段进入无遮蔽区域。",
        "低估沙地、强光和干热风对体力的消耗。",
      ],
      budgetTips: [
        { level: "低预算", advice: "优先买水具、防晒帽、太阳镜、电解质和离线地图。" },
        { level: "中预算", advice: "升级 UPF 防晒衣、透气鞋、登山杖和更稳定的补水系统。" },
        { level: "高预算", advice: "增加卫星通信、轻量背包、高端防晒层和远程路线应急遮蔽。" },
      ],
      faqs: [
        { question: "沙漠徒步需要准备哪些装备？", answer: "沙漠徒步需要额外水量、电解质、防晒帽、太阳镜、防晒霜、UPF 衣物、透气鞋、导航和应急遮蔽或保暖层。" },
        { question: "沙漠徒步要带多少水？", answer: "沙漠路线通常要比普通徒步多带水，并根据高温、距离和补水点判断。即使一日路线也可能需要几升水。" },
        { question: "沙漠徒步穿什么？", answer: "建议穿透气长袖、防晒帽、太阳镜、浅色衣物、稳定徒步鞋，以及能应对沙粒和高温的袜子。" },
        { question: "新手适合沙漠徒步吗？", answer: "短距离、标识清晰、天气温和的路线可以尝试，但要避开高温时段，多带水，并选择容易撤出的路线。" },
        { question: "高温徒步要带什么？", answer: "需要水、电解质、咸味零食、防晒、离线地图、头灯、急救用品和延误时可用的备用层。" },
      ],
    },
    climbing: {
      packingStrategy: [
        "优先考虑认证安全装备、头盔、伙伴检查、路线信息和下降方案。",
        "把接近、攀爬和保护站等待时的衣物分开准备，避免暴露环境下失温或疲劳。",
        "为延误准备头灯、胶带、急救、水、零食和防风雨外壳。",
      ],
      commonMistakes: [
        "只关注攀岩鞋和镁粉，忽略头盔、沟通和路线后勤。",
        "没有确认锚点、下降路线、人流量或当地准入规则。",
        "出发太晚，又没有头灯和等待前方队伍的时间余量。",
      ],
      budgetTips: [
        { level: "低预算", advice: "认证头盔、安全带、保护器和伙伴关键装备不能省；非安全类装备可以先借用。" },
        { level: "中预算", advice: "增加更合脚的攀岩鞋、绳包、接近衣物、手套和路线资料。" },
        { level: "高预算", advice: "投入专项绳索系统、高端保护装备、轻量背包和训练型鞋款。" },
      ],
      faqs: [
        { question: "户外攀岩需要准备哪些装备？", answer: "常见装备包括攀岩鞋、安全带、头盔、保护器、绳索或伙伴绳索系统、镁粉、路线信息、水、衣物层和急救用品。" },
        { question: "攀岩一定要戴头盔吗？", answer: "户外攀岩强烈建议戴头盔，因为可能遇到落石、掉落装备、拥挤保护站和坠落冲击。" },
        { question: "新手户外攀岩要带什么？", answer: "新手要带个人安全装备、接近鞋、水、零食、防晒或保暖层、胶带，并和有经验的伙伴制定清晰计划。" },
        { question: "攀岩装备预算怎么安排？", answer: "先购买认证安全装备和合脚攀岩鞋。绳索、保护装备和高级系统应根据攀爬类型和训练程度再升级。" },
        { question: "天气变化时攀岩要准备什么？", answer: "建议带防风外壳、保暖层、头灯、额外水、路线信息，并预留可以撤退的时间和方案。" },
      ],
    },
    "road-trip-gear-checklist": {
      packingStrategy: [
        "先准备车辆：证件、轮胎工具、应急包、照明、充电和离线导航。",
        "把装备分成驾驶、路边应急、食物、睡眠和天气层，紧急物品不要压在最底下。",
        "进入偏远路段前，提前规划补给间隔、加油点、休息点和备用路线。",
      ],
      commonMistakes: [
        "只准备露营舒适装备，却忽略胎压、搭电线和路边警示。",
        "地图、住宿、加油和紧急信息完全依赖手机信号。",
        "长时间驾驶但没有安排休息、饮水、进食和驾驶员轮换。",
      ],
      budgetTips: [
        { level: "低预算", advice: "优先准备车辆安全基础、急救、水、充电线、离线地图和简单保冷箱。" },
        { level: "中预算", advice: "增加充电宝、收纳箱、路边工具、舒适衣物和食物整理系统。" },
        { level: "高预算", advice: "升级户外电源、车辆救援套装、高端保冷箱、车顶或后备箱扩容和远程通信。" },
      ],
      faqs: [
        { question: "自驾游需要准备哪些装备？", answer: "自驾游装备包括证件、离线地图、充电器、水、零食、保冷箱、急救包、车载工具、手电、保暖层和紧急联系人计划。" },
        { question: "长途自驾车里应该常备什么？", answer: "建议常备搭电线、轮胎工具、手电、反光警示、急救包、水、零食、充电宝、毯子和基础药品。" },
        { question: "自驾游预算怎么安排？", answer: "预算要包含油费、住宿或营地费、餐饮、公园门票、过路费、车辆检查、应急余量和需要补齐的装备。" },
        { question: "自驾露营要带什么？", answer: "在车辆安全装备基础上，还要带帐篷、睡眠系统、炉具、保冷箱、照明、营椅、水具、垃圾袋和天气层。" },
        { question: "偏远路线自驾怎么准备？", answer: "提前检查车辆，下载离线地图，规划加油点，多带水，准备路边工具，分享路线，并预期手机信号不足。" },
      ],
    },
  },
};

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

function getGuideDepthContent(page: GearChecklistPage, language: Language): GuideDepthContent {
  const localizedPage = getLocalizedPage(page, language);
  const activityName = language === "zh" ? localizeValue(page.analysisContext.activity, "zh") : page.h1.replace(" Gear Checklist", "");

  return (
    guideDepthContent[language][page.slug] ?? {
      packingStrategy: [
        language === "zh"
          ? `围绕${activityName}的天气、行程长度和安全边界来安排装备优先级。`
          : `Plan gear priorities around ${activityName.toLowerCase()} weather, trip length, and safety margin.`,
        language === "zh" ? `先准备${localizedPage.gear.slice(0, 2).join("、")}，再补充舒适性装备。` : `Start with ${localizedPage.gear.slice(0, 2).join(" and ")} before adding comfort extras.`,
        language === "zh" ? "把应急、照明、补水和保暖物品放在容易取用的位置。" : "Keep emergency, lighting, hydration, and warmth items easy to reach.",
      ],
      commonMistakes: localizedPage.risks,
      budgetTips: [
        {
          level: language === "zh" ? "低预算" : "Low budget",
          advice:
            language === "zh"
              ? "优先解决安全、天气防护和补水问题，非关键舒适装备可以延后。"
              : "Prioritize safety, weather protection, and hydration before non-essential comfort items.",
        },
        {
          level: language === "zh" ? "中预算" : "Mid budget",
          advice:
            language === "zh"
              ? "升级最影响体验的核心装备，例如背负、睡眠、保暖或收纳系统。"
              : "Upgrade the core items that most affect comfort, such as carry, sleep, warmth, or storage systems.",
        },
        {
          level: language === "zh" ? "高预算" : "High budget",
          advice:
            language === "zh"
              ? "选择更轻、更耐用、更适合长线或复杂环境的专业装备。"
              : "Choose lighter, more durable, and more specialized gear for longer or more complex trips.",
        },
      ],
      faqs: [
        {
          question: language === "zh" ? `${activityName}需要准备哪些装备？` : `What gear do I need for ${activityName.toLowerCase()}?`,
          answer:
            language === "zh"
              ? `优先准备${localizedPage.gear.slice(0, 3).join("、")}，再根据天气和行程长度补充安全与舒适装备。`
              : `Start with ${localizedPage.gear.slice(0, 3).join(", ")}, then add safety and comfort items based on weather and trip length.`,
        },
        {
          question: language === "zh" ? `${activityName}新手最容易忽略什么？` : `What do beginners often forget for ${activityName.toLowerCase()}?`,
          answer: localizedPage.risks[0] ?? (language === "zh" ? "新手常常低估天气、路线和时间余量。" : "Beginners often underestimate weather, route conditions, and time margin."),
        },
        {
          question: language === "zh" ? `${activityName}预算应该怎么分配？` : `How should I budget for ${activityName.toLowerCase()} gear?`,
          answer:
            language === "zh"
              ? "先把钱花在安全、天气防护和真正影响完成度的核心装备上，再升级轻量化和舒适性。"
              : "Spend first on safety, weather protection, and the core items that affect trip completion before upgrading comfort and weight savings.",
        },
        {
          question: language === "zh" ? `${activityName}遇到坏天气怎么办？` : `What should I pack for bad weather ${activityName.toLowerCase()}?`,
          answer:
            language === "zh"
              ? "准备防水或防风外层、备用保暖层、可靠照明、防水收纳和可以提前撤退的计划。"
              : "Pack wind or rain protection, backup warmth, reliable lighting, waterproof storage, and a plan that allows an early exit.",
        },
        {
          question: language === "zh" ? `${activityName}适合一日行程吗？` : `Is ${activityName.toLowerCase()} suitable for a day trip?`,
          answer:
            language === "zh"
              ? "可以，但路线、天气、装备和返回时间都要保守规划，避免把短行程拖成高风险长线。"
              : "Yes, but plan conservatively around route difficulty, weather, gear, and return timing so a short trip does not become a risky long exit.",
        },
      ],
    }
  );
}

function getRelatedGuides(page: GearChecklistPage): RelatedGuide[] {
  const keys = relatedGuideKeysBySlug[page.slug] ?? ["hiking", "camping", "roadTrip"];

  return keys.map((key) => relatedGuideCatalog[key]).filter((guide): guide is RelatedGuide => Boolean(guide));
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
  const heroImage = getGuideImage(page.slug);
  const depthContent = getGuideDepthContent(page, language);
  const relatedGuides = getRelatedGuides(page);
  const activitySlug = activitySlugByActivity[page.analysisContext.activity] ?? page.slug;
  const plannerHref = `/?activity=${activitySlug}&lang=${language}`;

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

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-14 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{labels.packingStrategy}</p>
          <ul className="mt-5 space-y-4">
            {depthContent.packingStrategy.map((item) => (
              <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-rose-700">{labels.commonMistakes}</p>
          <ul className="mt-5 space-y-4">
            {depthContent.commonMistakes.map((item) => (
              <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">{labels.budgetTips}</p>
          <div className="mt-5 space-y-3">
            {depthContent.budgetTips.map((tip) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" key={tip.level}>
                <h3 className="text-sm font-black text-slate-950">{tip.level}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{tip.advice}</p>
              </div>
            ))}
          </div>
        </article>
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

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{labels.faq}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {depthContent.faqs?.map((faq) => (
              <article className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4" key={faq.question}>
                <h2 className="text-base font-black leading-6 text-slate-950">{faq.question}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{labels.relatedGuides}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {relatedGuides.map((guide) => (
              <Link
                className="group relative isolate min-h-[230px] overflow-hidden rounded-2xl border border-white/25 bg-slate-950 p-5 text-white shadow-lg shadow-emerald-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/20 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                href={`/${guide.slug}?lang=${language}`}
                key={guide.slug}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-20 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${getGuideImage(guide.slug)}")` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.24),rgba(2,6,23,0.82)),linear-gradient(90deg,rgba(6,78,59,0.58),rgba(15,23,42,0.14))]"
                />
                <div className="flex min-h-[190px] flex-col justify-end">
                  <h2 className="text-xl font-black leading-7 drop-shadow-sm">{guide.title[language]}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/82">{guide.description[language]}</p>
                  <span className="mt-5 w-fit rounded-xl border border-white/25 bg-white/16 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition group-hover:bg-white group-hover:text-emerald-950">
                    {labels.viewGuide}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-900 px-6 py-5 text-white shadow-lg shadow-emerald-950/10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-100">{localizedPage.eyebrow}</p>
            <p className="mt-2 text-base font-semibold text-white/82">{localizedPage.h1}</p>
          </div>
          <Link
            className="rounded-xl bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            href={plannerHref}
          >
            {labels.openPlanner}
          </Link>
        </div>
      </section>
    </main>
  );
}
