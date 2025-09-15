"use client"

import React from "react"
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material"
import { motion } from "framer-motion"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

interface FilterOption {
  value: string
  label: string
}

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: Array<{
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }>
  showFilters?: boolean
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

export default function SearchFilters({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = "Search...",
  filters = [],
  showFilters = true
}: SearchFiltersProps) {
  if (!showFilters) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
    >
      <Card sx={{ ...CARD_SX, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" }, 
            gap: 3, 
            alignItems: { sm: "center" } 
          }}>
            <TextField
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
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
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#f9fafb",
                  "& fieldset": { borderColor: "#e5e7eb" },
                  "&:hover fieldset": { borderColor: "#d1d5db" },
                  "&.Mui-focused fieldset": { borderColor: "#000" }
                }
              }}
            />
            
            {filters.map((filter, index) => (
              <FormControl key={index} sx={{ minWidth: 200 }}>
                <InputLabel sx={TYPOGRAPHY_STYLES.inputLabel}>{filter.label}</InputLabel>
                <Select
                  value={filter.value}
                  label={filter.label}
                  onChange={(e) => filter.onChange(e.target.value)}
                  sx={{
                    fontFamily: "DM Sans, sans-serif",
                    backgroundColor: "#f9fafb",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#000" }
                  }}
                >
                  {filter.options.map(option => (
                    <MenuItem key={option.value} value={option.value} sx={TYPOGRAPHY_STYLES.menuItem}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}
