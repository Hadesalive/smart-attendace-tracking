# 🎯 **COURSES PAGES REFACTORING PROMPT**

## **📋 OVERVIEW**
Refactor the admin and student courses pages to match the current academic page logic and implement program-based course access. Students should get access to courses based on their enrolled program and semester, regardless of section.

## **🔍 CURRENT ISSUES IDENTIFIED**

### **1. Admin Courses Page (`app/admin/courses/page.tsx`)**
- ❌ Missing advanced filtering (FilterBar component)
- ❌ Missing program assignment data integration
- ❌ Missing course assignment statistics
- ❌ Missing lecturer assignment tracking
- ❌ Basic search only (no program-based filtering)

### **2. Student Courses Page (`app/student/courses/page.tsx`)**
- ❌ Uses hardcoded mock data instead of real database data
- ❌ Missing program-based course access logic
- ❌ Missing section-based enrollment integration
- ❌ Missing academic structure integration
- ❌ Basic search only (no advanced filtering)

## **🎯 TARGET ARCHITECTURE**

### **Program-Based Course Access Logic:**
```typescript
// Students get access to courses based on:
1. Their enrolled program (e.g., "BSEM - Bachelor of Software Engineering")
2. Their current semester (e.g., "Semester 1")
3. Their academic year (e.g., "2024-2025")

// Course access is determined by:
- Course assignments to their program
- Course assignments to their semester
- Course assignments to their academic year
- NOT by specific section enrollment
```

### **Data Flow:**
```
Student Profile → Program → Semester → Academic Year → Course Assignments → Available Courses
```

## **🛠️ REQUIRED CHANGES**

### **Phase 1: Admin Courses Page Refactoring**

#### **1.1 Add Advanced Filtering**
```typescript
// Add FilterBar component with these filters:
const courseFilters = {
  assignmentStatus: 'all', // assigned, unassigned
  lecturerStatus: 'all',   // assigned, unassigned
  department: 'all',       // specific department
  program: 'all',          // specific program
  academicYear: 'all',     // specific academic year
  semester: 'all'          // specific semester
}
```

#### **1.2 Integrate Program Assignment Data**
```typescript
// Add these statistics:
const stats = {
  totalCourses: state.courses.length,
  activeCourses: state.courses.filter(c => c.is_active).length,
  programAssignedCourses: state.courseAssignments.length,
  unassignedCourses: state.courses.length - state.courseAssignments.length,
  lecturerAssignedCourses: state.courses.filter(c => c.lecturer_id).length,
  unassignedLecturers: state.courses.filter(c => !c.lecturer_id).length
}
```

#### **1.3 Update Table Columns**
```typescript
// Add these columns:
- Program Assignments (show assigned programs)
- Lecturer Status (assigned/unassigned)
- Assignment Status (assigned to programs/unassigned)
- Department
- Academic Year
- Semester
```

#### **1.4 Add FilterBar Component**
```typescript
<FilterBar
  fields={[
    { 
      type: 'native-select', 
      label: 'Assignment Status', 
      value: filters.assignmentStatus, 
      onChange: (v) => setFilters(prev => ({ ...prev, assignmentStatus: v })), 
      options: [
        { value: 'all', label: 'All Courses' },
        { value: 'assigned', label: 'Assigned to Programs' },
        { value: 'unassigned', label: 'Not Assigned' }
      ], 
      span: 2 
    },
    { 
      type: 'native-select', 
      label: 'Lecturer Status', 
      value: filters.lecturerStatus, 
      onChange: (v) => setFilters(prev => ({ ...prev, lecturerStatus: v })), 
      options: [
        { value: 'all', label: 'All Lecturers' },
        { value: 'assigned', label: 'Has Lecturer' },
        { value: 'unassigned', label: 'No Lecturer' }
      ], 
      span: 2 
    },
    { 
      type: 'native-select', 
      label: 'Faculty/Department', 
      value: filters.department, 
      onChange: (v) => setFilters(prev => ({ ...prev, department: v })), 
      options: [
        { value: 'all', label: 'All Faculties' },
        ...academicData.departments.map(dept => ({ value: dept.department_name, label: dept.department_name }))
      ], 
      span: 3 
    },
    { 
      type: 'native-select', 
      label: 'Program', 
      value: filters.program, 
      onChange: (v) => setFilters(prev => ({ ...prev, program: v })), 
      options: [
        { value: 'all', label: 'All Programs' },
        ...academicData.programs.map(program => ({ value: program.id, label: program.program_name }))
      ], 
      span: 3 
    }
  ]}
/>
```

### **Phase 2: Student Courses Page Refactoring**

#### **2.1 Replace Mock Data with Real Database Data**
```typescript
// Remove hardcoded mock data and use real data:
const courses = useMemo(() => {
  // Get student's program and semester from their profile
  const studentProfile = state.studentProfiles.find(profile => profile.user_id === studentId)
  if (!studentProfile) return []
  
  // Get student's section enrollment
  const sectionEnrollment = state.sectionEnrollments.find(enrollment => 
    enrollment.student_id === studentId && enrollment.status === 'active'
  )
  if (!sectionEnrollment) return []
  
  // Get section details
  const section = state.sections.find(s => s.id === sectionEnrollment.section_id)
  if (!section) return []
  
  // Get courses assigned to the student's program and semester
  const programCourses = state.courseAssignments
    .filter(assignment => 
      assignment.program_id === section.program_id &&
      assignment.semester_id === section.semester_id &&
      assignment.academic_year_id === section.academic_year_id
    )
    .map(assignment => {
      const course = state.courses.find(c => c.id === assignment.course_id)
      if (!course) return null
      
      // Calculate course-specific stats
      const assignments = getAssignmentsByCourse(course.id)
      const submittedAssignments = assignments.filter((assignment: Assignment) => {
        const submissions = getSubmissionsByAssignment(assignment.id)
        return submissions.some((s: Submission) => s.student_id === studentId)
      }).length
      
      // Calculate attendance rate
      let totalSessions = 0
      let presentSessions = 0
      const courseSessions = getAttendanceSessionsByCourse(course.id)
      courseSessions.forEach(session => {
        const records = getAttendanceRecordsBySession(session.id)
        const studentRecord = records.find(r => r.student_id === studentId)
        if (studentRecord) {
          totalSessions++
          if (studentRecord.status === 'present') presentSessions++
        }
      })
      
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0
      
      // Calculate average grade
      const grades = getStudentGradesByCourse(course.id, studentId)
      const averageGrade = grades.length > 0 
        ? Math.round(grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length)
        : 0
      
      // Calculate progress
      const progress = assignments.length > 0 ? Math.round((submittedAssignments / assignments.length) * 100) : 0
      
      return {
        ...course,
        instructor: course.lecturer_name || 'TBA',
        semester: `${section.academic_year} - ${section.semester_name}`,
        status: 'active',
        attendanceRate,
        averageGrade,
        materialsCount: state.materials.filter(m => m.course_id === course.id).length,
        totalAssignments: assignments.length,
        submittedAssignments,
        progress,
        description: course.description || 'No description available',
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'], // This should come from course schedule data
          time: '10:00 - 11:30', // This should come from course schedule data
          location: 'Room 101' // This should come from course schedule data
        },
        nextSession: {
          title: 'Next Session', // This should come from course schedule data
          date: new Date().toISOString(),
          time: '10:00 - 11:30'
        }
      }
    })
    .filter(Boolean)
  
  return programCourses
}, [state.courses, state.courseAssignments, state.sections, state.sectionEnrollments, state.studentProfiles, state.materials, studentId, getAssignmentsByCourse, getSubmissionsByAssignment, getAttendanceSessionsByCourse, getAttendanceRecordsBySession, getStudentGradesByCourse])
```

#### **2.2 Add Advanced Filtering**
```typescript
// Add FilterBar component with these filters:
const courseFilters = {
  department: 'all',       // specific department
  program: 'all',          // specific program
  academicYear: 'all',     // specific academic year
  semester: 'all',         // specific semester
  status: 'all',           // active, completed, dropped
  grade: 'all'             // grade range
}
```

#### **2.3 Update Statistics**
```typescript
// Update stats to reflect real data:
const stats = useMemo(() => {
  const activeCourses = courses.filter(c => c.status === 'active').length
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0)
  const overallAttendanceRate = courses.length > 0 
    ? courses.reduce((sum, c) => sum + c.attendanceRate, 0) / courses.length : 0
  const overallGrade = courses.length > 0
    ? courses.reduce((sum, c) => sum + c.averageGrade, 0) / courses.length : 0

  return { activeCourses, totalCredits, overallAttendanceRate, overallGrade }
}, [courses])
```

### **Phase 3: Data Integration**

#### **3.1 Update DataContext Integration**
```typescript
// Ensure both pages use the same data sources:
const { state } = useDataContext()
const { academicData } = useAcademicStructure()

// Merge data for consistency:
const mergedState = {
  ...state,
  ...academicData,
  courses: state.courses,
  courseAssignments: state.courseAssignments,
  sections: academicData.sections,
  sectionEnrollments: academicData.sectionEnrollments,
  programs: academicData.programs,
  departments: academicData.departments,
  academicYears: academicData.academicYears,
  semesters: academicData.semesters
}
```

#### **3.2 Add Program-Based Navigation**
```typescript
// Add navigation based on program:
const programNavigation = useMemo(() => {
  const studentProfile = state.studentProfiles.find(profile => profile.user_id === studentId)
  if (!studentProfile) return null
  
  const sectionEnrollment = state.sectionEnrollments.find(enrollment => 
    enrollment.student_id === studentId && enrollment.status === 'active'
  )
  if (!sectionEnrollment) return null
  
  const section = state.sections.find(s => s.id === sectionEnrollment.section_id)
  if (!section) return null
  
  return {
    program: section.program_name,
    programCode: section.program_code,
    semester: section.semester_name,
    academicYear: section.academic_year,
    year: section.year
  }
}, [state.studentProfiles, state.sectionEnrollments, state.sections, studentId])
```

## **🎨 UI COMPONENTS TO ADD**

### **1. FilterBar Component**
```typescript
// Add to both pages:
import FilterBar from '@/components/admin/FilterBar'

<FilterBar
  fields={[
    // Filter fields based on page requirements
  ]}
/>
```

### **2. Enhanced Search**
```typescript
// Add to both pages:
<SearchFilters
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search courses..."
  filters={[
    // Filter options based on page requirements
  ]}
/>
```

### **3. Program Status Indicators**
```typescript
// Add to admin page:
const getAssignmentStatus = (course: Course) => {
  const isAssigned = state.courseAssignments.some(assignment => assignment.course_id === course.id)
  return isAssigned ? 'Assigned' : 'Unassigned'
}

const getLecturerStatus = (course: Course) => {
  return course.lecturer_id ? 'Assigned' : 'Unassigned'
}
```

## **🔧 IMPLEMENTATION STEPS**

### **Step 1: Admin Courses Page**
1. Add FilterBar component
2. Integrate program assignment data
3. Add course assignment statistics
4. Update table columns
5. Add advanced filtering logic

### **Step 2: Student Courses Page**
1. Replace mock data with real database data
2. Implement program-based course access
3. Add FilterBar component
4. Update statistics calculation
5. Add program-based navigation

### **Step 3: Data Integration**
1. Ensure consistent data sources
2. Add program-based filtering
3. Implement section-based enrollment
4. Add academic structure integration

### **Step 4: Testing**
1. Test program-based course access
2. Test filtering functionality
3. Test data consistency
4. Test responsive design

## **📋 VALIDATION CHECKLIST**

### **Admin Courses Page:**
- [ ] FilterBar component integrated
- [ ] Program assignment data displayed
- [ ] Course assignment statistics working
- [ ] Advanced filtering functional
- [ ] Table columns updated
- [ ] Data consistency verified

### **Student Courses Page:**
- [ ] Mock data replaced with real data
- [ ] Program-based course access working
- [ ] FilterBar component integrated
- [ ] Statistics calculation correct
- [ ] Program-based navigation working
- [ ] Section-based enrollment integrated

### **Overall:**
- [ ] Both pages use same data sources
- [ ] Filtering logic consistent
- [ ] UI components standardized
- [ ] Program-based logic implemented
- [ ] Responsive design maintained

## **🚨 CRITICAL REQUIREMENTS**

1. **Program-Based Access:** Students must get access to courses based on their enrolled program and semester, NOT by section
2. **Data Consistency:** Both pages must use the same data sources and filtering logic
3. **Real Data:** Student page must use real database data, not mock data
4. **Advanced Filtering:** Both pages must have FilterBar component with program-based filters
5. **Academic Integration:** Both pages must integrate with the academic structure (programs, semesters, academic years)

## **💡 EXAMPLE IMPLEMENTATION**

### **Student Course Access Logic:**
```typescript
// Student enrolled in BSEM Semester 1 gets access to:
// - All courses assigned to BSEM program
// - All courses assigned to Semester 1
// - All courses assigned to current academic year
// - Regardless of which section they're in (A, B, C, etc.)

const studentCourses = state.courseAssignments
  .filter(assignment => 
    assignment.program_id === studentProgramId &&
    assignment.semester_id === studentSemesterId &&
    assignment.academic_year_id === studentAcademicYearId
  )
  .map(assignment => state.courses.find(c => c.id === assignment.course_id))
  .filter(Boolean)
```

This ensures students get access to all courses relevant to their program and semester, regardless of their specific section enrollment.

## **🔗 FILES TO MODIFY**

### **Primary Files:**
1. `app/admin/courses/page.tsx` - Admin courses page
2. `app/student/courses/page.tsx` - Student courses page

### **Supporting Files:**
1. `components/admin/FilterBar.tsx` - FilterBar component
2. `components/admin/SearchFilters.tsx` - Search filters component
3. `lib/domains/courses/hooks.ts` - Course data hooks
4. `lib/domains/academic/hooks.ts` - Academic data hooks
5. `lib/domains/auth/hooks.ts` - Authentication hooks

### **Data Context:**
1. `lib/contexts/DataContext.tsx` - Main data context
2. `lib/domains/academic/types.ts` - Academic data types
3. `lib/types/shared.ts` - Shared type definitions

## **📊 EXPECTED OUTCOMES**

### **After Refactoring:**
1. **Consistent Data:** Both pages use the same data sources and filtering logic
2. **Program-Based Access:** Students get courses based on their program and semester
3. **Advanced Filtering:** Both pages have comprehensive filtering options
4. **Real Data Integration:** Student page uses real database data
5. **Academic Integration:** Both pages integrate with academic structure
6. **Responsive Design:** Both pages maintain responsive design
7. **Performance:** Both pages are optimized for performance

### **User Experience:**
1. **Admin:** Can easily filter and manage courses by program, department, and assignment status
2. **Student:** Can see all courses relevant to their program and semester
3. **Consistency:** Both pages have similar UI patterns and functionality
4. **Efficiency:** Both pages load quickly and provide smooth user experience

This refactoring will ensure that the courses pages match the academic page logic and provide a consistent, efficient user experience for both administrators and students.
