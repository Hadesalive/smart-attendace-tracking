"use client"

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Assignment, Submission, GradeCategory, StudentGrade, CourseGradeSummary } from '@/lib/types/shared'
import { GradesState, GradesContextType } from './types'

export function useGrades() {
  const [state, setState] = useState<GradesState>({
    assignments: [],
    submissions: [],
    gradeCategories: [],
    studentGrades: [],
    courseGradeSummaries: [],
    loading: false,
    error: null
  })

  const getAssignmentsByCourse = useCallback((courseId: string): Assignment[] => {
    return state.assignments.filter(assignment => assignment.course_id === courseId)
  }, [state.assignments])

  const createAssignment = useCallback((assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `assignment_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setState(prev => ({
      ...prev,
      assignments: [...prev.assignments, newAssignment]
    }))
  }, [])

  const updateAssignment = useCallback((assignment: Assignment) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => 
        a.id === assignment.id ? assignment : a
      )
    }))
  }, [])

  const getSubmissionsByAssignment = useCallback((assignmentId: string): Submission[] => {
    return state.submissions.filter(submission => submission.assignment_id === assignmentId)
  }, [state.submissions])

  const createSubmission = useCallback((submission: Omit<Submission, 'id'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: `submission_${Date.now()}`
    }
    setState(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => 
        s.id === newSubmission.id ? newSubmission : s
      )
    }))
  }, [])

  const gradeSubmission = useCallback((submissionId: string, grade: number, comments?: string) => {
    const submission = state.submissions.find(s => s.id === submissionId)
    if (!submission) return

    const updatedSubmission: Submission = {
      ...submission,
      grade,
      final_grade: grade,
      status: 'graded',
      comments: comments || submission.comments
    }

    setState(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => 
        s.id === submissionId ? updatedSubmission : s
      )
    }))

    // Create grade record for gradebook
    const assignment = state.assignments.find(a => a.id === submission.assignment_id)
    if (assignment) {
      const studentGrade: StudentGrade = {
        id: `grade_${Date.now()}`,
        student_id: submission.student_id,
        course_id: assignment.course_id,
        category_id: assignment.category_id,
        assignment_id: assignment.id,
        points: grade,
        max_points: assignment.total_points,
        percentage: (grade / assignment.total_points) * 100,
        letter_grade: getLetterGrade((grade / assignment.total_points) * 100),
        is_late: submission.status === 'late',
        late_penalty: submission.late_penalty_applied,
        final_points: grade - submission.late_penalty_applied,
        comments: comments || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        studentGrades: [...prev.studentGrades, studentGrade]
      }))
    }
  }, [state.submissions, state.assignments])

  // Gradebook: Fetch grade categories for a course
  const fetchGradeCategoriesForCourse = useCallback(async (courseId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('grade_categories')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setState(prev => ({ 
        ...prev, 
        gradeCategories: (data || []) as unknown as GradeCategory[], 
        loading: false 
      }))
    } catch (e) {
      console.error('Error fetching grade categories:', e)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch grade categories', 
        loading: false 
      }))
    }
  }, [])

  // Gradebook: Save grade categories (replace strategy)
  const saveGradeCategoriesForCourse = useCallback(async (courseId: string, categories: GradeCategory[]) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { error: delErr } = await supabase
        .from('grade_categories')
        .delete()
        .eq('course_id', courseId)
      if (delErr) throw delErr

      if (categories.length > 0) {
        const payload = categories.map(c => ({
          name: c.name,
          percentage: c.percentage,
          is_default: !!c.is_default,
          course_id: courseId
        }))
        const { error: insErr } = await supabase.from('grade_categories').insert(payload)
        if (insErr) throw insErr
      }

      await fetchGradeCategoriesForCourse(courseId)
    } catch (e) {
      console.error('Error saving grade categories:', e)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to save grade categories', 
        loading: false 
      }))
      throw e
    }
  }, [fetchGradeCategoriesForCourse])

  // Gradebook: Fetch student grades for a course
  const fetchStudentGradesForCourse = useCallback(async (courseId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setState(prev => ({ 
        ...prev, 
        studentGrades: (data || []) as unknown as StudentGrade[], 
        loading: false 
      }))
    } catch (e) {
      console.error('Error fetching student grades:', e)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch student grades', 
        loading: false 
      }))
    }
  }, [])

  const updateGradeCategory = useCallback((courseId: string, categories: GradeCategory[]) => {
    setState(prev => ({
      ...prev,
      gradeCategories: categories
    }))
  }, [])

  const getStudentGradesByCourse = useCallback((studentId: string, courseId: string): StudentGrade[] => {
    return state.studentGrades.filter(grade => 
      grade.student_id === studentId && grade.course_id === courseId
    )
  }, [state.studentGrades])

  const getCourseGradeSummary = useCallback((studentId: string, courseId: string): CourseGradeSummary | null => {
    return state.courseGradeSummaries.find(summary => 
      summary.student_id === studentId && summary.course_id === courseId
    ) || null
  }, [state.courseGradeSummaries])

  const calculateFinalGrade = useCallback((studentId: string, courseId: string): number => {
    const grades = getStudentGradesByCourse(studentId, courseId)
    const categories = state.gradeCategories

    let totalWeightedGrade = 0
    let totalWeight = 0

    categories.forEach(category => {
      const categoryGrades = grades.filter(g => g.category_id === category.id)
      if (categoryGrades.length > 0) {
        const averageGrade = categoryGrades.reduce((sum, g) => sum + g.percentage, 0) / categoryGrades.length
        totalWeightedGrade += (averageGrade * category.percentage) / 100
        totalWeight += category.percentage
      }
    })

    return totalWeight > 0 ? totalWeightedGrade : 0
  }, [getStudentGradesByCourse, state.gradeCategories])

  const getLetterGrade = (percentage: number): string => {
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

  return {
    state,
    getAssignmentsByCourse,
    createAssignment,
    updateAssignment,
    getSubmissionsByAssignment,
    createSubmission,
    gradeSubmission,
    fetchGradeCategoriesForCourse,
    saveGradeCategoriesForCourse,
    updateGradeCategory,
    fetchStudentGradesForCourse,
    getStudentGradesByCourse,
    getCourseGradeSummary,
    calculateFinalGrade
  }
}
