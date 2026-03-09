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
        // Calm palette for Serene
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        sage: {
          50: "#f8faf8",
          100: "#eef2ee",
          200: "#d9e4d9",
          300: "#b8cdb8",
          400: "#8fab8f",
          500: "#6a8f6a",
          600: "#517551",
          700: "#425f42",
          800: "#374d37",
          900: "#2e402e",
        },
        warm: {
          50: "#fdfcfb",
          100: "#faf8f5",
          200: "#f5f0ea",
          300: "#ede4d8",
          400: "#e0d0bc",
          500: "#cdb99a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
