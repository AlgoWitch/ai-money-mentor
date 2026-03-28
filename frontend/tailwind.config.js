/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0F172A', light: '#1E293B', muted: '#334155' },
        gold:  { DEFAULT: '#C6A969', light: '#D4BC87', muted: '#A8905A', subtle: '#F5EDD9' },
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        finance: '0.06em',
      },
      animation: {
        'fade-up':   'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':   'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'premium': '0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
        'input':   '0 0 0 1px rgba(198,169,105,0.5), 0 1px 8px rgba(198,169,105,0.12)',
      },
      maxWidth: {
        'chat': '720px',
      },
    },
  },
  plugins: [],
}
