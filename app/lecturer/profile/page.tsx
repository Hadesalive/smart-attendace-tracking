"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Box,
  Typography,
  Card as MUICard,
  CardContent as MUICardContent,
  Button as MUIButton,
  Avatar,
  Chip,
  TextField,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  LinearProgress
} from "@mui/material"
import {
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  UserGroupIcon,
  TrophyIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline"
import { formatDate } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LecturerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  position: string
  employeeId: string
  joinDate: string
  officeLocation: string
  officeHours: string
  bio: string
  specializations: string[]
  qualifications: string[]
  researchInterests: string[]
  avatar?: string
}

interface ContactInfo {
  email: string
  phone: string
  officeLocation: string
  officeHours: string
}

interface TeachingStats {
  totalCourses: number
  totalStudents: number
  averageRating: number
  totalSessions: number
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  sessionReminders: boolean
  assignmentDeadlines: boolean
  gradeUpdates: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'students' | 'private'
  showEmail: boolean
  showPhone: boolean
  showOfficeHours: boolean
}

interface SystemSettings {
  language: string
  timezone: string
  theme: 'light' | 'dark' | 'auto'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_SX = {
  border: '1px solid #000',
  borderRadius: 2,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out'
  }
} as const

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { bgcolor: '#333' }
  },
  outlined: {
    borderColor: '#000',
    color: '#000',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': { 
      borderColor: '#000',
      bgcolor: 'rgba(0,0,0,0.04)'
    }
  }
} as const

const INPUT_STYLES = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#000',
    },
    '&:hover fieldset': {
      borderColor: '#000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000',
    },
  },
} as const

// ============================================================================
// MOCK DATA
// ============================================================================

const mockLecturerProfile: LecturerProfile = {
  id: "lecturer-1",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@university.edu",
  phone: "+1 (555) 123-4567",
  department: "Computer Science",
  position: "Associate Professor",
  employeeId: "EMP-2019-001",
  joinDate: "2019-08-15",
  officeLocation: "Engineering Building, Room 301",
  officeHours: "Monday & Wednesday 2:00-4:00 PM",
  bio: "Dr. Sarah Johnson is an Associate Professor in the Computer Science department with over 10 years of teaching experience. She specializes in database systems, machine learning, and software engineering.",
  specializations: ["Database Systems", "Machine Learning", "Software Engineering", "Data Mining"],
  qualifications: ["PhD in Computer Science - MIT (2015)", "MSc in Computer Science - Stanford (2010)", "BSc in Computer Science - UC Berkeley (2008)"],
  researchInterests: ["Artificial Intelligence", "Big Data Analytics", "Cloud Computing", "Cybersecurity"],
  avatar: "/placeholder-user.jpg"
}

const mockTeachingStats: TeachingStats = {
  totalCourses: 8,
  totalStudents: 245,
  averageRating: 4.7,
  totalSessions: 156
}

const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  sessionReminders: true,
  assignmentDeadlines: true,
  gradeUpdates: false
}

const mockPrivacySettings: PrivacySettings = {
  profileVisibility: 'students',
  showEmail: true,
  showPhone: false,
  showOfficeHours: true
}

const mockSystemSettings: SystemSettings = {
  language: 'English',
  timezone: 'UTC-5 (Eastern)',
  theme: 'light'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LecturerProfilePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [profile, setProfile] = useState<LecturerProfile>(mockLecturerProfile)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: mockLecturerProfile.email,
    phone: mockLecturerProfile.phone,
    officeLocation: mockLecturerProfile.officeLocation,
    officeHours: mockLecturerProfile.officeHours
  })
  const [teachingStats] = useState<TeachingStats>(mockTeachingStats)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(mockPrivacySettings)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<LecturerProfile>(mockLecturerProfile)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile(editedProfile)
    }
    setIsEditing(!isEditing)
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleProfileChange = (field: keyof LecturerProfile, value: string | string[]) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }))
  }

  // ============================================================================
  // TAB CONTENT COMPONENTS
  // ============================================================================

  const OverviewTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Profile Header */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              src={profile.avatar}
              sx={{ width: 100, height: 100, bgcolor: '#f0f0f0' }}
            >
              <UserIcon className="h-12 w-12" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, mb: 1 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                {profile.position} • {profile.department}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`ID: ${profile.employeeId}`} size="small" />
                <Chip label={`Since ${new Date(profile.joinDate).getFullYear()}`} size="small" />
              </Box>
            </Box>
            <IconButton onClick={handleEditToggle} sx={{ alignSelf: 'flex-start' }}>
              <PencilIcon className="h-5 w-5" />
            </IconButton>
          </Box>
          <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.6 }}>
            {profile.bio}
          </Typography>
        </MUICardContent>
      </MUICard>

      {/* Contact Information */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EnvelopeIcon className="h-5 w-5" />
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>Email</Typography>
                  <Typography variant="body1">{profile.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon className="h-5 w-5 text-gray-500" />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>Phone</Typography>
                  <Typography variant="body1">{profile.phone}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>Office Location</Typography>
                  <Typography variant="body1">{profile.officeLocation}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>Office Hours</Typography>
                  <Typography variant="body1">{profile.officeHours}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Teaching Statistics */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChartBarIcon className="h-5 w-5" />
            Teaching Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid #000' }}>
              <BookOpenIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>{teachingStats.totalCourses}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>Total Courses</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid #000' }}>
              <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>{teachingStats.totalStudents}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>Total Students</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid #000' }}>
              <TrophyIcon className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>{teachingStats.averageRating}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>Avg Rating</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid #000' }}>
              <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>{teachingStats.totalSessions}</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>Sessions Taught</Typography>
            </Box>
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Recent Activity */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
            Recent Activity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { action: "Graded Assignment 3 for CS301", time: "2 hours ago", type: "grade" },
              { action: "Created new session for Database Systems", time: "5 hours ago", type: "session" },
              { action: "Updated course materials for CS101", time: "1 day ago", type: "material" },
              { action: "Posted announcement in Data Structures", time: "2 days ago", type: "announcement" }
            ].map((activity, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1, border: '1px solid #000' }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: activity.type === 'grade' ? '#10b981' : activity.type === 'session' ? '#3b82f6' : activity.type === 'material' ? '#f59e0b' : '#8b5cf6'
                }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{activity.action}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{activity.time}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </MUICardContent>
      </MUICard>
    </Box>
  )

  const PersonalInfoTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {isEditing && (
        <Alert severity="info" sx={{ border: '1px solid #000' }}>
          You are in edit mode. Make your changes and click Save to update your profile.
        </Alert>
      )}

      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isEditing ? (
                <>
                  <IconButton onClick={handleEditToggle} sx={{ color: '#10b981' }}>
                    <CheckIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} sx={{ color: '#ef4444' }}>
                    <XMarkIcon className="h-5 w-5" />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={handleEditToggle}>
                  <PencilIcon className="h-5 w-5" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="First Name"
                value={isEditing ? editedProfile.firstName : profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                disabled={!isEditing}
                sx={INPUT_STYLES}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={isEditing ? editedProfile.lastName : profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                disabled={!isEditing}
                sx={INPUT_STYLES}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Department"
                value={isEditing ? editedProfile.department : profile.department}
                onChange={(e) => handleProfileChange('department', e.target.value)}
                disabled={!isEditing}
                sx={INPUT_STYLES}
              />
              <TextField
                fullWidth
                label="Position"
                value={isEditing ? editedProfile.position : profile.position}
                onChange={(e) => handleProfileChange('position', e.target.value)}
                disabled={!isEditing}
                sx={INPUT_STYLES}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              value={isEditing ? editedProfile.bio : profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              disabled={!isEditing}
              sx={INPUT_STYLES}
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Contact Information */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
            Contact Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
                sx={INPUT_STYLES}
              />
              <TextField
                fullWidth
                label="Phone"
                value={contactInfo.phone}
                onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                sx={INPUT_STYLES}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Office Location"
                value={contactInfo.officeLocation}
                onChange={(e) => handleContactInfoChange('officeLocation', e.target.value)}
                sx={INPUT_STYLES}
              />
              <TextField
                fullWidth
                label="Office Hours"
                value={contactInfo.officeHours}
                onChange={(e) => handleContactInfoChange('officeHours', e.target.value)}
                sx={INPUT_STYLES}
              />
            </Box>
          </Box>
        </MUICardContent>
      </MUICard>
    </Box>
  )

  const AcademicTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Qualifications */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AcademicCapIcon className="h-5 w-5" />
            Academic Qualifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {profile.qualifications.map((qualification, index) => (
              <Box key={index} sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1, border: '1px solid #000' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {qualification}
                </Typography>
              </Box>
            ))}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Specializations */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
            Specializations
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.specializations.map((spec, index) => (
              <Chip key={index} label={spec} sx={{ bgcolor: 'rgba(0,0,0,0.1)', border: '1px solid #000' }} />
            ))}
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Research Interests */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
            Research Interests
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.researchInterests.map((interest, index) => (
              <Chip key={index} label={interest} variant="outlined" sx={{ borderColor: '#000' }} />
            ))}
          </Box>
        </MUICardContent>
      </MUICard>
    </Box>
  )

  const SettingsTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Notification Settings */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BellIcon className="h-5 w-5" />
            Notification Preferences
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={() => handleNotificationChange('pushNotifications')}
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.sessionReminders}
                  onChange={() => handleNotificationChange('sessionReminders')}
                />
              }
              label="Session Reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.assignmentDeadlines}
                  onChange={() => handleNotificationChange('assignmentDeadlines')}
                />
              }
              label="Assignment Deadlines"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.gradeUpdates}
                  onChange={() => handleNotificationChange('gradeUpdates')}
                />
              }
              label="Grade Updates"
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Privacy Settings */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldCheckIcon className="h-5 w-5" />
            Privacy Settings
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                />
              }
              label="Show Email to Students"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                />
              }
              label="Show Phone to Students"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showOfficeHours}
                  onChange={(e) => handlePrivacyChange('showOfficeHours', e.target.checked)}
                />
              }
              label="Show Office Hours to Students"
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* System Settings */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cog6ToothIcon className="h-5 w-5" />
            System Preferences
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Language"
              value={systemSettings.language}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              fullWidth
              label="Timezone"
              value={systemSettings.timezone}
              disabled
              sx={INPUT_STYLES}
            />
            <TextField
              fullWidth
              label="Theme"
              value={systemSettings.theme}
              disabled
              sx={INPUT_STYLES}
            />
          </Box>
        </MUICardContent>
      </MUICard>

      {/* Account Actions */}
      <MUICard sx={CARD_SX}>
        <MUICardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, mb: 3 }}>
            Account Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <MUIButton variant="outlined" sx={BUTTON_STYLES.outlined}>
              Change Password
            </MUIButton>
            <MUIButton variant="outlined" sx={BUTTON_STYLES.outlined}>
              Download Data
            </MUIButton>
            <MUIButton variant="outlined" sx={{ ...BUTTON_STYLES.outlined, borderColor: '#ef4444', color: '#ef4444' }}>
              Delete Account
            </MUIButton>
          </Box>
        </MUICardContent>
      </MUICard>
    </Box>
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'transparent'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 700, 
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <UserIcon className="h-8 w-8" />
            Profile Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Manage your profile information, teaching details, and account preferences
          </Typography>
        </Box>

        {/* Tabs */}
        <MUICard sx={CARD_SX}>
          <Box sx={{ borderBottom: '1px solid #000' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#666',
                  '&.Mui-selected': {
                    color: '#000'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#000'
                }
              }}
            >
              <Tab label="Overview" icon={<UserIcon className="h-4 w-4" />} iconPosition="start" />
              <Tab label="Personal Info" icon={<PencilIcon className="h-4 w-4" />} iconPosition="start" />
              <Tab label="Academic" icon={<AcademicCapIcon className="h-4 w-4" />} iconPosition="start" />
              <Tab label="Settings" icon={<Cog6ToothIcon className="h-4 w-4" />} iconPosition="start" />
            </Tabs>
          </Box>
          <MUICardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {activeTab === 0 && <OverviewTab />}
            {activeTab === 1 && <PersonalInfoTab />}
            {activeTab === 2 && <AcademicTab />}
            {activeTab === 3 && <SettingsTab />}
          </MUICardContent>
        </MUICard>
      </motion.div>
    </Box>
  )
}
