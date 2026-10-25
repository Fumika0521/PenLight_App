/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deco: {
          pink: {
            50: '#fff5f7',
            100: '#ffeef2',
            200: '#ffdbe4',
            300: '#ffb3c6',
            400: '#ff80a2',
            500: '#f84f7c',
            600: '#e62e60',
          },
          blue: {
            50: '#f0f7ff',
            100: '#e0effe',
            200: '#bae0fd',
            300: '#7cc2fb',
            400: '#389ff7',
            500: '#1181e8',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
          },
          sparkle: '#ffea79',
          cream: '#fffdfa',
        }
      },
      fontFamily: {
        sans: ['"Zen Maru Gothic"', '"M PLUS Rounded 1c"', 'system-ui', 'sans-serif'],
        cursive: ['"Caveat"', '"Pacifico"', 'cursive'],
      },
      boxShadow: {
        'cute': '0 4px 20px -2px rgba(255, 143, 177, 0.25)',
        'cute-lg': '0 10px 25px -3px rgba(255, 143, 177, 0.35)',
        'glow-pink': '0 0 25px rgba(255, 105, 180, 0.65)',
        'glow-blue': '0 0 25px rgba(56, 189, 248, 0.65)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sparkle': 'sparkle 1.8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
