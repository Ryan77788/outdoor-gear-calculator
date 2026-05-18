import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.beachCamping;

export const metadata = createChecklistMetadata(page);

export default function BeachCampingPage() {
  return <GearChecklistLanding page={page} />;
}
