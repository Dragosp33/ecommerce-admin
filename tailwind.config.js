/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5542F6',
        highlight: '#eae8fb',
        bgGray: '#fbfafd',
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        13: 'repeat(13, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
