import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.climbing;

export const metadata = createChecklistMetadata(page);

export default function ClimbingPage() {
  return <GearChecklistLanding page={page} />;
}
