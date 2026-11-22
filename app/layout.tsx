import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Outpost — Nomad Field Reviews",
  description: "Distraction-free field reviews and ratings for wanderers and remote nomads.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FBFBFA] text-[#141413] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
