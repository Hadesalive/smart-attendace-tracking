# Database Schema Analysis & Migration Guide

## 🔍 Current Issues & Fixes

### 1. **Critical Issue: Missing `status` Column in `attendance_records`**
- **Problem**: Edge function tries to insert `status: 'present'` but column doesn't exist
- **Fix**: Added `status` column with CHECK constraint for ('present', 'late', 'absent')
- **Impact**: This will immediately fix the "Could not find the 'status' column" error

### 2. **Schema Compatibility Analysis**

#### ✅ **Existing Tables (No Changes Needed)**
- `users` - ✅ Complete and compatible
- `courses` - ✅ Complete and compatible  
- `enrollments` - ✅ Complete and compatible
- `attendance_sessions` - ✅ Complete and compatible
- `attendance_records` - ⚠️ Missing `status` column (fixed in migration)

#### 🆕 **New Tables Added**
- `assignments` - For homework management
- `submissions` - For assignment submissions
- `grade_categories` - For gradebook categories
- `student_grades` - For individual grades
- `materials` - For course resources
- `lecturer_assignments` - For lecturer-course relationships

## 🔗 **Relationship Analysis**

### **Core Relationships (Existing)**
```
users (1) ──── (many) enrollments (many) ──── (1) courses
   │                                              │
   │                                              │
   └── (1) lecturer ──────────────────────────────┘
               │
               └── (many) attendance_sessions
                              │
                              └── (many) attendance_records
                                             │
                                             └── (1) student
```

### **New Relationships (Added)**
```
courses (1) ──── (many) assignments (many) ──── (1) submissions
   │                    │                           │
   │                    │                           │
   └── (many) grade_categories (many) ──── (1) student_grades
                              │                           │
                              │                           │
                              └── (many) materials        └── (1) student
```

## 🛡️ **Edge Function Compatibility**

### **Current Edge Function Requirements** ✅
The `mark-attendance` function expects:
1. `attendance_sessions` table with: `id`, `session_date`, `start_time`, `end_time`, `course_id`
2. `enrollments` table with: `id`, `student_id`, `course_id`
3. `attendance_records` table with: `session_id`, `student_id`, `status`, `marked_at`, `method_used`

### **Migration Impact on Edge Function**
- ✅ **No breaking changes** - all existing columns preserved
- ✅ **Adds missing `status` column** - fixes the current error
- ✅ **Maintains all foreign key relationships**
- ✅ **Preserves all existing indexes**

## 📊 **New Features Enabled**

### 1. **Homework Management**
- Create and manage assignments
- Set due dates and point values
- Enable/disable late penalties
- Track submission status

### 2. **Gradebook System**
- Flexible grade categories (Assignments, Exams, Attendance, etc.)
- Automatic grade calculations with percentages
- Letter grade generation
- Late penalty handling

### 3. **Materials Management**
- Upload course materials (documents, videos, links)
- Organize by categories (lecture, assignment, reading, etc.)
- Track download statistics
- Link materials to specific sessions

### 4. **Enhanced Attendance**
- Status tracking (present, late, absent)
- Better integration with gradebook
- Session type classification

## 🔐 **Security & RLS Policies**

### **New RLS Policies Added**
- **Assignments**: Lecturers manage, students view enrolled courses
- **Submissions**: Students manage own, lecturers view for their courses
- **Grades**: Students view own, lecturers manage for their courses
- **Materials**: Lecturers manage, students view enrolled courses
- **Grade Categories**: Lecturers manage, students view enrolled courses

### **Security Considerations**
- All policies use `auth.uid()` for user identification
- Policies prevent cross-course data access
- Students can only see their own submissions/grades
- Lecturers can only manage their own courses

## 🚀 **Migration Execution Plan**

### **Step 1: Run the Migration**
```sql
-- Execute the complete migration file
-- This will:
-- 1. Fix the attendance_records status column issue
-- 2. Create all new tables with proper relationships
-- 3. Add indexes for performance
-- 4. Set up RLS policies
-- 5. Create helper functions
-- 6. Insert default grade categories
```

### **Step 2: Verify Migration**
```sql
-- Check that the status column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'attendance_records' AND column_name = 'status';

-- Verify new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('assignments', 'submissions', 'grade_categories', 'student_grades', 'materials', 'lecturer_assignments');
```

### **Step 3: Test Edge Function**
- Try scanning a QR code to verify the status column fix works
- Check that attendance marking succeeds without errors

## 📈 **Performance Considerations**

### **Indexes Added**
- Assignment queries by course, due date, status
- Submission queries by assignment, student, status
- Grade queries by student, course, assignment
- Material queries by course, type, uploader
- Lecturer assignment queries by lecturer, course

### **Generated Columns**
- `student_grades.percentage` - Auto-calculated from points/max_points
- `student_grades.letter_grade` - Auto-calculated from percentage
- `student_grades.final_points` - Auto-calculated with late penalties

## 🔧 **Helper Functions Added**

### **1. `calculate_course_final_grade(student_id, course_id)`**
- Calculates weighted final grade based on categories
- Returns percentage (0-100)

### **2. `calculate_attendance_percentage(student_id, course_id)`**
- Calculates attendance percentage for a student in a course
- Returns percentage (0-100)

## ⚠️ **Important Notes**

### **Data Integrity**
- All foreign keys use appropriate CASCADE/SET NULL actions
- CHECK constraints ensure data validity
- UNIQUE constraints prevent duplicates

### **Backward Compatibility**
- All existing queries will continue to work
- No breaking changes to existing APIs
- Edge function will work immediately after migration

### **Default Data**
- Default grade categories are created for existing courses
- Categories: Assignments (40%), Attendance (20%), Exams (30%), Participation (10%)
- Can be customized per course after migration

## 🎯 **Next Steps After Migration**

1. **Test QR Code Scanning** - Verify the status column fix
2. **Create Sample Assignments** - Test the homework system
3. **Upload Materials** - Test the materials management
4. **Configure Grade Categories** - Customize per course if needed
5. **Test Grade Calculations** - Verify helper functions work correctly

The migration is designed to be **safe, non-breaking, and immediately functional** while adding all the missing features for a complete academic management system.
