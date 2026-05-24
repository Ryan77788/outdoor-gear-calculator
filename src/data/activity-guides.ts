import { activityGuideCards } from "@/data/activities";
import type { Language } from "@/lib/i18n";

export type ActivityGuideCard = {
  key: string;
  href: string;
  image: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
};

export { activityGuideCards };
