/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ✅ Enables dark mode using the 'class' strategy
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
        // Light and dark theme semantic tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderColor: theme => ({
        DEFAULT: theme('colors.border', 'currentColor'),
        ...theme('colors'),
      }),
    },
  },
  plugins: [],
};
