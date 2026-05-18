import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.fishing;

export const metadata = createChecklistMetadata(page);

export default function FishingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
