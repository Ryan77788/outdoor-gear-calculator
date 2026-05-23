import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.desertHiking;

export const metadata = createChecklistMetadata(page);

export default function DesertHikingPage() {
  return <GearChecklistLanding page={page} />;
}
