/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ql: {
          bg: '#F7E6CA',
          primary: '#E8D59E',
          card: '#D9BBB0',
          accent: '#AD9C8E',
          text: '#4A4036',   // A slightly darker text color for readability against light backgrounds
          dark: '#3A3229'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        }
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(173, 156, 142, 0.15)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.02)'
      },
    },
  },
  plugins: [],
}
