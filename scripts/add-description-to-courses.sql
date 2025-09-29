-- ============================================================================
-- ADD DESCRIPTION COLUMN TO COURSES TABLE - MANUAL SCRIPT
-- ============================================================================
-- This script can be run manually in your Supabase SQL editor or via psql

-- Add description column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add an index on the description column for better search performance
CREATE INDEX IF NOT EXISTS idx_courses_description ON courses USING gin(to_tsvector('english', description));

-- Sample course descriptions (customize these for your actual courses)
UPDATE courses SET description = 'Introduction to programming concepts and problem-solving techniques' WHERE course_code = 'CS101';
UPDATE courses SET description = 'Advanced data structures and algorithms analysis' WHERE course_code = 'CS201';
UPDATE courses SET description = 'Database design, implementation, and management' WHERE course_code = 'CS301';
UPDATE courses SET description = 'Software engineering principles and methodologies' WHERE course_code = 'CS401';

-- Verify the changes
SELECT course_code, course_name, description FROM courses LIMIT 5;
