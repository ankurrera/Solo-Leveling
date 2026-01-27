/**
 * Core Metrics System for Solo Leveling
 * 
 * This module defines the Physical Balance metrics that can be used in the radar chart.
 * Core Metrics receive XP from Skills and Characteristics - they are NEVER directly edited.
 * 
 * DYNAMIC RADAR AXES BEHAVIOR:
 * "Generate radar axes dynamically from active Core Metrics derived from user Skills.
 * Remove any metric from the radar if no skills contribute to it."
 * 
 * HARD OVERRIDE LINE:
 * "If the radar chart is not driven entirely by computed Core Metric XP derived from Skills, 
 * the implementation is incorrect."
 */

/**
 * Physical Balance Core Metrics - Available Metric Names
 * 
 * These are the POSSIBLE metrics that can appear on the radar chart.
 * The ACTUAL radar axes are generated dynamically based on which metrics
 * have skills contributing to them.
 * 
 * - If no skills contribute to a metric → it does NOT appear on the radar
 * - If a skill is created that contributes to a metric → the metric appears
 * - If all skills contributing to a metric are deleted → the metric disappears
 * 
 * The radar shape changes dynamically based on the user's actual skill development.
 */
export const PHYSICAL_BALANCE_METRICS = [
  'Programming',
  'Learning',
  'Erudition',
  'Discipline',
  'Productivity',
  'Foreign Language',
  'Fitness',
  'Drawing',
  'Hygiene',
  'Reading',
  'Communication',
  'Cooking',
  'Meditation',
  'Swimming',
  'Running',
  'Math',
  'Music',
  'Cleaning',
] as const;

export type CoreMetricName = typeof PHYSICAL_BALANCE_METRICS[number];

/**
 * Core Metric interface - XP is always derived, never stored manually
 */
export interface CoreMetric {
  id: CoreMetricName;
  name: CoreMetricName;
  xp: number; // Always computed: Σ (Skill XP × Contribution Weight)
}

/**
 * Skill contribution weight to a Core Metric
 * Weights must sum ≤ 1 per skill
 */
export interface MetricContribution {
  metricId: CoreMetricName;
  weight: number; // 0.0 to 1.0
}

/**
 * Skill with contribution mappings to Core Metrics
 */
export interface SkillWithContributions {
  id: string;
  name: string;
  xp: number;
  consistencyState: 'consistent' | 'partial' | 'broken' | 'neutral';
  contributesTo: Record<CoreMetricName, number>; // metricId: weight
}

/**
 * Maximum XP per Core Metric for radar chart display
 */
export const MAX_METRIC_XP = 2000;

/**
 * Default contribution mappings for common skill areas
 * These are suggestions for auto-mapping when skills are created
 */
export const DEFAULT_SKILL_MAPPINGS: Record<string, Partial<Record<CoreMetricName, number>>> = {
  'Programming': { 'Programming': 0.8, 'Math': 0.1, 'Productivity': 0.1 },
  'Music': { 'Music': 0.8, 'Discipline': 0.1, 'Meditation': 0.1 },
  'Fitness': { 'Fitness': 0.6, 'Discipline': 0.2, 'Running': 0.1, 'Swimming': 0.1 },
  'Art': { 'Drawing': 0.7, 'Meditation': 0.15, 'Discipline': 0.15 },
  'Languages': { 'Foreign Language': 0.7, 'Communication': 0.15, 'Learning': 0.15 },
  'Business': { 'Productivity': 0.5, 'Communication': 0.3, 'Discipline': 0.2 },
  'Science': { 'Erudition': 0.5, 'Math': 0.3, 'Learning': 0.2 },
  'Writing': { 'Communication': 0.5, 'Reading': 0.25, 'Erudition': 0.25 },
};

/**
 * Get the default contribution mapping for a skill area
 * Falls back to a generic "Learning" contribution if no mapping exists
 */
export function getDefaultMapping(area: string | null): Partial<Record<CoreMetricName, number>> {
  if (area && DEFAULT_SKILL_MAPPINGS[area]) {
    return DEFAULT_SKILL_MAPPINGS[area];
  }
  // Default fallback: contribute to Learning
  return { 'Learning': 0.5, 'Discipline': 0.3, 'Productivity': 0.2 };
}

/**
 * Floating point comparison tolerance for weight validation
 * Used to account for JavaScript floating-point arithmetic imprecision
 */
const WEIGHT_SUM_TOLERANCE = 1.0001;

/**
 * Validate that contribution weights sum to ≤ 1
 */
export function validateContributionWeights(
  contributions: Partial<Record<CoreMetricName, number>>
): boolean {
  const sum = Object.values(contributions).reduce((acc, weight) => acc + (weight || 0), 0);
  return sum <= WEIGHT_SUM_TOLERANCE;
}

/**
 * Normalize contribution weights if they exceed 1
 */
export function normalizeContributionWeights(
  contributions: Partial<Record<CoreMetricName, number>>
): Record<CoreMetricName, number> {
  const result: Partial<Record<CoreMetricName, number>> = {};
  const sum = Object.values(contributions).reduce((acc, weight) => acc + (weight || 0), 0);
  
  if (sum <= WEIGHT_SUM_TOLERANCE) {
    // Already valid, just copy
    for (const [key, value] of Object.entries(contributions)) {
      result[key as CoreMetricName] = value || 0;
    }
  } else {
    // Normalize
    for (const [key, value] of Object.entries(contributions)) {
      result[key as CoreMetricName] = (value || 0) / sum;
    }
  }
  
  return result as Record<CoreMetricName, number>;
}
