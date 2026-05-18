import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.backpacking;

export const metadata = createChecklistMetadata(page);

export default function BackpackingPage() {
  return <GearChecklistLanding page={page} />;
}
