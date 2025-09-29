# Attendance System Update Plan

## 🎯 Current Status

✅ **Database Schema**: `section_id` column already exists in `attendance_sessions` table  
❌ **Session Creation**: Not using `section_id` when creating sessions  
❌ **Attendance Marking**: Still using legacy `enrollments` table instead of `section_enrollments`  
❌ **Session Fetching**: No section-based filtering for students  

---

## 🔧 Required Updates

### **1. Update Session Creation Logic**

**Current Issue**: Sessions are created without `section_id`
**Location**: `lib/domains/attendance/actions.ts` (line 60-71)

**Current Code**:
```typescript
const { error } = await supabase.from('attendance_sessions').insert({
  course_id: validatedFields.data.course_id,
  session_name: validatedFields.data.session_name,
  // ... other fields
  // ❌ Missing section_id
});
```

**Fix Required**:
1. Add `section_id` to session creation schema
2. Update session creation form to include section selection
3. Validate lecturer is assigned to the selected section

### **2. Update Attendance Marking Logic**

**Current Issue**: Uses legacy `enrollments` table
**Locations**: 
- `app/attend/[sessionId]/page.tsx` (line 142-146)
- `supabase/functions/mark-attendance/index.ts` (line 54-59)

**Current Code**:
```typescript
// ❌ Using legacy enrollments table
const { data: enrollment, error: enrollmentError } = await supabase
  .from('enrollments')
  .select('id')
  .eq('student_id', user.id)
  .eq('course_id', session.course_id)
  .single()
```

**Fix Required**:
1. Replace `enrollments` with `section_enrollments` table
2. Add section-based validation
3. Ensure student is enrolled in the session's section

### **3. Update Session Fetching Logic**

**Current Issue**: Shows all sessions regardless of section enrollment
**Location**: `lib/domains/attendance/hooks.ts`

**Current Code**:
```typescript
// ❌ No section filtering
const { data, error } = await supabase
  .from('attendance_sessions')
  .select(`*,
    courses!attendance_sessions_course_id_fkey(course_code, course_name),
    users!attendance_sessions_lecturer_id_fkey(full_name)
  `)
  .order('session_date', { ascending: false })
```

**Fix Required**:
1. Filter sessions by student's section enrollment
2. Only show sessions for sections student is enrolled in
3. Add section information to session display

### **4. Update UI Components**

**Current Issue**: No section selection in session creation
**Location**: `components/attendance/session-creation-modal-new.tsx`

**Fix Required**:
1. Add section selection dropdown
2. Filter sections by lecturer's assignments
3. Show section information in session display

---

## 🚀 Implementation Steps

### **Step 1: Update Session Creation Schema**

```typescript
// Update session schema to include section_id
const sessionSchema = z.object({
  course_id: z.string(),
  section_id: z.string(), // ✅ Add section_id
  session_name: z.string(),
  session_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  attendance_method: z.enum(["qr_code", "facial_recognition", "hybrid"]),
  lecturer_id: z.string(),
  location: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
});
```

### **Step 2: Update Session Creation Logic**

```typescript
// Include section_id in session creation
const { error } = await supabase.from('attendance_sessions').insert({
  course_id: validatedFields.data.course_id,
  section_id: validatedFields.data.section_id, // ✅ Add section_id
  session_name: validatedFields.data.session_name,
  // ... other fields
});
```

### **Step 3: Update Attendance Marking Logic**

```typescript
// Replace enrollments with section_enrollments
const { data: enrollment, error: enrollmentError } = await supabase
  .from('section_enrollments') // ✅ Use section_enrollments
  .select(`
    id,
    section_id,
    status
  `)
  .eq('student_id', user.id)
  .eq('section_id', session.section_id) // ✅ Check section enrollment
  .eq('status', 'active')
  .single()
```

### **Step 4: Update Session Fetching Logic**

```typescript
// Filter sessions by student's section enrollment
const fetchAttendanceSessions = useCallback(async (studentId: string) => {
  // First, get student's section enrollments
  const { data: sectionEnrollments } = await supabase
    .from('section_enrollments')
    .select('section_id')
    .eq('student_id', studentId)
    .eq('status', 'active')

  const sectionIds = sectionEnrollments?.map(se => se.section_id) || []

  if (sectionIds.length === 0) {
    return [] // No sections enrolled
  }

  // Then, fetch sessions for those sections
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select(`
      *,
      courses!attendance_sessions_course_id_fkey(course_code, course_name),
      users!attendance_sessions_lecturer_id_fkey(full_name),
      sections!attendance_sessions_section_id_fkey(section_code, program_id)
    `)
    .in('section_id', sectionIds) // ✅ Filter by section enrollment
    .order('session_date', { ascending: false })
})
```

### **Step 5: Update UI Components**

```typescript
// Add section selection to session creation form
const [selectedSection, setSelectedSection] = useState<string>('')

// Fetch sections for the selected course and lecturer
const { data: sections } = await supabase
  .from('lecturer_assignments')
  .select(`
    section_id,
    sections!inner(
      id,
      section_code,
      program_id
    )
  `)
  .eq('lecturer_id', lecturerId)
  .eq('course_id', selectedCourse.id)
```

---

## 🎯 Expected Outcomes

After implementation:

✅ **Section-based sessions** - Sessions are created for specific sections  
✅ **Proper enrollment validation** - Students can only mark attendance for their sections  
✅ **Filtered session display** - Students only see sessions for their enrolled sections  
✅ **Lecturer restrictions** - Lecturers can only create sessions for their assigned sections  
✅ **Data integrity** - No cross-section data leakage  
✅ **Consistent architecture** - Aligns with section-based enrollment system  

---

## 📋 Implementation Priority

1. **High Priority**: Update attendance marking logic (security issue)
2. **High Priority**: Update session creation to include section_id
3. **Medium Priority**: Update session fetching with section filtering
4. **Medium Priority**: Update UI components for section selection
5. **Low Priority**: Add section information to session display

---

## 🧪 Testing Strategy

1. **Test session creation** with section_id
2. **Test attendance marking** with section-based validation
3. **Test session filtering** by section enrollment
4. **Test cross-section access** (should be blocked)
5. **Test lecturer permissions** for section-specific sessions

The key is to ensure that the attendance system works seamlessly with our section-based enrollment system while maintaining proper access control and data integrity.
