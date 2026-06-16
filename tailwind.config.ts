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
        display: ["Plus Jakarta Sans", "Space Grotesk", "sans-serif"],
        heading: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
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
          "secondary-lt":"#e8f4fd",
          neutral:       "#e5e5e5",
        },
        surface: {
          app:    "#F8FAFC",
          card:   "#ffffff",
          subtle: "#F1F5F9",
          accent: "#EFF6FF",
        },
        border: {
          default: "#E5E7EB",
          light:   "#F3F4F6",
          strong:  "#D1D5DB",
          accent:  "rgba(27,152,224,0.25)",
        },
        text: {
          primary:   "#111827",
          secondary: "#374151",
          muted:     "#6B7280",
          faint:     "#9CA3AF",
          accent:    "#1b98e0",
        },
        status: {
          success:    "#059669",
          "success-bg":"#ECFDF5",
          danger:     "#DC2626",
          "danger-bg":"#FEF2F2",
          warning:    "#D97706",
          "warning-bg":"#FFFBEB",
          info:       "#1b98e0",
          "info-bg":  "#EFF6FF",
        },
      },
      boxShadow: {
        xs:          "0 1px 2px rgba(0,0,0,0.05)",
        sm:          "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        card:        "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover":"0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        accent:      "0 4px 14px rgba(27,152,224,0.2)",
        "btn-primary":"0 4px 14px rgba(27,152,224,0.25)",
      },
      backgroundImage: {
        "gradient-rjt":   "linear-gradient(135deg, #13233d 0%, #1a3054 100%)",
        "gradient-brand": "linear-gradient(135deg, #1b98e0, #0ea5e9)",
        "gradient-subtle":"linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
      },
      borderRadius: {
        card:  "16px",
        btn:   "10px",
        badge: "20px",
        icon:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        "3xs": ["9px",  { lineHeight: "12px" }],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-up":   "slideUp 0.3s ease-out",
        "fade-in":    "fadeIn 0.4s ease-out",
      },
      keyframes: {
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
