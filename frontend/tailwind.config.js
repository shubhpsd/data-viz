/* eslint-disable import/no-extraneous-dependencies */
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gruvbox: {
          // Dark mode colors (gruvbox medium)
          'dark': {
            'bg': '#282828',
            'bg-soft': '#32302f',
            'bg-hard': '#1d2021',
            'fg': '#ebdbb2',
            'fg2': '#d5c4a1',
            'fg3': '#bdae93',
            'fg4': '#a89984',
            'gray': '#928374',
            'red': '#fb4934',
            'green': '#b8bb26',
            'yellow': '#fabd2f',
            'blue': '#83a598',
            'purple': '#d3869b',
            'aqua': '#8ec07c',
            'orange': '#fe8019',
          },
          // Light mode colors (gruvbox medium)
          'light': {
            'bg': '#fbf1c7',
            'bg-soft': '#f2e5bc',
            'bg-hard': '#f9f5d7',
            'fg': '#3c3836',
            'fg2': '#504945',
            'fg3': '#665c54',
            'fg4': '#7c6f64',
            'gray': '#928374',
            'red': '#cc241d',
            'green': '#98971a',
            'yellow': '#d79921',
            'blue': '#458588',
            'purple': '#b16286',
            'aqua': '#689d6a',
            'orange': '#d65d0e',
          }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [],
}