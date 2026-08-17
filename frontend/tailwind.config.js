/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef1f8",
          100: "#d7deee",
          200: "#aab6d6",
          300: "#7c8cbc",
          400: "#4d5c99",
          500: "#2f3c73",
          600: "#202b57",
          700: "#161d3f",
          800: "#0f1530",
          900: "#080b1c",
          950: "#040611",
        },
        coral: {
          50: "#fff3ee",
          100: "#ffe3d5",
          200: "#ffc2aa",
          300: "#ff9c78",
          400: "#ff7a50",
          500: "#fb5a2c",
          600: "#e8431a",
          700: "#c13415",
          800: "#992b18",
          900: "#7c2718",
        },
        indigo: {
          50: "#f1efff",
          100: "#e2dcff",
          200: "#c6b8ff",
          300: "#a68dff",
          400: "#8b64fb",
          500: "#7645f0",
          600: "#6431d6",
          700: "#5225ac",
          800: "#42208a",
          900: "#361c6e",
        },
        cream: {
          50: "#fffdf9",
          100: "#fdf8ef",
          200: "#faf1e0",
          300: "#f3e6cc",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Manrope'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -15px rgba(118, 69, 240, 0.35)",
        coral: "0 20px 50px -15px rgba(251, 90, 44, 0.45)",
        card: "0 10px 30px -10px rgba(8, 11, 28, 0.15)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 20% 20%, rgba(118,69,240,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(251,90,44,0.15), transparent 40%)",
      },
      animation: {
        "spin-slow": "spin 14s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
    },
  },
  plugins: [],
};
