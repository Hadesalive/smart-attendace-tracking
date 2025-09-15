"use client"

import React, { ReactNode } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button as MUIButton
} from "@mui/material"

// ============================================================================
// TYPES
// ============================================================================

export interface TableColumn {
  id: string
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string | ReactNode
}

export interface TableAction {
  label: string
  onClick: (row: any) => void
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'error'
  href?: string
  component?: 'button' | 'a'
  sx?: any
}

export interface DataTableCardProps {
  title: string
  subtitle?: string
  data: any[]
  columns: TableColumn[]
  actions?: TableAction[]
  filters?: ReactNode
  headerActions?: ReactNode
  mobileCardRenderer?: (item: any, index: number) => ReactNode
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (row: any) => void
  tableProps?: any
  cardProps?: any
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BUTTON_STYLES = {
  primary: {
    bgcolor: '#000',
    color: 'white',
    textTransform: 'none' as const,
    fontWeight: 700,
    '&:hover': { bgcolor: '#111' }
  }
} as const

// ============================================================================
// COMPONENT
// ============================================================================

export default function DataTableCard({
  title,
  subtitle,
  data,
  columns,
  actions = [],
  filters,
  headerActions,
  mobileCardRenderer,
  emptyMessage = "No data available",
  loading = false,
  onRowClick,
  tableProps,
  cardProps
}: DataTableCardProps) {
  
  const renderDesktopTable = () => (
    <TableContainer sx={{ 
      '&::-webkit-scrollbar': { height: 8 },
      '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 4 },
      '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
    }}>
      <Table 
        aria-label={`${title} table`} 
        sx={{ minWidth: 600, ...tableProps?.sx }}
        {...tableProps}
      >
        <TableHead>
          <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    py: 2,
                    px: 3,
                    minWidth: column.minWidth,
                    color: '#000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '2px solid #e5e7eb'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            {actions.length > 0 && (
              <TableCell sx={{ 
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                py: 2,
                px: 3,
                color: '#000',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row.id || index} 
              hover 
              sx={{ 
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ 
                    fontSize: '0.875rem',
                    py: 1.5,
                    px: 3,
                    fontFamily: column.id === columns[0].id ? 'Poppins, sans-serif' : undefined,
                    fontWeight: column.id === columns[0].id ? 600 : undefined,
                    color: '#111827',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell sx={{ px: 3, borderBottom: '1px solid #f3f4f6' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    alignItems: 'center'
                  }}>
                    {actions.map((action, actionIndex) => (
                      <React.Fragment key={actionIndex}>
                        {action.component === 'a' ? (
                          <a 
                            href={action.href}
                            onClick={() => action.onClick?.(row)}
                            className="underline"
                            style={{ 
                              color: '#000',
                              fontSize: '0.875rem',
                              textDecoration: 'underline',
                              touchAction: 'manipulation',
                              minHeight: '44px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {action.label}
                          </a>
                        ) : (
                          <MUIButton 
                            size="small" 
                            variant={action.variant || 'contained'}
                            onClick={() => action.onClick(row)}
                            sx={{
                              ...BUTTON_STYLES.primary,
                              fontSize: '0.875rem',
                              px: 2,
                              py: 1,
                              touchAction: 'manipulation',
                              ...action.sx
                            }}
                          >
                            {action.label}
                          </MUIButton>
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderMobileCards = () => (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item, index) => (
          mobileCardRenderer ? 
            mobileCardRenderer(item, index) : 
            <Card 
              key={item.id || index}
              sx={{ 
                bgcolor: 'white',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#000',
                    mb: 1
                  }}
                >
                  {item[columns[0].id]}
                </Typography>
                {columns.slice(1).map((column) => (
                  <Box key={column.id} sx={{ mb: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'Poppins, sans-serif',
                        color: '#999',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {column.label}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Poppins, sans-serif',
                        color: '#333',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {column.format ? column.format(item[column.id]) : item[column.id]}
                    </Typography>
                  </Box>
                ))}
                {actions.length > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexDirection: 'column',
                    mt: 2
                  }}>
                    {actions.map((action, actionIndex) => (
                      <MUIButton 
                        key={actionIndex}
                        variant={action.variant || 'contained'} 
                        onClick={() => action.onClick(item)}
                        sx={{
                          ...BUTTON_STYLES.primary,
                          fontSize: '0.875rem',
                          py: 1.5,
                          touchAction: 'manipulation',
                          width: '100%',
                          ...action.sx
                        }}
                      >
                        {action.label}
                      </MUIButton>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
        ))}
      </Box>
    </Box>
  )

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card sx={{ 
          border: '1px solid',
          borderColor: '#e5e7eb',
          borderRadius: 3,
          boxShadow: 'none',
          ...cardProps?.sx
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography>Loading...</Typography>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Desktop/Tablet View - no card wrapper for unibody design */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: { xs: 2, sm: 2.5, md: 3 } 
        }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#000',
                fontFamily: 'Poppins, sans-serif',
                mb: subtitle ? 0.5 : 0
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {headerActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {headerActions}
            </Box>
          )}
        </Box>

        {/* Filters */}
        {filters && (
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
            {filters}
          </Box>
        )}

        {/* Content */}
        {data.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: '#6b7280'
          }}>
            <Typography variant="body1" sx={{ fontFamily: 'DM Sans, sans-serif' }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          renderDesktopTable()
        )}
      </Box>

      {/* Mobile View - no Card wrapper, flat cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* Header for mobile */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontFamily: 'Poppins, sans-serif',
              mb: subtitle ? 0.5 : 0
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: '#6b7280'
              }}
            >
              {subtitle}
            </Typography>
          )}
          {headerActions && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {headerActions}
            </Box>
          )}
        </Box>

        {/* Filters for mobile */}
        {filters && (
          <Box sx={{ mb: 3 }}>
            {filters}
          </Box>
        )}

        {/* Mobile Content - flat cards */}
        {data.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: '#6b7280'
          }}>
            <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.map((item, index) => (
              mobileCardRenderer ? 
                mobileCardRenderer(item, index) : 
                <Card 
                  key={item.id || index}
                  sx={{ 
                    bgcolor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary'
                      }}
                    >
                      {item[columns[0].id]}
                    </Typography>
                    {columns.slice(1).map((column) => (
                      <Box key={column.id} sx={{ mb: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {column.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'DM Sans, sans-serif',
                            color: '#000',
                            fontWeight: 500
                          }}
                        >
                          {column.format ? column.format(item[column.id]) : item[column.id]}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Box>
    </motion.div>
  )
}
