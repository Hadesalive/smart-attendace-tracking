// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Formats a number with proper thousand separators
 * 
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'en-SL')
 * @returns Formatted number string
 * 
 * @example
 * ```tsx
 * formatNumber(1234567) // '1,234,567'
 * formatNumber(1234.56) // '1,234.56'
 * ```
 */
export function formatNumber(num: number, locale: string = 'en-SL'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Formats a number as currency
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'NLe')
 * @param locale - Locale for formatting (default: 'en-SL')
 * @returns Formatted currency string
 * 
 * @example
 * ```tsx
 * formatCurrency(1234.56) // 'Le1,234.56'
 * formatCurrency(1234.56, 'NLe', 'en-SL') // 'Le1,234.56'
 * ```
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'NLe', 
  locale: string = 'en-SL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Formats a number as a percentage
 * 
 * @param value - Value to format (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param locale - Locale for formatting (default: 'en-SL')
 * @returns Formatted percentage string
 * 
 * @example
 * ```tsx
 * formatPercentage(0.1234) // '12.3%'
 * formatPercentage(85.67, 0) // '86%'
 * ```
 */
export function formatPercentage(
  value: number, 
  decimals: number = 1, 
  locale: string = 'en-SL'
): string {
  const percentage = value > 1 ? value / 100 : value
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(percentage)
}

/**
 * Truncates text to a specified length
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 * 
 * @example
 * ```tsx
 * truncateText('Hello world', 5) // 'Hello...'
 * truncateText('Short', 10) // 'Short'
 * ```
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 * 
 * @example
 * ```tsx
 * capitalize('hello world') // 'Hello world'
 * capitalize('HELLO') // 'HELLO'
 * ```
 */
export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Converts a string to title case
 * 
 * @param text - Text to convert
 * @returns Title case text
 * 
 * @example
 * ```tsx
 * toTitleCase('hello world') // 'Hello World'
 * toTitleCase('HELLO WORLD') // 'Hello World'
 * ```
 */
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Formats a file size in human-readable format
 * 
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size
 * 
 * @example
 * ```tsx
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * Formats a phone number
 * 
 * @param phone - Phone number string
 * @param format - Format type (default: 'SL')
 * @returns Formatted phone number
 * 
 * @example
 * ```tsx
 * formatPhoneNumber('23212345678') // '+232 12 345 678'
 * formatPhoneNumber('+23212345678') // '+232 12 345 678'
 * ```
 */
export function formatPhoneNumber(phone: string, format: 'SL' | 'INTERNATIONAL' = 'SL'): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (format === 'SL') {
    if (cleaned.length === 11 && cleaned.startsWith('232')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
    if (cleaned.length === 8) {
      return `+232 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
    }
  }
  
  if (format === 'INTERNATIONAL') {
    if (cleaned.length === 11 && cleaned.startsWith('232')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    }
  }
  
  return phone
}

/**
 * Formats a name with proper capitalization
 * 
 * @param name - Name to format
 * @returns Formatted name
 * 
 * @example
 * ```tsx
 * formatName('john doe') // 'John Doe'
 * formatName('MARY JANE SMITH') // 'Mary Jane Smith'
 * ```
 */
export function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Formats seconds into MM:SS format
 * 
 * @param sec - Number of seconds
 * @returns Formatted time string (MM:SS)
 * 
 * @example
 * ```tsx
 * formatSeconds(90) // '01:30'
 * formatSeconds(3661) // '61:01'
 * ```
 */
export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Exports data rows to CSV format and triggers download
 * 
 * @param headers - Array of column headers
 * @param rows - Array of data rows (each row is an array of values)
 * @param filename - Name of the file to download
 * 
 * @example
 * ```tsx
 * const headers = ['Name', 'Age', 'City']
 * const rows = [['John', 25, 'New York'], ['Jane', 30, 'Boston']]
 * exportRowsToCsv(headers, rows, 'data.csv')
 * ```
 */
export function exportRowsToCsv(
  headers: string[], 
  rows: (string | number)[][], 
  filename: string
): void {
  const csv = [headers, ...rows]
    .map(r => r.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
