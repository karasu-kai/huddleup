/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#E8E8E4",
        surface: "#FFFFFF",
        "surface-muted": "#F3F3F0",
        border: "#D4D4D0",
        "text-primary": "#121212",
        "text-secondary": "#6B6B68",
        "text-tertiary": "#9C9C98",
        neon: {
          DEFAULT: "#C8FF00",
          pressed: "#A8D900",
        },
        warning: "#FF4757",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
