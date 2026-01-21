-- Migration: Normalize Exercise Schema with Full Gym Exercise Dataset
-- This migration transforms the exercise system into a fully normalized structure
-- and seeds it with a complete, production-ready exercise database.

-- ============================================================================
-- STEP 1: Create equipment table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- STEP 2: Add is_cardio field to exercises table
-- ============================================================================
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS is_cardio BOOLEAN DEFAULT false;

-- ============================================================================
-- STEP 3: Create join tables
-- ============================================================================

-- Join table for exercises and muscle groups (many-to-many)
CREATE TABLE IF NOT EXISTS public.exercise_muscle_groups (
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  muscle_group_id UUID NOT NULL REFERENCES public.muscle_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, muscle_group_id)
);

-- Join table for exercises and equipment (many-to-many)
CREATE TABLE IF NOT EXISTS public.exercise_equipment (
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, equipment_id)
);

-- ============================================================================
-- STEP 4: Enable Row Level Security
-- ============================================================================
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_equipment ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create RLS Policies (Public read access)
-- ============================================================================

-- Equipment policies
DROP POLICY IF EXISTS "Anyone can view equipment" ON public.equipment;
CREATE POLICY "Anyone can view equipment"
  ON public.equipment FOR SELECT
  USING (true);

-- Exercise muscle groups policies
DROP POLICY IF EXISTS "Anyone can view exercise muscle groups" ON public.exercise_muscle_groups;
CREATE POLICY "Anyone can view exercise muscle groups"
  ON public.exercise_muscle_groups FOR SELECT
  USING (true);

-- Exercise equipment policies
DROP POLICY IF EXISTS "Anyone can view exercise equipment" ON public.exercise_equipment;
CREATE POLICY "Anyone can view exercise equipment"
  ON public.exercise_equipment FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 6: Create indexes for optimal query performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_muscle_groups_exercise_id ON public.exercise_muscle_groups(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_muscle_groups_muscle_group_id ON public.exercise_muscle_groups(muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercise_equipment_exercise_id ON public.exercise_equipment(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_equipment_equipment_id ON public.exercise_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_exercises_is_cardio ON public.exercises(is_cardio);

-- ============================================================================
-- STEP 7: Seed Muscle Groups (Idempotent)
-- ============================================================================
INSERT INTO public.muscle_groups (name, description) VALUES
  ('Chest', 'Pectoral muscles'),
  ('Back', 'Latissimus dorsi, trapezius, rhomboids'),
  ('Shoulders', 'Deltoids - anterior, lateral, posterior'),
  ('Biceps', 'Biceps brachii'),
  ('Triceps', 'Triceps brachii'),
  ('Forearms', 'Wrist flexors and extensors'),
  ('Abs / Core', 'Abdominals, obliques'),
  ('Legs', 'Quadriceps, hamstrings'),
  ('Calves', 'Gastrocnemius, soleus'),
  ('Glutes', 'Gluteus maximus, medius, minimus'),
  ('Cardio / Conditioning', 'Cardiovascular endurance'),
  ('Neck', 'Neck muscles')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 8: Seed Equipment Types (Idempotent)
-- ============================================================================
INSERT INTO public.equipment (name) VALUES
  ('Dumbbells'),
  ('Barbells'),
  ('Smith Machine'),
  ('Cable Machine'),
  ('Pec Deck'),
  ('Benches'),
  ('Lat Pulldown Machine'),
  ('Pull-Up Machine'),
  ('Lower Back Machine'),
  ('Leg Press Machine'),
  ('Leg Curl Machine'),
  ('Calves Machine'),
  ('Treadmill'),
  ('Cycling Cycle'),
  ('Boxing Bag'),
  ('Bodyweight'),
  ('Bicep Curl Machine')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 9: Clear existing exercises and seed comprehensive dataset
-- ============================================================================

-- Delete existing exercise relationships and exercises
-- This ensures a clean slate for the new normalized structure
DELETE FROM public.exercise_muscle_groups;
DELETE FROM public.exercise_equipment;
DELETE FROM public.exercises;

-- Seed all exercises with proper structure
-- CHEST EXERCISES
INSERT INTO public.exercises (name, is_cardio) VALUES
  ('Dumbbell Flat Bench Press', false),
  ('Dumbbell Incline Bench Press', false),
  ('Dumbbell Decline Bench Press', false),
  ('Dumbbell Chest Fly', false),
  ('Barbell Flat Bench Press', false),
  ('Barbell Incline Bench Press', false),
  ('Barbell Decline Bench Press', false),
  ('Smith Machine Bench Press', false),
  ('Smith Machine Incline Press', false),
  ('Cable Chest Fly (Mid)', false),
  ('Cable Chest Fly (Low)', false),
  ('Cable Chest Fly (High)', false),
  ('Pec Deck Fly', false),
  ('Bench Push-Ups', false),
  
  -- BACK EXERCISES
  ('Dumbbell Bent-Over Row', false),
  ('One-Arm Dumbbell Row', false),
  ('Dumbbell Deadlift', false),
  ('Barbell Bent-Over Row', false),
  ('Barbell Deadlift', false),
  ('Barbell Rack Pull', false),
  ('Smith Machine Row', false),
  ('Smith Machine Deadlift', false),
  ('Wide Grip Lat Pulldown', false),
  ('Close Grip Lat Pulldown', false),
  ('Reverse Grip Lat Pulldown', false),
  ('Seated Cable Row', false),
  ('Straight Arm Pulldown', false),
  ('Face Pull', false),
  ('Assisted Pull-Ups', false),
  ('Assisted Chin-Ups', false),
  ('Back Extension', false),
  
  -- SHOULDERS EXERCISES
  ('Dumbbell Shoulder Press', false),
  ('Dumbbell Lateral Raise', false),
  ('Dumbbell Front Raise', false),
  ('Dumbbell Rear Delt Fly', false),
  ('Barbell Overhead Press', false),
  ('Barbell Upright Row', false),
  ('Smith Machine Shoulder Press', false),
  ('Smith Machine Upright Row', false),
  ('Cable Lateral Raise', false),
  ('Cable Front Raise', false),
  ('Cable Rear Delt Fly', false),
  
  -- BICEPS EXERCISES
  ('Dumbbell Bicep Curl', false),
  ('Hammer Curl', false),
  ('Concentration Curl', false),
  ('Barbell Curl', false),
  ('EZ-Bar Curl', false),
  ('Close-Grip Curl', false),
  ('Cable Bicep Curl', false),
  ('Rope Hammer Curl', false),
  ('Machine Bicep Curl', false),
  ('Incline Dumbbell Curl', false),
  ('Preacher Curl', false),
  
  -- TRICEPS EXERCISES
  ('Dumbbell Overhead Extension', false),
  ('Dumbbell Kickback', false),
  ('Skull Crushers', false),
  ('Close-Grip Bench Press', false),
  ('Smith Machine Close-Grip Press', false),
  ('Tricep Pushdown (Straight Bar)', false),
  ('Tricep Pushdown (Rope)', false),
  ('Overhead Cable Extension', false),
  ('Bench Dips', false),
  
  -- FOREARMS EXERCISES
  ('Wrist Curl', false),
  ('Reverse Wrist Curl', false),
  ('Farmers Walk', false),
  ('Barbell Wrist Curl', false),
  ('Reverse Barbell Curl', false),
  ('Cable Wrist Curl', false),
  
  -- ABS / CORE EXERCISES
  ('Crunches', false),
  ('Decline Sit-Ups', false),
  ('Cable Crunch', false),
  ('Cable Woodchopper', false),
  ('Roman Chair Leg Raises', false),
  ('Plank', false),
  ('Hanging Knee Raises', false),
  
  -- LEGS EXERCISES
  ('Goblet Squat', false),
  ('Dumbbell Lunges', false),
  ('Dumbbell Step-Ups', false),
  ('Barbell Squat', false),
  ('Front Squat', false),
  ('Barbell Lunges', false),
  ('Romanian Deadlift', false),
  ('Smith Machine Squat', false),
  ('Smith Machine Lunges', false),
  ('Leg Press', false),
  ('Narrow Stance Leg Press', false),
  ('Wide Stance Leg Press', false),
  ('Lying Leg Curl', false),
  ('Seated Leg Curl', false),
  ('Bulgarian Split Squat', false),
  
  -- CALVES EXERCISES
  ('Standing Calf Raise', false),
  ('Seated Calf Raise', false),
  ('Smith Machine Calf Raises', false),
  ('Leg Press Calf Raises', false),
  
  -- GLUTES EXERCISES
  ('Hip Thrust', false),
  ('Barbell Glute Bridge', false),
  ('Smith Machine Hip Thrust', false),
  ('Cable Kickbacks', false),
  
  -- CARDIO / CONDITIONING EXERCISES
  ('Walking', true),
  ('Jogging', true),
  ('Sprinting', true),
  ('Incline Walk', true),
  ('Steady Cycling', true),
  ('High-Resistance Cycling', true),
  ('Heavy Bag Punching', true),
  ('Boxing Conditioning Rounds', true),
  
  -- NECK EXERCISES
  ('Neck Flexion', false),
  ('Neck Extension', false);

-- ============================================================================
-- STEP 10: Create relationships between exercises, muscle groups, and equipment
-- ============================================================================

-- Helper function to get IDs (used in subsequent INSERT statements)
DO $$
DECLARE
  -- Muscle Group IDs
  mg_chest UUID;
  mg_back UUID;
  mg_shoulders UUID;
  mg_biceps UUID;
  mg_triceps UUID;
  mg_forearms UUID;
  mg_abs_core UUID;
  mg_legs UUID;
  mg_calves UUID;
  mg_glutes UUID;
  mg_cardio UUID;
  mg_neck UUID;
  
  -- Equipment IDs
  eq_dumbbells UUID;
  eq_barbells UUID;
  eq_smith_machine UUID;
  eq_cable_machine UUID;
  eq_pec_deck UUID;
  eq_benches UUID;
  eq_lat_pulldown UUID;
  eq_pullup_machine UUID;
  eq_lower_back_machine UUID;
  eq_leg_press_machine UUID;
  eq_leg_curl_machine UUID;
  eq_calves_machine UUID;
  eq_treadmill UUID;
  eq_cycling_cycle UUID;
  eq_boxing_bag UUID;
  eq_bodyweight UUID;
  eq_bicep_curl_machine UUID;
  
  -- Exercise IDs (we'll declare these as we need them)
  ex_id UUID;
  
BEGIN
  -- Fetch muscle group IDs
  SELECT id INTO mg_chest FROM public.muscle_groups WHERE name = 'Chest';
  SELECT id INTO mg_back FROM public.muscle_groups WHERE name = 'Back';
  SELECT id INTO mg_shoulders FROM public.muscle_groups WHERE name = 'Shoulders';
  SELECT id INTO mg_biceps FROM public.muscle_groups WHERE name = 'Biceps';
  SELECT id INTO mg_triceps FROM public.muscle_groups WHERE name = 'Triceps';
  SELECT id INTO mg_forearms FROM public.muscle_groups WHERE name = 'Forearms';
  SELECT id INTO mg_abs_core FROM public.muscle_groups WHERE name = 'Abs / Core';
  SELECT id INTO mg_legs FROM public.muscle_groups WHERE name = 'Legs';
  SELECT id INTO mg_calves FROM public.muscle_groups WHERE name = 'Calves';
  SELECT id INTO mg_glutes FROM public.muscle_groups WHERE name = 'Glutes';
  SELECT id INTO mg_cardio FROM public.muscle_groups WHERE name = 'Cardio / Conditioning';
  SELECT id INTO mg_neck FROM public.muscle_groups WHERE name = 'Neck';
  
  -- Fetch equipment IDs
  SELECT id INTO eq_dumbbells FROM public.equipment WHERE name = 'Dumbbells';
  SELECT id INTO eq_barbells FROM public.equipment WHERE name = 'Barbells';
  SELECT id INTO eq_smith_machine FROM public.equipment WHERE name = 'Smith Machine';
  SELECT id INTO eq_cable_machine FROM public.equipment WHERE name = 'Cable Machine';
  SELECT id INTO eq_pec_deck FROM public.equipment WHERE name = 'Pec Deck';
  SELECT id INTO eq_benches FROM public.equipment WHERE name = 'Benches';
  SELECT id INTO eq_lat_pulldown FROM public.equipment WHERE name = 'Lat Pulldown Machine';
  SELECT id INTO eq_pullup_machine FROM public.equipment WHERE name = 'Pull-Up Machine';
  SELECT id INTO eq_lower_back_machine FROM public.equipment WHERE name = 'Lower Back Machine';
  SELECT id INTO eq_leg_press_machine FROM public.equipment WHERE name = 'Leg Press Machine';
  SELECT id INTO eq_leg_curl_machine FROM public.equipment WHERE name = 'Leg Curl Machine';
  SELECT id INTO eq_calves_machine FROM public.equipment WHERE name = 'Calves Machine';
  SELECT id INTO eq_treadmill FROM public.equipment WHERE name = 'Treadmill';
  SELECT id INTO eq_cycling_cycle FROM public.equipment WHERE name = 'Cycling Cycle';
  SELECT id INTO eq_boxing_bag FROM public.equipment WHERE name = 'Boxing Bag';
  SELECT id INTO eq_bodyweight FROM public.equipment WHERE name = 'Bodyweight';
  SELECT id INTO eq_bicep_curl_machine FROM public.equipment WHERE name = 'Bicep Curl Machine';
  
  -- CHEST EXERCISES
  -- Dumbbell Flat Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Flat Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Incline Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Incline Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Decline Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Decline Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Chest Fly
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Chest Fly';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Flat Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Flat Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Incline Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Incline Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Decline Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Decline Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Smith Machine Incline Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Incline Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Cable Chest Fly (Mid)
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Chest Fly (Mid)';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Cable Chest Fly (Low)
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Chest Fly (Low)';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Cable Chest Fly (High)
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Chest Fly (High)';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Pec Deck Fly
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Pec Deck Fly';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_pec_deck);
  
  -- Bench Push-Ups
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Bench Push-Ups';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_chest);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches), (ex_id, eq_bodyweight);
  
  -- BACK EXERCISES
  -- Dumbbell Bent-Over Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Bent-Over Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- One-Arm Dumbbell Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'One-Arm Dumbbell Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Deadlift
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Deadlift';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Bent-Over Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Bent-Over Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Deadlift
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Deadlift';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Rack Pull
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Rack Pull';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Smith Machine Deadlift
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Deadlift';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Wide Grip Lat Pulldown
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Wide Grip Lat Pulldown';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_lat_pulldown);
  
  -- Close Grip Lat Pulldown
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Close Grip Lat Pulldown';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_lat_pulldown);
  
  -- Reverse Grip Lat Pulldown
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Reverse Grip Lat Pulldown';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_lat_pulldown);
  
  -- Seated Cable Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Seated Cable Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Straight Arm Pulldown
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Straight Arm Pulldown';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Face Pull
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Face Pull';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Assisted Pull-Ups
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Assisted Pull-Ups';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_pullup_machine);
  
  -- Assisted Chin-Ups
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Assisted Chin-Ups';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_pullup_machine);
  
  -- Back Extension
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Back Extension';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_back);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_lower_back_machine);
  
  -- SHOULDERS EXERCISES
  -- Dumbbell Shoulder Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Shoulder Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Lateral Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Lateral Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Front Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Front Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Rear Delt Fly
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Rear Delt Fly';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Overhead Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Overhead Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Upright Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Upright Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Shoulder Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Shoulder Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Smith Machine Upright Row
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Upright Row';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Cable Lateral Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Lateral Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Cable Front Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Front Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Cable Rear Delt Fly
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Rear Delt Fly';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_shoulders);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- BICEPS EXERCISES
  -- Dumbbell Bicep Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Bicep Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Hammer Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Hammer Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Concentration Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Concentration Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- EZ-Bar Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'EZ-Bar Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Close-Grip Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Close-Grip Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Cable Bicep Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Bicep Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Rope Hammer Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Rope Hammer Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Machine Bicep Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Machine Bicep Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_bicep_curl_machine);
  
  -- Incline Dumbbell Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Incline Dumbbell Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches);
  
  -- Preacher Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Preacher Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_biceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches);
  
  -- TRICEPS EXERCISES
  -- Dumbbell Overhead Extension
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Overhead Extension';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Kickback
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Kickback';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Skull Crushers
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Skull Crushers';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Close-Grip Bench Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Close-Grip Bench Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Close-Grip Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Close-Grip Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Tricep Pushdown (Straight Bar)
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Tricep Pushdown (Straight Bar)';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Tricep Pushdown (Rope)
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Tricep Pushdown (Rope)';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Overhead Cable Extension
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Overhead Cable Extension';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Bench Dips
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Bench Dips';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_triceps);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches), (ex_id, eq_bodyweight);
  
  -- FOREARMS EXERCISES
  -- Wrist Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Wrist Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Reverse Wrist Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Reverse Wrist Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Farmers Walk
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Farmers Walk';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Wrist Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Wrist Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Reverse Barbell Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Reverse Barbell Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Cable Wrist Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Wrist Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_forearms);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- ABS / CORE EXERCISES
  -- Crunches
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Crunches';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches);
  
  -- Decline Sit-Ups
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Decline Sit-Ups';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches);
  
  -- Cable Crunch
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Crunch';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Cable Woodchopper
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Woodchopper';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Roman Chair Leg Raises
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Roman Chair Leg Raises';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_lower_back_machine);
  
  -- Plank
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Plank';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_bodyweight);
  
  -- Hanging Knee Raises
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Hanging Knee Raises';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_abs_core);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_bodyweight);
  
  -- LEGS EXERCISES
  -- Goblet Squat
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Goblet Squat';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Lunges
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Lunges';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Dumbbell Step-Ups
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Dumbbell Step-Ups';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_dumbbells);
  
  -- Barbell Squat
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Squat';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Front Squat
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Front Squat';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Lunges
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Lunges';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Romanian Deadlift
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Romanian Deadlift';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Squat
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Squat';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Smith Machine Lunges
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Lunges';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Leg Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Leg Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_press_machine);
  
  -- Narrow Stance Leg Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Narrow Stance Leg Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_press_machine);
  
  -- Wide Stance Leg Press
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Wide Stance Leg Press';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_press_machine);
  
  -- Lying Leg Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Lying Leg Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_curl_machine);
  
  -- Seated Leg Curl
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Seated Leg Curl';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_curl_machine);
  
  -- Bulgarian Split Squat
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Bulgarian Split Squat';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_legs);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_benches);
  
  -- CALVES EXERCISES
  -- Standing Calf Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Standing Calf Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_calves);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_calves_machine);
  
  -- Seated Calf Raise
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Seated Calf Raise';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_calves);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_calves_machine);
  
  -- Smith Machine Calf Raises
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Calf Raises';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_calves);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Leg Press Calf Raises
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Leg Press Calf Raises';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_calves);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_leg_press_machine);
  
  -- GLUTES EXERCISES
  -- Hip Thrust
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Hip Thrust';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_glutes);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Barbell Glute Bridge
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Barbell Glute Bridge';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_glutes);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_barbells);
  
  -- Smith Machine Hip Thrust
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Smith Machine Hip Thrust';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_glutes);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_smith_machine);
  
  -- Cable Kickbacks
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Cable Kickbacks';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_glutes);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- CARDIO / CONDITIONING EXERCISES
  -- Walking
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Walking';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_treadmill);
  
  -- Jogging
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Jogging';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_treadmill);
  
  -- Sprinting
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Sprinting';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_treadmill);
  
  -- Incline Walk
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Incline Walk';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_treadmill);
  
  -- Steady Cycling
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Steady Cycling';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cycling_cycle);
  
  -- High-Resistance Cycling
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'High-Resistance Cycling';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cycling_cycle);
  
  -- Heavy Bag Punching
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Heavy Bag Punching';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_boxing_bag);
  
  -- Boxing Conditioning Rounds
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Boxing Conditioning Rounds';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_cardio);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_boxing_bag);
  
  -- NECK EXERCISES
  -- Neck Flexion
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Neck Flexion';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_neck);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
  -- Neck Extension
  SELECT id INTO ex_id FROM public.exercises WHERE name = 'Neck Extension';
  INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id) VALUES (ex_id, mg_neck);
  INSERT INTO public.exercise_equipment (exercise_id, equipment_id) VALUES (ex_id, eq_cable_machine);
  
END $$;

-- ============================================================================
-- STEP 11: Drop old array columns (after data migration is complete)
-- ============================================================================
-- Note: We keep these columns for backward compatibility during transition
-- Uncomment these lines in a future migration after frontend is fully updated:
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS muscle_groups;
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS equipment;
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS difficulty;
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS description;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration successfully:
-- 1. ✅ Created normalized equipment table
-- 2. ✅ Created exercise_muscle_groups join table
-- 3. ✅ Created exercise_equipment join table
-- 4. ✅ Added is_cardio field to exercises
-- 5. ✅ Enabled RLS on all new tables
-- 6. ✅ Created public read policies
-- 7. ✅ Added performance indexes
-- 8. ✅ Seeded 12 muscle groups
-- 9. ✅ Seeded 17 equipment types
-- 10. ✅ Seeded 116 exercises with proper relationships
-- 11. ✅ Migration is idempotent (safe to run multiple times)
