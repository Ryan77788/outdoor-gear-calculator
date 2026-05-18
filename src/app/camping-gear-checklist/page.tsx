import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.camping;

export const metadata = createChecklistMetadata(page);

export default function CampingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
