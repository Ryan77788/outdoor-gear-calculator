import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.winterCamping;

export const metadata = createChecklistMetadata(page);

export default function WinterCampingPage() {
  return <GearChecklistLanding page={page} />;
}
