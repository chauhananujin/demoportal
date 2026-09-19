"use client";
import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from "react";

export type PortalTheme = "dark" | "light";

const STORAGE_KEY = "ascelios_portal_theme";

interface ThemeContextValue {
  theme: PortalTheme;
  toggleTheme: () => void;
  setTheme: (t: PortalTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function PortalThemeProvider({ children }: { children: ReactNode }) {
  // Dark is the historical default — preserve for existing users until they switch.
  const [theme, setThemeState] = useState<PortalTheme>("dark");

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      }
    } catch { /* ignore */ }
  }, []);

  // Persist on change.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = useCallback((t: PortalTheme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function usePortalTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("usePortalTheme must be used inside PortalThemeProvider");
  return ctx;
}
