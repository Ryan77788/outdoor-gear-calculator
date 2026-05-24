import type { Metadata } from "next";
import type { Activity } from "@/data/products";
import type { TripDays, Weather } from "@/lib/recommendation";
import type { GearTier } from "@/lib/gear-tier";

import { getGuideImage } from "@/lib/activity-backgrounds";
import { GearChecklistLandingClient } from "@/app/gear-checklist-landing-client";
import { getLanguageFromValue, type Language } from "@/lib/i18n";

export type GearChecklistPage = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  eyebrow: string;
  h1: string;
  intro: string;
  scenarios: string[];
  gear: string[];
  risks: string[];
  relatedSlugs?: string[];
  faqEn?: { question: string; answer: string }[];
  faqZh?: { question: string; answer: string }[];
  packingStrategy?: string[];
  commonMistakes?: string[];
  budgetTips?: {
    level: string;
    advice: string;
  }[];
  tier: GearTier;
  analysisContext: {
    activity: Activity;
    weather: Weather;
    tripDays: TripDays;
    peopleCount: number;
  };
};

export const gearChecklistPages = {
  hiking: {
    slug: "hiking-gear-checklist",
    title: "Hiking Gear Checklist | Outdoor Gear Calculator",
    description:
      "Use this hiking gear checklist to prepare layers, navigation, hydration, food, and safety essentials for day hikes and multi-day trails.",
    keywords: [
      "hiking gear checklist",
      "hiking packing list",
      "day hike essentials",
      "trail gear planner",
      "outdoor gear calculator",
    ],
    eyebrow: "Trail Planning",
    h1: "Hiking Gear Checklist",
    intro:
      "A practical hiking checklist helps you move lighter, stay oriented, and keep enough margin for changing trail and weather conditions.",
    scenarios: [
      "Day hikes on marked trails",
      "Weekend mountain routes",
      "Multi-day backpacking approaches",
      "Cool, wet, windy, or exposed terrain",
    ],
    gear: [
      "Supportive hiking shoes or boots",
      "Weather-appropriate layers and rain shell",
      "Daypack or backpack with rain cover",
      "Navigation tools: map, compass, GPS, or offline app",
      "Water bottles or hydration bladder plus treatment backup",
      "Trail food, emergency snacks, and electrolyte mix",
      "Headlamp, first-aid kit, repair tape, and whistle",
    ],
    risks: [
      "Weather can change quickly at elevation, so pack insulation even for warm starts.",
      "Poor navigation and low phone battery are common causes of delays.",
      "Dehydration, blisters, and late starts can turn an easy route into a long exit.",
    ],
    tier: "mid",
    analysisContext: { activity: "徒步", weather: "雨天", tripDays: "2-3天", peopleCount: 2 },
  },
  camping: {
    slug: "camping-gear-checklist",
    title: "Camping Gear Checklist | Outdoor Gear Calculator",
    description:
      "Plan your camping gear with a complete checklist for shelter, sleep, cooking, lighting, clothing, food storage, and campsite safety.",
    keywords: [
      "camping gear checklist",
      "camping packing list",
      "camping essentials",
      "family camping gear",
      "outdoor gear planner",
    ],
    eyebrow: "Camp Setup",
    h1: "Camping Gear Checklist",
    intro:
      "A good camping setup balances comfort, warmth, food safety, and simple campsite routines so the trip stays relaxed after dark.",
    scenarios: [
      "Car camping weekends",
      "Family campground trips",
      "Festival or group base camps",
      "Cool nights, rain, or mixed-weather campsites",
    ],
    gear: [
      "Tent, footprint, stakes, and guylines",
      "Sleeping bag, sleeping pad, and camp pillow",
      "Camp stove, fuel, lighter, cookware, and utensils",
      "Cooler or food storage system",
      "Headlamps, lanterns, and spare batteries",
      "Warm layers, rainwear, and dry sleep clothes",
      "First-aid kit, trash bags, repair kit, and campsite tools",
    ],
    risks: [
      "Cold ground can drain warmth fast if your sleeping pad is under-rated.",
      "Loose food storage attracts pests and can create safety problems.",
      "Wind and rain expose weak tent staking, especially on open sites.",
    ],
    tier: "premium",
    analysisContext: { activity: "露营", weather: "寒冷", tripDays: "2-3天", peopleCount: 3 },
  },
  skiing: {
    slug: "skiing-gear-checklist",
    title: "Skiing Gear Checklist | Outdoor Gear Calculator",
    description:
      "Prepare for ski days with a skiing gear checklist covering insulated layers, snow protection, safety gear, hydration, and resort essentials.",
    keywords: [
      "skiing gear checklist",
      "ski trip packing list",
      "ski essentials",
      "snow gear checklist",
      "winter outdoor gear",
    ],
    eyebrow: "Snow Days",
    h1: "Skiing Gear Checklist",
    intro:
      "Ski days reward preparation: warm layers, dry hands, clear visibility, and small backups make cold weather far easier to manage.",
    scenarios: [
      "Resort skiing and snowboarding",
      "Winter weekend trips",
      "Beginner lessons and rental days",
      "Cold, windy, or snowy mountain conditions",
    ],
    gear: [
      "Ski jacket, ski pants, base layers, and midlayer",
      "Helmet, goggles, neck gaiter, and sun protection",
      "Waterproof gloves or mittens plus spare liners",
      "Ski socks and insulated boots or rental confirmation",
      "Skis, poles, snowboard, bindings, or rental booking",
      "Small pack with water, snacks, hand warmers, and first-aid basics",
      "Lift pass, ID, travel documents, and dry change of clothes",
    ],
    risks: [
      "Cold injury risk rises when gloves, socks, or base layers get wet.",
      "Low visibility makes speed control and route choice more difficult.",
      "Altitude, sun reflection, and dehydration can build fatigue quickly.",
    ],
    tier: "premium",
    analysisContext: { activity: "滑雪", weather: "寒冷", tripDays: "1天", peopleCount: 2 },
  },
  fishing: {
    slug: "fishing-gear-checklist",
    title: "Fishing Gear Checklist | Outdoor Gear Calculator",
    description:
      "Use this fishing gear checklist for rods, tackle, clothing, storage, licenses, weather protection, and water safety essentials.",
    keywords: [
      "fishing gear checklist",
      "fishing packing list",
      "fishing essentials",
      "tackle checklist",
      "outdoor fishing planner",
    ],
    eyebrow: "Water Ready",
    h1: "Fishing Gear Checklist",
    intro:
      "Fishing plans depend on location, weather, and regulations, so a clear checklist keeps tackle, comfort, and safety in one place.",
    scenarios: [
      "Lake, river, pier, or shoreline fishing",
      "Boat fishing and guided trips",
      "Early morning or evening sessions",
      "Wet, sunny, buggy, or windy environments",
    ],
    gear: [
      "Rod, reel, line, hooks, lures, bait, and tackle box",
      "Fishing license, local rules, and catch limits",
      "Pliers, line cutter, net, measuring tool, and fish storage",
      "Waterproof footwear, rain shell, hat, and polarized sunglasses",
      "Cooler, water, food, sunscreen, and insect repellent",
      "Dry bag or waterproof case for phone and keys",
      "Life jacket for boat, dock, or deep-water access",
    ],
    risks: [
      "Local rules can vary by species, season, location, and catch method.",
      "Slippery banks, docks, and rocks make footwear and balance important.",
      "Sun, wind, and insects can become the main comfort problem on long sessions.",
    ],
    tier: "mid",
    analysisContext: { activity: "钓鱼", weather: "雨天", tripDays: "1天", peopleCount: 2 },
  },
  roadTrip: {
    slug: "road-trip-gear-checklist",
    title: "Road Trip Gear Checklist | Outdoor Gear Calculator",
    description:
      "Plan road trip gear for navigation, vehicle safety, food, weather, sleep, charging, documents, and emergency readiness.",
    keywords: [
      "road trip gear checklist",
      "road trip packing list",
      "car travel essentials",
      "vehicle emergency kit",
      "outdoor road trip planner",
    ],
    eyebrow: "Route Ready",
    h1: "Road Trip Gear Checklist",
    intro:
      "Road trips need more than bags in the trunk: vehicle readiness, charging, navigation, comfort, and contingency gear all matter.",
    scenarios: [
      "Weekend scenic drives",
      "National park road trips",
      "Long-distance family travel",
      "Remote routes with limited services",
    ],
    gear: [
      "Driver documents, insurance, registration, and itinerary",
      "Phone mount, offline maps, chargers, and power bank",
      "Vehicle emergency kit, jumper cables, tire tools, and flashlight",
      "Water, snacks, cooler, reusable bottles, and trash bags",
      "Comfort layers, travel pillow, blanket, and spare clothes",
      "First-aid kit, medications, hand sanitizer, and wipes",
      "Cash, cards, spare key plan, and roadside assistance details",
    ],
    risks: [
      "Remote routes can have long gaps between fuel, food, and cell coverage.",
      "Fatigue is a major road-trip hazard, especially after early starts.",
      "Weather and road closures can change the route plan with little notice.",
    ],
    tier: "premium",
    analysisContext: { activity: "自驾游", weather: "晴天", tripDays: "4天以上", peopleCount: 4 },
  },
  cycling: {
    slug: "cycling-gear-checklist",
    title: "Cycling Gear Checklist | Outdoor Gear Calculator",
    description:
      "Use this cycling gear checklist for helmet, repair kit, hydration, lights, layers, nutrition, tools, and ride safety planning.",
    keywords: [
      "cycling gear checklist",
      "bike ride packing list",
      "cycling essentials",
      "bike repair kit checklist",
      "outdoor cycling planner",
    ],
    eyebrow: "Ride Planning",
    h1: "Cycling Gear Checklist",
    intro:
      "Cycling preparation is about keeping the bike working, the rider visible, and energy steady from the first kilometer to the return.",
    scenarios: [
      "City rides and fitness loops",
      "Gravel, touring, and weekend routes",
      "Group rides or charity events",
      "Hot, windy, rainy, or low-light rides",
    ],
    gear: [
      "Helmet, cycling glasses, gloves, and weather-ready layers",
      "Bike lights, reflectors, bell, and visibility accessories",
      "Spare tube, tire levers, pump or CO2, multi-tool, and patch kit",
      "Water bottles or hydration pack",
      "Ride snacks, gels, or electrolyte mix",
      "Phone, ID, cash or card, and route map",
      "Chain lube, lock, and compact first-aid basics for longer rides",
    ],
    risks: [
      "Punctures and loose bolts are common reasons rides stop early.",
      "Low visibility raises risk around traffic, intersections, and bad weather.",
      "Under-fueling can cause sharp fatigue on longer or hillier routes.",
    ],
    tier: "mid",
    analysisContext: { activity: "骑行", weather: "炎热", tripDays: "1天", peopleCount: 2 },
  },
  beachTravel: {
    slug: "beach-travel-gear-checklist",
    title: "Beach Travel Gear Checklist | Outdoor Gear Calculator",
    description:
      "Prepare for beach travel with sun protection, swim gear, towels, hydration, storage, family items, and coastal safety essentials.",
    keywords: [
      "beach travel gear checklist",
      "beach packing list",
      "beach essentials",
      "family beach checklist",
      "summer travel gear",
    ],
    eyebrow: "Coastal Days",
    h1: "Beach Travel Gear Checklist",
    intro:
      "Beach travel is easiest when shade, hydration, dry storage, and sun protection are planned before sand and salt get involved.",
    scenarios: [
      "Beach day trips",
      "Family coastal vacations",
      "Swimming, snorkeling, or paddle activities",
      "Hot, sunny, windy, or humid destinations",
    ],
    gear: [
      "Swimwear, cover-up, sandals, and spare dry clothes",
      "Beach towels, blanket, shade tent, umbrella, or sun shelter",
      "Broad-spectrum sunscreen, lip balm, hat, and sunglasses",
      "Water bottles, cooler, snacks, and electrolyte drinks",
      "Waterproof phone pouch, dry bag, and sand-proof storage",
      "Snorkel gear, float aids, or activity-specific equipment",
      "Basic first aid, after-sun care, and insect repellent",
    ],
    risks: [
      "Sun exposure can build quickly through clouds, wind, and water reflection.",
      "Rip currents and changing tides require local awareness before swimming.",
      "Heat, dehydration, and lost small items are the most common beach-day problems.",
    ],
    tier: "entry",
    analysisContext: { activity: "海边旅行", weather: "炎热", tripDays: "2-3天", peopleCount: 3 },
  },
  trailRunning: {
    slug: "trail-running",
    title: "Trail Running Gear Checklist | Outdoor Gear Calculator",
    description: "Plan trail running gear for shoes, hydration, lighting, nutrition, layers, and safety margin on dirt, rock, and mountain routes.",
    keywords: ["trail running gear checklist", "trail running essentials", "mountain running gear", "hydration vest checklist"],
    eyebrow: "Fast Trails",
    h1: "Trail Running Gear Checklist",
    intro: "Trail running gear should stay light, stable, and risk-aware so pace, hydration, and visibility remain reliable on changing terrain.",
    scenarios: ["Mountain singletrack and forest loops", "Early morning or dusk trail runs", "Hot-weather endurance routes", "Race-day or long training efforts"],
    gear: ["Trail running shoes with reliable grip", "Hydration vest or running pack", "Headlamp or compact route light", "Electrolytes, gels, and compact snacks", "Quick-dry layer, wind shell, and small first-aid basics"],
    risks: ["Downhill speed increases ankle and fall risk on loose terrain.", "High effort can make dehydration and cramping appear quickly.", "Low light, wrong turns, and weak phone battery can turn a short run into a long exit."],
    tier: "mid",
    analysisContext: { activity: "越野跑", weather: "炎热", tripDays: "1天", peopleCount: 1 },
  },
  backpacking: {
    slug: "backpacking",
    title: "Backpacking Gear Checklist | Outdoor Gear Calculator",
    description: "Build a backpacking checklist for multi-day shelter, sleep, cooking, water, layers, navigation, and recovery-focused gear.",
    keywords: ["backpacking gear checklist", "multi day hiking gear", "backpacking packing list", "overnight hiking essentials"],
    eyebrow: "Multi-Day Trails",
    h1: "Backpacking Gear Checklist",
    intro: "Backpacking planning is about making shelter, sleep, water, and load carry work together across several days, not just packing more items.",
    scenarios: ["Overnight mountain routes", "Weekend backpacking trips", "Remote trail systems with limited resupply", "Cool, wet, or mixed-weather routes"],
    gear: ["Backpacking pack with stable load transfer", "Supportive hiking shoes or boots", "Tent, stakes, and repair basics", "Sleeping bag and insulated sleeping pad", "Stove, water treatment, food storage, and headlamp"],
    risks: ["Overpacking makes small terrain changes feel much harder by day two.", "Poor sleep insulation can reduce recovery and decision quality.", "Water source assumptions can fail on dry or exposed routes."],
    tier: "premium",
    analysisContext: { activity: "重装徒步", weather: "雨天", tripDays: "2-3天", peopleCount: 2 },
  },
  climbing: {
    slug: "climbing",
    title: "Climbing Gear Checklist | Outdoor Gear Calculator",
    description: "Prepare climbing gear for shoes, helmet, lighting, gloves, first aid, weather exposure, and route safety planning.",
    keywords: ["climbing gear checklist", "rock climbing essentials", "outdoor climbing checklist", "climbing safety gear"],
    eyebrow: "Vertical Routes",
    h1: "Climbing Gear Checklist",
    intro: "Climbing gear planning should prioritize precision, head protection, route timing, and simple retreat options before comfort extras.",
    scenarios: ["Outdoor sport climbing days", "Crag approaches and single-pitch routes", "Longer routes with descent planning", "Cool, windy, or exposed rock environments"],
    gear: ["Climbing shoes with reliable fit", "Helmet for rockfall and impact protection", "Headlamp for delays or descents", "Belay gloves or rope-handling gloves", "First-aid kit, weather shell, and approach water"],
    risks: ["Loose rock, crowded belay zones, and route delays increase impact risk.", "Storms and wind can make exposed rock routes unsafe fast.", "Late descents require lighting even when the route begins in daylight."],
    tier: "mid",
    analysisContext: { activity: "攀岩", weather: "晴天", tripDays: "1天", peopleCount: 2 },
  },
  kayaking: {
    slug: "kayaking",
    title: "Kayaking Gear Checklist | Outdoor Gear Calculator",
    description: "Use this kayaking gear checklist for PFDs, dry bags, sun protection, water, clothing, and on-water safety basics.",
    keywords: ["kayaking gear checklist", "kayak trip essentials", "paddling safety gear", "water sports packing list"],
    eyebrow: "On Water",
    h1: "Kayaking Gear Checklist",
    intro: "Kayaking gear needs to protect both the paddler and the essentials from water, glare, wind, and changing return-to-shore conditions.",
    scenarios: ["Lake and calm river paddles", "Beginner kayaking trips", "Sunny or windy water days", "Short coastal or campground paddles"],
    gear: ["Personal flotation device for every paddler", "Dry bag for phone, layers, and emergency items", "Sun hat, sunglasses, sunscreen, and quick-dry clothing", "Water bottle or hydration system", "Small first-aid kit, whistle, and route communication plan"],
    risks: ["Wind can make the return paddle much harder than the outbound leg.", "Cold water and wet layers increase exposure risk even on sunny days.", "Phones and keys need waterproof storage before launch, not after spray begins."],
    tier: "mid",
    analysisContext: { activity: "皮划艇", weather: "晴天", tripDays: "1天", peopleCount: 2 },
  },
  snowboarding: {
    slug: "snowboarding",
    title: "Snowboarding Gear Checklist | Outdoor Gear Calculator",
    description: "Plan snowboarding gear for board, bindings, boots, helmet, goggles, layers, gloves, warmth, and resort-day safety.",
    keywords: ["snowboarding gear checklist", "snowboard trip packing list", "snowboard essentials", "winter sports gear"],
    eyebrow: "Snowboard Setup",
    h1: "Snowboarding Gear Checklist",
    intro: "Snowboarding preparation is all about matching board control, boot comfort, visibility, warmth, and fall protection before the first run.",
    scenarios: ["Resort snowboarding days", "Beginner lessons and rental checks", "Cold, windy, or snowy mountain trips", "Weekend winter travel"],
    gear: ["Snowboard, bindings, and tuned edges", "Snowboard boots with secure fit", "Helmet and goggles", "Base layer, midlayer, snowboard jacket, and pants", "Waterproof gloves, socks, neck gaiter, snacks, and warmers"],
    risks: ["Poor boot fit quickly affects control and fatigue.", "Flat light and windblown snow reduce visibility.", "Falls are common, so impact protection and warm dry layers matter."],
    tier: "premium",
    analysisContext: { activity: "单板滑雪", weather: "寒冷", tripDays: "1天", peopleCount: 2 },
  },
  desertHiking: {
    slug: "desert-hiking",
    title: "Desert Hiking Gear Checklist | Outdoor Gear Calculator",
    description: "Prepare desert hiking gear for water capacity, sun protection, breathable footwear, navigation, electrolytes, and heat safety.",
    keywords: ["desert hiking gear checklist", "hot weather hiking gear", "desert trail essentials", "sun protection hiking checklist"],
    eyebrow: "Hot Terrain",
    h1: "Desert Hiking Gear Checklist",
    intro: "Desert hiking gear should prioritize water, shade, navigation, and breathable protection because heat and distance leave little margin.",
    scenarios: ["Desert trail day hikes", "Canyon and arid mountain routes", "Hot-weather travel routes", "Dry terrain with limited water sources"],
    gear: ["Breathable hiking shoes with stable soles", "Hydration bladder plus backup bottle capacity", "Sun hat, sunglasses, sunscreen, and UV shirt", "Electrolytes and salty snacks", "Offline map, headlamp, and emergency layer"],
    risks: ["Heat stress can build before you feel thirsty.", "Dry routes often have unreliable or no water sources.", "Bright sand and rock increase eye strain and navigation fatigue."],
    tier: "mid",
    analysisContext: { activity: "沙漠徒步", weather: "炎热", tripDays: "1天", peopleCount: 2 },
  },
  winterCamping: {
    slug: "winter-camping",
    title: "Winter Camping Gear Checklist | Outdoor Gear Calculator",
    description: "Plan winter camping gear for shelter, sleeping warmth, stove systems, insulation, lighting, dry layers, and cold-risk management.",
    keywords: ["winter camping gear checklist", "cold weather camping gear", "winter tent checklist", "snow camping essentials"],
    eyebrow: "Cold Camp",
    h1: "Winter Camping Gear Checklist",
    intro: "Winter camping works best when shelter, sleep insulation, cooking, lighting, and dry clothing are planned as one cold-weather system.",
    scenarios: ["Cold-weather campground trips", "Snow-adjacent base camps", "Winter weekend camping", "Long nights, wind, frost, or sub-freezing conditions"],
    gear: ["Winter-capable tent and secure anchors", "Cold-rated sleeping bag", "High R-value sleeping pad", "Reliable stove, fuel, lighter, and hot-drink setup", "Headlamps, lantern, dry base layers, gloves, and warm hat"],
    risks: ["Ground cold can defeat a warm sleeping bag without the right pad.", "Wet layers and long nights increase hypothermia risk.", "Stoves and batteries perform differently in freezing conditions."],
    tier: "premium",
    analysisContext: { activity: "冬季露营", weather: "寒冷", tripDays: "2-3天", peopleCount: 2 },
  },
  beachCamping: {
    slug: "beach-camping",
    title: "Beach Camping Gear Checklist | Outdoor Gear Calculator",
    description: "Prepare beach camping gear for wind, sand, shade, dry storage, food cooling, sun protection, sleep, and tide-aware camp setup.",
    keywords: ["beach camping gear checklist", "coastal camping essentials", "beach tent camping", "sand camping gear"],
    eyebrow: "Coastal Camp",
    h1: "Beach Camping Gear Checklist",
    intro: "Beach camping combines camp comfort with sand, wind, salt air, and tide planning, so storage and shelter setup matter early.",
    scenarios: ["Coastal campground weekends", "Beach base camps with family or friends", "Warm-weather overnight trips", "Windy, sandy, or humid campsites"],
    gear: ["Beach-capable tent or shelter with sand anchors", "Dry bags for electronics, layers, and documents", "Sun hat, sunscreen, sunglasses, and shade plan", "Cooler for food and drinks", "Quick-dry towels, camp mat, and sleep layers"],
    risks: ["Tide lines and storm surge can make a good campsite unsafe overnight.", "Wind and loose sand expose weak tent staking.", "Salt air and sand can damage electronics and zippers without dry storage."],
    tier: "mid",
    analysisContext: { activity: "海边露营", weather: "炎热", tripDays: "2-3天", peopleCount: 3 },
  },
} satisfies Record<string, GearChecklistPage>;

export function createChecklistMetadata(page: GearChecklistPage): Metadata {
  const url = `https://outdoor-gear-calculator.com/${page.slug}`;
  const image = getGuideImage(page.slug);
  const imageUrl = new URL(image, "https://outdoor-gear-calculator.com").toString();

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [imageUrl],
    },
  };
}

function createFaqJsonLd(page: GearChecklistPage, language: Language) {
  const faqs = language === "zh" ? page.faqZh : page.faqEn;

  if (!faqs?.length) return null;

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

export function GearChecklistLanding({ page, lang }: { page: GearChecklistPage; lang?: string }) {
  const language = getLanguageFromValue(lang);
  const faqJsonLd = createFaqJsonLd(page, language);

  return (
    <>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <GearChecklistLandingClient page={page} />
    </>
  );
}


