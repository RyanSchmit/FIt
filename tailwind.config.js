/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0c10",
          900: "#0f1218",
          850: "#151922",
          800: "#1b212c",
          700: "#272f3d",
          600: "#3a4456",
        },
        accent: {
          DEFAULT: "#6ea8fe",
          strong: "#3b82f6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
