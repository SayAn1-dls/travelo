import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travelo — Group Travel Made Simple",
  description: "Plan group trips, split expenses, and settle debts instantly with Travelo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
