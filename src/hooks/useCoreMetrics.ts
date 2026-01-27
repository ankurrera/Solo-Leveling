/**
 * useCoreMetrics Hook
 * 
 * This hook provides reactive Core Metric XP computation from Skills and Characteristics.
 * It recalculates automatically when:
 * - Skill XP changes
 * - Attendance is marked
 * - Time spent is edited
 * 
 * CORE PRINCIPLE (NON-NEGOTIABLE):
 * - Core Metric XP is COMPUTED, never stored manually
 * - Radar chart reads ONLY Core Metric XP
 * - No hardcoded radar values
 * 
 * HARD OVERRIDE LINE:
 * "If the radar chart is not driven entirely by computed Core Metric XP derived from Skills, 
 * the implementation is incorrect."
 */

import { useMemo } from 'react';
import { useSkills } from './useSkills';
import { useCharacteristics } from './useCharacteristics';
import {
  computeAllCoreMetrics,
  getRadarChartData,
  calculateBalanceScore,
  getTotalMetricXP,
  getAverageMetricLevel,
  getSkillMetricContributions,
  ComputedCoreMetric,
  SkillContributionData,
  CharacteristicContributionData,
} from '@/lib/coreMetricCalculation';
import { CoreMetricName, PHYSICAL_BALANCE_METRICS } from '@/lib/coreMetrics';

export interface UseCoreMetricsResult {
  // Computed Core Metrics with XP values
  coreMetrics: ComputedCoreMetric[];
  
  // Radar chart ready data
  radarData: { label: string; value: number }[];
  
  // Aggregate stats
  balanceScore: number;
  totalXP: number;
  averageLevel: number;
  
  // Loading state
  isLoading: boolean;
  
  // Helper functions for traceability
  getMetricContributors: (metricName: CoreMetricName) => ComputedCoreMetric['contributions'];
  getSkillContributions: (skillId: string) => { metricName: CoreMetricName; weight: number; contributedXp: number }[];
}

/**
 * Map skill data to contribution format
 */
function mapSkillToContributionData(skill: {
  id: string;
  name: string;
  xp: number;
  area: string | null;
}): SkillContributionData {
  return {
    id: skill.id,
    name: skill.name,
    xp: skill.xp,
    area: skill.area,
    // contributesTo could be extended if skills store their own mappings
  };
}

/**
 * Normalized mapping of characteristic names to Core Metric names
 * Handles naming variations (e.g., 'Foreign Languages' -> 'Foreign Language')
 */
const CHARACTERISTIC_TO_METRIC_MAP: Record<string, CoreMetricName> = {
  'programming': 'Programming',
  'learning': 'Learning',
  'erudition': 'Erudition',
  'discipline': 'Discipline',
  'productivity': 'Productivity',
  'foreign language': 'Foreign Language',
  'foreign languages': 'Foreign Language',
  'language': 'Foreign Language',
  'languages': 'Foreign Language',
  'fitness': 'Fitness',
  'drawing': 'Drawing',
  'hygiene': 'Hygiene',
  'reading': 'Reading',
  'communication': 'Communication',
  'cooking': 'Cooking',
  'meditation': 'Meditation',
  'swimming': 'Swimming',
  'running': 'Running',
  'math': 'Math',
  'mathematics': 'Math',
  'music': 'Music',
  'cleaning': 'Cleaning',
};

/**
 * Map characteristic data to contribution format
 * Uses a predefined mapping for reliable characteristic-to-metric matching
 */
function mapCharacteristicToContributionData(char: {
  id: string;
  name: string;
  xp: number;
}): CharacteristicContributionData {
  // Use normalized lowercase name for lookup
  const normalizedName = char.name.toLowerCase().trim();
  const metricName = CHARACTERISTIC_TO_METRIC_MAP[normalizedName];
  
  return {
    id: char.id,
    name: char.name,
    xp: char.xp,
    // If characteristic matches a metric name, it contributes 100% to that metric
    contributesTo: metricName ? { [metricName]: 1.0 } : {},
  };
}

/**
 * Hook to compute and access Core Metrics XP
 * 
 * This hook is the single source of truth for radar chart data.
 * It automatically recomputes when skills or characteristics change.
 */
export function useCoreMetrics(): UseCoreMetricsResult {
  const { skills, isLoading: skillsLoading } = useSkills();
  const { characteristics, isLoading: characteristicsLoading } = useCharacteristics();
  
  const isLoading = skillsLoading || characteristicsLoading;
  
  // Map skills to contribution data
  const skillContributions = useMemo(() => {
    return skills.map(mapSkillToContributionData);
  }, [skills]);
  
  // Map characteristics to contribution data
  const characteristicContributions = useMemo(() => {
    return characteristics.map(mapCharacteristicToContributionData);
  }, [characteristics]);
  
  // Compute all Core Metrics (this is the main calculation)
  const coreMetrics = useMemo(() => {
    return computeAllCoreMetrics(skillContributions, characteristicContributions);
  }, [skillContributions, characteristicContributions]);
  
  // Get radar chart data (clamped to MAX_METRIC_XP)
  const radarData = useMemo(() => {
    return getRadarChartData(coreMetrics);
  }, [coreMetrics]);
  
  // Calculate aggregate stats
  const balanceScore = useMemo(() => calculateBalanceScore(coreMetrics), [coreMetrics]);
  const totalXP = useMemo(() => getTotalMetricXP(coreMetrics), [coreMetrics]);
  const averageLevel = useMemo(() => getAverageMetricLevel(coreMetrics), [coreMetrics]);
  
  // Helper: Get which skills/characteristics contribute to a specific metric
  const getMetricContributors = useMemo(() => {
    return (metricName: CoreMetricName) => {
      const metric = coreMetrics.find(m => m.name === metricName);
      return metric?.contributions || [];
    };
  }, [coreMetrics]);
  
  // Helper: Get which metrics a skill contributes to
  const getSkillContributions = useMemo(() => {
    return (skillId: string) => {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return [];
      
      const contributionData = mapSkillToContributionData(skill);
      return getSkillMetricContributions(contributionData);
    };
  }, [skills]);
  
  return {
    coreMetrics,
    radarData,
    balanceScore,
    totalXP,
    averageLevel,
    isLoading,
    getMetricContributors,
    getSkillContributions,
  };
}
