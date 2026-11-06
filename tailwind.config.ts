import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cisd: {
          navy: {
            50: "#F0F4F8",
            100: "#D9E2EC",
            200: "#BCCCDC",
            300: "#9FB3C8",
            400: "#829AB1",
            500: "#627D98",
            600: "#486581",
            700: "#334E68",
            800: "#243B53",
            900: "#0F2744", // Core CISD Navy
            950: "#09182B", // Deep Executive Midnight
          },
          gold: {
            50: "#FBF8EE",
            100: "#F6F0DC",
            200: "#EBDDB3",
            300: "#DFC989",
            400: "#D4B660",
            500: "#C69F37", // Core CISD Gold
            600: "#A68228",
            700: "#82631C",
            800: "#5D4512",
            900: "#392A0A",
          },
          slate: {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
