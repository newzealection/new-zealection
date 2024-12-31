import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
        nzgreen: {
          50: "#f3f8f4",
          100: "#e0eee2",
          200: "#c3ddc7",
          300: "#9cc4a3",
          400: "#71a379",
          500: "#2C5530",
          600: "#3b6a43",
          700: "#325438",
          800: "#2c4431",
          900: "#263a2b",
        },
        stone: {
          50: "#f8f8f7",
          100: "#f0efed",
          200: "#8B8982",
          300: "#d3d0ca",
          400: "#a8a39b",
          500: "#8b8982",
          600: "#7c786f",
          700: "#666259",
          800: "#524e47",
          900: "#45413b",
        },
      },
      keyframes: {
        "card-hover": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "card-float": "card-hover 3s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;