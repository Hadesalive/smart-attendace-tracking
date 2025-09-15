/**
 * ADMIN TIMETABLE PAGE (MVP)
 *
 * Plan timetable placements by Year → Semester → Program (Class) → Section.
 * Uses mock data for now; ready to wire to Supabase CRUD.
 */

"use client"

import React, { useMemo, useState } from "react"
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, MenuItem, Stack, Paper, FormControl, InputLabel, NativeSelect } from "@mui/material"
import { PlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import PageHeader from "@/components/admin/PageHeader"
import StatsGrid from "@/components/admin/StatsGrid"
import SearchFilters from "@/components/admin/SearchFilters"
import FilterBar, { FilterField } from "@/components/admin/FilterBar"
import MonochromeButton from "@/components/admin/MonochromeButton"
import DataTable from "@/components/admin/DataTable"
import ErrorAlert from "@/components/admin/ErrorAlert"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

type Year = 1 | 2 | 3 | 4
type Semester = 1 | 2

interface SlotRow {
  id: string
  program: string
  year: Year
  semester: Semester
  section: string
  day: string
  start: string
  end: string
  course: string
  teacher: string
  room: string
  status: "draft" | "published"
}

const mockSlots: SlotRow[] = [
  { id: "s1", program: "BSEM", year: 1, semester: 2, section: "2101", day: "Mon", start: "09:00", end: "10:30", course: "BSEM2101", teacher: "Dr. Mensah", room: "MB-101", status: "draft" },
  { id: "s2", program: "BSEM", year: 1, semester: 2, section: "2102", day: "Mon", start: "11:00", end: "12:30", course: "BSEM2101", teacher: "Dr. Smith", room: "SW-204", status: "published" },
]

export default function TimetablePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({ year: "1", semester: "2", program: "BSEM", section: "2101", day: "all" })
  const [error, setError] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [newSlot, setNewSlot] = useState({
    program: "BSEM",
    year: "1",
    semester: "2",
    section: "2101",
    day: "Mon",
    start: "09:00",
    end: "10:30",
    course: "BSEM2101",
    teacher: "",
    room: ""
  })

  const statsCards = useMemo(() => ([
    { title: "Draft Slots", value: mockSlots.filter(s => s.status === "draft").length, icon: PlusIcon, color: "#000000", subtitle: "Pending publish", change: "+1" },
    { title: "Published", value: mockSlots.filter(s => s.status === "published").length, icon: CheckCircleIcon, color: "#000000", subtitle: "Live timetable", change: "Stable" },
  ]), [])

  const columns = [
    { key: "program", label: "Program" },
    { key: "year", label: "Year" },
    { key: "semester", label: "Semester" },
    { key: "section", label: "Section" },
    { key: "day", label: "Day" },
    { key: "start", label: "Start" },
    { key: "end", label: "End" },
    { key: "course", label: "Course" },
    { key: "teacher", label: "Teacher" },
    { key: "room", label: "Room" },
    { key: "status", label: "Status" },
  ]

  const filtered = useMemo(() => {
    return mockSlots.filter(s => {
      const scopeMatch = (
        String(s.year) === filters.year &&
        String(s.semester) === filters.semester &&
        s.program === filters.program &&
        s.section === filters.section
      )
      const dayMatch = filters.day === "all" || s.day === filters.day
      const queryMatch = `${s.course} ${s.teacher} ${s.room}`.toLowerCase().includes(searchTerm.toLowerCase())
      return scopeMatch && dayMatch && queryMatch
    })
  }, [filters, searchTerm])

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Timetable Planner"
        subtitle="Plan weekly timetable by year, semester, program and section"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <MonochromeButton monoVariant="primary" startIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setOpenCreate(true)}>Add Slot</MonochromeButton>
            <MonochromeButton monoVariant="outlined">Publish</MonochromeButton>
          </Box>
        }
      />

      <StatsGrid stats={statsCards} />

      {error && (
        <Box sx={{ mt: 3 }}>
          <ErrorAlert error={error} onRetry={() => setError(null)} />
        </Box>
      )}

      {/* Scope filters via reusable FilterBar */}
      <FilterBar
        fields={[
          { type: 'native-select', label: 'Year', value: filters.year, onChange: (v) => setFilters(prev => ({ ...prev, year: v })), options: ['1','2','3','4'].map(v => ({ value: v, label: v })), span: 2 },
          { type: 'native-select', label: 'Semester', value: filters.semester, onChange: (v) => setFilters(prev => ({ ...prev, semester: v })), options: ['1','2'].map(v => ({ value: v, label: v })), span: 2 },
          { type: 'text', label: 'Program', value: filters.program, onChange: (v) => setFilters(prev => ({ ...prev, program: v })), placeholder: 'BSEM', span: 4 },
          { type: 'text', label: 'Section', value: filters.section, onChange: (v) => setFilters(prev => ({ ...prev, section: v })), placeholder: '2101', span: 3 },
          { type: 'native-select', label: 'Day', value: filters.day, onChange: (v) => setFilters(prev => ({ ...prev, day: v })), options: [{ value: 'all', label: 'All' }, ...['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(v => ({ value: v, label: v }))], span: 1 },
        ]}
      />

      <Box sx={{ mb: 2 }}>
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by course, teacher, room..."
          filters={[]}
        />
      </Box>

      <DataTable title="Timetable Slots" columns={columns as any} data={filtered as any} />

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={TYPOGRAPHY_STYLES.dialogTitle}>Create Timetable Slot</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box>
                <TextField select fullWidth label="Year" value={newSlot.year} onChange={(e) => setNewSlot(v => ({ ...v, year: e.target.value }))}>
                  {["1","2","3","4"].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Box>
              <Box>
                <TextField select fullWidth label="Semester" value={newSlot.semester} onChange={(e) => setNewSlot(v => ({ ...v, semester: e.target.value }))}>
                  {["1","2"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box>
                <TextField fullWidth label="Program" value={newSlot.program} onChange={(e) => setNewSlot(v => ({ ...v, program: e.target.value }))} />
              </Box>
              <Box>
                <TextField fullWidth label="Section" value={newSlot.section} onChange={(e) => setNewSlot(v => ({ ...v, section: e.target.value }))} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box>
                <TextField select fullWidth label="Day" value={newSlot.day} onChange={(e) => setNewSlot(v => ({ ...v, day: e.target.value }))}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField fullWidth label="Start" type="time" value={newSlot.start} onChange={(e) => setNewSlot(v => ({ ...v, start: e.target.value }))} />
                <TextField fullWidth label="End" type="time" value={newSlot.end} onChange={(e) => setNewSlot(v => ({ ...v, end: e.target.value }))} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box>
                <TextField fullWidth label="Course" value={newSlot.course} onChange={(e) => setNewSlot(v => ({ ...v, course: e.target.value }))} placeholder="BSEM2101" />
              </Box>
              <Box>
                <TextField fullWidth label="Teacher" value={newSlot.teacher} onChange={(e) => setNewSlot(v => ({ ...v, teacher: e.target.value }))} placeholder="Dr. Mensah" />
              </Box>
            </Box>

            <TextField fullWidth label="Room" value={newSlot.room} onChange={(e) => setNewSlot(v => ({ ...v, room: e.target.value }))} placeholder="MB-101" />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
              <Button variant="outlined" sx={{ ...BUTTON_STYLES.outlined, ...TYPOGRAPHY_STYLES.buttonText }} onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button variant="contained" sx={{ ...BUTTON_STYLES.primary, ...TYPOGRAPHY_STYLES.buttonText }} onClick={() => setOpenCreate(false)}>Save Draft</Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  )
}


