import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ConnectIn | Pakistan's Startup & Jobs Engine",
  description: "ConnectIn bridges the gap between 500,000+ yearly Pakistani graduates, venture capital funding, and corporate deep-tech partnerships. Forging cofounder teams and placements in AI, SaaS, robotics, semiconductors, and fintech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('connectin-theme');if(t&&['grey','blue','mirror'].includes(t))document.documentElement.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <NextAuthProvider>
            <OnboardingOverlay />
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </NextAuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
