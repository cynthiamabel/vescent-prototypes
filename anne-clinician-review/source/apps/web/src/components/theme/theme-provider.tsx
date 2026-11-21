"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppearancePreference = "system" | "light" | "dark";

const STORAGE_KEY = "vescent.appearance";

interface ThemeContextValue {
  preference: AppearancePreference;
  resolved: "light" | "dark";
  setPreference: (preference: AppearancePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolve(preference: AppearancePreference) {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
}

export const themeBootScript = `
try {
  var p = localStorage.getItem("${STORAGE_KEY}");
  if (p !== "light" && p !== "dark" && p !== "system") p = "system";
  var r = p === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : p;
  document.documentElement.classList.toggle("dark", r === "dark");
  document.documentElement.dataset.theme = r;
} catch (_) {}
`;

export function ThemeProvider({ children }: { children: any }) {
  const [preference, setPreferenceState] =
    useState<AppearancePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    setPreferenceState(initial);
    setResolved(resolve(initial));
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const next = resolve(preference);
      setResolved(next);
      apply(next);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preference]);

  const setPreference = useCallback((next: AppearancePreference) => {
    localStorage.setItem(STORAGE_KEY, next);
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme must be used within ThemeProvider");
  return value;
}
