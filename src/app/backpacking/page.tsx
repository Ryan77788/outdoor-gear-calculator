import {
  createChecklistMetadata,
  GearChecklistLanding,
  gearChecklistPages,
} from "@/data/activities";

const page = gearChecklistPages.backpacking;

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
  }>;
};

export const metadata = createChecklistMetadata(page);

export default async function BackpackingPage({ searchParams }: PageProps) {
  const query = await searchParams;

  return <GearChecklistLanding lang={query?.lang} page={page} />;
}
