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
        'travelo': {
          parchment: '#FDFCFB',
          ink: '#1A1814',
          platinum: '#8E8680',
          gold: '#C9A96E',
          midnight: '#0F0E0C',
        }
      },
      fontFamily: {
        garamond: ['EB Garamond', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
