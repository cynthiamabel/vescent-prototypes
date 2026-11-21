export type Appearance = "light" | "dark";

export const palette = {
  peach: "#FEC2B9",
  lightYellow: "#FCF3C7",
  blue: "#5DA4CD",
  white: "#FFFFFF",
  lightGreen: "#D5EED2",
  black: "#2A2A2A",
  lightBlue: "#D2E9ED",
  pink: "#F887BD",
  yellow: "#FFBC2E",
  purple: "#BBB3E1",
} as const;

export const semanticThemes = {
  light: {
    screenBackground: "#FFF9F7",
    surface: "rgba(255, 255, 255, 0.82)",
    surfaceStrong: "#FFFCFA",
    surfaceMuted: "rgba(210, 233, 237, 0.62)",
    inputSurface: "#FFFCFA",
    text: palette.black,
    textMuted: "#4F4A52",
    border: "rgba(93, 164, 205, 0.30)",
    controlSurface: "rgba(93, 164, 205, 0.20)",
    controlBorder: "rgba(93, 164, 205, 0.38)",
    controlIcon: palette.black,
    primary: "#8EC4E2",
    primaryForeground: palette.black,
    accent: palette.pink,
    success: "#397052",
    warning: "#8A5A00",
    error: "#B42318",
    info: "#39708F",
    overlay: "rgba(42, 42, 42, 0.42)",
    mediaSurface: "#211F24",
    mediaOverlay: "rgba(0, 0, 0, 0.60)",
    destructiveSurface: "#B42318",
    destructiveForeground: palette.white,
    avatarFallback: palette.blue,
    avatarForeground: palette.black,
  },
  dark: {
    screenBackground: "#211F24",
    surface: "rgba(45, 42, 49, 0.88)",
    surfaceStrong: "#302D34",
    surfaceMuted: "rgba(72, 65, 82, 0.78)",
    inputSurface: "#302D34",
    text: "#FFF9F7",
    textMuted: "#F0EAF2",
    border: "rgba(187, 179, 225, 0.30)",
    controlSurface: "rgba(93, 164, 205, 0.26)",
    controlBorder: "rgba(142, 196, 226, 0.42)",
    controlIcon: "#FFF9F7",
    primary: palette.blue,
    primaryForeground: palette.black,
    accent: "#F4A7CC",
    success: "#9BCDB0",
    warning: "#FFD27A",
    error: "#FF9B91",
    info: "#8EC4E2",
    overlay: "rgba(18, 16, 20, 0.62)",
    mediaSurface: "#211F24",
    mediaOverlay: "rgba(0, 0, 0, 0.60)",
    destructiveSurface: "#DC2626",
    destructiveForeground: palette.white,
    avatarFallback: palette.blue,
    avatarForeground: palette.black,
  },
} as const;

export type SemanticTheme = {
  [Role in keyof (typeof semanticThemes)["light"]]: string;
};
export type ColorRole = keyof SemanticTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 9999,
} as const;

export const typography = {
  display: { size: 28, lineHeight: 36, weight: "600", family: "heading" },
  screenTitle: { size: 24, lineHeight: 31, weight: "600", family: "heading" },
  sectionTitle: { size: 18, lineHeight: 24, weight: "600", family: "body" },
  body: { size: 15, lineHeight: 21, weight: "400", family: "body" },
  caption: { size: 13, lineHeight: 18, weight: "400", family: "body" },
  label: { size: 13, lineHeight: 18, weight: "600", family: "body" },
  button: { size: 15, lineHeight: 20, weight: "600", family: "body" },
} as const;

export type TypographyRole = keyof typeof typography;

export const opacity = {
  disabled: 0.5,
  pressed: 0.75,
} as const;

export function cssThemeVariables(theme: SemanticTheme): string {
  return Object.entries(theme)
    .map(([role, value]) => `--color-${toKebabCase(role)}:${value}`)
    .join(";");
}

export function rgbChannels(color: string): string {
  if (color.startsWith("#")) {
    const value = color.slice(1);
    const normalized =
      value.length === 3
        ? value
            .split("")
            .map((character) => character + character)
            .join("")
        : value.slice(0, 6);
    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ].join(" ");
  }
  const channels = color.match(/[\d.]+/g)?.slice(0, 3);
  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported design color: ${color}`);
  }
  return channels.join(" ");
}

export function colorAlpha(color: string): number {
  if (color.startsWith("#")) {
    return color.length === 9
      ? Number.parseInt(color.slice(7, 9), 16) / 255
      : 1;
  }
  const channels = color.match(/[\d.]+/g);
  return channels?.[3] === undefined ? 1 : Number(channels[3]);
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
