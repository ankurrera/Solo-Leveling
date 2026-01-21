/**
 * XP Calculation System for Solo Leveling
 * 
 * This module implements a sophisticated XP calculation system that rewards
 * training stress and adaptation based on objective effort metrics.
 * 
 * Core principles:
 * - XP represents training stress + adaptation
 * - XP scales with objective effort
 * - No flat XP, no cosmetic rewards
 */

export interface ExerciseSet {
  reps: number;
  weight_kg: number | null;
}

export interface WorkoutData {
  sets: ExerciseSet[];
  duration_minutes: number;
  is_edited?: boolean;
}

export interface FatigueData {
  fatigue_level: number; // 0-100
}

export interface ConsistencyData {
  sessions_this_week: number;
}

/**
 * STEP 2 - Calculate Intensity Factor
 * Approximates intensity using rep ranges.
 * Lower reps = heavier weight = higher intensity
 */
export function calculateIntensityFactor(reps: number): number {
  if (reps <= 5) return 1.3;
  if (reps <= 8) return 1.15;
  if (reps <= 12) return 1.0;
  if (reps <= 20) return 0.9;
  return 0.9; // 20+ reps
}

/**
 * STEP 1 - Calculate Total Volume
 * Total volume = Σ (weight × reps) across all sets
 */
export function calculateTotalVolume(sets: ExerciseSet[]): number {
  return sets.reduce((total, set) => {
    const weight = set.weight_kg ?? 0;
    return total + (weight * set.reps);
  }, 0);
}

/**
 * Calculate average intensity factor for the session
 */
export function calculateAverageIntensity(sets: ExerciseSet[]): number {
  if (sets.length === 0) return 1.0;
  
  const totalIntensity = sets.reduce((total, set) => {
    return total + calculateIntensityFactor(set.reps);
  }, 0);
  
  return totalIntensity / sets.length;
}

/**
 * STEP 3 - Calculate Work Density
 * work_density = total_volume / session_duration_minutes
 * This represents how demanding the session actually was
 */
export function calculateWorkDensity(totalVolume: number, durationMinutes: number): number {
  if (durationMinutes <= 0) return 0;
  return totalVolume / durationMinutes;
}

/**
 * STEP 4 - Calculate Base XP from Effort
 * base_xp = (sqrt(total_volume) × 0.5 + work_density × 0.4 + session_duration_minutes × 0.3) × intensity_factor
 * 
 * Properties:
 * - Heavy + dense workouts score higher
 * - Long but lazy sessions score lower
 * - No single variable dominates
 */
export function calculateBaseXP(
  totalVolume: number,
  workDensity: number,
  durationMinutes: number,
  intensityFactor: number
): number {
  const volumeComponent = Math.sqrt(totalVolume) * 0.5;
  const densityComponent = workDensity * 0.4;
  const durationComponent = durationMinutes * 0.3;
  
  return (volumeComponent + densityComponent + durationComponent) * intensityFactor;
}

/**
 * STEP 5 - Apply Fatigue Efficiency Modifier
 * Hard training while exhausted is less effective
 */
export function getFatigueModifier(fatigueLevel: number): number {
  if (fatigueLevel < 40) return 1.0;
  if (fatigueLevel < 60) return 0.85;
  if (fatigueLevel < 80) return 0.7;
  return 0.55; // fatigue >= 80
}

/**
 * STEP 6 - Apply Consistency Bonus
 * Rewards regular training but caps at 1.25
 */
export function getConsistencyMultiplier(sessionsThisWeek: number): number {
  if (sessionsThisWeek >= 5) return 1.25;
  if (sessionsThisWeek === 4) return 1.2;
  if (sessionsThisWeek === 3) return 1.1;
  return 1.0; // 1-2 sessions
}

/**
 * STEP 7 - Apply XP Bounds
 * Minimum: 20 XP per completed session
 * Maximum: 120 XP per session
 */
export function applyXPBounds(xp: number): number {
  return Math.max(20, Math.min(120, Math.round(xp)));
}

/**
 * Main XP Calculation Function
 * Combines all steps to calculate final XP for a workout session
 */
export function calculateSessionXP(
  workoutData: WorkoutData,
  fatigueData: FatigueData = { fatigue_level: 0 },
  consistencyData: ConsistencyData = { sessions_this_week: 0 }
): number {
  // Validate completion requirements
  if (workoutData.duration_minutes < 20) {
    return 0; // Session must be at least 20 minutes
  }
  
  const totalVolume = calculateTotalVolume(workoutData.sets);
  if (totalVolume <= 0) {
    return 0; // Session must have volume
  }
  
  // STEP 1 & 2: Calculate volume and intensity
  const intensityFactor = calculateAverageIntensity(workoutData.sets);
  
  // STEP 3: Calculate work density
  const workDensity = calculateWorkDensity(totalVolume, workoutData.duration_minutes);
  
  // STEP 4: Calculate base XP
  let xp = calculateBaseXP(totalVolume, workDensity, workoutData.duration_minutes, intensityFactor);
  
  // STEP 5: Apply fatigue modifier
  const fatigueModifier = getFatigueModifier(fatigueData.fatigue_level);
  xp *= fatigueModifier;
  
  // STEP 6: Apply consistency bonus
  const consistencyMultiplier = getConsistencyMultiplier(consistencyData.sessions_this_week);
  xp *= consistencyMultiplier;
  
  // STEP 8: Apply edit penalty if session was edited
  if (workoutData.is_edited) {
    xp *= 0.8;
  }
  
  // STEP 7: Apply bounds
  return applyXPBounds(xp);
}

/**
 * Get a system message based on XP earned
 */
export function getSystemMessage(xp: number): string {
  if (xp >= 100) {
    return "Exceptional training stress detected. Maximum adaptation stimulus achieved.";
  } else if (xp >= 70) {
    return "Significant training load registered. Adaptation in progress.";
  } else if (xp >= 45) {
    return "Training stress registered. Adaptation in progress.";
  } else {
    return "Recovery session logged. Maintaining baseline adaptation.";
  }
}

/**
 * Classify workout type based on XP
 */
export function classifyWorkout(xp: number): string {
  if (xp >= 100) return "Very intense session";
  if (xp >= 70) return "Heavy compound day";
  if (xp >= 45) return "Normal hypertrophy";
  return "Light / recovery";
}
