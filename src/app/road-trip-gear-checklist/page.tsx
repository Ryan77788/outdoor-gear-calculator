import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.roadTrip;

export const metadata = createChecklistMetadata(page);

export default function RoadTripGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
