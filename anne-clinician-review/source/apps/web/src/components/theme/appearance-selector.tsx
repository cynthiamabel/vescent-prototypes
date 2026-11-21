"use client";

import { useAppTheme, type AppearancePreference } from "./theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const options: { value: AppearancePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function AppearanceSelector() {
  const { preference, setPreference } = useAppTheme();
  return (
    <div
      className="inline-flex rounded-xl border bg-card/75 p-1"
      aria-label="Appearance"
    >
      {options.map((option) => (
        <Button
          variant="ghost"
          size="sm"
          key={option.value}
          type="button"
          aria-pressed={preference === option.value}
          onClick={() => setPreference(option.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            preference === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
