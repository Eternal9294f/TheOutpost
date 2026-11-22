import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Outpost — Global Nomad Network",
  description: "Field reports, provisions, and verified ratings for wandering nomads across global outposts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0A0B0E] text-[#F4F4F6] antialiased">
        {children}
      </body>
    </html>
  );
}
