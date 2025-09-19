# Academic Structure Form Components

## 🎯 **Overview**

Comprehensive CRUD form components for managing the academic structure of the attendance tracking system. All forms use the `DialogBox` component for consistent modal presentation and follow the monochrome design system.

## 📋 **Available Forms**

### **1. AcademicYearForm**
**Purpose**: Create and edit academic years (e.g., 2024-2025)

**Fields**:
- `year_name` (required) - Format: YYYY-YYYY
- `start_date` (required) - Academic year start date
- `end_date` (required) - Academic year end date
- `is_current` (checkbox) - Set as current academic year
- `description` (optional) - Description of the academic year

**Validation**:
- Year name must match YYYY-YYYY format
- End date must be after start date
- All required fields must be filled

### **2. SemesterForm**
**Purpose**: Create and edit semesters within academic years

**Fields**:
- `academic_year_id` (required) - Select from existing academic years
- `semester_name` (required) - Name of the semester
- `semester_number` (required) - 1 (First) or 2 (Second)
- `start_date` (required) - Semester start date
- `end_date` (required) - Semester end date
- `is_current` (checkbox) - Set as current semester
- `description` (optional) - Description of the semester

**Validation**:
- Academic year must be selected
- Semester number must be 1 or 2
- End date must be after start date
- All required fields must be filled

### **3. DepartmentForm**
**Purpose**: Create and edit departments

**Fields**:
- `department_code` (required) - 2-10 uppercase letters (e.g., CS, BSEM)
- `department_name` (required) - Full department name
- `head_id` (optional) - Select department head from users
- `description` (optional) - Department description
- `is_active` (checkbox) - Department is active

**Validation**:
- Department code must be 2-10 uppercase letters
- Department name must be at least 3 characters
- All required fields must be filled

### **4. ProgramForm**
**Purpose**: Create and edit degree programs within departments

**Fields**:
- `program_code` (required) - 3-10 uppercase letters/numbers (e.g., CS101)
- `program_name` (required) - Full program name
- `department_id` (required) - Select from active departments
- `degree_type` (required) - Certificate, Diploma, Bachelor, Master, PhD
- `duration_years` (required) - Program duration (1-10 years)
- `total_credits` (required) - Total credits required (1-500)
- `description` (optional) - Program description
- `is_active` (checkbox) - Program is active

**Validation**:
- Program code must be 3-10 uppercase letters/numbers
- Program name must be at least 3 characters
- Duration must be 1-10 years
- Total credits must be 1-500
- All required fields must be filled

### **5. ClassroomForm**
**Purpose**: Create and edit physical classrooms

**Fields**:
- `building` (required) - Building name
- `room_number` (required) - Room number/identifier
- `room_name` (optional) - Descriptive room name
- `capacity` (required) - Maximum capacity (1-1000)
- `room_type` (required) - Type of room (lecture, lab, computer_lab, etc.)
- `equipment` (multi-select) - Available equipment
- `description` (optional) - Room description
- `is_active` (checkbox) - Room is active

**Room Types**:
- lecture
- lab
- computer_lab
- seminar
- conference
- workshop
- studio

**Equipment Options**:
- Projector, Whiteboard, Audio System, Computers, Network, Lab Equipment, etc.

**Validation**:
- Building and room number are required
- Capacity must be 1-1000
- All required fields must be filled

### **6. SectionForm**
**Purpose**: Create and edit class sections

**Fields**:
- `section_code` (required) - Section identifier (e.g., 2101, A, B)
- `program_id` (required) - Select from active programs
- `academic_year_id` (required) - Select academic year
- `semester_id` (required) - Select semester (filtered by academic year)
- `year` (required) - Academic year level (1-4)
- `max_capacity` (required) - Maximum students (1-200)
- `current_enrollment` (optional) - Current number of students
- `classroom_id` (optional) - Assign specific classroom
- `description` (optional) - Section description
- `is_active` (checkbox) - Section is active

**Validation**:
- All required fields must be filled
- Year must be 1-4
- Max capacity must be 1-200
- Current enrollment cannot exceed max capacity

## 🔧 **Usage Examples**

### **Basic Form Usage**
```tsx
import { AcademicYearForm } from '@/components/admin/forms'

function AcademicPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [academicYear, setAcademicYear] = useState(null)

  const handleSave = async (data) => {
    // Save to database
    await saveAcademicYear(data)
  }

  return (
    <AcademicYearForm
      open={isOpen}
      onOpenChange={setIsOpen}
      academicYear={academicYear}
      onSave={handleSave}
      mode="create"
    />
  )
}
```

### **Using the Form Manager**
```tsx
import { AcademicFormManager } from '@/components/admin/forms/AcademicFormManager'

function AcademicPage() {
  const handleSaveAcademicYear = async (data) => {
    // Save academic year
  }

  const handleSaveSemester = async (data) => {
    // Save semester
  }

  // ... other handlers

  return (
    <AcademicFormManager
      academicYears={academicYears}
      semesters={semesters}
      departments={departments}
      programs={programs}
      classrooms={classrooms}
      sections={sections}
      users={users}
      onSaveAcademicYear={handleSaveAcademicYear}
      onSaveSemester={handleSaveSemester}
      // ... other handlers
    />
  )
}
```

## 🎨 **Design Features**

### **Consistent Styling**
- Uses `DialogBox` component for modal presentation
- Monochrome color scheme (black/white/gray)
- Consistent form field styling
- Responsive design for all screen sizes

### **User Experience**
- Real-time validation with error messages
- Loading states during save operations
- Clear form labels and help text
- Intuitive form flow and organization

### **Accessibility**
- Proper form labels and ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Focus management

## 🔒 **Security Features**

### **Input Validation**
- Client-side validation for immediate feedback
- Server-side validation required for security
- Sanitized input handling
- XSS protection through proper escaping

### **Data Integrity**
- Required field validation
- Format validation (dates, codes, etc.)
- Range validation (numbers, years, etc.)
- Relationship validation (foreign keys)

## 📱 **Responsive Design**

### **Mobile Support**
- Touch-friendly form controls
- Responsive grid layouts
- Optimized for mobile screens
- Swipe-friendly modal interactions

### **Desktop Support**
- Multi-column layouts for larger screens
- Hover states for interactive elements
- Keyboard shortcuts support
- Efficient form navigation

## 🚀 **Performance**

### **Optimizations**
- Lazy loading of form components
- Efficient re-rendering with proper dependencies
- Minimal bundle size impact
- Fast form validation

### **State Management**
- Local form state management
- Proper cleanup on unmount
- Efficient data flow
- Minimal re-renders

## 📋 **Form States**

### **Create Mode**
- Empty form with default values
- All fields editable
- Save button creates new record

### **Edit Mode**
- Pre-populated with existing data
- All fields editable
- Save button updates existing record

### **Delete Mode**
- Confirmation dialog
- Shows record details
- Delete button removes record

## 🔄 **Data Flow**

1. **Form Opens** - Initialize with data (create/edit mode)
2. **User Input** - Real-time validation and error clearing
3. **Form Submit** - Validate all fields
4. **Save Handler** - Call parent's save function
5. **Success** - Close form and refresh data
6. **Error** - Show error message and keep form open

## 📚 **Dependencies**

- `DialogBox` - Modal component
- `React` - Core framework
- `TypeScript` - Type safety
- Tailwind CSS - Styling

## 🎯 **Future Enhancements**

### **Planned Features**
- Bulk import/export functionality
- Form templates and presets
- Advanced validation rules
- Auto-save functionality
- Form versioning and history

### **Integration Points**
- Database integration
- File upload support
- Real-time collaboration
- Audit logging
- Notification system

## 📖 **Best Practices**

### **Form Design**
- Group related fields together
- Use clear, descriptive labels
- Provide helpful placeholder text
- Show validation errors immediately
- Use appropriate input types

### **User Experience**
- Minimize required fields
- Provide default values where possible
- Use progressive disclosure for complex forms
- Give clear feedback on actions
- Allow easy form cancellation

### **Code Quality**
- Use TypeScript for type safety
- Implement proper error handling
- Follow consistent naming conventions
- Write reusable components
- Document complex logic

The academic form components provide a complete solution for managing the academic structure with a focus on usability, accessibility, and maintainability.
