import { useEffect, useRef, useMemo } from "react";

interface LifeSkill {
  label: string;
  value: number;
}

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const LifeSkillsRadarChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 18 life skills as specified in requirements - memoized to prevent unnecessary re-renders
  const lifeSkills: LifeSkill[] = useMemo(() => [
    { label: "Programming", value: 1250 },
    { label: "Learning", value: 890 },
    { label: "Erudition", value: 1100 },
    { label: "Discipline", value: 1450 },
    { label: "Productivity", value: 980 },
    { label: "Foreign Language", value: 760 },
    { label: "Fitness", value: 1680 },
    { label: "Drawing", value: 520 },
    { label: "Hygiene", value: 1850 },
    { label: "Reading", value: 1340 },
    { label: "Communication", value: 950 },
    { label: "Cooking", value: 1120 },
    { label: "Meditation", value: 680 },
    { label: "Swimming", value: 420 },
    { label: "Running", value: 1540 },
    { label: "Math", value: 1030 },
    { label: "Music", value: 590 },
    { label: "Cleaning", value: 1720 },
  ], []);

  const maxValue = 2000; // Maximum XP level
  const numRings = 5; // Number of concentric rings

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    const numAxes = lifeSkills.length;

    // Clear canvas using logical dimensions
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw concentric polygon rings (grid)
    for (let ring = 1; ring <= numRings; ring++) {
      const ringRadius = (radius / numRings) * ring;
      ctx.beginPath();
      
      for (let i = 0; i <= numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.strokeStyle = "rgba(156, 163, 175, 0.15)"; // Very subtle light gray
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw axes from center to edge
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(156, 163, 175, 0.25)"; // Slightly darker than grid
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw axis labels outside the chart
    ctx.font = "10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(107, 114, 128, 0.8)"; // Muted gray
    
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const labelRadius = radius + 30;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Adjust text alignment based on position
      if (Math.abs(Math.cos(angle)) > 0.5) {
        ctx.textAlign = Math.cos(angle) > 0 ? "left" : "right";
      }
      if (Math.abs(Math.sin(angle)) > 0.5) {
        ctx.textBaseline = Math.sin(angle) > 0 ? "top" : "bottom";
      }
      
      ctx.fillText(lifeSkills[i].label, labelX, labelY);
    }

    // Draw data polygon
    ctx.beginPath();
    
    for (let i = 0; i <= numAxes; i++) {
      const index = i % numAxes;
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const normalizedValue = Math.min(lifeSkills[index].value / maxValue, 1);
      const x = centerX + Math.cos(angle) * radius * normalizedValue;
      const y = centerY + Math.sin(angle) * radius * normalizedValue;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    
    // Fill with soft neutral gray, 40% opacity
    ctx.fillStyle = "rgba(156, 163, 175, 0.4)";
    ctx.fill();
    
    // Border stroke: slightly darker gray
    ctx.strokeStyle = "rgba(107, 114, 128, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Draw data points and numeric values at vertices
    ctx.font = "9px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(107, 114, 128, 0.9)"; // Light gray for numbers
    
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const normalizedValue = Math.min(lifeSkills[i].value / maxValue, 1);
      const x = centerX + Math.cos(angle) * radius * normalizedValue;
      const y = centerY + Math.sin(angle) * radius * normalizedValue;

      // Draw small point at vertex
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(107, 114, 128, 0.8)";
      ctx.fill();

      // Draw numeric value near the vertex
      const valueRadius = radius * normalizedValue + 12;
      const valueX = centerX + Math.cos(angle) * valueRadius;
      const valueY = centerY + Math.sin(angle) * valueRadius;
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(107, 114, 128, 0.75)";
      ctx.fillText(lifeSkills[i].value.toString(), valueX, valueY);
    }
  }, [lifeSkills]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8">
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-gray-800 tracking-tight">Life Skills</h2>
        <p className="text-xs text-gray-500 mt-1">Character Development Radar</p>
      </div>
      
      <div className="flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: `${CANVAS_HEIGHT}px`, maxWidth: `${CANVAS_WIDTH}px` }}
          className="max-w-full"
        />
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>XP Range: 0 - {maxValue}</p>
      </div>
    </div>
  );
};

export default LifeSkillsRadarChart;
