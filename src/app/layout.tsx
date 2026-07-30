import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travelo — Elite Group Travel Intelligence",
  description:
    "Institutional-grade travel platform: capital ledger, expedition planning, and AI concierge for elite group expeditions.",
  keywords: ["travel", "group expenses", "itinerary", "AI travel planner"],
  openGraph: {
    title: "Travelo — Elite Group Travel Intelligence",
    description: "Plan smarter. Spend wiser. Travel elite.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased min-h-screen bg-[#05051c]">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
