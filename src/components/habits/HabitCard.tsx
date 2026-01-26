import { Check } from "lucide-react";
import { Habit } from "@/hooks/useHabits";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: (habitId: string, date: string) => void;
}

const HabitCard = ({ habit, onToggleCompletion }: HabitCardProps) => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [todayCompleted, setTodayCompleted] = useState(false);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Constants for quarterly view
  const QUARTERLY_DAYS = 90;
  const QUARTERLY_WEEKS = 13;

  // Helper function to calculate the start date for quarterly view
  const getQuarterlyStartDate = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - QUARTERLY_DAYS);
    // Find the Sunday before or equal to start date
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    return startDate;
  };

  // Generate quarterly heatmap grid (13 weeks x 7 days = ~3 months)
  const generateCalendarGrid = () => {
    const grid: Date[][] = [];
    const startDate = getQuarterlyStartDate();
    const baseTime = startDate.getTime();

    for (let week = 0; week < QUARTERLY_WEEKS; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const dayOffset = (week * 7) + day;
        const date = new Date(baseTime + dayOffset * 24 * 60 * 60 * 1000);
        weekDates.push(date);
      }
      grid.push(weekDates);
    }
    
    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  // Calculate start date for queries (helper function)
  const getStartDate = () => {
    return getQuarterlyStartDate().toISOString().split('T')[0];
  };

  // Load completions from database
  useEffect(() => {
    const loadCompletions = async () => {
      if (!user) return;

      const startDateStr = getStartDate();
      const todayStr = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_completions')
        .select('completion_date')
        .eq('habit_id', habit.id)
        .eq('user_id', user.id)
        .gte('completion_date', startDateStr);

      if (error) {
        console.error('Failed to load completions:', error);
        return;
      }

      if (data) {
        const completionDates = new Set(data.map(c => c.completion_date));
        setCompletions(completionDates);
        setTodayCompleted(completionDates.has(todayStr));
      }
    };

    loadCompletions();
  }, [habit.id, user]);

  const handleToggle = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const wasCompleted = completions.has(dateStr);
    
    onToggleCompletion(habit.id, dateStr);
    
    // Optimistic update
    setCompletions(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });

    // Update today's completion status using the new state
    if (dateStr === todayStr) {
      setTodayCompleted(!wasCompleted);
    }
  };

  const handleTodayToggle = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    handleToggle(today);
  };

  const isCompleted = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return completions.has(dateStr);
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  return (
    <div className="bg-[#0d0d0f] rounded border border-[#1a1a1f] p-3 w-fit">
      {/* Header - Emoji + Title Case */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{habit.icon}</span>
        <h3 className="text-xs font-medium text-gray-300">
          {habit.name}
        </h3>
      </div>

      {/* Calendar Grid - Day Labels on LEFT + Tight Grid */}
      <div className="flex gap-1.5">
        {/* Day Labels - Left side */}
        <div className="flex flex-col justify-between pr-1">
          {weekDays.map((day, index) => (
            <div key={index} className="text-[9px] text-gray-500 h-[11px] flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap Grid - Weeks as columns, Days as rows */}
        <div className="flex gap-[2px]">
          {calendarGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((date, dayIndex) => {
                const completed = isCompleted(date);
                const future = isFutureDate(date);
                const today = isToday(date);
                
                return (
                  <button
                    key={dayIndex}
                    onClick={() => !future && handleToggle(date)}
                    disabled={future}
                    title={date.toDateString()}
                    className={`
                      w-[11px] h-[11px] rounded-sm
                      transition-colors
                      ${future 
                        ? 'bg-[#161619] opacity-40 cursor-not-allowed' 
                        : completed
                          ? 'bg-[#2d4a2a] hover:bg-[#365534] cursor-pointer'
                          : 'bg-[#1a1a1f] hover:bg-[#222228] cursor-pointer border border-[#2a2a30]'
                      }
                      ${today && !completed ? 'ring-1 ring-gray-600 ring-offset-1 ring-offset-[#0d0d0f]' : ''}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Done Button - Small and Left-aligned */}
      <button
        onClick={handleTodayToggle}
        className={`
          mt-3 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded
          transition-colors
          ${todayCompleted 
            ? 'text-[#4a7a47] bg-[#1a2619]' 
            : 'text-gray-500 hover:text-gray-400 hover:bg-[#1a1a1f]'
          }
        `}
      >
        {todayCompleted && (
          <Check className="w-3 h-3" />
        )}
        <span>Done</span>
      </button>
    </div>
  );
};

export default HabitCard;
