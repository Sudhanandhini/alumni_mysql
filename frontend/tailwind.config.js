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
          50:  '#e8f2fd',
          100: '#c5defa',
          200: '#8dc0f5',
          300: '#55a2f0',
          400: '#2d8eec',
          500: '#197fe6',
          600: '#1368c4',
          700: '#0d52a0',
          800: '#093d7a',
          900: '#052754',
          DEFAULT: '#197fe6',
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
