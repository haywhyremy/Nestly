/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--surface-base, #FBF8F4)',
          raised: 'var(--surface-raised, #FFFFFF)',
          sunken: 'var(--surface-sunken, #F2EDE6)',
        },
        ink: {
          primary: 'var(--ink-primary, #1F1B16)',
          secondary: 'var(--ink-secondary, #6B6259)',
          tertiary: 'var(--ink-tertiary, #A89F94)',
        },
        accent: {
          sage: 'var(--accent-sage, #7A9B7E)',
          dusk: 'var(--accent-dusk, #9B7E9B)',
          clay: 'var(--accent-clay, #C49B7A)',
          coral: 'var(--accent-coral, #C97064)',
        },
        signal: {
          sync: 'var(--signal-sync, #9B7E9B)',
          conflict: 'var(--signal-conflict, #D4A574)',
        },
      },
      fontFamily: {
        system: 'var(--font-system)',
      },
      transitionDuration: {
        quick: 'var(--motion-quick, 180ms)',
        standard: 'var(--motion-standard, 240ms)',
        gentle: 'var(--motion-gentle, 360ms)',
      },
    },
  },
  plugins: [],
}
