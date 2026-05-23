import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.climbing;

export const metadata = createChecklistMetadata(page);

export default function ClimbingPage() {
  return <GearChecklistLanding page={page} />;
}
