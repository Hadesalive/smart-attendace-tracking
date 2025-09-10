"use client"

import React from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"
import { motion } from "framer-motion"
import { ComputerDesktopIcon } from "@heroicons/react/24/outline"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  Filler
)

const AnalyticsCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          bgcolor: 'card',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'card-foreground',
              fontFamily: 'Poppins, sans-serif',
              mb: { xs: 2, sm: 2.5, md: 3 },
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
            }}
          >
            <ComputerDesktopIcon aria-hidden="true" style={{ 
              width: 24, 
              height: 24, 
              color: '#000000' 
            }} />
            Analytics & Performance
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: '1fr', 
              md: '1fr', 
              lg: 'repeat(2, 1fr)' 
            },
            gap: { xs: 2, sm: 2.5, md: 3, lg: 3 }
          }}>
            {/* Student Growth Trend */}
            <Box aria-label="Student growth line chart" role="group">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif',
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Student Growth Trend
              </Typography>
              <Box sx={{ 
                height: { xs: 180, sm: 200, md: 225, lg: 250 }, 
                p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
                minHeight: { xs: 180, sm: 200 }
              }}>
                <Line 
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                      label: 'Total Students',
                      data: [1350, 1380, 1400, 1420, 1440, 1450, 1470],
                      borderColor: '#000000',
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#000000',
                      pointBorderColor: '#FFFFFF',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                      pointHoverRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      x: {
                        grid: { 
                          color: 'rgba(0, 0, 0, 0.1)',
                          display: true
                        },
                        ticks: { 
                          color: '#555657', 
                          font: { 
                            family: 'DM Sans, sans-serif', 
                            size: 10
                          },
                          maxRotation: 45,
                          minRotation: 0
                        }
                      },
                      y: {
                        grid: { 
                          color: 'rgba(0, 0, 0, 0.1)',
                          display: true
                        },
                        ticks: { 
                          color: '#555657', 
                          font: { 
                            family: 'DM Sans, sans-serif', 
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Weekly Attendance */}
            <Box aria-label="Weekly attendance bar chart" role="group">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'card-foreground',
                  fontFamily: 'Poppins, sans-serif',
                  mb: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Weekly Attendance
              </Typography>
              <Box sx={{ 
                height: { xs: 180, sm: 200, md: 225, lg: 250 }, 
                p: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
                minHeight: { xs: 180, sm: 200 }
              }}>
                <Bar 
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    datasets: [
                      {
                        label: 'Student Attendance',
                        data: [95, 92, 88, 94, 96],
                        backgroundColor: '#008080', // Keep teal for attendance chart as requested
                        borderRadius: 6,
                        borderSkipped: false
                      },
                      {
                        label: 'Staff Attendance',
                        data: [98, 97, 95, 99, 98],
                        backgroundColor: '#000000',
                        borderRadius: 6,
                        borderSkipped: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      intersect: false,
                      mode: 'index'
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top' as const,
                        labels: {
                          color: 'card-foreground',
                          font: { 
                            family: 'DM Sans, sans-serif', 
                            size: 10
                          },
                          usePointStyle: true,
                          pointStyle: 'circle',
                          padding: 15
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: { 
                          color: 'rgba(0, 0, 0, 0.1)',
                          display: true
                        },
                        ticks: { 
                          color: '#555657', 
                          font: { 
                            family: 'DM Sans, sans-serif', 
                            size: 10
                          },
                          maxRotation: 45,
                          minRotation: 0
                        }
                      },
                      y: {
                        grid: { 
                          color: 'rgba(0, 0, 0, 0.1)',
                          display: true
                        },
                        ticks: { 
                          color: '#555657', 
                          font: { 
                            family: 'DM Sans, sans-serif', 
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AnalyticsCard
