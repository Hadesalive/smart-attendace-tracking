# Student Courses Hook - Usage Example

This document demonstrates how to use the new `useStudentCourses` hook for clean data fetching in student course pages.

## Basic Usage

```tsx
import React from 'react'
import { useStudentCourses } from '@/lib/domains/courses/useStudentCourses'

export default function StudentCoursesPage() {
  const { data: courses, loading, error, reload } = useStudentCourses()

  if (loading) {
    return <div>Loading courses...</div>
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={reload}>Try Again</button>
      </div>
    )
  }

  return (
    <div>
      <h1>My Courses ({courses.length})</h1>
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.course_code} - {course.course_name}</h3>
          <p>Instructor: {course.instructor}</p>
          <p>Credits: {course.credits}</p>
          <p>Semester: {course.semesterLabel || 'TBA'}</p>
          <p>Year: {course.year || 'N/A'}</p>
          <p>Attendance Rate: {course.attendanceRate}%</p>
          <p>Average Grade: {course.averageGrade}%</p>
          <p>Progress: {course.progress}%</p>
          <p>Status: {course.status}</p>
          {course.schedule && (
            <p>Schedule: {course.schedule.days?.join(', ')} {course.schedule.time}</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

## Data Structure

The hook returns courses with the following structure:

```typescript
interface StudentCourse {
  id: string
  course_code: string
  course_name: string
  credits: number
  semesterLabel: string | null
  year: number | null
  instructor: string
  schedule: {
    days: string[] | null
    time: string | null
    location: string | null
  } | null
  attendanceRate: number
  averageGrade: number
  progress: number
  status: 'active' | 'completed' | 'upcoming'
  materialsCount: number
  totalAssignments: number
  submittedAssignments: number
  nextSession?: {
    title: string
    date: string
    time: string | null
  }
}
```

## Edge Cases Handled

The hook automatically handles these edge cases:

1. **No session**: Returns error "No authenticated user found. Please log in."
2. **Missing student profile**: Returns error "Student profile not found. Please contact your academic advisor."
3. **No course assignments**: Returns empty array with no error
4. **Missing course data**: Filters out courses that don't exist
5. **Missing semester/year data**: Uses null values with graceful fallbacks
6. **Missing lecturer data**: Uses "TBA" as default instructor
7. **Missing schedule data**: Uses null for schedule fields
8. **Partial joins**: Gracefully handles missing relationships

## Performance Features

- **Batch queries**: Fetches related data in parallel
- **Memoization**: Prevents unnecessary re-renders
- **Efficient filtering**: Only fetches data for student's program and academic year
- **Error boundaries**: Comprehensive error handling with actionable messages

## Integration with Existing Hooks

The hook integrates seamlessly with existing domain hooks:
- Uses `useAuth` for session management
- Uses `useAcademicStructure` for academic data
- Uses `useCourses` for course-related data
- Uses `useAttendance` for attendance statistics
- Uses `useGrades` for grade calculations
- Uses `useMaterials` for materials count

This ensures consistency with the existing codebase while providing a clean, focused interface for student course data.
