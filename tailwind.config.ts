import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── Direction B colour palette ──────────────────────────────────────
      colors: {
        navy: '#142235',
        teal: {
          DEFAULT: '#2E6F5E',
          dark:    '#2c5446',
          light:   '#E7F0EC',   // success background
          text:    '#2E6F5E',   // success text (same hue, kept explicit)
        },
        // surfaces
        'surface':        '#FFFFFF',
        'surface-raised': '#F5F6F7',  // page / info-box background
        'surface-info':   '#EEF1F3',  // secondary info box
        // borders
        'border':         '#E6EAEE',
        'border-strong':  '#E2E7EB',
        // text
        'text-primary':   '#142235',
        'text-secondary': '#5C6573',
        'text-muted':     '#8b95a1',
        // status: amber / warning
        'amber': {
          DEFAULT: '#F4EFE2',
          text:    '#B07A2E',
        },
        // disabled
        'disabled':       '#D3D9DF',
        'disabled-text':  '#a4adb8',
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },

      // ── Progress-bar grow animation ──────────────────────────────────────
      keyframes: {
        'progress-grow': {
          from: { transform: 'scaleX(0)' },
          to:   { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'progress': 'progress-grow 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
