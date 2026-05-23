import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.trailRunning;

export const metadata = createChecklistMetadata(page);

export default function TrailRunningPage() {
  return <GearChecklistLanding page={page} />;
}
