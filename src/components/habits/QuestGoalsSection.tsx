import { Zap, Heart, AlertCircle } from "lucide-react";

interface QuestData {
  id: string;
  habitName: string;
  daysRemaining: number;
  winXP: number;
  loseXP: number;
  status: "active" | "lost";
  color: string;
}

const QuestGoalsSection = () => {
  const quests: QuestData[] = [
    {
      id: "1",
      habitName: "Read 1 Page",
      daysRemaining: 14,
      winXP: 100,
      loseXP: 50,
      status: "active",
      color: "rgb(168, 85, 247)", // purple
    },
    {
      id: "2",
      habitName: "Touch Grass",
      daysRemaining: 7,
      winXP: 80,
      loseXP: 40,
      status: "active",
      color: "rgb(34, 197, 94)", // green
    },
    {
      id: "3",
      habitName: "Productivity Learning",
      daysRemaining: 0,
      winXP: 120,
      loseXP: 60,
      status: "lost",
      color: "rgb(234, 179, 8)", // gold
    },
    {
      id: "4",
      habitName: "Workout",
      daysRemaining: 21,
      winXP: 150,
      loseXP: 75,
      status: "active",
      color: "rgb(249, 115, 22)", // orange
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Quest Goals</h2>

      {/* 2x2 Grid of Quest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="system-panel p-6 rounded-[16px] relative overflow-hidden"
            style={{
              boxShadow: `0 0 20px ${quest.color}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Quest Name */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {quest.habitName}
              </h3>
              <div className="flex items-center gap-2">
                {quest.status === "active" ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {quest.daysRemaining} Days Remaining
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-destructive font-medium">Lost ❌</span>
                  </>
                )}
              </div>
            </div>

            {/* XP Mechanics */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: quest.color }} />
                  <span className="text-sm text-foreground">Win XP</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: quest.color }}>
                  +{quest.winXP}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-foreground">Lose XP</span>
                </div>
                <span className="text-sm font-semibold text-destructive">
                  -{quest.loseXP}
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    quest.status === "active"
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {quest.status === "active" ? "Active" : "Lost"}
                </span>
              </div>
            </div>

            {/* Decorative Corner */}
            <div
              className="absolute top-0 right-0 w-24 h-24 opacity-10"
              style={{
                background: `radial-gradient(circle at top right, ${quest.color}, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestGoalsSection;
