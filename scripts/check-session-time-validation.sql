-- Check session time validation issue
-- This helps diagnose timezone problems with attendance marking

SELECT 
  session_name,
  session_date,
  start_time,
  end_time,
  -- Combine date and time to create timestamps (this is what the edge function does)
  (session_date || 'T' || start_time)::timestamp AS start_timestamp,
  (session_date || 'T' || end_time)::timestamp AS end_timestamp,
  -- Current time
  NOW() AS current_time_with_tz,
  NOW()::timestamp AS current_time_no_tz,
  -- Validation checks (mimics edge function logic at line 83-84)
  CASE 
    WHEN NOW()::timestamp < (session_date || 'T' || start_time)::timestamp THEN '❌ Too Early (before session start)'
    WHEN NOW()::timestamp > (session_date || 'T' || end_time)::timestamp THEN '❌ Too Late (after session end)'
    ELSE '✅ Within Session Time'
  END AS validation_result,
  -- Time differences in minutes
  EXTRACT(EPOCH FROM (NOW()::timestamp - (session_date || 'T' || start_time)::timestamp))/60 AS minutes_since_start,
  EXTRACT(EPOCH FROM ((session_date || 'T' || end_time)::timestamp - NOW()::timestamp))/60 AS minutes_until_end,
  -- Database timezone
  current_setting('TIMEZONE') AS db_timezone
FROM attendance_sessions
WHERE id = 'a27cd36e-568c-45d5-bd98-427f4fb0508d';

