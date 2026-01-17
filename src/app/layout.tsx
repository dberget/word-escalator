import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { JsonLd } from "./components/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://wordescalator.com";
const siteName = "Word Escalator";
const siteDescription =
  "Play Word Escalator, the free daily word ladder puzzle game. Transform one word into another by changing one letter at a time. New puzzle every day, plus endless mode with multiple difficulty levels. Like Wordle meets word ladders!";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // Basic metadata
  title: {
    default: "Word Escalator - Free Daily Word Ladder Puzzle Game",
    template: "%s | Word Escalator",
  },
  description: siteDescription,
  keywords: [
    "word ladder",
    "word game",
    "daily puzzle",
    "word puzzle",
    "brain game",
    "word escalator",
    "doublets",
    "word links",
    "word golf",
    "free word game",
    "daily word game",
    "wordle alternative",
    "letter change game",
    "vocabulary game",
    "puzzle game",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,

  // Canonical URL
  alternates: {
    canonical: "/",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "Word Escalator - Free Daily Word Ladder Puzzle Game",
    description: siteDescription,
    images: [
      {
        url: "/word-chain-logo.png",
        width: 512,
        height: 512,
        alt: "Word Escalator - Daily Word Ladder Puzzle Game",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Word Escalator - Free Daily Word Ladder Puzzle Game",
    description: siteDescription,
    images: ["/word-chain-logo.png"],
    creator: "@wordescalator",
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/word-chain-logo.png",
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // App-specific
  applicationName: siteName,
  category: "games",

  // Verification (add your IDs when available)
  // verification: {
  //   google: "your-google-site-verification-id",
  //   yandex: "your-yandex-verification-id",
  //   bing: "your-bing-verification-id",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external origins for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2KX2MR5CE8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-2KX2MR5CE8');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
