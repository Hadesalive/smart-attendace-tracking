-- Manual SQL script to create section_enrollments table
-- Run this in your Supabase SQL editor or database client

-- Create section_enrollments table
CREATE TABLE IF NOT EXISTS public.section_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  grade VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, section_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_section_enrollments_student_id ON public.section_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_section_enrollments_section_id ON public.section_enrollments(section_id);
CREATE INDEX IF NOT EXISTS idx_section_enrollments_status ON public.section_enrollments(status);

-- Enable RLS
ALTER TABLE public.section_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view their own section enrollments" ON public.section_enrollments
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all section enrollments" ON public.section_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Lecturers can view all section enrollments" ON public.section_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'lecturer'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_section_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_section_enrollments_updated_at
  BEFORE UPDATE ON public.section_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_section_enrollments_updated_at();

-- Verify table was created
SELECT 'section_enrollments table created successfully!' as status;
