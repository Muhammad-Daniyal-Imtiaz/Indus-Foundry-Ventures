"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Palette, Sun, Moon, Waves, ChevronDown } from "lucide-react";

const THEMES = [
  { id: "emerald" as const, label: "Emerald Dark", icon: Moon, color: "#00a86b" },
  { id: "bright" as const, label: "Bright", icon: Sun, color: "#00875a" },
  { id: "navy" as const, label: "Navy", icon: Waves, color: "#38bdf8" },
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
          className="absolute right-0 top-full mt-1 w-44 rounded-lg border overflow-hidden z-50"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-primary)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold transition-all cursor-pointer"
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
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 rounded-full" style={{ background: t.color }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
