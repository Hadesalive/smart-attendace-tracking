# 🇸🇱 Sierra Leone Localization Implementation Guide

## Overview
This document outlines the systematic implementation of Sierra Leone localization across the smart attendance tracking application. All new components should follow these patterns from the start.

## ✅ Completed Components
- `components/ui/chart.tsx` - Chart tooltip number formatting
- `components/dashboard/admin-dashboard.tsx` - Date formatting
- `components/dashboard/student-dashboard.tsx` - Date and time formatting
- `lib/utils/` - All utility functions with SL defaults

## 📋 TODO: Components Requiring Localization

### High Priority (User-Facing)
- [ ] `components/dashboard/analytics-card.tsx` - Chart data, percentages
- [ ] `components/dashboard/sessions-card.tsx` - Session dates, times
- [ ] `components/dashboard/courses-card.tsx` - Course data display
- [ ] `components/dashboard/welcome-header.tsx` - Any numeric displays
- [ ] `components/dashboard/stat-card.tsx` - Statistics formatting
- [ ] `components/dashboard/stats-grid.tsx` - Grid statistics
- [ ] `components/dashboard/lecturer-dashboard-material.tsx` - All data displays

### Medium Priority (Forms & Inputs)
- [ ] `components/auth/login-form.tsx` - Phone number validation
- [ ] `components/admin/add-user-form.tsx` - Phone, email validation
- [ ] `components/admin/course-form.tsx` - Form validation messages
- [ ] `components/attendance/create-session-form.tsx` - Date/time inputs

### Low Priority (Internal/Admin)
- [ ] `components/admin/course-management.tsx` - Data tables
- [ ] `components/admin/enrollment-management.tsx` - Student data
- [ ] `components/analytics/attendance-analytics.tsx` - Chart data

## 🛠️ Implementation Patterns

### 1. Import Localization Utils
```tsx
import { 
  formatDate, 
  formatTime, 
  formatNumber, 
  formatCurrency, 
  formatPercentage,
  formatPhoneNumber,
  isValidPhone,
  SIERRA_LEONE 
} from "@/lib/utils"
```

### 2. Replace Native Formatting

#### ❌ Before (Native JavaScript)
```tsx
// Date formatting
{new Date(session.date).toLocaleDateString()}
{new Date(session.date).toLocaleTimeString()}

// Number formatting
{value.toLocaleString()}
{attendance.toFixed(1)}%

// Currency (if any)
{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
```

#### ✅ After (Sierra Leone Utils)
```tsx
// Date formatting
{formatDate(session.date)}
{formatTime(session.date)}

// Number formatting
{formatNumber(value)}
{formatPercentage(attendance / 100)}

// Currency
{formatCurrency(amount)}
```

### 3. Phone Number Handling

#### ❌ Before
```tsx
// Basic phone display
{user.phone}

// Basic validation
const isValid = phone.length >= 10
```

#### ✅ After
```tsx
// Formatted phone display
{formatPhoneNumber(user.phone)}

// Sierra Leone validation
const isValid = isValidPhone(phone, 'SL')
```

### 4. Form Validation Messages

#### ❌ Before
```tsx
const validatePhone = (phone: string) => {
  if (phone.length < 10) {
    return "Please enter a valid phone number"
  }
}
```

#### ✅ After
```tsx
import { ERROR_MESSAGES, isValidPhone } from "@/lib/utils"

const validatePhone = (phone: string) => {
  if (!isValidPhone(phone, 'SL')) {
    return ERROR_MESSAGES.VALIDATION.PHONE_INVALID
  }
}
```

### 5. Constants Usage

#### ❌ Before
```tsx
const CURRENCY = 'USD'
const LOCALE = 'en-US'
const PHONE_CODE = '+1'
```

#### ✅ After
```tsx
import { SIERRA_LEONE } from "@/lib/utils"

const CURRENCY = SIERRA_LEONE.CURRENCY_CODE // 'NLe'
const LOCALE = SIERRA_LEONE.LOCALE // 'en-SL'
const PHONE_CODE = SIERRA_LEONE.PHONE_CODE // '+232'
```

## 📊 Component-Specific Implementation

### Dashboard Cards
```tsx
// Statistics display
<div className="text-2xl font-bold">
  {formatNumber(stats.totalUsers)}
</div>

// Percentage display
<div className="text-sm text-muted-foreground">
  {formatPercentage(stats.attendanceRate / 100)}%
</div>

// Date display
<div className="text-sm">
  {formatDate(session.session_date)}
</div>
```

### Data Tables
```tsx
<TableCell>
  {formatDate(record.created_at)}
</TableCell>
<TableCell>
  {formatPhoneNumber(student.phone)}
</TableCell>
<TableCell>
  {formatNumber(attendance.count)}
</TableCell>
```

### Charts and Analytics
```tsx
// Chart data formatting
const chartData = data.map(item => ({
  ...item,
  value: formatNumber(item.value),
  date: formatDate(item.date)
}))

// Tooltip formatting
const formatter = (value: number) => formatNumber(value)
```

### Forms
```tsx
// Input validation
const validateForm = (data: FormData) => {
  const errors: string[] = []
  
  if (!isValidPhone(data.phone, 'SL')) {
    errors.push(ERROR_MESSAGES.VALIDATION.PHONE_INVALID)
  }
  
  if (!isValidEmail(data.email)) {
    errors.push(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID)
  }
  
  return errors
}
```

## 🎯 Implementation Checklist

For each component:

### Phase 1: Analysis
- [ ] Identify all date/time displays
- [ ] Find number/percentage formatting
- [ ] Locate phone number fields
- [ ] Check for currency displays
- [ ] Review validation messages

### Phase 2: Implementation
- [ ] Add utility imports
- [ ] Replace native formatting calls
- [ ] Update validation logic
- [ ] Use Sierra Leone constants
- [ ] Test with sample data

### Phase 3: Testing
- [ ] Verify date formats (DD/MM/YYYY)
- [ ] Check number formatting (1,234.56)
- [ ] Test phone validation (+232 format)
- [ ] Confirm currency display (Le1,234.56)
- [ ] Validate error messages

## 🔧 Development Guidelines

### New Components
1. **Always import utilities** at the top
2. **Use Sierra Leone defaults** for all formatting
3. **Implement validation** with SL patterns
4. **Follow naming conventions** for consistency

### Code Review Checklist
- [ ] No native `toLocaleString()` calls
- [ ] No hardcoded currency codes
- [ ] Phone validation uses `isValidPhone('SL')`
- [ ] Error messages use `ERROR_MESSAGES` constants
- [ ] All dates use `formatDate()`

## 📱 Mobile Considerations

### Responsive Formatting
```tsx
// Mobile-friendly number display
<div className="text-sm sm:text-base">
  {formatNumber(value)}
</div>

// Compact date format for small screens
<div className="text-xs sm:text-sm">
  {formatDate(date, { format: 'short' })}
</div>
```

### Touch-Friendly Phone Input
```tsx
<input
  type="tel"
  placeholder={SIERRA_LEONE.PHONE_FORMATS.LOCAL}
  onChange={(e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }}
/>
```

## 🚀 Future Enhancements

### Planned Features
- [ ] RTL support for Arabic (if needed)
- [ ] Timezone handling for international students
- [ ] Multi-language error messages
- [ ] Custom date format preferences
- [ ] Accessibility improvements for screen readers

### Performance Optimizations
- [ ] Memoize formatted values
- [ ] Lazy load locale data
- [ ] Cache validation results
- [ ] Optimize chart formatting

## 📝 Notes

### Sierra Leone Standards
- **Currency**: NLe (New Leone)
- **Phone**: +232 XX XXX XXXX or XX XXX XXXX
- **Date**: DD/MM/YYYY format
- **Numbers**: Comma-separated thousands
- **Locale**: en-SL (English Sierra Leone)

### Common Pitfalls
1. **Don't mix** native and utility formatting
2. **Always validate** phone numbers with SL patterns
3. **Use constants** instead of hardcoded values
4. **Test edge cases** (empty values, invalid data)
5. **Consider performance** for large datasets

---

## 🎯 Next Steps

1. **Start with high-priority components** (dashboard cards)
2. **Test thoroughly** with real data
3. **Update documentation** as you go
4. **Share patterns** with team members
5. **Monitor performance** impact

**Remember**: Every new component should follow these patterns from day one!
