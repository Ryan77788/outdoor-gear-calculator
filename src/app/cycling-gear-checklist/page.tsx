import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.cycling;

export const metadata = createChecklistMetadata(page);

export default function CyclingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
