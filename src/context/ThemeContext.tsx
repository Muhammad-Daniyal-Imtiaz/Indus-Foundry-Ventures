"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = 
  | "pakistan"
  | "emerald" 
  | "nordic" 
  | "slate" 
  | "lavender" 
  | "sunset" 
  | "rose" 
  | "teal" 
  | "amber" 
  | "sand" 
  | "sage" 
  | "clay";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const VALID_THEMES: Theme[] = [
  "pakistan",
  "emerald",
  "nordic",
  "slate",
  "lavender",
  "sunset",
  "rose",
  "teal",
  "amber",
  "sand",
  "sage",
  "clay"
];

const ThemeContext = createContext<ThemeContextType>({ theme: "pakistan", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("pakistan");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("connectin-theme") as Theme | null;
    if (saved && VALID_THEMES.includes(saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "pakistan");
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("connectin-theme", t);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

