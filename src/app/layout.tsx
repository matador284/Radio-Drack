import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radio Drack — World Radio Explorer",
  description:
    "Explore the planet and discover what is playing in real-time across cities and continents through a 3D celestial radio atlas.",
  keywords: ["radio", "world radio", "live radio", "radio drack", "3d globe", "three.js", "streaming"],
  authors: [{ name: "Radio Drack" }],
  openGraph: {
    title: "Radio Drack — World Radio Explorer",
    description: "Thousands of stations. One planet. Explore live frequencies around the globe in real time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050608] text-slate-100 min-h-screen overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
