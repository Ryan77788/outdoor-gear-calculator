import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.kayaking;

export const metadata = createChecklistMetadata(page);

export default function KayakingPage() {
  return <GearChecklistLanding page={page} />;
}
