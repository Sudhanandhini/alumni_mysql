/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // Keep Bootstrap resets intact
  },
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef1f7',
          100: '#d5dcec',
          200: '#aab9d9',
          300: '#7f96c6',
          400: '#5473b3',
          500: '#2d4a8a',
          600: '#243370',
          700: '#1a2744',
          800: '#141e36',
          900: '#0e1525',
          DEFAULT: '#1a2744',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.07)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
