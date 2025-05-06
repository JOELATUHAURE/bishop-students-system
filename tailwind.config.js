/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EBEAFD',
          100: '#D7D5FB',
          200: '#AEABF8',
          300: '#8680F4',
          400: '#5D56F1',
          500: '#4F46E5',
          600: '#2C21D1',
          700: '#221A9F',
          800: '#19146D',
          900: '#0F0D3B',
        },
      },
    },
  },
  plugins: [],
};