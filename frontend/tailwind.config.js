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
          50: '#fdfbf7',
          100: '#faf6ee',
          200: '#f5ecd5',
          300: '#efe1bc',
          400: '#e4cc8a',
          500: '#d4b895',
          600: '#c09e5f',
          700: '#a17e43',
          800: '#7d5e2f',
          900: '#5a3f1d',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f4a5a5',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        blush: {
          50: '#fef5f6',
          100: '#fde9ec',
          200: '#fbd4d9',
          300: '#f8b9c2',
          400: '#f4a5a5',
          500: '#f08c8c',
          600: '#d96a6a',
          700: '#b85050',
          800: '#933e3e',
          900: '#6e2e2e',
        },
      },
    },
  },
  plugins: [],
}