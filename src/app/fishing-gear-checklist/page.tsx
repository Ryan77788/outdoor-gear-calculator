import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.fishing;

export const metadata = createChecklistMetadata(page);

export default function FishingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
