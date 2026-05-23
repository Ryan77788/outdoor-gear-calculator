import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.backpacking;

export const metadata = createChecklistMetadata(page);

export default function BackpackingPage() {
  return <GearChecklistLanding page={page} />;
}
