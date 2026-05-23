import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.winterCamping;

export const metadata = createChecklistMetadata(page);

export default function WinterCampingPage() {
  return <GearChecklistLanding page={page} />;
}
