import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE OUTPOST — Digital Nomad Intelligence Network",
  description: "A decentralized registry and field intelligence network for digital nomads across global cities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#F6F5F0]">
      <body className="min-h-full flex flex-col bg-[#F6F5F0] text-[#1C1E21] antialiased selection:bg-[#E5E2D9] selection:text-[#1C1E21]">
        {children}
      </body>
    </html>
  );
}
