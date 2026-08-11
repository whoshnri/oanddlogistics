import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const display = Fraunces({
  variable: "--font-display-family",
  subsets: ["latin"],
});

const body = Nunito({
  variable: "--font-body-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O&D Logistics: Same-day local delivery",
  description:
    "Friendly same-day courier and local delivery for businesses across our coverage area. Check your postcode and get a quote.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${display.variable} ${body.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="flex h-dvh flex-col overflow-hidden font-sans text-ink">{children}</body>
    </html>
  );
}
