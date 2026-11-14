/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/buyme_design/tailwind.preset.js')],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
