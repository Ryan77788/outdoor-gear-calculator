import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.skiing;

export const metadata = createChecklistMetadata(page);

export default function SkiingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
