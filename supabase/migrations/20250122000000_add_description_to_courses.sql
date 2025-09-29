-- ============================================================================
-- ADD DESCRIPTION COLUMN TO COURSES TABLE
-- ============================================================================
-- This migration adds a description column to the courses table to provide
-- more detailed information about each course.

-- Add description column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add an index on the description column for better search performance
CREATE INDEX IF NOT EXISTS idx_courses_description ON courses USING gin(to_tsvector('english', description));

