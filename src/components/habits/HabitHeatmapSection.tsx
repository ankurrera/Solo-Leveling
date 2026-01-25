import { useState } from "react";
import { Book, Leaf, Lightbulb, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEKS_TO_DISPLAY = 5;
const DAYS_PER_WEEK = 7;

interface HabitData {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  completions: boolean[][];
}

interface HabitHeatmapSectionProps {
  onCreateNew: () => void;
}

const HabitHeatmapSection = ({ onCreateNew }: HabitHeatmapSectionProps) => {
  const [habits, setHabits] = useState<HabitData[]>([
    {
      id: "1",
      name: "Read 1 Page",
      icon: <Book className="w-4 h-4" />,
      color: "rgb(168, 85, 247)", // purple
      completions: Array(WEEKS_TO_DISPLAY).fill(null).map(() => Array(DAYS_PER_WEEK).fill(false)),
    },
    {
      id: "2",
      name: "Touch Grass",
      icon: <Leaf className="w-4 h-4" />,
      color: "rgb(34, 197, 94)", // green
      completions: Array(WEEKS_TO_DISPLAY).fill(null).map(() => Array(DAYS_PER_WEEK).fill(false)),
    },
    {
      id: "3",
      name: "Productivity Learning",
      icon: <Lightbulb className="w-4 h-4" />,
      color: "rgb(234, 179, 8)", // gold
      completions: Array(WEEKS_TO_DISPLAY).fill(null).map(() => Array(DAYS_PER_WEEK).fill(false)),
    },
    {
      id: "4",
      name: "Workout",
      icon: <Dumbbell className="w-4 h-4" />,
      color: "rgb(249, 115, 22)", // orange
      completions: Array(WEEKS_TO_DISPLAY).fill(null).map(() => Array(DAYS_PER_WEEK).fill(false)),
    },
  ]);

  const toggleCompletion = (habitId: string, weekIndex: number, dayIndex: number) => {
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              completions: habit.completions.map((week, wIdx) =>
                wIdx === weekIndex
                  ? week.map((day, dIdx) => (dIdx === dayIndex ? !day : day))
                  : week
              ),
            }
          : habit
      )
    );
  };

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="relative">
      {/* Section Header with Create Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Habit Heatmap</h2>
        <Button
          onClick={onCreateNew}
          className="bg-card/50 border border-primary/30 hover:border-primary/60 hover:bg-card/80 text-foreground hover-glow transition-all"
        >
          <span className="text-lg mr-2">+</span> New Habit
        </Button>
      </div>

      {/* 2x2 Grid of Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="system-panel p-6 rounded-[16px]"
            style={{
              boxShadow: `0 0 20px ${habit.color}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                >
                  {habit.icon}
                </div>
                <h3 className="text-lg font-medium text-foreground">{habit.name}</h3>
              </div>
              
              {/* Day Labels */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {dayLabels.map((day, idx) => (
                  <div key={idx} className="h-6 flex items-center justify-center w-5">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* 7x5 Heatmap Grid */}
            <div className="flex gap-2 mb-4">
              {habit.completions.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-2">
                  {week.map((isCompleted, dayIdx) => (
                    <button
                      key={dayIdx}
                      onClick={() => toggleCompletion(habit.id, weekIdx, dayIdx)}
                      className="w-8 h-6 rounded transition-all"
                      style={{
                        backgroundColor: isCompleted ? habit.color : "rgba(255,255,255,0.05)",
                        boxShadow: isCompleted ? `0 0 8px ${habit.color}60` : "none",
                        border: `1px solid ${isCompleted ? habit.color : "rgba(255,255,255,0.1)"}`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Done</span>
              <div
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
              >
                ✓
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitHeatmapSection;
