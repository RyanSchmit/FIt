/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy "case file" surface scale. Existing bg-ink-*/border-ink-* usages
        // inherit the new palette automatically.
        ink: {
          950: "#1a1f2e",
          900: "#1f2433",
          850: "#252b3d",
          800: "#2e3548",
          700: "#3a4258",
          600: "#4c5670",
        },
        accent: {
          DEFAULT: "#8a7456",
          strong: "#a08862",
        },
        cream: {
          DEFAULT: "#f5f0e8",
          dim: "#e8e0d2",
        },
        brass: "#8a7456",
        red: "#c41e3a",
        green: "#2d5f3e",
        steel: {
          DEFAULT: "#6b7280",
          light: "#9ca3af",
        },
      },
      fontFamily: {
        display: ["Oswald", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
