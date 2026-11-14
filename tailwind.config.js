import { createTailwindPreset } from '@sudobility/design';

/** @type {import('tailwindcss').Config} */
export default {
  // Semantic tokens (bg-primary, border-input, ...) resolve to the design
  // system's CSS variables, injected at boot by generateThemeCSS.
  presets: [createTailwindPreset()],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@sudobility/components/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/building_blocks/dist/**/*.{js,jsx}',
    './node_modules/@sudobility/design/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/auth-components/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/entity-components/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/entity_pages/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          'bg-primary': 'var(--color-bg-primary)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary': 'var(--color-bg-tertiary)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-tertiary)',
          border: 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
          'hover-bg': 'var(--color-hover-bg)',
          'hover-border': 'var(--color-hover-border)',
        },
      },
    },
  },
  plugins: [],
};
