import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#080D2B',
          800: '#0a1135',
          700: '#0e193d',
          600: '#121f4a',
          500: '#1a2a5c',
        },
        brand: {
          DEFAULT: '#0241e3',
          light: '#3366ff',
          dark: '#0130a8',
        },
      },
    },
  },
  plugins: [],
}
