import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.hiking;

export const metadata = createChecklistMetadata(page);

export default function HikingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
