/**
 * DATA TABLE COMPONENT
 * 
 * A reusable table component for displaying tabular data in admin pages.
 * Provides consistent styling, loading states, and responsive design.
 * 
 * ARCHITECTURE:
 * - Built with React 18 and TypeScript
 * - Uses Material-UI for consistent design system
 * - Implements Framer Motion for smooth animations
 * - Follows monochrome design policy for professional appearance
 * 
 * FEATURES IMPLEMENTED:
 * ✅ Responsive table layout with horizontal scrolling
 * ✅ Loading state with skeleton placeholders
 * ✅ Customizable column definitions
 * ✅ Consistent row styling and spacing
 * ✅ Smooth animations and transitions
 * 
 * FEATURES TO IMPLEMENT:
 * 🔄 Sorting and filtering functionality
 * 🔄 Pagination and virtual scrolling
 * 🔄 Row selection and bulk operations
 * 🔄 Column resizing and reordering
 * 🔄 Export functionality (CSV, Excel, PDF)
 * 🔄 Search and highlight functionality
 * 🔄 Row expansion and detail views
 * 🔄 Inline editing capabilities
 * 
 * USAGE:
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   loading={false}
 * />
 * ```
 * 
 * @author Senior Engineering Team
 * @version 1.0.0
 * @lastUpdated 2024-01-23
 */

"use client"

import React from "react"
import { 
  Box, 
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton
} from "@mui/material"
import { motion } from "framer-motion"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  title: string
  subtitle?: string
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any) => void
}

const CARD_SX = {
  border: "1px solid #000000",
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    duration: 0.3
  }
} as const

export default function DataTable({ 
  title, 
  subtitle, 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "No data found",
  onRowClick 
}: DataTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
    >
      <Card sx={CARD_SX}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography 
              variant="h5" 
              sx={TYPOGRAPHY_STYLES.sectionTitle}
            >
              {title} ({data.length})
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={TYPOGRAPHY_STYLES.sectionSubtitle}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={TYPOGRAPHY_STYLES.tableHeader}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          <Skeleton variant="text" width="80%" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{ 
                        "&:hover": { 
                          backgroundColor: "#f9fafb",
                          cursor: onRowClick ? "pointer" : "default",
                          borderLeft: onRowClick ? "3px solid #000000" : "none"
                        },
                        transition: "all 0.2s ease-in-out"
                      }}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
