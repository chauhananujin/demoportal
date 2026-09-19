import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'] as const,
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--brand-bg)",
          surface: "var(--brand-surface)",
          primary: "var(--brand-primary)",
          accent: "var(--brand-accent)",
          "accent-light": "var(--brand-accent-light)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
