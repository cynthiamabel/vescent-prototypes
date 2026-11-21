import { colorAlpha, rgbChannels, type SemanticTheme } from "@vescent/design";

const aliases = {
  background: "screenBackground",
  foreground: "text",
  card: "surface",
  "card-foreground": "text",
  popover: "surfaceStrong",
  "popover-foreground": "text",
  primary: "primary",
  "primary-foreground": "primaryForeground",
  secondary: "surfaceMuted",
  "secondary-foreground": "text",
  muted: "surfaceMuted",
  "muted-foreground": "textMuted",
  accent: "accent",
  "accent-foreground": "avatarForeground",
  destructive: "destructiveSurface",
  "destructive-foreground": "destructiveForeground",
  border: "border",
  input: "controlBorder",
  ring: "primary",
  success: "success",
  warning: "warning",
  info: "info",
  "avatar-fallback": "avatarFallback",
  "avatar-foreground": "avatarForeground",
  "media-surface": "mediaSurface",
} as const satisfies Record<string, keyof SemanticTheme>;

export function webThemeVariables(theme: SemanticTheme): string {
  return Object.entries(aliases)
    .flatMap(([variable, role]) => [
      `--${variable}:${rgbChannels(theme[role])}`,
      `--${variable}-alpha:${colorAlpha(theme[role])}`,
    ])
    .join(";");
}
