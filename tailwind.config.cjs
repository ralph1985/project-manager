/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './dashboard/home/**/*.html',
    './dashboard/src/home/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        pmbg: '#0b1018',
        pmaccent: '#45e6ff',
      },
    },
  },
  plugins: [],
};
