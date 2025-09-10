// ============================================================================
// SIERRA LEONE CONSTANTS
// ============================================================================

/**
 * Sierra Leone specific constants and configurations
 * Used throughout the application for localization and formatting
 */

// ============================================================================
// LOCALE & CURRENCY
// ============================================================================

export const SIERRA_LEONE = {
  // Basic info
  COUNTRY_CODE: 'SL',
  COUNTRY_NAME: 'Sierra Leone',
  CURRENCY_CODE: 'NLe',
  CURRENCY_SYMBOL: 'Le',
  PHONE_CODE: '+232',
  LOCALE: 'en-SL',
  TIMEZONE: 'Africa/Freetown',
  
  // Phone number formats
  PHONE_FORMATS: {
    INTERNATIONAL: '+232 XX XXX XXXX',
    LOCAL: 'XX XXX XXXX',
    MOBILE: '+232 XX XXX XXXX'
  },
  
  // Common phone number prefixes
  MOBILE_PREFIXES: ['77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
  
  // Date formats
  DATE_FORMATS: {
    SHORT: 'dd/MM/yyyy',
    MEDIUM: 'dd MMM yyyy',
    LONG: 'dd MMMM yyyy',
    FULL: 'EEEE, dd MMMM yyyy'
  },
  
  // Time formats
  TIME_FORMATS: {
    SHORT: 'HH:mm',
    MEDIUM: 'HH:mm:ss',
    LONG: 'HH:mm:ss z'
  }
} as const

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

export const VALIDATION_PATTERNS = {
  // Phone number patterns
  PHONE: {
    INTERNATIONAL: /^\+232[0-9]{8}$/,
    LOCAL: /^[0-9]{8}$/,
    MOBILE: /^\+232(77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)[0-9]{6}$/
  },
  
  // Student ID patterns (customize based on your institution)
  STUDENT_ID: {
    DEFAULT: /^[A-Z]{2,4}[0-9]{6}$/,
    WITH_YEAR: /^[0-9]{4}[A-Z]{2,4}[0-9]{3}$/,
    CUSTOM: /^[A-Z0-9]{6,10}$/
  },
  
  // Course code patterns
  COURSE_CODE: {
    DEFAULT: /^[A-Z]{2,4}[0-9]{3}$/,
    WITH_DEPARTMENT: /^[A-Z]{2,4}-[0-9]{3}$/,
    CUSTOM: /^[A-Z0-9]{3,8}$/
  },
  
  // Email patterns
  EMAIL: {
    GENERAL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    INSTITUTIONAL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  }
} as const

// ============================================================================
// FORMATTING OPTIONS
// ============================================================================

export const FORMATTING_OPTIONS = {
  // Number formatting
  NUMBER: {
    locale: SIERRA_LEONE.LOCALE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  
  // Currency formatting
  CURRENCY: {
    locale: SIERRA_LEONE.LOCALE,
    currency: SIERRA_LEONE.CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  
  // Date formatting
  DATE: {
    locale: SIERRA_LEONE.LOCALE,
    timeZone: SIERRA_LEONE.TIMEZONE
  },
  
  // Time formatting
  TIME: {
    locale: SIERRA_LEONE.LOCALE,
    timeZone: SIERRA_LEONE.TIMEZONE,
    hour12: true
  }
} as const

// ============================================================================
// COMMON VALUES
// ============================================================================

export const COMMON_VALUES = {
  // Academic terms
  ACADEMIC_TERMS: ['First Semester', 'Second Semester', 'Summer Session'] as const,
  
  // Departments (customize based on your institution)
  DEPARTMENTS: [
    'Computer Science',
    'Information Technology',
    'Business Administration',
    'Engineering',
    'Medicine',
    'Law',
    'Education',
    'Arts',
    'Sciences'
  ] as const,
  
  // User roles
  USER_ROLES: ['admin', 'lecturer', 'student'] as const,
  
  // Attendance methods
  ATTENDANCE_METHODS: ['qr_code', 'facial_recognition', 'hybrid'] as const,
  
  // Session statuses
  SESSION_STATUSES: ['scheduled', 'active', 'completed', 'cancelled'] as const
} as const

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  VALIDATION: {
    PHONE_INVALID: 'Please enter a valid Sierra Leone phone number (+232XXXXXXXXX or XXXXXXXX)',
    EMAIL_INVALID: 'Please enter a valid email address',
    STUDENT_ID_INVALID: 'Please enter a valid student ID format',
    COURSE_CODE_INVALID: 'Please enter a valid course code format',
    REQUIRED_FIELD: 'This field is required',
    PASSWORD_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters'
  },
  
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.'
  },
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    ACCESS_DENIED: 'You do not have permission to access this resource'
  }
} as const

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out successfully',
    PASSWORD_RESET: 'Password reset instructions sent to your email'
  },
  
  DATA: {
    SAVE_SUCCESS: 'Data saved successfully',
    UPDATE_SUCCESS: 'Data updated successfully',
    DELETE_SUCCESS: 'Data deleted successfully',
    UPLOAD_SUCCESS: 'File uploaded successfully'
  },
  
  ATTENDANCE: {
    MARKED_SUCCESS: 'Attendance marked successfully',
    SESSION_CREATED: 'Attendance session created successfully',
    SESSION_UPDATED: 'Session updated successfully'
  }
} as const

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100] as const
  },
  
  // Debounce delays
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 500,
    API_CALL: 1000
  },
  
  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  
  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  }
} as const

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const CONSTANTS = {
  SIERRA_LEONE,
  VALIDATION_PATTERNS,
  FORMATTING_OPTIONS,
  COMMON_VALUES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS
} as const
