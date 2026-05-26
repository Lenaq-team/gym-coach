/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#C8F135',
      },
      maxWidth: {
        'mobile': '430px',
      },
    },
  },
  plugins: [],
}
