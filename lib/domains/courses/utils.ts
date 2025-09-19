import { Course } from '@/lib/types/shared'

export const getCourseByCode = (courses: Course[], code: string): Course | undefined => {
  return courses.find(course => course.course_code === code)
}

export const getCoursesByDepartment = (courses: Course[], department: string): Course[] => {
  return courses.filter(course => course.department === department)
}

export const getCoursesByLecturerId = (courses: Course[], lecturerId: string): Course[] => {
  return courses.filter(course => course.lecturer_id === lecturerId)
}

export const sortCoursesByCode = (courses: Course[]): Course[] => {
  return [...courses].sort((a, b) => a.course_code.localeCompare(b.course_code))
}

export const sortCoursesByName = (courses: Course[]): Course[] => {
  return [...courses].sort((a, b) => a.course_name.localeCompare(b.course_name))
}

export const getCourseStats = (courses: Course[]) => {
  const totalCourses = courses.length
  const activeCourses = courses.filter(course => course.status === 'active').length
  const departments = new Set(courses.map(course => course.department)).size
  
  return {
    totalCourses,
    activeCourses,
    departments,
    inactiveCourses: totalCourses - activeCourses
  }
}
