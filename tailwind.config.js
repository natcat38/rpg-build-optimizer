/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Spline Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Instrument chassis — graphite surfaces, constant across games.
        surface: {
          900: '#0f1116',
          800: '#14161d',
          700: '#1b1e27',
          600: '#242833',
        },
        // The reading signal — swapped per game via CSS vars (see index.css).
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          bright: 'rgb(var(--accent-bright) / <alpha-value>)',
          deep: 'rgb(var(--accent-deep) / <alpha-value>)',
        },
        // The constraint/interactive signal — constant across games.
        flux: {
          DEFAULT: '#6aa6ff',
          bright: '#9dc0ff',
        },
        paper: '#e9e7e0',
        muted: '#8d93a3',
        rose: '#e88b7d',
        jade: '#6fd39a',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / 0.15), 0 18px 50px -20px rgba(0,0,0,0.8)',
        'glow-accent':
          '0 8px 30px -8px rgb(var(--accent) / 0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
        panel: '0 24px 70px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'hairline-accent':
          'linear-gradient(135deg, rgb(var(--accent) / 0.5), rgb(var(--accent) / 0.04) 40%, transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(var(--accent) / 0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgb(var(--accent) / 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulse-glow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
