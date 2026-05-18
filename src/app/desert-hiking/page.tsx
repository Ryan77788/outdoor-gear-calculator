import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.desertHiking;

export const metadata = createChecklistMetadata(page);

export default function DesertHikingPage() {
  return <GearChecklistLanding page={page} />;
}
