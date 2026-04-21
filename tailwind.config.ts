import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // DCP brand palette
        midnight: "#000531",
        aurora: {
          green: "#20FE8F",
          violet: "#545DFF",
        },
        sky: "#76BEFF",
        ember: "#FF8371",
        offwhite: "#F4F5F7",

        // brand / surface scales remapped onto DCP palette
        brand: {
          50: "#EEF0FF",
          100: "#DADDFF",
          200: "#B6BCFF",
          300: "#8E96FF",
          400: "#6E78FF",
          500: "#545DFF", // aurora violet
          600: "#4048E0",
          700: "#2E34B8",
          800: "#1B2080",
          900: "#0D1154",
          950: "#000531", // midnight
        },
        accent: {
          50: "#E7FFF3",
          100: "#BDFFDD",
          200: "#8EFEC3",
          300: "#5CFEAB",
          400: "#38FE9C",
          500: "#20FE8F", // aurora green
          600: "#0DE27A",
          700: "#0AB864",
          800: "#088E4E",
          900: "#056638",
        },
        surface: {
          50: "#F4F5F7",  // off-white
          100: "#EAECEF",
          200: "#E6E7E8", // dcp cool grey
          300: "#C8CACD",
          400: "#9FA2A7",
          500: "#6F7378",
          600: "#4A4D52",
          700: "#2F3238",
          800: "#14162B",
          900: "#000531", // midnight
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        pill: "40px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "progress-fill": "progressFill 1s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        progressFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
