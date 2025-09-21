import { 
  User, 
  Course, 
  Class, 
  Student, 
  Assignment, 
  Submission, 
  AttendanceSession, 
  AttendanceRecord,
  GradeCategory,
  StudentGrade,
  CourseGradeSummary,
  Material,
  Enrollment,
  LecturerAssignment
} from '@/lib/types/shared'

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const mockUsers: User[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    email: "admin@university.edu",
    full_name: "Admin User",
    role: "admin",
    department: "Administration",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    email: "sarah.johnson@university.edu",
    full_name: "Dr. Sarah Johnson",
    role: "lecturer",
    department: "Computer Science",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174003",
    email: "mike.smith@university.edu",
    full_name: "Prof. Mike Smith",
    role: "lecturer",
    department: "Mathematics",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174004",
    email: "john.doe@student.edu",
    full_name: "John Doe",
    role: "student",
    student_id: "LIM-2023001",
    department: "Computer Science",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174005",
    email: "jane.smith@student.edu",
    full_name: "Jane Smith",
    role: "student",
    student_id: "LIM-2023002",
    department: "Computer Science",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174006",
    email: "alice.brown@student.edu",
    full_name: "Alice Brown",
    role: "student",
    student_id: "LIM-2023003",
    department: "Mathematics",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  }
]

export const mockClasses: Class[] = [
  {
    id: "class_1",
    name: "Computer Science 2024",
    level: "Year 2",
    year: 2,
    semester: 1,
    program: "CS",
    section: "A"
  },
  {
    id: "class_2",
    name: "Mathematics 2024",
    level: "Year 1",
    year: 1,
    semester: 1,
    program: "MATH",
    section: "B"
  },
  {
    id: "class_3",
    name: "Computer Science 2024",
    level: "Year 2",
    year: 2,
    semester: 1,
    program: "CS",
    section: "B"
  }
]

export const mockCourses: Course[] = [
  {
    id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    lecturer_id: "user_2",
    lecturer_name: "Dr. Sarah Johnson",
    department: "Computer Science",
    credits: 3,
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "course_2",
    course_code: "MATH201",
    course_name: "Calculus II",
    lecturer_id: "user_3",
    lecturer_name: "Prof. Mike Smith",
    department: "Mathematics",
    credits: 4,
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "course_3",
    course_code: "CS102",
    course_name: "Data Structures and Algorithms",
    lecturer_id: "user_2",
    lecturer_name: "Dr. Sarah Johnson",
    department: "Computer Science",
    credits: 3,
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  }
]

export const mockStudents: Student[] = [
  {
    id: "user_4",
    full_name: "John Doe",
    student_id: "LIM-2023001",
    email: "john.doe@student.edu",
    class_id: "class_1"
  },
  {
    id: "user_5",
    full_name: "Jane Smith",
    student_id: "LIM-2023002",
    email: "jane.smith@student.edu",
    class_id: "class_1"
  },
  {
    id: "user_6",
    full_name: "Alice Brown",
    student_id: "LIM-2023003",
    email: "alice.brown@student.edu",
    class_id: "class_2"
  }
]

export const mockEnrollments: Enrollment[] = [
  {
    id: "enrollment_1",
    student_id: "user_4",
    course_id: "course_1",
    class_id: "class_1",
    enrolled_at: "2024-01-01T00:00:00Z",
    status: "active"
  },
  {
    id: "enrollment_2",
    student_id: "user_5",
    course_id: "course_1",
    class_id: "class_1",
    enrolled_at: "2024-01-01T00:00:00Z",
    status: "active"
  },
  {
    id: "enrollment_3",
    student_id: "user_4",
    course_id: "course_2",
    class_id: "class_1",
    enrolled_at: "2024-01-01T00:00:00Z",
    status: "active"
  },
  {
    id: "enrollment_4",
    student_id: "user_6",
    course_id: "course_2",
    class_id: "class_2",
    enrolled_at: "2024-01-01T00:00:00Z",
    status: "active"
  }
]

export const mockLecturerAssignments: LecturerAssignment[] = [
  {
    id: "assignment_1",
    lecturer_id: "user_2",
    course_id: "course_1",
    class_id: "class_1",
    assigned_at: "2024-01-01T00:00:00Z",
    status: "active"
  },
  {
    id: "assignment_2",
    lecturer_id: "user_3",
    course_id: "course_2",
    class_id: "class_1",
    assigned_at: "2024-01-01T00:00:00Z",
    status: "active"
  },
  {
    id: "assignment_3",
    lecturer_id: "user_2",
    course_id: "course_3",
    class_id: "class_3",
    assigned_at: "2024-01-01T00:00:00Z",
    status: "active"
  }
]

export const mockGradeCategories: GradeCategory[] = [
  {
    id: "category_1",
    name: "Homework",
    percentage: 30,
    is_default: true
  },
  {
    id: "category_2",
    name: "Attendance",
    percentage: 5,
    is_default: true
  },
  {
    id: "category_3",
    name: "Exams",
    percentage: 40,
    is_default: true
  },
  {
    id: "category_4",
    name: "Projects",
    percentage: 25,
    is_default: true
  }
]

export const mockAssignments: Assignment[] = [
  {
    id: "assignment_1",
    title: "Data Structures Lab",
    description: "Implement basic data structures in Python",
    course_id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    class_id: "class_1",
    class_name: "Computer Science 2024",
    due_date: "2024-01-25T23:59:59Z",
    total_points: 100,
    late_penalty_enabled: true,
    late_penalty_percent: 10,
    late_penalty_interval: "day",
    category_id: "category_1",
    status: "published",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "assignment_2",
    title: "Calculus Problem Set",
    description: "Solve integration problems",
    course_id: "course_2",
    course_code: "MATH201",
    course_name: "Calculus II",
    class_id: "class_1",
    class_name: "Computer Science 2024",
    due_date: "2024-01-30T23:59:59Z",
    total_points: 50,
    late_penalty_enabled: true,
    late_penalty_percent: 5,
    late_penalty_interval: "day",
    category_id: "category_1",
    status: "published",
    created_at: "2024-01-16T00:00:00Z",
    updated_at: "2024-01-16T00:00:00Z"
  }
]

export const mockSubmissions: Submission[] = [
  {
    id: "submission_1",
    assignment_id: "assignment_1",
    student_id: "user_4",
    student_name: "John Doe",
    student_email: "john.doe@student.edu",
    submitted_at: "2024-01-24T14:30:00Z",
    grade: 85,
    max_grade: 100,
    status: "graded",
    late_penalty_applied: 0,
    final_grade: 85,
    comments: "Good implementation, minor issues with efficiency",
    submission_text: "Here's my implementation...",
    submission_files: ["lab1.py", "README.md"]
  },
  {
    id: "submission_2",
    assignment_id: "assignment_1",
    student_id: "user_5",
    student_name: "Jane Smith",
    student_email: "jane.smith@student.edu",
    submitted_at: "2024-01-26T10:15:00Z",
    grade: 92,
    max_grade: 100,
    status: "graded",
    late_penalty_applied: 10,
    final_grade: 82,
    comments: "Excellent work, but submitted late",
    submission_text: "My implementation...",
    submission_files: ["lab1.py"]
  },
  {
    id: "submission_3",
    assignment_id: "assignment_2",
    student_id: "user_4",
    student_name: "John Doe",
    student_email: "john.doe@student.edu",
    submitted_at: "2024-01-29T16:45:00Z",
    grade: null,
    max_grade: 50,
    status: "submitted",
    late_penalty_applied: 0,
    final_grade: null,
    comments: "",
    submission_text: "Calculus solutions...",
    submission_files: ["calculus.pdf"]
  }
]

export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: "session_1",
    course_id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    class_id: "class_1",
    class_name: "Computer Science 2024",
    session_name: "Lecture 5: Data Structures",
    session_date: "2024-01-20",
    start_time: "09:00",
    end_time: "10:30",
    location: "Room 201",
    qr_code: "QR_CODE_DATA_1",
    is_active: false,
    attendance_method: "hybrid",
    status: "completed",
    created_at: "2024-01-20T08:00:00Z"
  },
  {
    id: "session_2",
    course_id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    class_id: "class_1",
    class_name: "Computer Science 2024",
    session_name: "Tutorial 3: Algorithms",
    session_date: "2024-01-22",
    start_time: "14:00",
    end_time: "15:30",
    location: "Lab 301",
    qr_code: "QR_CODE_DATA_2",
    is_active: true,
    attendance_method: "qr_code",
    status: "active",
    created_at: "2024-01-22T13:00:00Z"
  },
  {
    id: "session_3",
    course_id: "course_2",
    course_code: "MATH201",
    course_name: "Calculus II",
    class_id: "class_1",
    class_name: "Computer Science 2024",
    session_name: "Lecture 4: Integration",
    session_date: "2024-01-21",
    start_time: "11:00",
    end_time: "12:30",
    location: "Room 302",
    qr_code: "QR_CODE_DATA_3",
    is_active: false,
    attendance_method: "hybrid",
    status: "completed",
    created_at: "2024-01-21T10:00:00Z"
  }
]

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "attendance_1",
    session_id: "session_1",
    student_id: "user_4",
    student_name: "John Doe",
    student_email: "john.doe@student.edu",
    marked_at: "2024-01-20T09:05:00Z",
    method_used: "qr_code",
    status: "present",
    check_in_time: "2024-01-20T09:05:00Z",
    confidence_score: 0.95
  },
  {
    id: "attendance_2",
    session_id: "session_1",
    student_id: "user_5",
    student_name: "Jane Smith",
    student_email: "jane.smith@student.edu",
    marked_at: "2024-01-20T09:15:00Z",
    method_used: "qr_code",
    status: "late",
    check_in_time: "2024-01-20T09:15:00Z",
    confidence_score: 0.92
  },
  {
    id: "attendance_3",
    session_id: "session_2",
    student_id: "user_4",
    student_name: "John Doe",
    student_email: "john.doe@student.edu",
    marked_at: "2024-01-22T14:02:00Z",
    method_used: "qr_code",
    status: "present",
    check_in_time: "2024-01-22T14:02:00Z",
    confidence_score: 0.98
  },
  {
    id: "attendance_4",
    session_id: "session_3",
    student_id: "user_4",
    student_name: "John Doe",
    student_email: "john.doe@student.edu",
    marked_at: "2024-01-21T11:10:00Z",
    method_used: "facial_recognition",
    status: "late",
    check_in_time: "2024-01-21T11:10:00Z",
    confidence_score: 0.88
  }
]

export const mockStudentGrades: StudentGrade[] = [
  {
    id: "grade_1",
    student_id: "user_4",
    course_id: "course_1",
    category_id: "category_1",
    assignment_id: "assignment_1",
    points: 85,
    max_points: 100,
    percentage: 85,
    letter_grade: "B",
    is_late: false,
    late_penalty: 0,
    final_points: 85,
    comments: "Good implementation, minor issues with efficiency",
    created_at: "2024-01-24T15:00:00Z",
    updated_at: "2024-01-24T15:00:00Z"
  },
  {
    id: "grade_2",
    student_id: "user_4",
    course_id: "course_1",
    category_id: "category_2",
    session_id: "session_1",
    points: 1,
    max_points: 1,
    percentage: 100,
    letter_grade: "A",
    is_late: false,
    late_penalty: 0,
    final_points: 1,
    comments: "Attendance marked via qr_code",
    created_at: "2024-01-20T09:05:00Z",
    updated_at: "2024-01-20T09:05:00Z"
  },
  {
    id: "grade_3",
    student_id: "user_5",
    course_id: "course_1",
    category_id: "category_1",
    assignment_id: "assignment_1",
    points: 92,
    max_points: 100,
    percentage: 92,
    letter_grade: "A-",
    is_late: true,
    late_penalty: 10,
    final_points: 82,
    comments: "Excellent work, but submitted late",
    created_at: "2024-01-26T11:00:00Z",
    updated_at: "2024-01-26T11:00:00Z"
  }
]

export const mockCourseGradeSummaries: CourseGradeSummary[] = [
  {
    course_id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    student_id: "user_4",
    student_name: "John Doe",
    category_grades: {
      "category_1": 85, // Homework
      "category_2": 100, // Attendance
      "category_3": 0, // Exams (not taken yet)
      "category_4": 0 // Projects (not assigned yet)
    },
    final_grade: 30.5, // (85 * 0.3) + (100 * 0.05) + (0 * 0.4) + (0 * 0.25)
    final_letter_grade: "B+",
    attendance_rate: 100,
    total_assignments: 1,
    submitted_assignments: 1
  },
  {
    course_id: "course_1",
    course_code: "CS101",
    course_name: "Introduction to Computer Science",
    student_id: "user_5",
    student_name: "Jane Smith",
    category_grades: {
      "category_1": 82, // Homework (with late penalty)
      "category_2": 0, // Attendance (not marked yet)
      "category_3": 0, // Exams
      "category_4": 0 // Projects
    },
    final_grade: 24.6, // (82 * 0.3) + (0 * 0.05) + (0 * 0.4) + (0 * 0.25)
    final_letter_grade: "C+",
    attendance_rate: 0,
    total_assignments: 1,
    submitted_assignments: 1
  }
]

export const mockMaterials: Material[] = [
  {
    id: "material_1",
    title: "Data Structures Lecture Notes",
    description: "Comprehensive notes on arrays, linked lists, and trees",
    course_id: "course_1",
    course_code: "CS101",
    session_id: "session_1",
    material_type: "document",
    file_url: "/materials/data-structures-notes.pdf",
    file_size: 2048000,
    file_type: "application/pdf",
    is_public: true,
    created_at: "2024-01-20T08:30:00Z",
    updated_at: "2024-01-20T08:30:00Z"
  },
  {
    id: "material_2",
    title: "Algorithm Visualization Video",
    description: "Step-by-step visualization of sorting algorithms",
    course_id: "course_1",
    course_code: "CS101",
    material_type: "video",
    file_url: "/materials/sorting-algorithms.mp4",
    file_size: 15728640,
    file_type: "video/mp4",
    is_public: true,
    created_at: "2024-01-19T16:00:00Z",
    updated_at: "2024-01-19T16:00:00Z"
  },
  {
    id: "material_3",
    title: "Integration Techniques Reference",
    description: "Quick reference guide for calculus integration methods",
    course_id: "course_2",
    course_code: "MATH201",
    session_id: "session_3",
    material_type: "document",
    file_url: "/materials/integration-reference.pdf",
    file_size: 1024000,
    file_type: "application/pdf",
    is_public: true,
    created_at: "2024-01-21T10:30:00Z",
    updated_at: "2024-01-21T10:30:00Z"
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getMockData() {
  return {
    users: mockUsers,
    courses: mockCourses,
    classes: mockClasses,
    students: mockStudents,
    enrollments: mockEnrollments,
    lecturerAssignments: mockLecturerAssignments,
    gradeCategories: mockGradeCategories,
    assignments: mockAssignments,
    submissions: mockSubmissions,
    attendanceSessions: mockAttendanceSessions,
    attendanceRecords: mockAttendanceRecords,
    studentGrades: mockStudentGrades,
    courseGradeSummaries: mockCourseGradeSummaries,
    materials: mockMaterials
  }
}

export function initializeMockData(dispatch: any) {
  const data = getMockData()
  
  dispatch({ type: 'SET_USERS', payload: data.users })
  dispatch({ type: 'SET_COURSES', payload: data.courses })
  dispatch({ type: 'SET_CLASSES', payload: data.classes })
  dispatch({ type: 'SET_STUDENTS', payload: data.students })
  dispatch({ type: 'SET_ENROLLMENTS', payload: data.enrollments })
  dispatch({ type: 'SET_LECTURER_ASSIGNMENTS', payload: data.lecturerAssignments })
  dispatch({ type: 'SET_GRADE_CATEGORIES', payload: data.gradeCategories })
  dispatch({ type: 'SET_ASSIGNMENTS', payload: data.assignments })
  dispatch({ type: 'SET_SUBMISSIONS', payload: data.submissions })
  dispatch({ type: 'SET_ATTENDANCE_SESSIONS', payload: data.attendanceSessions })
  dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: data.attendanceRecords })
  dispatch({ type: 'SET_STUDENT_GRADES', payload: data.studentGrades })
  dispatch({ type: 'SET_COURSE_GRADE_SUMMARIES', payload: data.courseGradeSummaries })
  dispatch({ type: 'SET_MATERIALS', payload: data.materials })
}
