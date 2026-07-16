import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#5fe9cb",
          400: "#2dd4b0",
          500: "#14b896",
          600: "#0d9478",
          700: "#0f7661",
          800: "#115e4f",
          900: "#134e42",
        },
      },
    },
  },
  plugins: [],
};

export default config;
