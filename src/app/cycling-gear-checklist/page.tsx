import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.cycling;

export const metadata = createChecklistMetadata(page);

export default function CyclingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
