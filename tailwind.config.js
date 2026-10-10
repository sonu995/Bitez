/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FF5200',
          'primary-hover': '#E04800',
          'primary-light': '#FFF4ED',
          orange: '#FF5200',
          amber: '#F59E0B',
          'amber-light': '#FEF3C7',
          green: '#10B981',
          'green-light': '#ECFDF5',
          red: '#EF4444',
          'red-light': '#FEF2F2',
          dark: '#EA580C',
          'dark-muted': '#C2410C',
          light: '#FFFFFF',
          surface: '#FAF9F6',
          border: '#E2E8F0',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-smooth': 'floatSmooth 5s ease-in-out infinite',
        'float-delay': 'float 3s ease-in-out 0.5s infinite',
        'float-slow': 'float 4s ease-in-out 1s infinite',
        'float-reverse': 'floatReverse 4.5s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 5s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulseSlow 3.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(234, 88, 12, 0.35)' },
          '50%': { boxShadow: '0 0 35px rgba(234, 88, 12, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        floatSmooth: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '300': '300% 300%',
      },
    },
  },
  plugins: [],
};
