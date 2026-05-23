import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.beachTravel;

export const metadata = createChecklistMetadata(page);

export default function BeachTravelGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
