import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Admin | Outdoor Gear Calculator",
  description: "Private analytics dashboard for Outdoor Gear Calculator usage events.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
