import type { Metadata } from "next";
import { LegalPageClient } from "@/app/legal-page-client";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Outdoor Gear Calculator",
  description: "Affiliate Disclosure for Outdoor Gear Calculator.",
};

export default function AffiliateDisclosurePage() {
  return <LegalPageClient page="affiliate" />;
}
