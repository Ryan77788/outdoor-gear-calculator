import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.kayaking;

export const metadata = createChecklistMetadata(page);

export default function KayakingPage() {
  return <GearChecklistLanding page={page} />;
}
