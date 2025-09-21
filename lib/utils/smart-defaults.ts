export const getSmartDefaults = (userRole: string, userDepartment?: string) => {
  const defaults = {
    student: {
      // Default to current academic year and semester
      academicYear: 'current',
      semester: 'current'
    },
    lecturer: {
      // Default to lecturer's department
      department: userDepartment,
      academicYear: 'current',
      semester: 'current'
    },
    admin: {
      // Default to current academic year and semester
      academicYear: 'current',
      semester: 'current'
    }
  }
  
  return defaults[userRole] || defaults.admin
}

export const getFilteredOptions = (options: any[], userRole: string, userDepartment?: string) => {
  const defaults = getSmartDefaults(userRole, userDepartment)
  
  // Filter options based on user context
  if (userRole === 'lecturer' && userDepartment) {
    return options.filter(option => 
      option.department === userDepartment || 
      option.group?.includes(userDepartment)
    )
  }
  
  return options
}
