import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        pitch: {
          light: "#22c55e",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          950: "#022c22",
          DEFAULT: "#15803d",
          dark: "#14532d",
          line: "rgba(255, 255, 255, 0.4)",
        },
        football: {
          live: "#ef4444",
          yellow: "#eab308",
          red: "#dc2626",
          blue: "#2563eb",
          gold: "#f59e0b",
          dark: "#0b1329",
          cardDark: "#111c38",
        },
        kraft: {
          50: "#fbf9f4",
          100: "#f5f0e4",
          200: "#ede8dc",
          300: "#e0d6c3",
          400: "#cfc5b3",
          700: "#786c55",
          900: "#3c3223",
        },
      },
      fontFamily: {
        headline: [
          "var(--font-headline)",
          "'Playfair Display'",
          "'Merriweather'",
          "'Times New Roman'",
          "Times",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        serif: [
          "var(--font-headline)",
          "'Playfair Display'",
          "'Merriweather'",
          "'Times New Roman'",
          "Times",
          "serif",
        ],
      },
      boxShadow: {
        paper: "0 1px 3px rgba(60, 50, 35, 0.06), 0 4px 16px -2px rgba(60, 50, 35, 0.08)",
        "paper-hover": "0 4px 6px -1px rgba(60, 50, 35, 0.08), 0 12px 24px -3px rgba(60, 50, 35, 0.12)",
        stamp: "inset 0 0 0 1px rgba(220, 38, 38, 0.25), 0 2px 6px rgba(220, 38, 38, 0.15)",
        "stamp-gold": "inset 0 0 0 1px rgba(217, 119, 6, 0.25), 0 2px 6px rgba(217, 119, 6, 0.15)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        tactile: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "220": "220ms",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.2)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
