"use client";

import { useEffect } from "react";
import type { Activity } from "@/data/products";
import type { TripDays, Weather } from "@/lib/recommendation";

type PlanOpenLoggerProps = {
  planId: string;
  activity: Activity;
  weather: Weather;
  tripDays: TripDays;
  peopleCount: number;
  budget: number;
};

export function PlanOpenLogger({ planId, activity, weather, tripDays, peopleCount, budget }: PlanOpenLoggerProps) {
  useEffect(() => {
    async function logPlanOpen() {
      try {
        await fetch("/api/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "plan_open",
            data: {
              planId,
              activity,
              weather,
              tripDays,
              peopleCount,
              budget,
            },
          }),
        });
      } catch (error) {
        console.error("Failed to log plan_open:", error);
      }
    }

    void logPlanOpen();
  }, [activity, budget, peopleCount, planId, tripDays, weather]);

  return null;
}
