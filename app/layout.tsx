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
    <html lang="en" className="h-full bg-black">
      <body className="min-h-full flex flex-col bg-black text-[#EDEDED] antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
