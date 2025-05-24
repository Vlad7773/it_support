/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Нова темна палітра з градієнтами
        'bg-primary': '#0f0f23',
        'bg-secondary': '#1a1a2e',
        'bg-card': '#16213e',
        'bg-hover': '#0e3460',
        'border-color': '#2a3f66',
        'text-primary': '#ffffff',
        'text-secondary': '#8892b0',
        'accent-blue': '#64ffda',
        'accent-purple': '#c792ea',
        
        dark: {
          bg: '#0f0f23',
          card: '#16213e',
          border: '#2a3f66',
          hover: '#0e3460',
          text: '#ffffff',
          textSecondary: '#8892b0',
        },
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          cyan: '#64ffda',
          purple: '#c792ea',
          blue: '#667eea',
          green: '#4ade80',
        }
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-card': 'linear-gradient(145deg, #16213e 0%, #1a1a2e 100%)',
        'gradient-btn': 'linear-gradient(135deg, #64ffda 0%, #4ade80 100%)',
        'gradient-btn-hover': 'linear-gradient(135deg, #4ade80 0%, #64ffda 100%)',
      },
      boxShadow: {
        'card': '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(64, 255, 218, 0.1)',
        'glow': '0 8px 25px rgba(100, 255, 218, 0.3)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
} 