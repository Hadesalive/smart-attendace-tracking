# QR Code & Edge Function Analysis

## 🎯 Current Implementation Overview

The attendance system uses **QR codes** and **Supabase Edge Functions** for attendance marking. Here's how it currently works and what needs to be updated for section-based attendance.

---

## 📱 QR Code Components Analysis

### **1. QR Code Generation (`session-qr-code-dialog-new.tsx`)**

**Current Implementation:**
```typescript
// Generate URL that redirects to attendance page
const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
const attendanceUrl = `${baseUrl}/attend/${session.id}`;
setQrValue(attendanceUrl);
```

**✅ Status**: This is correct - QR codes point to `/attend/[sessionId]` route

### **2. QR Code Scanning (`qr-scanner.tsx`)**

**Current Implementation:**
```typescript
const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
  const result = detectedCodes[0]?.rawValue;
  if (!result) return;

  try {
    const url = new URL(result)
    const sessionId = url.searchParams.get("session_id") // ❌ Wrong approach

    // Calls edge function
    const { error: functionError } = await supabase.functions.invoke("mark-attendance", {
      body: { session_id: sessionId, student_id: userData.user.id },
    })
  }
}
```

**❌ Issues Found:**
1. **Wrong URL parsing**: Expects `session_id` as query parameter, but QR codes use `/attend/[sessionId]` format
2. **No section validation**: Directly calls edge function without section checks

### **3. Mobile QR Scanner (`mobile-qr-scanner-new.tsx`)**

**Current Implementation:**
- Generic QR scanner component
- Passes scanned data to parent component
- No specific attendance logic

**✅ Status**: This is correct - just a scanner component

---

## 🔧 Edge Function Analysis (`supabase/functions/mark-attendance/index.ts`)

### **Current Implementation:**

```typescript
// 1. Get session details
const { data: session, error: sessionError } = await supabase
  .from('attendance_sessions')
  .select('*')
  .eq('id', session_id)
  .single()

// 2. Check if student is enrolled in the course
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments') // ❌ Uses legacy enrollments table
  .select('id')
  .eq('student_id', student_id)
  .eq('course_id', session.course_id)
  .maybeSingle()

// 3. Check for duplicate attendance
const { data: existingAttendance, error: existingAttendanceError } = await supabase
  .from('attendance_records')
  .select('id')
  .eq('session_id', session_id)
  .eq('student_id', student_id)
  .maybeSingle()

// 4. Insert attendance record
const { error: insertError } = await supabase.from('attendance_records').insert({
  session_id,
  student_id,
  status: 'present',
  marked_at: new Date().toISOString(),
  method_used: 'qr_code',
})
```

**❌ Critical Issues:**
1. **Uses legacy `enrollments` table** instead of `section_enrollments`
2. **No section-based validation** - students from any section can mark attendance
3. **No section_id validation** - doesn't check if session belongs to student's section
4. **Missing session.section_id usage** - ignores the section_id column

---

## 📄 Attendance Pages Analysis

### **1. Direct Attendance Page (`app/attend/[sessionId]/page.tsx`)**

**Current Implementation:**
```typescript
// Check if user is enrolled in this course
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments') // ❌ Uses legacy enrollments table
  .select('id')
  .eq('student_id', user.id)
  .eq('course_id', session.course_id)
  .single()
```

**❌ Issues Found:**
1. **Uses legacy `enrollments` table**
2. **No section-based validation**
3. **Direct database access** instead of using edge function

### **2. Student Scan Attendance Page (`app/student/scan-attendance/page.tsx`)**

**Current Implementation:**
```typescript
// Check if user is enrolled in this course
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments') // ❌ Uses legacy enrollments table
  .select('id')
  .eq('student_id', authState.currentUser?.id)
  .eq('course_id', dbSessionData.course_id)
  .single()
```

**❌ Issues Found:**
1. **Uses legacy `enrollments` table**
2. **No section-based validation**
3. **Calls `markAttendanceSupabase`** which uses edge function (good)

---

## 🚨 Critical Security Issues

### **1. Cross-Section Attendance Marking**
- **Problem**: Students from Section A can mark attendance for sessions in Section B
- **Impact**: Data integrity issues, incorrect attendance records
- **Root Cause**: No section-based validation in attendance marking

### **2. Legacy Enrollment System**
- **Problem**: Still using `enrollments` table instead of `section_enrollments`
- **Impact**: Inconsistent with new section-based system
- **Root Cause**: Attendance logic not updated for new enrollment system

### **3. Missing Section Validation**
- **Problem**: Sessions have `section_id` but it's not being validated
- **Impact**: Students can attend sessions they shouldn't have access to
- **Root Cause**: Logic doesn't check session.section_id against student's section enrollment

---

## 🔧 Required Fixes

### **1. Update Edge Function (`supabase/functions/mark-attendance/index.ts`)**

**Current (Problematic):**
```typescript
// ❌ Uses legacy enrollments
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments')
  .select('id')
  .eq('student_id', student_id)
  .eq('course_id', session.course_id)
  .maybeSingle()
```

**Fixed (Section-Based):**
```typescript
// ✅ Use section_enrollments with section validation
const { data: enrollment, error: enrollmentError } = await supabase
  .from('section_enrollments')
  .select(`
    id,
    section_id,
    status,
    sections!inner(
      id,
      section_code
    )
  `)
  .eq('student_id', student_id)
  .eq('section_id', session.section_id) // ✅ Validate section match
  .eq('status', 'active')
  .maybeSingle()

if (!enrollment) {
  throw new Error('You are not enrolled in this section or the session is not for your section.')
}
```

### **2. Update QR Scanner (`qr-scanner.tsx`)**

**Current (Problematic):**
```typescript
// ❌ Wrong URL parsing
const url = new URL(result)
const sessionId = url.searchParams.get("session_id")
```

**Fixed (Correct URL Parsing):**
```typescript
// ✅ Extract sessionId from URL path
const url = new URL(result)
const pathParts = url.pathname.split('/')
const sessionId = pathParts[pathParts.length - 1] // Last part of path

if (!sessionId || sessionId === 'attend') {
  throw new Error("Invalid QR code. Session ID not found.")
}
```

### **3. Update Attendance Pages**

**Replace all instances of:**
```typescript
// ❌ Legacy enrollment check
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments')
  .select('id')
  .eq('student_id', user.id)
  .eq('course_id', session.course_id)
  .single()
```

**With:**
```typescript
// ✅ Section-based enrollment check
const { data: enrollment, error: enrollmentError } = await supabase
  .from('section_enrollments')
  .select(`
    id,
    section_id,
    status
  `)
  .eq('student_id', user.id)
  .eq('section_id', session.section_id)
  .eq('status', 'active')
  .single()
```

---

## 🎯 Implementation Priority

### **High Priority (Security Issues)**
1. **Update Edge Function** - Fix section-based validation
2. **Update QR Scanner** - Fix URL parsing
3. **Update Attendance Pages** - Replace enrollment checks

### **Medium Priority (Consistency)**
4. **Update Session Creation** - Include section_id in session creation
5. **Update Session Fetching** - Filter by section enrollment
6. **Update UI Components** - Add section selection

### **Low Priority (Enhancement)**
7. **Add Section Information** - Show section details in QR codes
8. **Improve Error Messages** - More specific section-related errors

---

## 🧪 Testing Strategy

### **Test Cases to Implement:**

1. **Section Validation Tests:**
   - Student from Section A tries to mark attendance for Section B session → Should fail
   - Student from Section A marks attendance for Section A session → Should succeed

2. **QR Code Tests:**
   - Scan QR code with correct session ID → Should work
   - Scan QR code with invalid format → Should show proper error

3. **Edge Function Tests:**
   - Call with valid section enrollment → Should succeed
   - Call with invalid section enrollment → Should fail with proper error

4. **Cross-Section Access Tests:**
   - Verify students can't see sessions from other sections
   - Verify students can't mark attendance for other sections

---

## 📋 Summary

The QR code and edge function system has the right architecture but needs critical updates for section-based attendance:

**✅ What's Working:**
- QR code generation points to correct URLs
- Edge function structure is good
- Mobile scanner component is fine

**❌ What Needs Fixing:**
- Edge function uses legacy `enrollments` table
- No section-based validation anywhere
- QR scanner has wrong URL parsing
- All attendance pages use legacy enrollment checks

**🎯 Next Steps:**
1. Update edge function for section-based validation
2. Fix QR scanner URL parsing
3. Update all attendance pages to use `section_enrollments`
4. Test section-based access control thoroughly

The key is to ensure that attendance marking is properly restricted to students enrolled in the specific section that the session belongs to.
