/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#db2777', // Hibiscus Pink
        secondary: '#115e59', // Midnight Teal
        accent: '#fbbf24', // Sunset Gold
        background: '#fff1f2', // Rose Sand / Pale Pink
        surface: '#ffffff', // White
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
