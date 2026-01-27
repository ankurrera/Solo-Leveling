import { useEffect, useRef, useMemo } from "react";
import { useStats } from "@/hooks/useStats";

const RadarChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stats, isLoading } = useStats();

  // 18 metrics for Life OS radar chart - clockwise order as specified
  const data = useMemo(() => {
    // Generate sample data based on stats (scale 0-2000)
    // TODO: Replace with actual metric data when backend is implemented
    // Currently using existing stats as a baseline to generate varied values
    const baseMultiplier = stats ? 10 : 5;
    
    // Multipliers for variation across metrics
    const METRIC_MULTIPLIERS = {
      programming: 1.0,
      learning: 0.8,
      erudition: 1.0,
      discipline: 0.7,
      productivity: 1.7,
      foreignLanguage: 0.8,
      fitness: 1.2,
      drawing: 0.6,
      hygiene: 1.5,
      reading: 0.9,
      communication: 0.7,
      cooking: 1.1,
      meditation: 0.8,
      swimming: 1.3,
      running: 1.1,
      math: 0.9,
      music: 0.7,
      cleaning: 1.2
    };
    
    return [
      { label: "Programming", value: (stats?.strength || 30) * baseMultiplier * METRIC_MULTIPLIERS.programming },
      { label: "Learning", value: (stats?.endurance || 25) * baseMultiplier * METRIC_MULTIPLIERS.learning },
      { label: "Erudition", value: (stats?.mobility || 30) * baseMultiplier * METRIC_MULTIPLIERS.erudition },
      { label: "Discipline", value: (stats?.consistency || 20) * baseMultiplier * METRIC_MULTIPLIERS.discipline },
      { label: "Productivity", value: (stats?.recovery || 50) * baseMultiplier * METRIC_MULTIPLIERS.productivity },
      { label: "Foreign Language", value: (stats?.strength || 30) * baseMultiplier * METRIC_MULTIPLIERS.foreignLanguage },
      { label: "Fitness", value: (stats?.endurance || 25) * baseMultiplier * METRIC_MULTIPLIERS.fitness },
      { label: "Drawing", value: (stats?.mobility || 30) * baseMultiplier * METRIC_MULTIPLIERS.drawing },
      { label: "Hygiene", value: (stats?.consistency || 20) * baseMultiplier * METRIC_MULTIPLIERS.hygiene },
      { label: "Reading", value: (stats?.recovery || 50) * baseMultiplier * METRIC_MULTIPLIERS.reading },
      { label: "Communication", value: (stats?.strength || 30) * baseMultiplier * METRIC_MULTIPLIERS.communication },
      { label: "Cooking", value: (stats?.endurance || 25) * baseMultiplier * METRIC_MULTIPLIERS.cooking },
      { label: "Meditation", value: (stats?.mobility || 30) * baseMultiplier * METRIC_MULTIPLIERS.meditation },
      { label: "Swimming", value: (stats?.consistency || 20) * baseMultiplier * METRIC_MULTIPLIERS.swimming },
      { label: "Running", value: (stats?.recovery || 50) * baseMultiplier * METRIC_MULTIPLIERS.running },
      { label: "Math", value: (stats?.strength || 30) * baseMultiplier * METRIC_MULTIPLIERS.math },
      { label: "Music", value: (stats?.endurance || 25) * baseMultiplier * METRIC_MULTIPLIERS.music },
      { label: "Cleaning", value: (stats?.mobility || 30) * baseMultiplier * METRIC_MULTIPLIERS.cleaning },
    ];
  }, [stats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60; // More padding for labels
    const numAxes = data.length;
    const maxValue = 2000; // Scale from 0 to 2000

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw polygon grid rings (NOT circular)
    const levels = 10; // For 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000
    for (let i = levels; i >= 1; i--) {
      const levelRadius = (radius / levels) * i;
      ctx.beginPath();
      ctx.strokeStyle = "#E5E5E5"; // Very light gray for grid rings
      ctx.lineWidth = 0.5;

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

    // Draw axes lines
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#CCCCCC"; // Slightly darker gray for axes
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#9A9A9A";
    ctx.fill();

    // Draw labels outside the outer grid
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const labelRadius = radius + 30;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;
      
      ctx.font = "300 10px sans-serif"; // Small, thin, sans-serif
      ctx.fillStyle = "#9A9A9A"; // Muted gray
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

    // Fill with neutral gray at 40% opacity
    ctx.fillStyle = "rgba(189, 189, 189, 0.4)"; // #BDBDBD at 40%
    ctx.fill();

    // Border with slightly darker gray
    ctx.strokeStyle = "#9C9C9C"; // Slightly darker gray
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw numeric values at each vertex
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const normalizedValue = data[i].value / maxValue;
      const x = centerX + Math.cos(angle) * radius * normalizedValue;
      const y = centerY + Math.sin(angle) * radius * normalizedValue;

      // Position value close to data point
      const valueOffsetRadius = 10;
      const valueX = x + Math.cos(angle) * valueOffsetRadius;
      const valueY = y + Math.sin(angle) * valueOffsetRadius;

      ctx.font = "300 9px sans-serif"; // Light, small font
      ctx.fillStyle = "#A0A0A0"; // Low contrast
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.round(data[i].value).toString(), valueX, valueY);
    }
  }, [data]);

  return (
    <div className="system-panel p-6 animate-fade-in-up animation-delay-100" style={{ background: '#f8f8f8' }}>
      <div className="text-center mb-4">
        <span className="text-xs uppercase tracking-[0.15em]" style={{ color: '#9A9A9A' }}>Core Metrics</span>
        <h3 className="text-sm uppercase tracking-wider mt-1" style={{ color: '#666666', fontWeight: 400 }}>Physical Balance</h3>
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
