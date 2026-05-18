import type { Metadata } from "next";
import Link from "next/link";

type GearChecklistPage = {
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
  image: string;
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
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1800&q=85",
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
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1800&q=85",
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
    image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1800&q=85",
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
    image: "/fishing-hero.jpg",
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
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
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
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1800&q=85",
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
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85",
  },
} satisfies Record<string, GearChecklistPage>;

export function createChecklistMetadata(page: GearChecklistPage): Metadata {
  const url = `https://outdoor-gear-calculator.com/${page.slug}`;

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
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function GearChecklistLanding({ page }: { page: GearChecklistPage }) {
  return (
    <main className="min-h-screen bg-[#eef3ea] text-slate-900">
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.36), rgba(22, 80, 45, 0.18), rgba(238, 243, 234, 0.92)), url("${page.image}")`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,48,31,0.5),rgba(12,48,31,0.12)_55%,rgba(238,243,234,0.18)),linear-gradient(to_bottom,rgba(0,0,0,0.16),rgba(0,0,0,0.04)_42%,rgba(238,243,234,0.96))]"
        />

        <div className="mx-auto flex min-h-[390px] max-w-6xl flex-col justify-end px-6 pb-16 pt-20">
          <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-xl">
            {page.eyebrow}
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-white drop-shadow-sm sm:text-6xl">
            <span style={{ textShadow: "0 4px 22px rgba(0, 0, 0, 0.42)" }}>{page.h1}</span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl"
            style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.34)" }}
          >
            {page.intro}
          </p>
          <Link
            className="mt-8 w-fit rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            href="/"
          >
            Open Gear Planner
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Best For</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Suitable Scenarios</h2>
          <ul className="mt-5 space-y-3">
            {page.scenarios.map((item) => (
              <li key={item} className="flex gap-3 text-slate-700">
                <span className="mt-2 h-2 w-2 rounded-full bg-emerald-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/88 p-6 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-950/5 backdrop-blur-2xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">Checklist</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Core Gear List</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {page.gear.map((item) => (
              <li key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-slate-800">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-lg shadow-amber-950/5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-700">Risk Notes</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Common Risk Reminders</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {page.risks.map((risk) => (
              <p key={risk} className="rounded-xl border border-amber-200 bg-white/75 p-4 text-sm leading-6 text-slate-700">
                {risk}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
