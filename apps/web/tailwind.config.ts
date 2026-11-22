import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        navy: {
          50: "#EEF2F7",
          100: "#D8E2EE",
          200: "#B1C5DD",
          300: "#7FA0C7",
          400: "#4A75A8",
          500: "#1D4A7E",
          600: "#0D3566",
          700: "#072852",
          800: "#03224A",
          900: "#011D42",
          950: "#00122B",
          DEFAULT: "#011D42",
        },
        accent: {
          50: "#FFF5EB",
          100: "#FFE6CC",
          200: "#FFCA99",
          300: "#FFA85C",
          400: "#FF8F29",
          500: "#FD7C05",
          600: "#E56B00",
          700: "#C25800",
          800: "#9A4500",
          900: "#753400",
          DEFAULT: "#FD7C05",
        },
        brand: {
          50: "#FFF5EB",
          100: "#FFE6CC",
          200: "#FFCA99",
          300: "#FFA85C",
          400: "#FF8F29",
          500: "#FD7C05",
          600: "#E56B00",
          700: "#C25800",
          800: "#9A4500",
          900: "#011D42",
        },
        canvas: "#F7F9FC",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(1, 29, 66, 0.05), 0 1px 2px -1px rgba(1, 29, 66, 0.04)",
        "card-hover": "0 8px 24px -6px rgba(1, 29, 66, 0.10), 0 2px 6px -2px rgba(1, 29, 66, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
