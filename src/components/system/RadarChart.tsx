import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useCoreMetrics } from "@/hooks/useCoreMetrics";
import { MAX_METRIC_XP, CoreMetricName } from "@/lib/coreMetrics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Physical Balance Radar Chart Component
 * 
 * CORE PRINCIPLE (NON-NEGOTIABLE):
 * - Radar reads ONLY Core Metric XP
 * - Core Metric XP is COMPUTED from Skills and Characteristics
 * - No hardcoded radar values
 * - Radar axes are DYNAMIC and generated from active metrics only
 * 
 * DYNAMIC RADAR AXES:
 * "Generate radar axes dynamically from active Core Metrics derived from user Skills.
 * Remove any metric from the radar if no skills contribute to it."
 * 
 * The radar shape changes dynamically:
 * - When skills are created → new axes appear
 * - When skills are deleted → axes disappear
 * - When skill XP changes → polygon reshapes
 * - Axis count ranges from 0 to 18+ based on active metrics
 * 
 * HARD OVERRIDE LINE:
 * "If the radar chart is not driven entirely by computed Core Metric XP derived from Skills, 
 * the implementation is incorrect."
 * 
 * BI-DIRECTIONAL DEBUGGING:
 * - Clicking a radar axis shows list of contributing skills with XP per skill
 */

interface MetricDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metricName: CoreMetricName | null;
  metricXp: number;
  contributions: Array<{
    skillId: string;
    skillName: string;
    skillXp: number;
    weight: number;
    contributedXp: number;
  }>;
}

const MetricDetailDialog = ({ 
  open, 
  onOpenChange, 
  metricName, 
  metricXp,
  contributions 
}: MetricDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="system-panel max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal text-foreground">
            {metricName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Total XP */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <span className="text-muted-foreground">Total XP</span>
            <span className="text-lg font-medium text-foreground">{metricXp} XP</span>
          </div>
          
          {/* Contributing Skills */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Contributing Skills ({contributions.length})
            </h4>
            
            {contributions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No skills currently contribute to this metric
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {contributions.map((contribution) => (
                  <div 
                    key={contribution.skillId}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                  >
                    <div>
                      <span className="text-foreground">{contribution.skillName}</span>
                      <span className="text-muted-foreground ml-2">
                        ({contribution.skillXp} XP × {Math.round(contribution.weight * 100)}%)
                      </span>
                    </div>
                    <span className="font-medium text-primary">
                      +{contribution.contributedXp} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RadarChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<CoreMetricName | null>(null);
  
  // Use computed Core Metrics - this is the ONLY data source for the radar
  const { radarData, isLoading, coreMetrics, getMetricContributors } = useCoreMetrics();
  
  // radarData is computed from Skills and Characteristics XP
  // It automatically updates when skill XP changes, attendance is marked, or time is edited
  const data = radarData;
  
  // Memoize total contributing skills count to avoid recalculating on every render
  const totalContributingSkills = useMemo(() => {
    return coreMetrics.reduce((sum, m) => sum + m.contributions.length, 0);
  }, [coreMetrics]);
  
  // Memoize non-zero metrics count
  const nonZeroMetricsCount = useMemo(() => {
    return coreMetrics.filter(m => m.xp > 0).length;
  }, [coreMetrics]);

  // Handle canvas click to detect which axis was clicked
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const numAxes = data.length;

    // Calculate angle from center to click point
    const dx = x - centerX;
    const dy = y - centerY;
    const clickAngle = Math.atan2(dy, dx);
    
    // Use squared distance comparison to avoid expensive square root operation
    const distanceSquared = dx * dx + dy * dy;
    const maxDistanceSquared = (radius + 50) * (radius + 50);

    // Only respond to clicks near the chart area
    if (distanceSquared > maxDistanceSquared) return;

    // Find the closest axis
    let closestAxisIndex = 0;
    let minAngleDiff = Infinity;

    for (let i = 0; i < numAxes; i++) {
      const axisAngle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      let angleDiff = Math.abs(clickAngle - axisAngle);
      
      // Normalize angle difference to [0, PI]
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff;
        closestAxisIndex = i;
      }
    }

    // Threshold: only select if click is within ~20 degrees of an axis
    const angleThreshold = Math.PI / 9; // ~20 degrees
    if (minAngleDiff < angleThreshold) {
      setSelectedMetric(data[closestAxisIndex].label as CoreMetricName);
    }
  }, [data]);

  // Get contributions for selected metric
  const selectedMetricContributions = selectedMetric 
    ? getMetricContributors(selectedMetric) 
    : [];
  const selectedMetricData = selectedMetric 
    ? coreMetrics.find(m => m.name === selectedMetric) 
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Debug logging: Log radar re-renders
    if (process.env.NODE_ENV === 'development') {
      console.log('[Radar Chart] Re-rendering with data:', {
        dataPoints: data.length,
        timestamp: new Date().toISOString(),
        sampleMetrics: data.slice(0, 3).map(d => ({ label: d.label, value: d.value })),
      });
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60; // More padding for labels
    const numAxes = data.length;
    const maxValue = MAX_METRIC_XP; // Max per metric: 2000 XP (from coreMetrics constants)
    
    // Handle special cases for small numbers of axes
    const minAxesForPolygon = 3;
    const shouldDrawAsPolygon = numAxes >= minAxesForPolygon;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw polygon grid rings (NOT circular) - thin, evenly spaced, light gray
    const levels = 10; // For 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000
    for (let i = levels; i >= 1; i--) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      ctx.strokeStyle = "#E6E6E6"; // Light gray for grid rings (exact spec)
      ctx.lineWidth = 0.5; // Thin lines

      if (shouldDrawAsPolygon) {
        // Draw as polygon
        for (let j = 0; j <= numAxes; j++) {
          const angle = (Math.PI * 2 * j) / numAxes - Math.PI / 2;
          const x = centerX + Math.cos(angle) * levelRadius;
          const y = centerY + Math.sin(angle) * levelRadius;
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
      } else {
        // For 1-2 axes, draw circles instead
        ctx.arc(centerX, centerY, levelRadius, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    // Draw axes lines - slightly darker than grid, still subtle and thin
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#D0D0D0"; // Slightly darker than grid, still subtle
      ctx.lineWidth = 0.5; // Thin line
      ctx.stroke();
    }

    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#9A9A9A";
    ctx.fill();

    // Draw labels outside the outer grid - thin, sans-serif, small, muted gray
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const labelRadius = radius + 30;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;
      
      ctx.font = "300 10px sans-serif"; // Thin, small, sans-serif
      ctx.fillStyle = "#8E8E8E"; // Muted gray (exact spec)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(data[i].label, labelX, labelY);
    }

    // Draw data polygon or line
    if (shouldDrawAsPolygon) {
      // Draw as filled polygon (3+ axes)
      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const index = i % numAxes;
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const normalizedValue = data[index].value / maxValue;
        const x = centerX + Math.cos(angle) * radius * normalizedValue;
        const y = centerY + Math.sin(angle) * radius * normalizedValue;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fill with neutral gray (#C8C8C8) at 40-45% opacity (spec)
      ctx.fillStyle = "rgba(200, 200, 200, 0.42)"; // #C8C8C8 at 42%
      ctx.fill();

      // Border with #9B9B9B at 1-1.5px (spec)
      ctx.strokeStyle = "#9B9B9B"; // Exact spec color
      ctx.lineWidth = 1.25; // 1.25px within 1-1.5px range
      ctx.stroke();
    } else {
      // For 1-2 axes, draw as points/line
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const normalizedValue = data[i].value / maxValue;
        const x = centerX + Math.cos(angle) * radius * normalizedValue;
        const y = centerY + Math.sin(angle) * radius * normalizedValue;
        
        if (numAxes === 1) {
          // Single point
          ctx.arc(x, y, 4, 0, Math.PI * 2);
        } else if (numAxes === 2) {
          // Line between two points
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      
      ctx.strokeStyle = "#9B9B9B";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(200, 200, 200, 0.42)";
      ctx.fill();
    }

    // Draw numeric values at each vertex - small, light weight, low contrast
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const normalizedValue = data[i].value / maxValue;
      const x = centerX + Math.cos(angle) * radius * normalizedValue;
      const y = centerY + Math.sin(angle) * radius * normalizedValue;

      // Position value close to data point, offset slightly away from polygon
      const valueOffsetRadius = 10;
      const valueX = x + Math.cos(angle) * valueOffsetRadius;
      const valueY = y + Math.sin(angle) * valueOffsetRadius;

      ctx.font = "300 8px sans-serif"; // Very small, light weight
      ctx.fillStyle = "#9A9A9A"; // Low contrast (exact spec)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(data[i].value).toString(), valueX, valueY);
    }
  }, [data]);

  return (
    <div className="system-panel p-6 animate-fade-in-up animation-delay-100" style={{ background: '#FAFAFA' }}>
      {/* Debug Panel - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="font-semibold text-blue-900 mb-2">🔍 Debug Info</div>
          <div className="space-y-1 text-blue-700">
            <div>Radar Points: {data.length}</div>
            <div>Core Metrics: {coreMetrics.length}</div>
            <div>Total Contributing Skills: {totalContributingSkills}</div>
            <div>Non-Zero Metrics: {nonZeroMetricsCount}</div>
            <div className="text-blue-500 text-[10px] mt-2">
              Click metrics to see contributors
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        // Empty state when no metrics are active
        <div className="flex flex-col items-center justify-center h-[400px] text-center px-8">
          <div className="w-24 h-24 mb-6 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon 
                points="50,10 90,35 90,65 50,90 10,65 10,35" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Active Metrics
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your radar chart will appear here once you create skills. 
            Each skill contributes to different Core Metrics, which form the axes of this chart.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Navigate to Skills page to get started →
          </p>
        </div>
      ) : (
        <>
          <div className="relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="w-full max-w-[500px] cursor-pointer"
              onClick={handleCanvasClick}
              title="Click on a metric axis to see contributing skills"
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            {data.length === 1 
              ? "Click on the metric to see contributing skills"
              : `Click on any of the ${data.length} metrics to see contributing skills`
            }
          </p>
        </>
      )}
      
      {/* Metric Detail Dialog - bi-directional debugging */}
      <MetricDetailDialog
        open={selectedMetric !== null}
        onOpenChange={(open) => !open && setSelectedMetric(null)}
        metricName={selectedMetric}
        metricXp={selectedMetricData?.xp || 0}
        contributions={selectedMetricContributions}
      />
    </div>
  );
};

export default RadarChart;
