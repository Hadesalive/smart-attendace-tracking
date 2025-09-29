# Section-Based Filtering Implementation

## 🎯 Overview

This document explains the implementation of **section-based filtering** for lecturer assignments in the student courses system. The goal is to ensure that:

- **Students** can only see lecturers who are assigned to their specific section
- **Lecturers** can only see students who are enrolled in sections they're assigned to

This mirrors the existing lecturer logic and ensures proper data isolation between different sections.

---

## 🔄 How It Works

### **Before (No Section Filtering)**
```typescript
// Students could see ALL lecturers assigned to a course
const lecturerAssignments = await this.getLecturerAssignmentsByCourseIds(courseIds)
// ❌ No section filtering - shows all lecturers
```

### **After (Section-Based Filtering)**
```typescript
// Step 1: Get student's section enrollment
const studentSectionEnrollment = await this.getStudentSectionEnrollment(studentId)

// Step 2: Filter lecturer assignments by student's section
const lecturerAssignments = await this.getLecturerAssignmentsByCourseAndSection(
  courseIds, 
  studentSectionEnrollment.section_id
)
// ✅ Only shows lecturers assigned to student's specific section
```

---

## 🏗️ Implementation Details

### **1. Student Section Enrollment Lookup**
```typescript
private async getStudentSectionEnrollment(studentId: string): Promise<any | null> {
  const { data, error } = await this.supabase
    .from('section_enrollments')
    .select(`
      id,
      student_id,
      section_id,
      status,
      sections!inner(
        id,
        section_code,
        program_id,
        academic_year_id,
        semester_id
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()

  return data
}
```

**Key Points:**
- Only gets **active** section enrollments
- Joins with `sections` table to get section details
- Uses `maybeSingle()` to handle cases where no enrollment exists

### **2. Section-Filtered Lecturer Assignments**
```typescript
private async getLecturerAssignmentsByCourseAndSection(
  courseIds: string[], 
  sectionId: string
): Promise<LecturerAssignment[]> {
  let query = this.supabase
    .from('lecturer_assignments')
    .select(`
      id,
      course_id,
      lecturer_id,
      academic_year_id,
      semester_id,
      program_id,
      section_id,
      teaching_hours_per_week,
      start_date,
      end_date
    `)
    .eq('section_id', sectionId)  // 🔑 Key filter: by section
  
  // Filter by course IDs
  if (courseIds.length === 1) {
    query = query.eq('course_id', courseIds[0])
  } else {
    const orConditions = courseIds.map(id => `course_id.eq.${id}`).join(',')
    query = query.or(orConditions)
  }

  return data || []
}
```

**Key Points:**
- **Primary filter**: `eq('section_id', sectionId)` - only lecturers assigned to student's section
- **Secondary filter**: By course IDs - only for courses the student is enrolled in
- Handles both single and multiple course IDs efficiently

### **3. Updated Data Flow**
```typescript
// OLD: getLecturerAssignmentsWithProfiles(courseIds)
// NEW: getLecturerAssignmentsWithProfiles(courseIds, studentId)

private async getLecturerAssignmentsWithProfiles(
  courseIds: string[], 
  studentId: string  // 🔑 Added student ID for section lookup
): Promise<any[]> {
  // Step 1: Get student's section enrollment
  const studentSectionEnrollment = await this.getStudentSectionEnrollment(studentId)
  
  // Step 2: Filter lecturer assignments by section
  const lecturerAssignments = await this.getLecturerAssignmentsByCourseAndSection(
    courseIds, 
    studentSectionEnrollment.section_id
  )
  
  // Step 3: Get lecturer profiles and combine data
  // ...
}
```

---

## 🔍 Debugging & Logging

### **Console Logs Added**
```typescript
console.log('Student section enrollment:', {
  studentId,
  sectionId: studentSectionEnrollment.section_id,
  sectionCode: studentSectionEnrollment.sections?.section_code
})

console.log('Filtered lecturer assignments for section:', {
  sectionId: studentSectionEnrollment.section_id,
  courseIds,
  assignmentsFound: lecturerAssignments.length,
  assignments: lecturerAssignments.map(la => ({ 
    course_id: la.course_id, 
    lecturer_id: la.lecturer_id 
  }))
})
```

### **What to Look For**
1. **Student Section Enrollment**: Check if student has an active section enrollment
2. **Section ID**: Verify the correct section ID is being used for filtering
3. **Filtered Results**: See how many lecturer assignments match the student's section
4. **Instructor Names**: Verify that only section-assigned lecturers appear as instructors

---

## 🧪 Testing

### **Test Page Created**
- **File**: `app/student/courses/page-section-filtered.tsx`
- **Purpose**: Demonstrate section-based filtering in action
- **Features**: 
  - Shows courses with section-filtered instructors
  - Debug information panel
  - Clear indication when instructors are "TBA" vs assigned

### **Expected Behavior**
1. **Student in Section A**: Only sees lecturers assigned to Section A
2. **Student in Section B**: Only sees lecturers assigned to Section B
3. **Student with no section enrollment**: Sees no instructors (all "TBA")
4. **Lecturer assigned to Section A**: Only sees students enrolled in Section A

---

## 🔗 Database Schema Dependencies

### **Required Tables**
```sql
-- Student section enrollment
section_enrollments (
  student_id,
  section_id,
  status
)

-- Lecturer assignments (with section filtering)
lecturer_assignments (
  course_id,
  lecturer_id,
  section_id,  -- 🔑 Key field for filtering
  program_id,
  academic_year_id,
  semester_id
)

-- Sections table
sections (
  id,
  section_code,
  program_id,
  academic_year_id,
  semester_id
)
```

### **Key Relationships**
- `section_enrollments.section_id` → `sections.id`
- `lecturer_assignments.section_id` → `sections.id`
- `section_enrollments.student_id` → `users.id`
- `lecturer_assignments.lecturer_id` → `users.id`

---

## 🚀 Benefits

### **1. Data Isolation**
- Students only see relevant lecturers for their section
- Prevents confusion from seeing lecturers from other sections
- Maintains academic structure integrity

### **2. Performance**
- Reduces data transfer by filtering at the database level
- Fewer lecturer profiles to fetch and process
- More efficient queries with proper indexing

### **3. Security**
- Enforces section-based access control
- Prevents unauthorized access to other sections' data
- Maintains proper academic boundaries

### **4. User Experience**
- Clear, relevant instructor information
- No confusion about which lecturer to contact
- Proper section-based course management

---

## 🔧 Maintenance

### **When to Update**
- When section enrollment logic changes
- When lecturer assignment structure changes
- When new filtering requirements are added

### **Monitoring**
- Check console logs for section filtering effectiveness
- Monitor "TBA" instructor counts (should decrease with proper assignments)
- Verify section enrollment data integrity

---

## 📝 Summary

The section-based filtering implementation ensures that students only see lecturers who are assigned to their specific section, mirroring the existing lecturer logic. This provides:

✅ **Proper data isolation** between sections  
✅ **Improved performance** with targeted queries  
✅ **Better user experience** with relevant instructor information  
✅ **Enhanced security** with section-based access control  

The implementation is robust, well-logged, and follows the existing patterns in the codebase.
