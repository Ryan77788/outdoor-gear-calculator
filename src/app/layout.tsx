import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://outdoor-gear-calculator.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Outdoor AI | Outdoor Gear Calculator",
  description: "Plan outdoor gear by activity, weather, people and budget.",
  keywords: [
    "outdoor gear calculator",
    "camping gear planner",
    "hiking gear checklist",
    "ski gear planner",
    "fishing gear checklist",
  ],
  openGraph: {
    title: "Outdoor AI | Outdoor Gear Calculator",
    description: "Plan outdoor gear by activity, weather, people and budget.",
    type: "website",
    url: siteUrl,
  },
  alternates: {
    canonical: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Outdoor AI | Outdoor Gear Calculator",
    description: "Plan outdoor gear by activity, weather, people and budget.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
