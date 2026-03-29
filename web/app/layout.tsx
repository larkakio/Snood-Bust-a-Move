import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://snood-bust-a-move.vercel.app";
/** Base.dev app id (public); env overrides for other environments */
const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69c94b2f8014f880e22dd2e8";

export const metadata: Metadata = {
  title: "Snood — neon bubbles on Base",
  description:
    "Cyberpunk bubble shooter + daily on-chain check-in. Built for Base App.",
  metadataBase: new URL(site),
  openGraph: {
    title: "Snood",
    description: "Neon bubble shooter on Base",
    url: site,
    images: [{ url: "/og-thumbnail.jpg", width: 1200, height: 628 }],
  },
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
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
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
