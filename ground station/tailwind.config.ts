import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--gs-font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--gs-font-mono)", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
