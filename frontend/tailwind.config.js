/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // preflight enabled (Bootstrap removed)
  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────────────────────────────────
        // CENTRALIZED COLORS  →  change the CSS variable in index.css
        // to update every page instantly.
        //
        // Primary  : buttons, links, highlights, hero gradient
        // Secondary: sidebar, headings, dark accents
        // ─────────────────────────────────────────────────────────────────
        primary: {
          light:   'var(--color-primary-light)',   // light tint / badge bg
          DEFAULT: 'var(--color-primary)',          // main brand color
          dark:    'var(--color-primary-dark)',     // hover / gradient dark
          darker:  'var(--color-primary-darker)',   // deep accent
        },
        secondary: {
          light:   'var(--color-secondary-light)', // lighter navy
          DEFAULT: 'var(--color-secondary)',        // dark navy / sidebar
        },
        sidebar: 'var(--color-sidebar)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:    '0 1px 4px rgba(0,0,0,0.07)',
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
