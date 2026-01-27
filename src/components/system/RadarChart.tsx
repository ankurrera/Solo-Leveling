import { useEffect, useRef } from "react";
import { useCoreMetrics } from "@/hooks/useCoreMetrics";
import { MAX_METRIC_XP } from "@/lib/coreMetrics";

/**
 * Physical Balance Radar Chart Component
 * 
 * CORE PRINCIPLE (NON-NEGOTIABLE):
 * - Radar reads ONLY Core Metric XP
 * - Core Metric XP is COMPUTED from Skills and Characteristics
 * - No hardcoded radar values
 * 
 * HARD OVERRIDE LINE:
 * "If the radar chart is not driven entirely by computed Core Metric XP derived from Skills, 
 * the implementation is incorrect."
 */
const RadarChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use computed Core Metrics - this is the ONLY data source for the radar
  const { radarData, isLoading, balanceScore } = useCoreMetrics();
  
  // radarData is computed from Skills and Characteristics XP
  // It automatically updates when skill XP changes, attendance is marked, or time is edited
  const data = radarData;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60; // More padding for labels
    const numAxes = data.length;
    const maxValue = MAX_METRIC_XP; // Max per metric: 2000 XP (from coreMetrics constants)
    
    // Ensure data polygon occupies ~55-70% of chart radius
    // This prevents the "small spiky star" look by scaling up the visual impact

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw polygon grid rings (NOT circular) - thin, evenly spaced, light gray
    const levels = 10; // For 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000
    for (let i = levels; i >= 1; i--) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      ctx.strokeStyle = "#E6E6E6"; // Light gray for grid rings (exact spec)
      ctx.lineWidth = 0.5; // Thin lines

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

    // Draw data polygon
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

  // Title styling for both lines
  const titleStyle = { color: '#9A9A9A', fontWeight: 300 };
  
  return (
    <div className="system-panel p-6 animate-fade-in-up animation-delay-100" style={{ background: '#FAFAFA' }}>
      <div className="text-center mb-4">
        <div className="text-xs uppercase tracking-[0.2em] mb-0.5" style={titleStyle}>CORE METRICS</div>
        <div className="text-xs uppercase tracking-[0.2em]" style={titleStyle}>PHYSICAL BALANCE</div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full max-w-[500px]"
          />
        </div>
      )}
    </div>
  );
};

export default RadarChart;
