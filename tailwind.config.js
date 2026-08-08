/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#131515",
        "canvas-alt": "#2b2c28",
        card: "#202522",
        border: "#35433f",
        "border-strong": "#3f534f",
        text: "#fffafb",
        "text-muted": "#b8d8d1",
        "text-faint": "#8daea5",
        thread: "#339989",
        "thread-hover": "#7de2d1",
        "thread-done": "#7de2d1",
        danger: "#ef5350",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 20px 40px -12px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
