import type { Activity } from "@/data/products";
import type { RiskIconName, TripDays, Weather } from "@/lib/recommendation";
import type { Language } from "@/lib/i18n";

export type RecommendationAnalysisItem = {
  icon: RiskIconName;
  title: string;
  tone: "standard" | "elevated" | "high";
  bullets: string[];
};

type RecommendationAnalysisContext = {
  activity: Activity;
  weather: Weather;
  tripDays: TripDays;
  peopleCount: number;
  language: Language;
};

function isMultiDay(tripDays: TripDays) {
  return tripDays === "2-3天" || tripDays === "4天以上";
}

function isLongTrip(tripDays: TripDays) {
  return tripDays === "4天以上";
}

function activityReasoning(activity: Activity, language: Language): RecommendationAnalysisItem {
  if (language === "zh") {
    const activityRules: Record<Activity, RecommendationAnalysisItem> = {
      登山: {
        icon: "route",
        title: "地形与负重判断",
        tone: "elevated",
        bullets: ["优先提高鞋底抓地、背包稳定和照明冗余。", "坡度和碎石会放大体力消耗，因此核心装备比舒适配件更重要。"],
      },
      徒步: {
        icon: "route",
        title: "行走效率判断",
        tone: "standard",
        bullets: ["优先选择鞋、背包和补水系统，减少后半程疲劳。", "轻量但可靠的装备能提高全天节奏稳定性。"],
      },
      露营: {
        icon: "pack",
        title: "营地系统判断",
        tone: "elevated",
        bullets: ["帐篷、睡袋、睡垫和炉具决定夜间恢复质量。", "共享装备优先级高，预算应先覆盖睡眠和庇护系统。"],
      },
      滑雪: {
        icon: "shield",
        title: "雪场控制与防护",
        tone: "high",
        bullets: ["雪板、雪靴、头盔和雪镜直接影响控制与安全。", "低温和高速环境下，保暖、防风和摔倒防护权重更高。"],
      },
      钓鱼: {
        icon: "weather",
        title: "水边场景判断",
        tone: "elevated",
        bullets: ["鱼竿、线组、防滑和防水收纳比零散小配件更关键。", "湿滑岸线和天气变化会提高撤离与安全装备需求。"],
      },
      自驾游: {
        icon: "route",
        title: "路线与车辆冗余",
        tone: "standard",
        bullets: ["优先保障导航、车载应急、照明和补给冗余。", "远距离路线要把充电、维修和休息装备前置。"],
      },
      骑行: {
        icon: "shield",
        title: "骑行安全判断",
        tone: "elevated",
        bullets: ["头盔、车灯、维修工具和补水优先级高。", "路线越长，爆胎、能量下降和能见度风险越需要提前覆盖。"],
      },
      海边旅行: {
        icon: "weather",
        title: "日晒与防水判断",
        tone: "standard",
        bullets: ["防晒、防水收纳和速干装备会直接影响舒适度。", "海边反光、潮气和风会放大皮肤与电子设备风险。"],
      },
      越野跑: {
        icon: "clock",
        title: "速度与补给判断",
        tone: "elevated",
        bullets: ["跑鞋抓地、补水背心和照明冗余决定路线稳定性。", "高心率运动会放大脱水、抽筋和下坡摔倒风险。"],
      },
      重装徒步: {
        icon: "pack",
        title: "负重系统判断",
        tone: "elevated",
        bullets: ["背包、鞋靴、帐篷和睡眠系统决定多日行程恢复。", "负重越高，减重和稳定背负越能影响后续体力。"],
      },
      攀岩: {
        icon: "shield",
        title: "保护与撤退判断",
        tone: "high",
        bullets: ["攀岩鞋、头盔和基础急救优先级高于舒适配件。", "落石、延误和下降路线会提高照明与安全冗余需求。"],
      },
      皮划艇: {
        icon: "weather",
        title: "水面安全判断",
        tone: "high",
        bullets: ["救生衣、防水袋和回岸计划是水面活动的基础。", "风浪、水温和强反光会同时影响安全与体力。"],
      },
      单板滑雪: {
        icon: "shield",
        title: "单板控制判断",
        tone: "high",
        bullets: ["雪板、固定器、雪鞋、头盔和雪镜直接影响控制。", "低温、高速和摔倒频率让防护装备权重更高。"],
      },
      沙漠徒步: {
        icon: "weather",
        title: "高温与补水判断",
        tone: "high",
        bullets: ["饮水、防晒、遮阳和路线冗余必须优先覆盖。", "沙地反光和干热会快速增加脱水与迷航风险。"],
      },
      冬季露营: {
        icon: "clock",
        title: "夜间保暖判断",
        tone: "high",
        bullets: ["帐篷、睡袋、防潮垫和炉具共同决定夜间安全。", "低温下湿衣物、长夜和静止等待会提高失温风险。"],
      },
      海边露营: {
        icon: "weather",
        title: "潮汐营地判断",
        tone: "elevated",
        bullets: ["帐篷固定、防水收纳和食物冷藏影响营地稳定。", "潮汐、强风和盐雾会放大普通露营的小问题。"],
      },
    };

    return activityRules[activity];
  }

  const activityRules: Record<Activity, RecommendationAnalysisItem> = {
    登山: {
      icon: "route",
      title: "Terrain and load reasoning",
      tone: "elevated",
      bullets: ["Prioritize traction, pack stability, and lighting redundancy.", "Steep or loose terrain makes core gear more valuable than comfort extras."],
    },
    徒步: {
      icon: "route",
      title: "Walking efficiency reasoning",
      tone: "standard",
      bullets: ["Shoes, pack fit, and hydration drive comfort through the return leg.", "Light but dependable gear keeps pace and fatigue more predictable."],
    },
    露营: {
      icon: "pack",
      title: "Camp system reasoning",
      tone: "elevated",
      bullets: ["Tent, sleeping bag, pad, and stove shape recovery after dark.", "Shared systems should be funded before nice-to-have campsite extras."],
    },
    滑雪: {
      icon: "shield",
      title: "Snow control and protection",
      tone: "high",
      bullets: ["Board, boots, helmet, and goggles directly affect control and safety.", "Cold, speed, and falls raise the value of warmth, wind protection, and impact gear."],
    },
    钓鱼: {
      icon: "weather",
      title: "Waterside reasoning",
      tone: "elevated",
      bullets: ["Rod, line, traction, and dry storage matter more than scattered small accessories.", "Wet banks and weather shifts increase exit planning and safety needs."],
    },
    自驾游: {
      icon: "route",
      title: "Route and vehicle redundancy",
      tone: "standard",
      bullets: ["Navigation, vehicle emergency gear, lighting, and spare supplies come first.", "Longer routes need charging, repair, and rest planning before comfort upgrades."],
    },
    骑行: {
      icon: "shield",
      title: "Cycling safety reasoning",
      tone: "elevated",
      bullets: ["Helmet, lights, repair tools, and hydration carry the highest priority.", "Longer rides increase puncture, fatigue, and visibility risk."],
    },
    海边旅行: {
      icon: "weather",
      title: "Sun and water reasoning",
      tone: "standard",
      bullets: ["Sun protection, dry storage, and quick-dry gear drive comfort.", "Reflection, humidity, and wind amplify skin and electronics risk."],
    },
    越野跑: {
      icon: "clock",
      title: "Pace and fuel reasoning",
      tone: "elevated",
      bullets: ["Traction, hydration carry, and lighting redundancy keep the route stable.", "Higher intensity increases dehydration, cramp, and downhill fall risk."],
    },
    重装徒步: {
      icon: "pack",
      title: "Load system reasoning",
      tone: "elevated",
      bullets: ["Pack fit, boots, shelter, and sleep system shape multi-day recovery.", "Heavier loads make weight savings and stable carry more valuable each day."],
    },
    攀岩: {
      icon: "shield",
      title: "Protection and retreat reasoning",
      tone: "high",
      bullets: ["Climbing shoes, helmet, and first-aid basics outrank comfort accessories.", "Rockfall, delays, and descent plans raise lighting and safety redundancy needs."],
    },
    皮划艇: {
      icon: "weather",
      title: "On-water safety reasoning",
      tone: "high",
      bullets: ["PFD, dry storage, and a return-to-shore plan come first.", "Wind, water temperature, and glare affect safety and fatigue at the same time."],
    },
    单板滑雪: {
      icon: "shield",
      title: "Snowboard control reasoning",
      tone: "high",
      bullets: ["Board, bindings, boots, helmet, and goggles directly shape control.", "Cold, speed, and frequent falls raise the weight of protective gear."],
    },
    沙漠徒步: {
      icon: "weather",
      title: "Heat and hydration reasoning",
      tone: "high",
      bullets: ["Water, sun protection, shade, and route redundancy must come first.", "Sand reflection and dry heat quickly increase dehydration and navigation risk."],
    },
    冬季露营: {
      icon: "clock",
      title: "Overnight warmth reasoning",
      tone: "high",
      bullets: ["Tent, sleeping bag, pad, and stove work together as the overnight safety system.", "Wet clothing, long nights, and stillness raise hypothermia risk."],
    },
    海边露营: {
      icon: "weather",
      title: "Tide-aware camp reasoning",
      tone: "elevated",
      bullets: ["Tent anchoring, dry storage, and cold food storage drive camp stability.", "Tides, wind, and salt air can amplify ordinary camping issues."],
    },
  };

  return activityRules[activity];
}

function weatherReasoning(weather: Weather, language: Language): RecommendationAnalysisItem {
  if (language === "zh") {
    const weatherRules: Record<Weather, RecommendationAnalysisItem> = {
      晴天: {
        icon: "weather",
        title: "晴天条件",
        tone: "standard",
        bullets: ["提高防晒、补水和眼部保护权重。", "天气稳定时可以适度降低重型防护，但基础安全装备不能省。"],
      },
      雨天: {
        icon: "alert",
        title: "雨天风险高亮",
        tone: "high",
        bullets: ["增加防水需求，优先考虑外层、干袋和防滑装备。", "地面湿滑风险上升，照明、撤离和备用干衣更重要。"],
      },
      寒冷: {
        icon: "weather",
        title: "寒冷条件",
        tone: "high",
        bullets: ["增加失温风险，提高保暖层、手套和睡眠系统权重。", "疲劳后的体温下降更明显，应预留干燥和热量冗余。"],
      },
      炎热: {
        icon: "weather",
        title: "高温条件",
        tone: "elevated",
        bullets: ["提高补水、电解质、遮阳和速干装备权重。", "热疲劳会影响判断，行程节奏和补给冗余需要提前规划。"],
      },
    };

    return weatherRules[weather];
  }

  const weatherRules: Record<Weather, RecommendationAnalysisItem> = {
    晴天: {
      icon: "weather",
      title: "Clear-weather conditions",
      tone: "standard",
      bullets: ["Increase the weight of sun protection, hydration, and eye protection.", "Stable weather allows lighter protection, but baseline safety gear still matters."],
    },
    雨天: {
      icon: "alert",
      title: "Rain risk highlight",
      tone: "high",
      bullets: ["Waterproofing needs rise, so shells, dry bags, and traction move up the list.", "Wet ground raises slip risk, making lighting, exit planning, and dry backups more important."],
    },
    寒冷: {
      icon: "weather",
      title: "Cold-weather conditions",
      tone: "high",
      bullets: ["Hypothermia risk rises, increasing the weight of insulation, gloves, and sleep systems.", "Body temperature drops faster after fatigue, so dry layers and heat redundancy matter."],
    },
    炎热: {
      icon: "weather",
      title: "Heat conditions",
      tone: "elevated",
      bullets: ["Hydration, electrolytes, shade, and quick-dry layers move up in priority.", "Heat fatigue affects judgment, so pacing and supply redundancy need planning."],
    },
  };

  return weatherRules[weather];
}

function tripReasoning(tripDays: TripDays, language: Language): RecommendationAnalysisItem {
  if (language === "zh") {
    if (isLongTrip(tripDays)) {
      return {
        icon: "calendar",
        title: "多日行程推理",
        tone: "high",
        bullets: ["增加补给冗余、照明续航和维修需求。", "装备失效会跨天累积影响，因此优先选择稳定耐用的核心系统。"],
      };
    }

    if (isMultiDay(tripDays)) {
      return {
        icon: "calendar",
        title: "过夜行程推理",
        tone: "elevated",
        bullets: ["需要覆盖夜间保暖、备用电量和更多食水计划。", "预算应从单日轻装转向睡眠、收纳和应急冗余。"],
      };
    }

    return {
      icon: "clock",
      title: "单日行程推理",
      tone: "standard",
      bullets: ["优先选择高频核心装备，减少低频大件。", "仍需保留头灯、急救和补给余量，应对晚归或绕路。"],
    };
  }

  if (isLongTrip(tripDays)) {
    return {
      icon: "calendar",
      title: "Multi-day trip reasoning",
      tone: "high",
      bullets: ["Supply redundancy, battery life, and repair needs increase.", "Gear failure compounds across days, so durable core systems come first."],
    };
  }

  if (isMultiDay(tripDays)) {
    return {
      icon: "calendar",
      title: "Overnight trip reasoning",
      tone: "elevated",
      bullets: ["Night warmth, backup power, and larger food and water plans are needed.", "Budget shifts from day-trip lightness toward sleep, storage, and emergency margin."],
    };
  }

  return {
    icon: "clock",
    title: "Day-trip reasoning",
    tone: "standard",
    bullets: ["High-use core gear comes first while low-frequency large items stay lower.", "Headlamp, first aid, and extra supplies still cover delays or route changes."],
  };
}

function groupReasoning(peopleCount: number, language: Language): RecommendationAnalysisItem {
  if (language === "zh") {
    if (peopleCount >= 4) {
      return {
        icon: "people",
        title: "团队出行推理",
        tone: "elevated",
        bullets: ["增加共享装备需求，例如帐篷、炉具、照明、急救和收纳。", "人数越多，沟通、分工和安全冗余越重要。"],
      };
    }

    if (peopleCount >= 2) {
      return {
        icon: "people",
        title: "双人或小队推理",
        tone: "standard",
        bullets: ["部分装备可以共享，但个人防护和保暖不能简单合并。", "建议把预算分成共享系统和个人必需装备两部分。"],
      };
    }

    return {
      icon: "people",
      title: "单人出行推理",
      tone: "elevated",
      bullets: ["单人行动容错更低，应提高导航、照明和急救权重。", "无法依赖队友分担装备，因此关键物品需要独立完整。"],
    };
  }

  if (peopleCount >= 4) {
    return {
      icon: "people",
      title: "Group travel reasoning",
      tone: "elevated",
      bullets: ["Shared gear demand rises: shelter, cooking, lighting, first aid, and storage.", "More people require clearer roles, communication, and safety redundancy."],
    };
  }

  if (peopleCount >= 2) {
    return {
      icon: "people",
      title: "Pair or small-team reasoning",
      tone: "standard",
      bullets: ["Some gear can be shared, but personal protection and warmth should stay individual.", "Budget should be split between shared systems and personal essentials."],
    };
  }

  return {
    icon: "people",
    title: "Solo travel reasoning",
    tone: "elevated",
    bullets: ["Solo margin is lower, so navigation, lighting, and first aid gain weight.", "Critical items need to be complete because there is no teammate backup."],
  };
}

export function buildRecommendationAnalysis(context: RecommendationAnalysisContext) {
  return [
    activityReasoning(context.activity, context.language),
    weatherReasoning(context.weather, context.language),
    tripReasoning(context.tripDays, context.language),
    groupReasoning(context.peopleCount, context.language),
  ];
}
