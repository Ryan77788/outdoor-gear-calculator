import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = "https://outdoor-gear-calculator.com";
const defaultOgImage = `${siteUrl}/og-image.jpg`;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Outdoor AI",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Outdoor AI",
  alternateName: "Outdoor Gear Calculator",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/guides?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

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
    siteName: "Outdoor AI",
    images: [{ url: defaultOgImage }],
  },
  alternates: {
    canonical: `${siteUrl}/`,
    languages: {
      en: `${siteUrl}/`,
      zh: `${siteUrl}/?lang=zh`,
      "x-default": `${siteUrl}/`,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Outdoor AI | Outdoor Gear Calculator",
    description: "Plan outdoor gear by activity, weather, people and budget.",
    images: [defaultOgImage],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        {gaId ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
