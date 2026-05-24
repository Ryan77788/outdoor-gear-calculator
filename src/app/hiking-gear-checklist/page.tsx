import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.hiking;

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export const metadata = createChecklistMetadata(page);

export default async function HikingGearChecklistPage({ searchParams }: PageProps) {
  const query = await searchParams;

  return <GearChecklistLanding lang={query?.lang} page={page} />;
}
