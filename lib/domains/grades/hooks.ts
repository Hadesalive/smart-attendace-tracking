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

  const createAssignment = useCallback(async (
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          ...assignment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        assignments: [data, ...prev.assignments]
      }))

      return data
    } catch (error) {
      console.error('❌ Error creating assignment:', error)
      throw error
    }
  }, [])

  const updateAssignment = useCallback(async (assignment: Assignment) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .update({ ...assignment, updated_at: new Date().toISOString() })
        .eq('id', assignment.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        assignments: prev.assignments.map(a => a.id === assignment.id ? data : a)
      }))

      return data
    } catch (error) {
      console.error('❌ Error updating assignment:', error)
      throw error
    }
  }, [])

  const getSubmissionsByAssignment = useCallback((assignmentId: string): Submission[] => {
    return state.submissions.filter(submission => submission.assignment_id === assignmentId)
  }, [state.submissions])

  const createSubmission = useCallback(async (
    submission: Omit<Submission, 'id'>,
    files?: File[]
  ) => {
    try {
      let submissionFiles: string[] = []

      // Upload files to Supabase Storage if provided
      if (files && files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `submissions/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('assignment-submissions')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('assignment-submissions')
            .getPublicUrl(filePath)

          submissionFiles.push(publicUrl)
        }
      }

      const { data, error} = await supabase
        .from('submissions')
        .upsert([{
          ...submission,
          submission_files: submissionFiles,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        submissions: [data, ...prev.submissions.filter(s => 
          !(s.assignment_id === data.assignment_id && s.student_id === data.student_id)
        )]
      }))

      return data
    } catch (error) {
      console.error('❌ Error creating submission:', error)
      throw error
    }
  }, [])

  const fetchAssignments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          courses(course_code, course_name),
          grade_categories(name, percentage)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const transformedAssignments = (data || []).map(assignment => ({
        ...assignment,
        course_code: assignment.courses?.course_code,
        course_name: assignment.courses?.course_name,
        class_id: assignment.class_id || '',
        class_name: assignment.class_name || ''
      }))
      
      setState(prev => ({ ...prev, assignments: transformedAssignments, loading: false }))
    } catch (error) {
      console.error('❌ Error fetching assignments:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch assignments', 
        loading: false 
      }))
    }
  }, [])

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          users(full_name, email)
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      
      const transformedSubmissions = (data || []).map(submission => ({
        ...submission,
        student_name: submission.users?.full_name || '',
        student_email: submission.users?.email || '',
        max_grade: 100 // Default, should come from assignment
      }))
      
      setState(prev => ({ ...prev, submissions: transformedSubmissions }))
    } catch (error) {
      console.error('❌ Error fetching submissions:', error)
    }
  }, [])

  const gradeSubmission = useCallback(async (
    submissionId: string,
    grade: number,
    comments: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          grade,
          comments,
          status: 'graded',
          final_grade: grade // Will be calculated with penalties in real implementation
        })
        .eq('id', submissionId)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        submissions: prev.submissions.map(s => s.id === submissionId ? data : s)
      }))

      return data
    } catch (error) {
      console.error('❌ Error grading submission:', error)
      throw error
    }
  }, [])

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

      if (error) {
        console.error('❌ Error fetching student grades from database:', error)
        console.log('🔧 Attempting to load grades from localStorage fallback...')
        
        // Load from localStorage as fallback
        const fallbackGrades = loadGradesFromLocalStorage(courseId)
        setState(prev => ({ 
          ...prev, 
          studentGrades: fallbackGrades, 
          loading: false 
        }))
        return
      }
      
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

  // Load grades from localStorage as fallback
  const loadGradesFromLocalStorage = useCallback((courseId: string): StudentGrade[] => {
    try {
      const grades: StudentGrade[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('grade_') && key.includes(`_${courseId}_`)) {
          const gradeData = JSON.parse(localStorage.getItem(key) || '{}')
          grades.push({
            id: key,
            student_id: gradeData.studentId,
            course_id: gradeData.courseId,
            category_id: gradeData.categoryId,
            points: gradeData.grade,
            max_points: 100,
            percentage: gradeData.grade,
            letter_grade: getLetterGrade(gradeData.grade),
            is_late: false,
            late_penalty: 0,
            final_points: gradeData.grade,
            comments: 'Stored in localStorage',
            created_at: gradeData.timestamp,
            updated_at: gradeData.timestamp
          })
        }
      }
      console.log(`✅ Loaded ${grades.length} grades from localStorage fallback`)
      return grades
    } catch (error) {
      console.error('❌ Error loading grades from localStorage:', error)
      return []
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
        const averageGrade = categoryGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / categoryGrades.length
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

  // Gradebook: Save student grade for a specific category
  const saveStudentGrade = useCallback(async (
    studentId: string,
    courseId: string,
    categoryId: string,
    grade: number
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      // Test if table exists and we have permissions
      console.log('🔍 Testing database connection and permissions...')
      const { data: testData, error: testError } = await supabase
        .from('student_grades')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('❌ Table access test failed:', testError)
        console.error('❌ Test error details:', JSON.stringify(testError, null, 2))
        
        // If table doesn't exist, try to create it or use a fallback
        console.log('🔧 Attempting to create student_grades table...')
        const { error: createError } = await supabase.rpc('create_student_grades_table')
        if (createError) {
          console.error('❌ Failed to create table:', createError)
          // Use a fallback approach - store in a simpler format
          console.log('🔧 Using fallback approach - storing in submissions table')
          return await saveGradeFallback(studentId, courseId, categoryId, grade)
        }
      } else {
        console.log('✅ Table access test successful')
      }
      
      // Check if grade already exists
      const existingGrade = state.studentGrades.find(
        sg => sg.student_id === studentId && 
              sg.course_id === courseId && 
              sg.category_id === categoryId
      )

      if (existingGrade) {
        // Update existing grade
        const { data, error } = await supabase
          .from('student_grades')
          .update({
            points: grade,
            max_points: 100,
            final_points: grade,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGrade.id)
          .select()
          .single()

        if (error) {
          console.error('❌ Supabase error (update student grade):', error)
          throw error
        }

        setState(prev => ({
          ...prev,
          studentGrades: prev.studentGrades.map(sg => 
            sg.id === existingGrade.id ? data : sg
          )
        }))
      } else {
        // Create new grade
        const insertData = {
          student_id: studentId,
          course_id: courseId,
          category_id: categoryId,
          points: grade,
          max_points: 100,
          final_points: grade,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('🔍 Inserting new grade with data:', insertData)
        
        const { data, error } = await supabase
          .from('student_grades')
          .insert([insertData])
          .select()
          .single()

        if (error) {
          console.error('❌ Supabase error (insert student grade):', error)
          console.error('❌ Error object details:', JSON.stringify(error, null, 2))
          console.error('❌ Error type:', typeof error)
          console.error('❌ Error properties:', Object.keys(error || {}))
          throw error
        }

        setState(prev => ({
          ...prev,
          studentGrades: [...prev.studentGrades, data]
        }))
      }

      setState(prev => ({ ...prev, loading: false }))
      return true
    } catch (error) {
      console.error('❌ Error saving student grade:', error)
      console.error('❌ Error details:', {
        studentId,
        courseId,
        categoryId,
        grade,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details
      })
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to save student grade', 
        loading: false 
      }))
      throw error
    }
  }, [state.studentGrades])

  // Fallback function to save grades in a simpler format
  const saveGradeFallback = useCallback(async (
    studentId: string,
    courseId: string,
    categoryId: string,
    grade: number
  ) => {
    try {
      console.log('🔧 Using fallback grade saving approach')
      
      // Store in localStorage as a temporary solution
      const gradeKey = `grade_${studentId}_${courseId}_${categoryId}`
      const gradeData = {
        studentId,
        courseId,
        categoryId,
        grade,
        timestamp: new Date().toISOString()
      }
      
      localStorage.setItem(gradeKey, JSON.stringify(gradeData))
      
      // Update local state
      setState(prev => ({
        ...prev,
        studentGrades: [...prev.studentGrades, {
          id: gradeKey,
          student_id: studentId,
          course_id: courseId,
          category_id: categoryId,
          points: grade,
          max_points: 100,
          percentage: grade,
          letter_grade: getLetterGrade(grade),
          is_late: false,
          late_penalty: 0,
          final_points: grade,
          comments: 'Stored in localStorage',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      }))
      
      console.log('✅ Grade saved to localStorage as fallback')
      return true
    } catch (error) {
      console.error('❌ Fallback grade saving failed:', error)
      throw error
    }
  }, [])

  return {
    state,
    fetchAssignments,
    fetchSubmissions,
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
    calculateFinalGrade,
    saveStudentGrade
  }
}
