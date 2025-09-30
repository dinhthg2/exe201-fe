/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#4F8EF7',
          50: '#EEF5FF',
          100: '#DDEBFF',
          200: '#BAD6FE',
          300: '#97C2FD',
          400: '#73ADFB',
          500: '#4F8EF7',
          600: '#2E6EE2',
          700: '#1F53B5',
          800: '#163B83',
          900: '#0E285A',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#3CCB6C',
          50: '#ECFFF2',
          100: '#D6FCE3',
          200: '#ADF6C7',
          300: '#84EFAA',
          400: '#5DE78E',
          500: '#3CCB6C',
          600: '#2AA956',
          700: '#1E8342',
          800: '#145D2F',
          900: '#0C3C1D',
        },
        warning: {
          DEFAULT: '#FF8A00',
          50: '#FFF5E6',
          100: '#FFE6BF',
          200: '#FFD199',
          300: '#FFB870',
          400: '#FF9E47',
          500: '#FF8A00',
          600: '#DB7000',
          700: '#B75800',
          800: '#8F4300',
          900: '#672F00',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          50: '#F4F0FF',
          100: '#E6DBFF',
          200: '#C9B5FF',
          300: '#AC8EFF',
          400: '#9067FD',
          500: '#8B5CF6',
          600: '#6D3FE0',
          700: '#522DB3',
          800: '#3A2080',
          900: '#251451',
        },
        surface: '#F7F9FC',
        card: '#FFFFFF',
        text: '#0F172A',
        muted: '#475569',
        borderNeutral: '#E6ECF5',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: '1rem',
        xl: '1rem',
        '2xl': '1.25rem'
      },
      boxShadow: {
        sm: '0 4px 12px rgba(15,23,42,0.05)',
        md: '0 8px 24px rgba(15,23,42,0.06)'
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        floaty: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-12px)' } },
        fadeInUp: { '0%':{opacity:0, transform:'translateY(24px)'}, '100%':{opacity:1, transform:'translateY(0)'} }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        fadeInUp: 'fadeInUp .75s both'
      }
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwind-scrollbar')({nocompatible:true})],
};
