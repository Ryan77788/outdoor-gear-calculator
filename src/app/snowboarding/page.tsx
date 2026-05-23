import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.snowboarding;

export const metadata = createChecklistMetadata(page);

export default function SnowboardingPage() {
  return <GearChecklistLanding page={page} />;
}
