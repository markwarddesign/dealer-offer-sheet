/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'miles-lightest': '#e6f6f7',
        'miles-light': '#b7d7da',
        'miles': '#5fa6ad',
        'miles-dark': '#388087',
        'miles-darkest': '#205259',
        'dark-gradient-1': '#18181b',
        'dark-gradient-2': '#23272f',
        'dark-gradient-3': '#3b4252',
      },
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },
    },
  },
  plugins: [],
}