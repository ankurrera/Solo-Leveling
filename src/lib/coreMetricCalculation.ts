/**
 * Core Metric XP Calculation Engine
 * 
 * This module implements the live data mapping system that connects 
 * Skills and Characteristics directly to Core Metrics.
 * 
 * CORE PRINCIPLE (NON-NEGOTIABLE):
 * - Skills do NOT directly draw the radar
 * - Skills → contribute XP → Core Metrics
 * - Core Metrics → are the only data source for radar charts
 * 
 * FORMULA:
 * Metric XP = Σ (Skill XP × Contribution Weight)
 * 
 * HARD OVERRIDE LINE:
 * "If the radar chart is not driven entirely by computed Core Metric XP derived from Skills, 
 * the implementation is incorrect."
 */

import {
  PHYSICAL_BALANCE_METRICS,
  CoreMetricName,
  CoreMetric,
  MAX_METRIC_XP,
  getDefaultMapping,
} from './coreMetrics';

export interface SkillContributionData {
  id: string;
  name: string;
  xp: number;
  area: string | null;
  contributesTo?: Record<string, number>;
}

export interface CharacteristicContributionData {
  id: string;
  name: string;
  xp: number;
  contributesTo?: Record<string, number>;
}

export interface MetricContributionDetail {
  skillId: string;
  skillName: string;
  skillXp: number;
  weight: number;
  contributedXp: number;
}

export interface ComputedCoreMetric extends CoreMetric {
  contributions: MetricContributionDetail[];
  level: number;
}

/**
 * Calculate level from XP using the standard formula
 * Level = floor(sqrt(XP / 100)) + 1
 * 
 * XP Thresholds:
 * - Level 1: 0-99 XP
 * - Level 2: 100-399 XP
 * - Level 3: 400-899 XP
 * - Level 4: 900-1599 XP
 * - Level 5: 1600-2499 XP
 * - Level 10: 8100-9999 XP
 */
export function calculateMetricLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Compute a single Core Metric's XP from all contributing skills/characteristics
 * 
 * @param metricName The core metric to compute
 * @param skills Array of skills with their XP and contribution mappings
 * @param characteristics Array of characteristics with their XP and contribution mappings
 * @returns ComputedCoreMetric with XP, level, and contribution details
 */
export function computeCoreMetricXP(
  metricName: CoreMetricName,
  skills: SkillContributionData[],
  characteristics: CharacteristicContributionData[] = []
): ComputedCoreMetric {
  const contributions: MetricContributionDetail[] = [];
  let totalXp = 0;

  // Process skills
  for (const skill of skills) {
    const mapping = skill.contributesTo || getDefaultMapping(skill.area);
    const weight = mapping[metricName] || 0;
    
    if (weight > 0) {
      const contributedXp = Math.floor(skill.xp * weight);
      totalXp += contributedXp;
      contributions.push({
        skillId: skill.id,
        skillName: skill.name,
        skillXp: skill.xp,
        weight,
        contributedXp,
      });
    }
  }

  // Process characteristics (they can also contribute to metrics)
  for (const char of characteristics) {
    const mapping = char.contributesTo || {};
    const weight = mapping[metricName] || 0;
    
    if (weight > 0) {
      const contributedXp = Math.floor(char.xp * weight);
      totalXp += contributedXp;
      contributions.push({
        skillId: char.id,
        skillName: char.name,
        skillXp: char.xp,
        weight,
        contributedXp,
      });
    }
  }

  return {
    id: metricName,
    name: metricName,
    xp: totalXp,
    level: calculateMetricLevel(totalXp),
    contributions,
  };
}

/**
 * Get all unique metric names that have at least one skill/characteristic contributing to them
 * This generates the dynamic list of active metrics based on actual user data.
 * 
 * @param skills Array of skills with their XP and contribution mappings
 * @param characteristics Array of characteristics with their XP and contribution mappings
 * @returns Set of unique metric names that are actively being used
 */
export function getActiveMetricNames(
  skills: SkillContributionData[],
  characteristics: CharacteristicContributionData[] = []
): Set<CoreMetricName> {
  const activeMetrics = new Set<CoreMetricName>();
  
  // Collect metrics from skills
  for (const skill of skills) {
    const mapping = skill.contributesTo || getDefaultMapping(skill.area);
    for (const metricName of Object.keys(mapping)) {
      const weight = mapping[metricName];
      // Only include if weight > 0 and metric is valid
      if (weight > 0 && PHYSICAL_BALANCE_METRICS.includes(metricName as CoreMetricName)) {
        activeMetrics.add(metricName as CoreMetricName);
      }
    }
  }
  
  // Collect metrics from characteristics
  for (const char of characteristics) {
    const mapping = char.contributesTo || {};
    for (const metricName of Object.keys(mapping)) {
      const weight = mapping[metricName];
      // Only include if weight > 0 and metric is valid
      if (weight > 0 && PHYSICAL_BALANCE_METRICS.includes(metricName as CoreMetricName)) {
        activeMetrics.add(metricName as CoreMetricName);
      }
    }
  }
  
  return activeMetrics;
}

/**
 * Compute all Core Metrics XP from skills and characteristics
 * This is the main function called by the UI to get radar chart data
 * 
 * DYNAMIC BEHAVIOR:
 * - Only returns metrics that have at least one skill/characteristic contributing to them
 * - If a metric has no contributors, it will not appear in the radar
 * - If all skills are deleted, returns empty array
 * - When skills are added/removed, the metric list changes automatically
 * 
 * @param skills Array of skills with their XP and contribution mappings
 * @param characteristics Array of characteristics with their XP and contribution mappings
 * @returns Array of computed Core Metrics with XP values (only active metrics)
 */
export function computeAllCoreMetrics(
  skills: SkillContributionData[],
  characteristics: CharacteristicContributionData[] = []
): ComputedCoreMetric[] {
  // Generate radar axes dynamically from active Core Metrics derived from user Skills.
  // Remove any metric from the radar if no skills contribute to it.
  const activeMetrics = getActiveMetricNames(skills, characteristics);
  
  // Convert Set to Array and compute each metric
  const activeMetricArray = Array.from(activeMetrics);
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Core Metrics] Active metrics computed:', {
      totalMetrics: activeMetricArray.length,
      metrics: activeMetricArray,
      skillCount: skills.length,
      charCount: characteristics.length,
    });
  }
  
  return activeMetricArray.map(metricName => 
    computeCoreMetricXP(metricName, skills, characteristics)
  );
}

/**
 * Get radar chart data from computed Core Metrics
 * Clamps values to MAX_METRIC_XP for display purposes
 * 
 * @param metrics Computed core metrics
 * @returns Array of { label, value } for radar chart rendering
 */
export function getRadarChartData(
  metrics: ComputedCoreMetric[]
): { label: string; value: number }[] {
  return metrics.map(metric => ({
    label: metric.name,
    value: Math.min(metric.xp, MAX_METRIC_XP),
  }));
}

/**
 * Get which metrics a skill contributes to
 * Used for skill detail pages to show affected metrics
 * 
 * @param skill Skill with contribution data
 * @returns Array of metric names and contribution amounts
 */
export function getSkillMetricContributions(
  skill: SkillContributionData
): { metricName: CoreMetricName; weight: number; contributedXp: number }[] {
  const mapping = skill.contributesTo || getDefaultMapping(skill.area);
  const contributions: { metricName: CoreMetricName; weight: number; contributedXp: number }[] = [];
  
  for (const [metricName, weight] of Object.entries(mapping)) {
    if (weight > 0) {
      contributions.push({
        metricName: metricName as CoreMetricName,
        weight,
        contributedXp: Math.floor(skill.xp * weight),
      });
    }
  }
  
  return contributions.sort((a, b) => b.weight - a.weight);
}

/**
 * Calculate overall balance score based on all Core Metrics
 * Higher score means more balanced development across all metrics
 * 
 * @param metrics Computed core metrics
 * @returns Balance score from 0-100
 */
export function calculateBalanceScore(metrics: ComputedCoreMetric[]): number {
  if (metrics.length === 0) return 0;
  
  const xpValues = metrics.map(m => Math.min(m.xp, MAX_METRIC_XP));
  const maxXp = Math.max(...xpValues);
  
  if (maxXp === 0) return 0;
  
  // Calculate standard deviation as a measure of imbalance
  const mean = xpValues.reduce((a, b) => a + b, 0) / xpValues.length;
  const variance = xpValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / xpValues.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize: lower stdDev relative to mean = higher balance
  // Perfect balance (all equal) = 100, more variance = lower score
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
  const balanceScore = Math.max(0, Math.min(100, 100 * (1 - coefficientOfVariation)));
  
  return Math.round(balanceScore);
}

/**
 * Get the total XP across all Core Metrics
 * 
 * @param metrics Computed core metrics
 * @returns Total XP sum
 */
export function getTotalMetricXP(metrics: ComputedCoreMetric[]): number {
  return metrics.reduce((sum, metric) => sum + metric.xp, 0);
}

/**
 * Get the average level across all Core Metrics
 * 
 * @param metrics Computed core metrics
 * @returns Average level (rounded)
 */
export function getAverageMetricLevel(metrics: ComputedCoreMetric[]): number {
  if (metrics.length === 0) return 1;
  const totalLevels = metrics.reduce((sum, metric) => sum + metric.level, 0);
  return Math.round(totalLevels / metrics.length);
}
