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
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
          sunken: 'var(--surface-sunken)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          tertiary: 'var(--ink-tertiary)',
        },
        accent: {
          sage: 'var(--accent-sage)',
          dusk: 'var(--accent-dusk)',
          clay: 'var(--accent-clay)',
          coral: 'var(--accent-coral)',
        },
        signal: {
          sync: 'var(--signal-sync)',
          conflict: 'var(--signal-conflict)',
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
