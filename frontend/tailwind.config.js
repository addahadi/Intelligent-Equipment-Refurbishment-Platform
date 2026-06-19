/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        atelier: '#EEF1F2',
        panel: '#FAFBFB',
        graphite: '#18211F',
        steel: '#6E7A80',
        rule: '#DCE1E2',
        verdigris: {
          DEFAULT: '#1C7A62',
          700: '#155C4B',
          50: '#E7F2EE',
        },
        brass: {
          DEFAULT: '#A87C2A',
          50: '#F4EDDD',
        },
        oxide: {
          DEFAULT: '#9C4A2C',
          50: '#F2E4DD',
        },
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        lg: '8px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
      },
    },
  },
  plugins: [],
}
