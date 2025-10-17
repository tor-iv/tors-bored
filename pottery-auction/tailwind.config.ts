import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pottery-charcoal": "#2B2B2B",
        "pottery-terracotta": "#E07856",
        "pottery-clay": "#C96846",
        "pottery-sage": "#8B9D83",
        "pottery-cream": "#F5F1EC",
        medium: {
          green: "#0A8754",
          cream: "#F5F1EC",
          dark: "#2B2B2B",
          light: "#FFFFFF",
        },
        toggle: {
          red: "#E74C3C",
          green: "#0A8754",
          blue: "#2E86AB",
        },
        theme: {
          primary: "var(--theme-primary)",
          secondary: "var(--theme-secondary)",
          background: "var(--theme-background)",
          "background-light": "var(--theme-background-light)",
          text: "var(--theme-text)",
          "text-light": "var(--theme-text-light)",
          border: "var(--theme-border)",
          accent: "var(--theme-accent)",
          muted: "var(--theme-muted)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Caveat", "cursive"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "gentle-bounce": "gentleBounce 3s ease-in-out infinite",
        "pottery-wheel": "spin 2s linear infinite",
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
        gentleBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;