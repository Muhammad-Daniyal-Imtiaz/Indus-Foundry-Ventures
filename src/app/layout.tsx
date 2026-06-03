import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Use fallback until font loads
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Use fallback until font loads
});

export const metadata: Metadata = {
  title: "Indus Foundry Ventures | Pakistan's Startup & Jobs Engine",
  description: "Bridging the gap between 500,000+ yearly Pakistani graduates, venture capital funding, and corporate deep-tech partnerships. Forging cofounder teams and placements in AI, SaaS, robotics, semiconductors, and fintech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextAuthProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <OnboardingOverlay />
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </body>
      </html>
    </NextAuthProvider>
  );
}
