import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.roadTrip;

export const metadata = createChecklistMetadata(page);

export default function RoadTripGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
