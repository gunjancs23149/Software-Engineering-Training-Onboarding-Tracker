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
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          hover: '#1e293b',
          active: '#3b82f6',
          text: '#94a3b8',
          textActive: '#ffffff',
        },
        status: {
          completed: '#10b981',
          completedBg: '#ecfdf5',
          completedBorder: '#a7f3d0',
          inProgress: '#3b82f6',
          inProgressBg: '#eff6ff',
          inProgressBorder: '#bfdbfe',
          pending: '#f59e0b',
          pendingBg: '#fffbeb',
          pendingBorder: '#fde68a',
          overdue: '#ef4444',
          overdueBg: '#fef2f2',
          overdueBorder: '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'glow-brand': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
