import type { Metadata } from "next";
import { LegalPageClient } from "@/app/legal-page-client";

export const metadata: Metadata = {
  title: "Terms | Outdoor Gear Calculator",
  description: "Terms for Outdoor Gear Calculator.",
};

export default function TermsPage() {
  return <LegalPageClient page="terms" />;
}
