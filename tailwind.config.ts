import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          cyan:         "#29ABE2",
          "cyan-light": "#4FC3F7",
          "cyan-dark":  "#0288D1",
          navy:         "#0D1B2E",
          "navy-mid":   "#1A3A5C",
          "navy-light": "#1e5a8a",
        },
        surface: {
          DEFAULT:   "#FFFFFF",
          secondary: "#F0F4F8",
          tertiary:  "#E8EDF3",
        },
        status: {
          success: "#10B981",
          danger:  "#EF4444",
          warning: "#F59E0B",
          info:    "#3B82F6",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
      },
      boxShadow: {
        card:       "0 1px 4px rgba(13,27,46,0.06), 0 4px 16px rgba(13,27,46,0.04)",
        "card-hover": "0 8px 32px rgba(13,27,46,0.12)",
        sidebar:    "4px 0 24px rgba(13,27,46,0.15)",
        "cyan-glow": "0 4px 16px rgba(41,171,226,0.35)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #29ABE2, #0288D1)",
        "gradient-navy":   "linear-gradient(180deg, #0D1B2E 0%, #1A3A5C 100%)",
        "gradient-surface":"linear-gradient(135deg, #F0F4F8 0%, #E8EDF3 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
