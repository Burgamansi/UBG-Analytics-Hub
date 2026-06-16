import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        kpi:     ["Rajdhani", "Inter", "sans-serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        rjt: {
          primary:       "#13233d",
          "primary-mid": "#1a3054",
          "primary-lt":  "#1e3d6b",
          secondary:     "#1b98e0",
          "secondary-d": "#1480c0",
          accent:        "#00d4ff",
          neutral:       "#e5e5e5",
          dark:          "#0c1929",
          darker:        "#0a1520",
        },
        brand: {
          cyan:     "#1b98e0",
          "cyan-d": "#1480c0",
          neon:     "#00d4ff",
          navy:     "#13233d",
        },
        surface: {
          app:     "#0c1929",
          sidebar: "#0a1520",
          card:    "rgba(19,35,61,0.7)",
          solid:   "#111f36",
          glass:   "rgba(255,255,255,0.04)",
        },
        status: {
          success: "#00e676",
          danger:  "#ff4d6d",
          warning: "#ffb300",
          info:    "#1b98e0",
        },
      },
      boxShadow: {
        card:         "0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(27,152,224,0.1)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(27,152,224,0.25)",
        neon:         "0 0 20px rgba(27,152,224,0.3), 0 0 40px rgba(27,152,224,0.1)",
        "neon-sm":    "0 0 10px rgba(27,152,224,0.25)",
        "neon-lg":    "0 0 40px rgba(27,152,224,0.4), 0 0 80px rgba(27,152,224,0.15)",
        sidebar:      "4px 0 32px rgba(0,0,0,0.5)",
        btn:          "0 2px 12px rgba(27,152,224,0.35)",
      },
      backgroundImage: {
        "gradient-rjt":    "linear-gradient(135deg, #13233d 0%, #1a3054 100%)",
        "gradient-neon":   "linear-gradient(135deg, #1b98e0, #00d4ff)",
        "gradient-sidebar":"linear-gradient(180deg, #0a1520 0%, #0c1929 100%)",
        "gradient-card":   "linear-gradient(135deg, rgba(19,35,61,0.9) 0%, rgba(26,48,84,0.8) 100%)",
        "gradient-accent": "linear-gradient(90deg, transparent, #1b98e0, #00d4ff, transparent)",
        "gradient-brand":  "linear-gradient(135deg, #1b98e0, #00d4ff)",
      },
      borderRadius: {
        card:  "16px",
        btn:   "10px",
        badge: "20px",
        icon:  "10px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        "3xs": ["9px",  { lineHeight: "12px" }],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        glow:         "glow 2s ease-in-out infinite alternate",
        "slide-up":   "slideUp 0.3s ease-out",
        "fade-in":    "fadeIn 0.4s ease-out",
      },
      keyframes: {
        glow: {
          from: { boxShadow: "0 0 10px rgba(27,152,224,0.2)" },
          to:   { boxShadow: "0 0 25px rgba(27,152,224,0.5)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
