/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8b5cf6',
          DEFAULT: '#6D28D9',
          dark: '#5b21b6',
        },
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        textMain: 'var(--color-textMain)',
        textMuted: 'var(--color-textMuted)',
        borderBase: 'var(--color-border)',
        accentYellow: {
          light: '#fef3c7',
          DEFAULT: '#fbbf24',
        },
        accentGreen: {
          light: '#dcfce7',
          DEFAULT: '#10b981',
        },
        accentRed: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
        },
        accentBlue: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.05)',
        'fab': '0 4px 14px rgba(109, 40, 217, 0.4)',
      }
    },
  },
  plugins: [],
}