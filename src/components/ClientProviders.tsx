"use client";
import { ThemeProvider } from "@/context/ThemeContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
