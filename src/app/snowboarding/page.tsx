import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.snowboarding;

export const metadata = createChecklistMetadata(page);

export default function SnowboardingPage() {
  return <GearChecklistLanding page={page} />;
}
