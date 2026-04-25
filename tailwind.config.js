/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-faded': 'var(--text-faded)',
        orp: 'var(--orp)',
        accent: 'var(--accent)',
        rule: 'var(--rule)',

        // shadcn-compatible aliases — map onto Oculé palette
        background: 'var(--bg)',
        foreground: 'var(--text)',
        popover: 'var(--bg-elevated)',
        'popover-foreground': 'var(--text)',
        primary: 'var(--accent)',
        'primary-foreground': 'var(--bg)',
        muted: 'var(--bg-elevated)',
        'muted-foreground': 'var(--text-dim)',
        border: 'var(--rule)',
        input: 'var(--rule)',
        ring: 'var(--accent)',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
        humanist: ['var(--font-humanist)'],
        dyslexic: ['var(--font-dyslexic)'],
        app: ['var(--font-app)'],
      },
      transitionTimingFunction: {
        'ease-library': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'about-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'about-slide': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'word-enter': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'flash-pulse': {
          '0%': { background: 'var(--orp)' },
          '100%': { background: 'var(--text-dim)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        'about-fade': 'about-fade 180ms cubic-bezier(0.4, 0, 0.2, 1)',
        'about-slide': 'about-slide 260ms cubic-bezier(0.4, 0, 0.2, 1)',
        'word-enter': 'word-enter 160ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'flash-pulse': 'flash-pulse 450ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
