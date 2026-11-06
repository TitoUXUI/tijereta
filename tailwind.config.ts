import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapeo de shadcn/ui a los tokens semánticos de Tijereta (app/tokens.css)
        background: "var(--color-bg-app)",
        foreground: "var(--color-text-primary)",
        card: {
          DEFAULT: "var(--color-bg-surface)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT: "var(--color-bg-raised)",
          foreground: "var(--color-text-primary)",
        },
        primary: {
          DEFAULT: "var(--color-accent-default)",
          foreground: "var(--color-text-on-accent)",
        },
        secondary: {
          DEFAULT: "var(--color-bg-sunken)",
          foreground: "var(--color-text-primary)",
        },
        muted: {
          DEFAULT: "var(--color-bg-sunken)",
          foreground: "var(--color-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--color-accent-subtle)",
          foreground: "var(--color-accent-subtle-text)",
          hover: "var(--color-accent-hover)",
          pressed: "var(--color-accent-pressed)",
          border: "var(--color-accent-subtle-border)",
        },
        destructive: {
          DEFAULT: "var(--color-danger-solid)",
          foreground: "var(--color-text-on-brand)",
        },
        border: "var(--color-border-default)",
        input: "var(--color-border-control)",
        ring: "var(--color-border-focus)",
        // Tokens propios
        brand: {
          DEFAULT: "var(--color-bg-brand)",
          foreground: "var(--color-text-on-brand)",
          accent: "var(--color-text-accent-on-brand)",
        },
        highlight: {
          DEFAULT: "var(--color-bg-highlight)",
          foreground: "var(--color-text-on-highlight)",
        },
        tangerine: {
          DEFAULT: "var(--color-accent-default)",
          foreground: "var(--color-text-on-accent)",
        },
        surface: "var(--color-bg-surface)",
        sunken: "var(--color-bg-sunken)",
        subtle: "var(--color-border-subtle)",
        strong: "var(--color-border-strong)",
        link: "var(--color-text-link)",
        tertiary: "var(--color-text-tertiary)",
        success: {
          bg: "var(--color-success-bg)",
          fg: "var(--color-success-fg)",
          border: "var(--color-success-border)",
          solid: "var(--color-success-solid)",
        },
        warning: {
          bg: "var(--color-warning-bg)",
          fg: "var(--color-warning-fg)",
          border: "var(--color-warning-border)",
          solid: "var(--color-warning-solid)",
        },
        danger: {
          bg: "var(--color-danger-bg)",
          fg: "var(--color-danger-fg)",
          border: "var(--color-danger-border)",
          solid: "var(--color-danger-solid)",
        },
        info: {
          bg: "var(--color-info-bg)",
          fg: "var(--color-info-fg)",
          border: "var(--color-info-border)",
          solid: "var(--color-info-solid)",
        },
        cat: {
          "1": "var(--color-cat-1-bg)",
          "2": "var(--color-cat-2-bg)",
          "3": "var(--color-cat-3-bg)",
          "4": "var(--color-cat-4-bg)",
          "5": "var(--color-cat-5-bg)",
          "6": "var(--color-cat-6-bg)",
          fg: "var(--color-cat-1-fg)",
        },
      },
      borderRadius: {
        tag: "var(--radius-tag)",
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        sheet: "var(--radius-sheet)",
        lg: "var(--radius-card)",
        md: "var(--radius-control)",
        sm: "var(--radius-tag)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-gabarito)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        sheet: "var(--shadow-sheet)",
      },
      minHeight: { touch: "var(--size-touch-min)" },
      minWidth: { touch: "var(--size-touch-min)" },
      transitionDuration: { base: "200ms" },
      transitionTimingFunction: { out: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};
export default config;
