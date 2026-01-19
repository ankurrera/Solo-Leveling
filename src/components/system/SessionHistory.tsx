import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { Calendar, Clock, Zap, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const SessionHistory = () => {
  const { sessions, isLoading, calculateStats } = useWorkoutSessions();

  if (isLoading) {
    return (
      <Card className="system-panel">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = calculateStats(sessions);

  return (
    <Card className="system-panel hover-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Session History
        </CardTitle>
        <CardDescription>
          Track your workout journey and earned XP
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.totalXP}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalHours}h</div>
            <div className="text-xs text-muted-foreground">Training Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{Math.round(stats.consistency)}%</div>
            <div className="text-xs text-muted-foreground">Consistency</div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No workout sessions logged yet.</p>
              <p className="text-sm">Start logging your workouts to earn XP and level up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">Recent Sessions</div>
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {format(new Date(session.session_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {session.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration_minutes} min
                        </span>
                      )}
                      {session.notes && (
                        <span className="truncate max-w-[200px]">{session.notes}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-accent">
                    <Zap className="w-4 h-4" />
                    +{session.total_xp_earned || 0} XP
                  </div>
                </div>
              ))}
              {sessions.length > 5 && (
                <div className="text-center text-xs text-muted-foreground pt-2">
                  And {sessions.length - 5} more sessions...
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionHistory;
