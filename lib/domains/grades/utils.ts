import { Assignment, Submission, GradeCategory, StudentGrade, CourseGradeSummary } from '@/lib/types/shared'

export const getLetterGrade = (percentage: number): string => {
  if (percentage >= 97) return 'A+'
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 63) return 'D'
  if (percentage >= 60) return 'D-'
  return 'F'
}

export const getGradePoint = (letterGrade: string): number => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0
  }
  return gradePoints[letterGrade] || 0.0
}

export const calculateGPA = (grades: StudentGrade[]): number => {
  if (grades.length === 0) return 0
  
  const totalPoints = grades.reduce((sum, grade) => {
    const letterGrade = getLetterGrade(grade.percentage)
    const gradePoint = getGradePoint(letterGrade)
    return sum + gradePoint
  }, 0)
  
  return totalPoints / grades.length
}

export const getAssignmentStats = (assignments: Assignment[]) => {
  const totalAssignments = assignments.length
  const publishedAssignments = assignments.filter(a => a.status === 'published').length
  const draftAssignments = assignments.filter(a => a.status === 'draft').length
  
  return {
    totalAssignments,
    publishedAssignments,
    draftAssignments,
    publishedRate: totalAssignments > 0 ? (publishedAssignments / totalAssignments) * 100 : 0
  }
}

export const getSubmissionStats = (submissions: Submission[]) => {
  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter(s => s.status === 'graded').length
  const lateSubmissions = submissions.filter(s => s.status === 'late').length
  const averageGrade = gradedSubmissions > 0 
    ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions 
    : 0
  
  return {
    totalSubmissions,
    gradedSubmissions,
    lateSubmissions,
    averageGrade: Math.round(averageGrade * 100) / 100,
    gradingRate: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0
  }
}

export const getStudentGradeStats = (studentGrades: StudentGrade[], studentId: string) => {
  const studentGradesList = studentGrades.filter(g => g.student_id === studentId)
  const totalGrades = studentGradesList.length
  const averagePercentage = totalGrades > 0 
    ? studentGradesList.reduce((sum, g) => sum + g.percentage, 0) / totalGrades 
    : 0
  
  return {
    totalGrades,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    gpa: calculateGPA(studentGradesList)
  }
}

export const getCourseGradeDistribution = (studentGrades: StudentGrade[], courseId: string) => {
  const courseGrades = studentGrades.filter(g => g.course_id === courseId)
  const distribution = {
    'A+': 0, 'A': 0, 'A-': 0,
    'B+': 0, 'B': 0, 'B-': 0,
    'C+': 0, 'C': 0, 'C-': 0,
    'D+': 0, 'D': 0, 'D-': 0,
    'F': 0
  }
  
  courseGrades.forEach(grade => {
    const letterGrade = getLetterGrade(grade.percentage)
    if (distribution[letterGrade as keyof typeof distribution] !== undefined) {
      distribution[letterGrade as keyof typeof distribution]++
    }
  })
  
  return distribution
}

export const sortAssignmentsByDueDate = (assignments: Assignment[]): Assignment[] => {
  return [...assignments].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )
}

export const sortSubmissionsBySubmissionDate = (submissions: Submission[]): Submission[] => {
  return [...submissions].sort((a, b) => 
    new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  )
}

export const getOverdueAssignments = (assignments: Assignment[]): Assignment[] => {
  const now = new Date()
  return assignments.filter(assignment => 
    new Date(assignment.due_date) < now && assignment.status === 'published'
  )
}

export const getUpcomingAssignments = (assignments: Assignment[], daysAhead: number = 7): Assignment[] => {
  const now = new Date()
  const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000))
  
  return assignments.filter(assignment => {
    const dueDate = new Date(assignment.due_date)
    return dueDate > now && dueDate <= futureDate
  })
}

export const calculateCategoryAverage = (grades: StudentGrade[], categoryId: string): number => {
  const categoryGrades = grades.filter(g => g.category_id === categoryId)
  if (categoryGrades.length === 0) return 0
  
  return categoryGrades.reduce((sum, g) => sum + g.percentage, 0) / categoryGrades.length
}

export const isPassingGrade = (percentage: number, passingThreshold: number = 60): boolean => {
  return percentage >= passingThreshold
}

export const getGradeColor = (letterGrade: string): string => {
  const colors: { [key: string]: string } = {
    'A+': 'text-green-600',
    'A': 'text-green-600',
    'A-': 'text-green-500',
    'B+': 'text-blue-600',
    'B': 'text-blue-600',
    'B-': 'text-blue-500',
    'C+': 'text-yellow-600',
    'C': 'text-yellow-600',
    'C-': 'text-yellow-500',
    'D+': 'text-orange-600',
    'D': 'text-orange-600',
    'D-': 'text-orange-500',
    'F': 'text-red-600'
  }
  return colors[letterGrade] || 'text-gray-600'
}
