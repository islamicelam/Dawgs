/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
        xl: '14px',
      },
      colors: {
        // dawgs brand — neutral ramp ("ground" dark bg slots into 950,
        // "paper" light surface slots into 50 — everything else is the
        // brand book's literal 100-900 steps)
        neutral: {
          50: '#fafbff',
          100: '#f3f5fe',
          200: '#e4e7f5',
          300: '#cfd3e5',
          400: '#b2b6ca',
          500: '#9397ab',
          600: '#75798c',
          700: '#595d6c',
          800: '#3f424d',
          900: '#292b31',
          950: '#161826',
        },
        // brand accent (soft lavender) — replaces Tailwind's indigo
        indigo: {
          50: '#f5f4ff',
          100: '#f5f4ff',
          200: '#e7e5fe',
          300: '#d2cefd',
          400: '#b5abfc',
          500: '#9184d9',
          600: '#796cbf',
          700: '#5d5294',
          800: '#423a6a',
          900: '#2b2741',
          950: '#2b2741',
        },
        // brand danger ("rust") — replaces Tailwind's red
        red: {
          50: '#fdf3f3',
          100: '#f9e3e3',
          200: '#f0c4c4',
          300: '#e2a0a0',
          400: '#d98d8d',
          500: '#c96f6f',
          600: '#a87373',
          700: '#8a4f4f',
          800: '#5c2b2e',
          900: '#2a1215',
        },
        // brand signal — "steel" (in progress) — replaces Tailwind's sky
        sky: {
          50: '#eef4fb',
          100: '#dbe8f6',
          200: '#b9d2ec',
          300: '#8fb7de',
          400: '#6da3d2',
          500: '#5b93c9',
          600: '#4a76a3',
          700: '#3c5d80',
          800: '#2d4460',
          900: '#1e2d40',
        },
        // brand signal — "moss" (done) — replaces Tailwind's emerald
        emerald: {
          50: '#eef7f2',
          100: '#d7ecdf',
          200: '#b3dbc7',
          300: '#8ac7ab',
          400: '#71b899',
          500: '#5fa88a',
          600: '#4c8870',
          700: '#3c6c59',
          800: '#2c5043',
          900: '#1d352d',
        },
        // brand signal — "amber" (high priority) — replaces Tailwind's amber
        amber: {
          50: '#faf6ec',
          100: '#f3e8d2',
          200: '#e6d1a6',
          300: '#d8b97a',
          400: '#d0ac67',
          500: '#c9a35b',
          600: '#a3843f',
          700: '#806732',
          800: '#5c4a24',
          900: '#3d3117',
        },
      },
    },
  },
  plugins: [],
};
