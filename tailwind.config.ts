import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { blue: '#0066FF', orange: '#FF4F17', teal: '#00B4D8', green: '#00C48C' },
      },
      borderRadius: { pill: '100px', '4xl': '32px' },
      fontFamily: {
        fredoka: ['Fredoka', 'Plus Jakarta Sans', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
