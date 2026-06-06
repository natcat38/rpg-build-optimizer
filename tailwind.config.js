/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        sans: ['"Spline Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Abyssal base — deep indigo near-black surfaces.
        abyss: {
          900: '#070912',
          800: '#0a0d1a',
          700: '#10142a',
          600: '#161c3a',
        },
        // Mora — warm primary accent (gold).
        mora: {
          DEFAULT: '#e9c46a',
          bright: '#f6d98a',
          deep: '#b8923f',
        },
        // Anemo — secondary accent (teal).
        teal: {
          DEFAULT: '#5ad1c4',
          bright: '#8be8df',
        },
        parchment: '#f1ebdd',
        muted: '#8b93ad',
        rose: '#e08a7a',
        jade: '#82d6a6',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(233,196,106,0.15), 0 18px 50px -20px rgba(0,0,0,0.8)',
        'glow-mora':
          '0 8px 30px -8px rgba(233,196,106,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        panel: '0 24px 70px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'hairline-gold':
          'linear-gradient(135deg, rgba(233,196,106,0.5), rgba(233,196,106,0.04) 40%, transparent 70%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(233,196,106,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(233,196,106,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-glow': 'pulse-glow 1.6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
