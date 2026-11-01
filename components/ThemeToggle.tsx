"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ORDER = ["system", "light", "dark"] as const;
const ICON = { system: "◐", light: "☀", dark: "☾" } as const;

export default function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="inline-block w-9 h-9" />; // avoids hydration mismatch
  const next = ORDER[(ORDER.indexOf(theme as any) + 1) % 3];
  return (
    <button onClick={() => setTheme(next)} aria-label={`Theme: ${theme}. Switch to ${next}`} title={`Theme: ${theme}`} className="w-9 h-9 text-lg">
      {ICON[theme as keyof typeof ICON] ?? ICON.system}
    </button>
  );
}
