-- ============================================
-- Timestamp-Based Duration Tracking
-- ============================================
-- This migration enables automatic duration calculation from start_time and end_time
-- Removes the need for manual duration input

-- Add a function to calculate duration in minutes from timestamps
CREATE OR REPLACE FUNCTION calculate_session_duration(
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_start_time IS NULL OR p_end_time IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate duration in minutes
  RETURN EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a trigger to automatically calculate duration_minutes when end_time is set
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically calculate duration when end_time is set
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := ROUND(
      EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS calculate_duration_on_end_time ON public.workout_sessions;

CREATE TRIGGER calculate_duration_on_end_time
  BEFORE INSERT OR UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_duration();

-- Backfill duration_minutes for existing sessions that have start_time and end_time
UPDATE public.workout_sessions
SET duration_minutes = ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) / 60)
WHERE start_time IS NOT NULL 
  AND end_time IS NOT NULL 
  AND duration_minutes IS NULL;

-- Add comment to document the new behavior
COMMENT ON COLUMN public.workout_sessions.duration_minutes IS 
  'Duration in minutes, automatically calculated from end_time - start_time. Should not be manually set.';
COMMENT ON COLUMN public.workout_sessions.start_time IS 
  'Server timestamp when workout session started. Set on session creation.';
COMMENT ON COLUMN public.workout_sessions.end_time IS 
  'Server timestamp when workout session completed. Set on completion.';
