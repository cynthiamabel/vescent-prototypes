var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../../../private/tmp/anne-clinician-review/source/apps/web/tailwind.config.ts
var tailwind_config_exports = {};
__export(tailwind_config_exports, {
  default: () => tailwind_config_default
});
module.exports = __toCommonJS(tailwind_config_exports);
var tailwind_config_default = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: color("border"),
        input: color("input"),
        ring: color("ring"),
        background: color("background"),
        foreground: color("foreground"),
        success: color("success"),
        warning: color("warning"),
        info: color("info"),
        "avatar-fallback": color("avatar-fallback"),
        "avatar-foreground": color("avatar-foreground"),
        "media-surface": color("media-surface"),
        primary: {
          DEFAULT: color("primary"),
          foreground: color("primary-foreground")
        },
        secondary: {
          DEFAULT: color("secondary"),
          foreground: color("secondary-foreground")
        },
        destructive: {
          DEFAULT: color("destructive"),
          foreground: color("destructive-foreground")
        },
        muted: {
          DEFAULT: color("muted"),
          foreground: color("muted-foreground")
        },
        accent: {
          DEFAULT: color("accent"),
          foreground: color("accent-foreground")
        },
        card: {
          DEFAULT: color("card"),
          foreground: color("card-foreground")
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: []
};
function color(name) {
  return `rgb(var(--${name}) / calc(var(--${name}-alpha) * <alpha-value>))`;
}
