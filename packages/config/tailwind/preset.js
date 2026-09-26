/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF5500',
          foreground: '#000000',
          50: '#FFF2EB',
          100: '#FFE2D1',
          400: '#FF6A1A',
          500: '#FF5500',
          600: '#E64D00',
          700: '#CC4400',
        },
        surface: {
          DEFAULT: '#0C0C12',
          elevated: '#12121A',
          card: '#161622',
          border: '#1E1E2C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};
