/**
 * BuyMe Tailwind CSS Preset
 * Synchronized with tokens.json (One single source of truth)
 * Brand Theme: Red + White + Yellow Glassmorphism
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        buyme: {
          primary: '#E4002B',
          'primary-deep': '#B80022',
          'primary-soft': '#FFE9EC',
          yellow: '#FFC20E',
          'yellow-soft': '#FFF6D6',
          canvas: '#FFFDFD',
          'canvas-warm': '#FFF9F9',
          navy: '#1F2430',
          'navy-muted': '#374151',
          body: '#1F2430',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          subtle: '#D1D5DB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#991B1B',
          info: '#2563EB',
          // Aliases for compatibility
          red: '#E4002B',
          neon: '#E4002B',
          deep: '#B80022',
          ice: '#FFFDFD',
          soft: '#FFE9EC',
        },
      },
      backgroundColor: {
        'glass-fill': 'rgba(255, 255, 255, 0.68)',
        'glass-elevated': 'rgba(255, 255, 255, 0.84)',
        'glass-opaque': 'rgba(255, 255, 255, 0.95)',
      },
      borderColor: {
        'glass-border': 'rgba(255, 255, 255, 0.75)',
        'glass-red': 'rgba(228, 0, 43, 0.35)',
        'glass-yellow': 'rgba(255, 194, 14, 0.40)',
      },
      borderRadius: {
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(228, 0, 43, 0.08)',
        'glass-elevated': '0 16px 48px rgba(31, 36, 48, 0.12)',
        'red-glow': '0 4px 20px rgba(228, 0, 43, 0.35)',
        'floating-nav': '0 12px 36px rgba(31, 36, 48, 0.14)',
        card: '0 4px 16px rgba(31, 36, 48, 0.06)',
      },
      fontFamily: {
        heading: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        tamil: ['Noto Sans Tamil', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
        glass: '20px',
        'glass-heavy': '24px',
      },
    },
  },
  plugins: [],
};
