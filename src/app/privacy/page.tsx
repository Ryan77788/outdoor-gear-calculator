import type { Metadata } from "next";
import { LegalPageClient } from "@/app/legal-page-client";

export const metadata: Metadata = {
  title: "Privacy Policy | Outdoor Gear Calculator",
  description: "Privacy Policy for Outdoor Gear Calculator.",
};

export default function PrivacyPage() {
  return <LegalPageClient page="privacy" />;
}
