import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'] as const,
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0D1F2D",
          surface: "#0A2940",
          primary: "#0891B2",
          accent: "#06B6D4",
          "accent-light": "#67E8F9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
