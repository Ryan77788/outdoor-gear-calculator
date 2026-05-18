import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.beachTravel;

export const metadata = createChecklistMetadata(page);

export default function BeachTravelGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
