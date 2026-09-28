/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        page: '#F7F8FA',
        surface: '#FFFFFF',
        ink: '#1B1F27',
        muted: '#6B7280',
        dim: '#9CA3AF',
        accent: '#2563EB',
        'accent-hover': '#1D4ED8',
        console: '#0D1117',
      },
    },
  },
  plugins: [],
};
