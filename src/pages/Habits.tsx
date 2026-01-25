import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HabitHeatmapSection from "@/components/habits/HabitHeatmapSection";
import QuestGoalsSection from "@/components/habits/QuestGoalsSection";
import HabitsSidebar from "@/components/habits/HabitsSidebar";
import CreateHabitModal from "@/components/habits/CreateHabitModal";

const Habits = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dark RPG Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0f0f12] to-[#141418] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/40 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50 pointer-events-none" />
      
      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 px-8 py-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-gothic font-bold text-foreground mb-2 player-header-text">
              Habit Tracker
            </h1>
            <p className="text-muted-foreground">Track your daily quests and level up your life</p>
          </div>

          {/* Habit Heatmap Section */}
          <HabitHeatmapSection onCreateNew={() => setIsCreateModalOpen(true)} />

          {/* Quest/Goals Section */}
          <div className="mt-8">
            <QuestGoalsSection />
          </div>
        </div>

        {/* Right Sidebar */}
        <HabitsSidebar />
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default Habits;
