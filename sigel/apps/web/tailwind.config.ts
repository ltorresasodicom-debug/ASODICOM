import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens institucionales GovTech
        sigel: {
          primary: '#1E3A8A',     // azul institucional
          secondary: '#0F766E',   // verde gobierno
          accent: '#D97706',      // amarillo señalización
          danger: '#DC2626',
          success: '#16A34A',
          warning: '#F59E0B',
          dark: '#0F172A',
          gray: '#64748B',
          light: '#F1F5F9',
        },
        semaforo: {
          verde: '#16A34A',
          amarillo: '#F59E0B',
          rojo: '#DC2626',
        },
        ecuador: {
          amarillo: '#FCD116',
          azul: '#003893',
          rojo: '#CE1126',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.04)',
        floating: '0 10px 30px -10px rgba(0,0,0,.15)',
      },
      borderRadius: { card: '0.75rem' },
    },
  },
  plugins: [],
};
export default config;
