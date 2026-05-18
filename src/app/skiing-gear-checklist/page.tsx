import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/app/gear-checklist-pages";

const page = gearChecklistPages.skiing;

export const metadata = createChecklistMetadata(page);

export default function SkiingGearChecklistPage() {
  return <GearChecklistLanding page={page} />;
}
