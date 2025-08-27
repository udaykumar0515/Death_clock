/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'dark': {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#525252',
          500: '#666666',
          600: '#7a7a7a',
          700: '#8e8e8e',
          800: '#a3a3a3',
          900: '#b8b8b8',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(34, 211, 238, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
