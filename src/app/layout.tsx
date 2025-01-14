import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Word Escalator - Daily Word Ladder Puzzle Game",
  description: "Play Word Escalator: Change letters, reach the target!",
  metadataBase: new URL("https://wordescalator.com"),
  openGraph: {
    title: "Word Escalator - Daily Word Ladder Puzzle Game",
    description: "Play Word Escalator: Change letters, reach the target!",
    url: "https://wordescalator.com",
    siteName: "Word Escalator",
    images: [
      {
        url: "/word-chain-logo.png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Escalator - Daily Word Ladder Puzzle Game",
    description: "Play Word Escalator: Change letters, reach the target!",
    images: ["/word-chain-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
        {children}
      </body>
    </html>
  );
}
