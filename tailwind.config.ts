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
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff8f0",
          100: "#ffecd6",
          200: "#ffd4a8",
          300: "#ffb570",
          400: "#ff8c35",
          500: "#ff6b00",
          600: "#e85a00",
          700: "#c44a00",
          800: "#9e3d00",
          900: "#7a3000",
        },
        surface: {
          DEFAULT: "#0f0e0c",
          50:  "#faf9f7",
          100: "#f2f0eb",
          200: "#e5e1d8",
          800: "#1c1a16",
          900: "#0f0e0c",
        }
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease both",
        "fade-in":    "fadeIn 0.4s ease both",
        "slide-in-r": "slideInR 0.35s cubic-bezier(0.4,0,0.2,1) both",
        "spin-slow":  "spin 3s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "none" } },
        fadeIn:    { from: { opacity: "0" },                                to: { opacity: "1" } },
        slideInR:  { from: { transform: "translateX(100%)" },              to: { transform: "translateX(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" },                          "50%": { opacity: "0.5" } },
      },
      backgroundImage: {
        "hero-grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
