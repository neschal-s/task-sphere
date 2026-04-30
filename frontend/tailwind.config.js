/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          50: '#ecf7ff',
          100: '#d9eeff',
          200: '#b8dfff',
          300: '#86c6ff',
          400: '#53adff',
          500: '#2b92ff',
          600: '#1b7aff',
          700: '#1060e6',
          800: '#0d4cb8',
          900: '#0a3a8a',
        }
      }
    }
  },
  darkMode: 'class',
  plugins: [],
}
