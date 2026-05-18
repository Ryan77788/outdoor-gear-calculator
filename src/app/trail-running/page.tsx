import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.trailRunning;

export const metadata = createChecklistMetadata(page);

export default function TrailRunningPage() {
  return <GearChecklistLanding page={page} />;
}
