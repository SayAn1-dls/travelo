import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          50: "#f0f0f5",
          100: "#d4d4e8",
          200: "#a9a9d1",
          300: "#7e7eba",
          400: "#5353a3",
          500: "#28288c",
          600: "#1e1e70",
          700: "#141454",
          800: "#0a0a38",
          900: "#05051c",
          950: "#020210",
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          hover: "rgba(255,255,255,0.10)",
        },
        accent: {
          gold: "#f0b429",
          emerald: "#10d9a0",
          crimson: "#ff4757",
          sapphire: "#4a9eff",
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "60px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "glass-shimmer": "glassShimmer 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glassShimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(74,158,255,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(74,158,255,0.6)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glass-lg": "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        "glow-gold": "0 0 30px rgba(240,180,41,0.4)",
        "glow-emerald": "0 0 30px rgba(16,217,160,0.4)",
        "glow-sapphire": "0 0 30px rgba(74,158,255,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
