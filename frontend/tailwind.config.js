/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddc8',
          300: '#dbc9a8',
          400: '#d4b896',
          500: '#c9a882',
          600: '#b8936d',
          700: '#a17a56',
          800: '#7d5e42',
          900: '#5a4230',
        },
        rose: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9cfd6',
          300: '#f5a8b8',
          400: '#f0859b',
          500: '#e8637e',
          600: '#d84567',
          700: '#b83351',
          800: '#8f2740',
          900: '#6b1d30',
        },
      },
    },
  },
  plugins: [],
}