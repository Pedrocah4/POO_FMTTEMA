/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fmt-blue': {
          DEFAULT: '#002868',
          hover: '#001e4e',
          light: '#e8edf6',
        },
        'fmt-red': {
          DEFAULT: '#D91C22',
          hover: '#b51419',
          light: '#fde8e9',
        },
        'fmt-light': '#F4F4F5',
        'fmt-dark': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'institutional': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 2px 4px 0 rgba(0, 40, 104, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}