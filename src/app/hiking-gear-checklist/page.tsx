import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.hiking;

export const metadata = createChecklistMetadata(page);

export default function HikingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
