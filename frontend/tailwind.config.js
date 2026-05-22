/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f3ff',
          100: '#e1e7fe',
          200: '#c7d3fd',
          500: '#6366f1', // Indigo accent
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        slate: {
          950: '#090d16', // Sleek deep slate dark mode background
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        emerald: {
          500: '#10b981', // Accent active state
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-accent': '0 8px 32px 0 rgba(99, 102, 241, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
