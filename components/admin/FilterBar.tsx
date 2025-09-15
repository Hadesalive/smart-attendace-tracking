"use client"

import React from "react"
import { Box, Paper, TextField } from "@mui/material"

export type FilterField =
  | { type: 'native-select'; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; span?: number }
  | { type: 'text'; label: string; value: string; onChange: (v: string) => void; placeholder?: string; span?: number }

interface FilterBarProps {
  fields: FilterField[]
}

export default function FilterBar({ fields }: FilterBarProps) {
  return (
    <Paper sx={{ mt: 4, mb: 3, p: { xs: 2, sm: 3 }, border: '1px solid #000', borderRadius: 4, backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(12, minmax(0,1fr))' } }}>
        {fields.map((f, idx) => (
          <Box key={idx} sx={{ gridColumn: { xs: '1 / -1', sm: `span ${f.span ?? 3}` } }}>
            {f.type === 'native-select' ? (
              <TextField
                select
                fullWidth
                size="small"
                variant="outlined"
                label={f.label}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, minWidth: 0 }}
              >
                {f.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label={f.label}
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, minWidth: 0 }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}


