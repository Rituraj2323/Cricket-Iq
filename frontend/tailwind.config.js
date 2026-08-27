/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cricket-dark': '#0a0f18',
        'cricket-card': '#0b1320',
        'cricket-border': '#16273b',
        'cricket-cyan': '#00f2fe',
        'cricket-teal': '#0d5c63',
      },
    },
  },
  plugins: [],
};
