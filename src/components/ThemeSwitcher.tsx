"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Palette, Sun, Moon, Waves, Flame, Gem, Flower2, Droplets, Sparkles, Zap, ChevronDown } from "lucide-react";

const THEMES = [
  { id: "pakistan" as const, label: "Pakistan Flag", icon: Sparkles, color: "#004124" },
  { id: "emerald" as const, label: "Emerald Accent", icon: Moon, color: "#10b981" },
  { id: "nordic" as const, label: "Nordic Breeze", icon: Waves, color: "#38bdf8" },
  { id: "slate" as const, label: "Sleek Slate", icon: Moon, color: "#94a3b8" },
  { id: "lavender" as const, label: "Dreamy Lavender", icon: Gem, color: "#c084fc" },
  { id: "sunset" as const, label: "Terracotta Sunset", icon: Flame, color: "#fb923c" },
  { id: "rose" as const, label: "Blush Rose", icon: Flower2, color: "#f472b6" },
  { id: "teal" as const, label: "Ocean Teal", icon: Droplets, color: "#2dd4bf" },
  { id: "amber" as const, label: "Golden Amber", icon: Sun, color: "#fbbf24" },
  { id: "sand" as const, label: "Desert Sand", icon: Sun, color: "#f59e0b" },
  { id: "sage" as const, label: "Mist Sage", icon: Sparkles, color: "#a7f3d0" },
  { id: "clay" as const, label: "Earthy Clay", icon: Zap, color: "#f87171" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold cursor-pointer"
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-primary)",
          color: "var(--text-secondary)",
        }}
      >
        <Palette className="w-3.5 h-3.5" style={{ color: current.color }} />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-lg border overflow-hidden z-50 max-h-80 overflow-y-auto"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-primary)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-bold transition-all cursor-pointer"
                style={{
                  background: active ? "var(--accent-glow)" : "transparent",
                  color: active ? t.color : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = active ? "var(--accent-glow)" : "transparent";
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ background: t.color, opacity: active ? 1 : 0.3 }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
