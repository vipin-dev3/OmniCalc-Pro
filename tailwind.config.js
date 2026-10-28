/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Semantic color mapping matching our industrial design themes
        app: {
          bg: 'var(--bg-main)',
          card: 'var(--bg-card)',
          header: 'var(--bg-header)',
          border: 'var(--border-color)',
          accent: 'var(--accent-primary)',
          'accent-hover': 'var(--accent-hover)',
        }
      },
      boxShadow: {
        'keycap': '0 2px 0 var(--key-shadow), 0 3px 6px rgba(0, 0, 0, 0.25)',
        'keycap-active': '0 0 0 var(--key-shadow), inset 0 2px 4px rgba(0, 0, 0, 0.4)',
        'keycap-light': '0 2px 0 rgba(0, 0, 0, 0.15), 0 3px 5px rgba(0, 0, 0, 0.08)',
        'display-inset': 'inset 0 2px 6px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-panel': '0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-color)',
      }
    },
  },
  plugins: [],
}
