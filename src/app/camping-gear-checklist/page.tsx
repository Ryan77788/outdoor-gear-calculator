import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.camping;

export const metadata = createChecklistMetadata(page);

export default function CampingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
