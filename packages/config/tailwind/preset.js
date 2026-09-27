/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#C86228',
          foreground: '#FFFFFF',
          50: '#FAF2ED',
          100: '#F2DFD4',
          400: '#D97736',
          500: '#C86228', // Faded, elegant warm copper
          600: '#AF4F1A',
          700: '#8E3C10',
        },
        surface: {
          DEFAULT: '#0B0C10',
          elevated: '#111319',
          card: '#161922',
          border: '#202430',
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
