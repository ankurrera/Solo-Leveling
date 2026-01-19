import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";
import { Calendar, Clock, Zap, TrendingUp, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { format } from "date-fns";
import InlineWorkoutLogger from "./InlineWorkoutLogger";

const SessionHistory = () => {
  const { sessions, isLoading, calculateStats } = useWorkoutSessions();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<string | null>(null);

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

  // If editing a session, show the editor
  if (editingSession) {
    return (
      <Card className="system-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Workout Session</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSession(null)}
            >
              Back to History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InlineWorkoutLogger
            sessionId={editingSession}
            onComplete={() => setEditingSession(null)}
          />
        </CardContent>
      </Card>
    );
  }

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
              {sessions.slice(0, 10).map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border bg-card transition-colors"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/5"
                    onClick={() => setExpandedSession(
                      expandedSession === session.id ? null : session.id
                    )}
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm font-bold text-accent">
                        <Zap className="w-4 h-4" />
                        +{session.total_xp_earned || 0} XP
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSession(session.id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {expandedSession === session.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Details - This would require fetching exercise details */}
                  {expandedSession === session.id && (
                    <div className="border-t px-3 py-2 bg-muted/30 text-sm">
                      <p className="text-muted-foreground italic">
                        Click Edit to view and modify exercises and sets
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {sessions.length > 10 && (
                <div className="text-center text-xs text-muted-foreground pt-2">
                  And {sessions.length - 10} more sessions...
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
