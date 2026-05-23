import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.beachCamping;

export const metadata = createChecklistMetadata(page);

export default function BeachCampingPage() {
  return <GearChecklistLanding page={page} />;
}
