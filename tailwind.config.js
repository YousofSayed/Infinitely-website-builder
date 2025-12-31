/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-brand-primary)',
        },

        surface: {
          main: 'var(--color-surface-main)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
        },

        text: {
          primary: 'var(--color-text-primary)',
        },

        border: {
          DEFAULT: 'var(--color-border-default)',
        },
      },
    },
  },
  plugins: [],
};
