/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wizard: {
          // Enchanted Wizard Palette
          primary: '#047857',      // Deep Emerald Green
          secondary: '#e5e7eb',    // Moonlit Silver
          accent: '#f59e0b',       // Amber Glow
          // Supporting shades
          'primary-light': '#059669',
          'primary-dark': '#064e3b',
          'secondary-light': '#f3f4f6',
          'secondary-dark': '#d1d5db',
          'accent-light': '#fbbf24',
          'accent-dark': '#d97706',
          // Magical backgrounds
          'forest-mist': '#ecfdf5',
          'enchanted-shadow': '#374151',
          'mystical-white': '#fefefe',
        }
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #ecfdf5 0%, #e5e7eb 50%, #f0fdf4 100%)',
        'emerald-magic': 'linear-gradient(135deg, #047857 0%, #059669 100%)',
        'amber-glow': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      },
      animation: {
        'magical-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'forest-float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}