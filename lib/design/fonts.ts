/**
 * Font Design System
 * 
 * Consistent typography patterns used across all dashboards
 * Based on the established design patterns from student and lecturer dashboards
 */

export const FONT_FAMILIES = {
  primary: 'Poppins, sans-serif',
  secondary: 'DM Sans, sans-serif'
} as const

export const FONT_WEIGHTS = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800
} as const

export const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem'
} as const

export const TYPOGRAPHY_STYLES = {
  // Main page titles (e.g., "Admin Dashboard", "Student Dashboard")
  pageTitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: { xs: '1.75rem', sm: '2.125rem' },
    lineHeight: 1.2,
    color: '#000000'
  },
  
  // Page subtitles/descriptions
  pageSubtitle: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '1rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Section titles (e.g., "System Analytics", "My Courses")
  sectionTitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: '1.25rem',
    lineHeight: 1.3,
    color: '#000000'
  },
  
  // Card titles (e.g., "Total Users", "Attendance Rate")
  cardTitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
    lineHeight: 1.2,
    color: '#000000'
  },
  
  // Card values (e.g., "1247", "87.3%")
  cardValue: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.extrabold,
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
    lineHeight: 1.2,
    color: '#000000'
  },
  
  // Card subtitles (e.g., "Registered users", "This week")
  cardSubtitle: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Chart titles
  chartTitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: '1.125rem',
    lineHeight: 1.3,
    color: '#000000'
  },
  
  // Chart descriptions
  chartDescription: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Table headers
  tableHeader: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: '0.875rem',
    lineHeight: 1.2,
    color: '#000000'
  },
  
  // Table body text
  tableBody: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#000000'
  },
  
  // Button text
  buttonText: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: '0.875rem',
    lineHeight: 1.2,
    textTransform: 'none' as const
  },
  
  // Caption/small text
  caption: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Error text
  error: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#dc2626'
  },
  
  // Success text
  success: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#10b981'
  },
  
  // Stat card values (for KPI cards)
  statValue: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.extrabold,
    fontSize: '1.875rem',
    lineHeight: 1.2,
    color: '#000000'
  },
  
  // Stat card labels
  statLabel: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Section subtitles
  sectionSubtitle: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Input labels
  inputLabel: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.2,
    color: '#374151'
  },
  
  // Menu items
  menuItem: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4
  },
  
  // Table captions
  tableCaption: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: '#64748B'
  },
  
  // Dialog titles
  dialogTitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontSize: '1.125rem',
    lineHeight: 1.3,
    color: '#000000'
  },
  
  // Dialog content
  dialogContent: {
    fontFamily: FONT_FAMILIES.secondary,
    fontWeight: FONT_WEIGHTS.medium,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    color: '#374151'
  }
} as const

// Helper function to get typography style
export const getTypographyStyle = (style: keyof typeof TYPOGRAPHY_STYLES) => {
  return TYPOGRAPHY_STYLES[style]
}

// Helper function to create custom typography style
export const createTypographyStyle = (overrides: Partial<typeof TYPOGRAPHY_STYLES.pageTitle>) => {
  return {
    ...TYPOGRAPHY_STYLES.pageTitle,
    ...overrides
  }
}

export default {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FONT_SIZES,
  TYPOGRAPHY_STYLES,
  getTypographyStyle,
  createTypographyStyle
}
