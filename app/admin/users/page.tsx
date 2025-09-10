"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  Box as TabPanel
} from "@mui/material"
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon
} from "@heroicons/react/24/outline"
import { formatDate, formatNumber } from "@/lib/utils"
import { AddUserForm } from "@/components/admin/add-user-form"
import { supabase } from "@/lib/supabase"

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

const STATS_CARDS = [
  { label: "Total Users", value: 0, icon: UsersIcon, color: "#8b5cf6" },
  { label: "Students", value: 0, icon: AcademicCapIcon, color: "#10b981" },
  { label: "Lecturers", value: 0, icon: UserIcon, color: "#f59e0b" },
  { label: "Admins", value: 0, icon: Cog6ToothIcon, color: "#ef4444" }
] as const

const ROLE_COLORS = {
  student: "#10b981",
  lecturer: "#f59e0b", 
  admin: "#ef4444"
} as const

// ============================================================================
// INTERFACES
// ============================================================================

interface User {
  id: string
  full_name: string
  email: string
  role: 'student' | 'lecturer' | 'admin'
  created_at: string
  last_login?: string
  status: 'active' | 'inactive'
}

interface UserStats {
  totalUsers: number
  students: number
  lecturers: number
  admins: number
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UsersPage() {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    students: 0,
    lecturers: 0,
    admins: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddUserOpen, setAddUserOpen] = useState(false)
  const [isEditUserOpen, setEditUserOpen] = useState(false)
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setUsers(users || [])
      
      // Calculate stats
      const totalUsers = users?.length || 0
      const students = users?.filter(u => u.role === 'student').length || 0
      const lecturers = users?.filter(u => u.role === 'lecturer').length || 0
      const admins = users?.filter(u => u.role === 'admin').length || 0

      setStats({ totalUsers, students, lecturers, admins })
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedUser(null)
  }, [])

  const handleAddUserSuccess = useCallback(() => {
    fetchUsers()
    setAddUserOpen(false)
  }, [fetchUsers])

  const handleEditUser = useCallback(() => {
    setEditUserOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const handleDeleteUser = useCallback(() => {
    setDeleteConfirmOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const confirmDeleteUser = useCallback(async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id)

      if (error) throw error

      fetchUsers()
      setDeleteConfirmOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }, [selectedUser, fetchUsers])

  const handleRoleChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setSelectedRole(newValue)
  }, [])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const statsCardsWithData = useMemo(() => {
    return STATS_CARDS.map(card => ({
      ...card,
      value: card.label === "Total Users" ? stats.totalUsers :
             card.label === "Students" ? stats.students :
             card.label === "Lecturers" ? stats.lecturers :
             stats.admins
    }))
  }, [stats])

  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    return filtered
  }, [users, searchTerm, selectedRole])

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'student':
        return <AcademicCapIcon style={{ width: 16, height: 16 }} />
      case 'lecturer':
        return <UserIcon style={{ width: 16, height: 16 }} />
      case 'admin':
        return <Cog6ToothIcon style={{ width: 16, height: 16 }} />
      default:
        return <UserIcon style={{ width: 16, height: 16 }} />
    }
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={ANIMATION_CONFIG.spring}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4 
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontFamily: "Poppins", 
                fontWeight: 700, 
                color: "#000",
                fontSize: { xs: "1.75rem", sm: "2.125rem" },
                mb: 1
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: "DM Sans", 
                color: "#6b7280",
                fontSize: "1rem"
              }}
            >
              Manage system users, roles, and permissions
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<FunnelIcon className="h-4 w-4" />}
              sx={{
                borderColor: "#e5e7eb",
                color: "#374151",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { borderColor: "#d1d5db", backgroundColor: "#f9fafb" }
              }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setAddUserOpen(true)}
              sx={{
                backgroundColor: "#000",
                fontFamily: "DM Sans",
                textTransform: "none",
                "&:hover": { backgroundColor: "#1f2937" }
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCardsWithData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.1 + (index * 0.05) }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: "100%",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: "8px", 
                          backgroundColor: `${stat.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <stat.icon style={{ width: 24, height: 24, color: stat.color }} />
                      </Box>
                    </Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontFamily: "Poppins", 
                        fontWeight: 700, 
                        color: "#000",
                        mb: 0.5,
                        fontSize: "1.875rem"
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "DM Sans", 
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, alignItems: { sm: "center" } }}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon style={{ width: 20, height: 20, color: "#6b7280" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "DM Sans",
                    backgroundColor: "#f9fafb",
                    "& fieldset": { borderColor: "#e5e7eb" },
                    "&:hover fieldset": { borderColor: "#d1d5db" },
                    "&.Mui-focused fieldset": { borderColor: "#000" }
                  }
                }}
              />
              <Tabs 
                value={selectedRole} 
                onChange={handleRoleChange}
                sx={{
                  "& .MuiTab-root": {
                    fontFamily: "DM Sans",
                    textTransform: "none",
                    minWidth: "auto",
                    px: 2
                  }
                }}
              >
                <Tab label="All" value="all" />
                <Tab label="Students" value="student" />
                <Tab label="Lecturers" value="lecturer" />
                <Tab label="Admins" value="admin" />
              </Tabs>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
      >
        <Card sx={{ 
          border: "1px solid #f3f4f6",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: "Poppins", 
                  fontWeight: 600, 
                  color: "#000",
                  mb: 1
                }}
              >
                Users ({filteredUsers.length})
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "DM Sans", 
                  color: "#6b7280",
                  mb: 2
                }}
              >
                Manage all system users and their roles
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      User
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Joined
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Last Login
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontFamily: "DM Sans", fontWeight: 600, color: "#374151" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 + (index * 0.02) }}
                      component={TableRow}
                      sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar 
                            src={`/placeholder-user.jpg`} 
                            alt={user.full_name}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                fontWeight: 600, 
                                color: "#000",
                                mb: 0.5
                              }}
                            >
                              {user.full_name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontFamily: "DM Sans", 
                                color: "#6b7280"
                              }}
                            >
                              ID: {user.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans", 
                            color: "#374151"
                          }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box 
                            sx={{ 
                              p: 0.5, 
                              borderRadius: "4px", 
                              backgroundColor: `${ROLE_COLORS[user.role]}20`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {getRoleIcon(user.role)}
                          </Box>
                          <Chip 
                            label={user.role} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${ROLE_COLORS[user.role]}20`,
                              color: ROLE_COLORS[user.role],
                              fontFamily: "DM Sans",
                              textTransform: "capitalize",
                              fontWeight: 500
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans", 
                            color: "#374151"
                          }}
                        >
                          {formatDate(user.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: "DM Sans", 
                            color: "#374151"
                          }}
                        >
                          {user.last_login ? formatDate(user.last_login) : "Never"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || "active"} 
                          size="small"
                          sx={{ 
                            backgroundColor: user.status === "active" ? "#10b98120" : "#ef444420",
                            color: user.status === "active" ? "#10b981" : "#ef4444",
                            fontFamily: "DM Sans",
                            fontWeight: 500,
                            textTransform: "capitalize"
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                          sx={{ color: "#6b7280" }}
                        >
                          <EllipsisVerticalIcon style={{ width: 16, height: 16 }} />
                        </IconButton>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog 
        open={isAddUserOpen} 
        onClose={() => setAddUserOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#000" }}>
          Add New User
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#6b7280",
              mb: 3
            }}
          >
            Create a new user account for the system.
          </Typography>
          <AddUserForm onFormSubmit={handleAddUserSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: 600, color: "#000" }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: "DM Sans", 
              color: "#374151",
              mb: 2
            }}
          >
            Are you sure you want to delete <strong>{selectedUser?.full_name}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ 
              fontFamily: "DM Sans", 
              textTransform: "none",
              color: "#6b7280"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteUser}
            variant="contained"
            color="error"
            sx={{ 
              fontFamily: "DM Sans", 
              textTransform: "none"
            }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #f3f4f6"
          }
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "DM Sans" }}>
          <EyeIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleEditUser} sx={{ fontFamily: "DM Sans" }}>
          <PencilIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Edit User
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteUser} sx={{ fontFamily: "DM Sans", color: "#ef4444" }}>
          <TrashIcon style={{ width: 16, height: 16, marginRight: 8 }} />
          Delete User
        </MenuItem>
      </Menu>
    </Box>
  )
}