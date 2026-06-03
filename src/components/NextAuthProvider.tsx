"use client";

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("CLIENT_FETCH_ERROR")) {
        return; // Suppress this specific NextAuth error log
      }
      originalConsoleError.apply(console, args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
