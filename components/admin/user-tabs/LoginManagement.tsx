import React, { useState, useEffect } from "react"
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Switch, 
  FormControlLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material"
import { 
  KeyIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { useAuth } from "@/lib/domains"

interface LoginManagementProps {
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'lecturer' | 'student'
    lastLogin: string
  }
}

export default function LoginManagement({ user }: LoginManagementProps) {
  const auth = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isAccountActive, setIsAccountActive] = useState(true)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [isAccountStatusChanged, setIsAccountStatusChanged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<{
    isActive: boolean
    lastLogin: string | null
    emailConfirmed: boolean
  } | null>(null)

  // Load user auth status on component mount
  useEffect(() => {
    // Only load if we don't already have auth status and not currently loading
    if (authStatus || loading) return

    const loadAuthStatus = async () => {
      try {
        setLoading(true)
        const status = await auth.getUserAuthStatus(user.id)
        if (status) {
          setAuthStatus({
            ...status,
            lastLogin: status.lastLogin || null
          })
          setIsAccountActive(status.isActive)
        }
      } catch (error) {
        console.error('Error loading auth status:', error)
        setError('Failed to load user authentication status')
      } finally {
        setLoading(false)
      }
    }

    loadAuthStatus()
  }, [user.id]) // Only depend on user.id to prevent loops

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await auth.resetUserPassword(user.id, newPassword)
      
      setSuccess("Password reset successfully")
      setIsPasswordReset(true)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setError(error.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountStatusToggle = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const newStatus = !isAccountActive
      await auth.updateUserStatus(user.id, newStatus)
      
      setIsAccountActive(newStatus)
      setIsAccountStatusChanged(true)
      setSuccess(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      setError(error.message || "Failed to update account status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={TYPOGRAPHY_STYLES.pageTitle} gutterBottom>
        Login Management
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage user login credentials and account status
      </Typography>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Account Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LockClosedIcon className="h-5 w-5 mr-2" />
            <Typography variant="h6" sx={TYPOGRAPHY_STYLES.sectionTitle}>
              Account Status
            </Typography>
            {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={isAccountActive}
                onChange={handleAccountStatusToggle}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Account Active
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAccountActive ? 'User can log in' : 'User account is disabled'}
                </Typography>
              </Box>
            }
          />
          
          {authStatus && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email Confirmed: {authStatus.emailConfirmed ? 'Yes' : 'No'}
              </Typography>
              {authStatus.lastLogin && (
                <Typography variant="body2" color="text.secondary">
                  Last Login: {new Date(authStatus.lastLogin).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <KeyIcon className="h-5 w-5 mr-2" />
            <Typography variant="h6" sx={TYPOGRAPHY_STYLES.sectionTitle}>
              Password Management
            </Typography>
            {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last login: {authStatus?.lastLogin ? new Date(authStatus.lastLogin).toLocaleString() : 'Never'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowPassword(!showPassword)}
                    size="small"
                    sx={{ minWidth: 'auto', p: 1 }}
                    disabled={loading}
                  >
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                )
              }}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              disabled={loading}
            />
          </Box>

          <Button
            variant="contained"
            onClick={handlePasswordReset}
            disabled={!newPassword || !confirmPassword || loading}
            sx={BUTTON_STYLES.contained}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <Typography variant="h6" sx={TYPOGRAPHY_STYLES.sectionTitle}>
              Security Information
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.id}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.email}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Account Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon className={`h-4 w-4 ${isAccountActive ? 'text-green-500' : 'text-red-500'}`} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {isAccountActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email Confirmed
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon className={`h-4 w-4 ${authStatus?.emailConfirmed ? 'text-green-500' : 'text-red-500'}`} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {authStatus?.emailConfirmed ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Login
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {authStatus?.lastLogin ? new Date(authStatus.lastLogin).toLocaleDateString() : 'Never'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
