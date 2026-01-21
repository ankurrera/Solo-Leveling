import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Clock } from "lucide-react";
import { useWorkoutSessions, SessionWithDetails } from "@/hooks/useWorkoutSessions";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateSessionXP, getSystemMessage } from "@/lib/xpCalculation";
import type { ExerciseSet as XPExerciseSet } from "@/lib/xpCalculation";

interface InlineWorkoutLoggerProps {
  sessionId?: string | null;
  onComplete?: () => void;
}

const InlineWorkoutLogger = ({ sessionId, onComplete }: InlineWorkoutLoggerProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    createSession,
    addExercise,
    addSet,
    updateExercise,
    updateSet,
    updateSession,
    deleteExercise,
    deleteSet,
    getSessionDetails,
    sessions
  } = useWorkoutSessions();

  const [currentSession, setCurrentSession] = useState<SessionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [sessionStartTime] = useState<Date>(new Date());
  const sessionCreationInitiated = useRef(false);

  // Load existing session if editing
  useEffect(() => {
    const loadSession = async () => {
      if (sessionId) {
        setIsLoading(true);
        try {
          const session = await getSessionDetails(sessionId);
          setCurrentSession(session);
        } catch (error) {
          console.error("Failed to load session:", error);
          toast.error("Failed to load workout session");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadSession();
  }, [sessionId, getSessionDetails]);

  // Create a new session if not editing
  useEffect(() => {
    const shouldCreateSession = !sessionId && !currentSession && user && !sessionCreationInitiated.current;
    
    if (shouldCreateSession) {
      sessionCreationInitiated.current = true;
      createSession(
        {
          session_date: new Date().toISOString(),
          duration_minutes: null,
          notes: null
        },
        {
          onSuccess: async (session) => {
            const fullSession = await getSessionDetails(session.id);
            setCurrentSession(fullSession);
          },
          onError: () => {
            // Reset the flag on error so user can retry
            sessionCreationInitiated.current = false;
          }
        }
      );
    }
    // createSession and getSessionDetails are intentionally omitted from dependencies
    // as they are stable functions from the custom hook. Including them would cause
    // unnecessary re-runs and potential infinite loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, currentSession, user]);

  const handleAddExercise = useCallback(async () => {
    if (!newExerciseName.trim() || !currentSession) {
      toast.error("Exercise name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const orderIndex = currentSession.exercises.length;
      addExercise(
        {
          session_id: currentSession.id,
          exercise_name: newExerciseName.trim(),
          exercise_type: 'strength',
          order_index: orderIndex,
          notes: null
        },
        {
          onSuccess: async (exercise) => {
            // Reload session to get updated data
            const updatedSession = await getSessionDetails(currentSession.id);
            setCurrentSession(updatedSession);
            setNewExerciseName("");
            setIsAddingExercise(false);
          },
          onError: () => {
            setIsSaving(false);
          }
        }
      );
    } catch (error) {
      console.error("Failed to add exercise:", error);
    } finally {
      setIsSaving(false);
    }
  }, [newExerciseName, currentSession, addExercise, getSessionDetails]);

  const handleAddSet = useCallback(async (exerciseId: string) => {
    if (!currentSession) return;

    setIsSaving(true);
    try {
      const exercise = currentSession.exercises.find(e => e.id === exerciseId);
      if (!exercise) return;

      const setNumber = exercise.sets.length + 1;
      addSet(
        {
          exercise_id: exerciseId,
          set_number: setNumber,
          reps: 1,
          weight_kg: 0,
          duration_seconds: null,
          distance_meters: null,
          notes: null
        },
        {
          onSuccess: async () => {
            const updatedSession = await getSessionDetails(currentSession.id);
            setCurrentSession(updatedSession);
          },
          onError: () => {
            setIsSaving(false);
          }
        }
      );
    } catch (error) {
      console.error("Failed to add set:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, addSet, getSessionDetails]);

  const handleUpdateSet = useCallback(async (
    setId: string,
    field: 'reps' | 'weight_kg',
    value: number
  ) => {
    if (!currentSession) return;

    // Validation
    if (field === 'reps' && value < 1) {
      toast.error("Reps must be at least 1");
      return;
    }
    if (field === 'weight_kg' && value < 0) {
      toast.error("Weight must be at least 0");
      return;
    }

    setIsSaving(true);
    try {
      updateSet(
        { id: setId, [field]: value },
        {
          onSuccess: async () => {
            const updatedSession = await getSessionDetails(currentSession.id);
            setCurrentSession(updatedSession);
          },
          onError: () => {
            setIsSaving(false);
          }
        }
      );
    } catch (error) {
      console.error("Failed to update set:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, updateSet, getSessionDetails]);

  const handleUpdateExerciseName = useCallback(async (
    exerciseId: string,
    name: string
  ) => {
    if (!currentSession) return;
    if (!name.trim()) {
      toast.error("Exercise name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      updateExercise(
        { id: exerciseId, exercise_name: name.trim() },
        {
          onSuccess: async () => {
            const updatedSession = await getSessionDetails(currentSession.id);
            setCurrentSession(updatedSession);
          },
          onError: () => {
            setIsSaving(false);
          }
        }
      );
    } catch (error) {
      console.error("Failed to update exercise:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, updateExercise, getSessionDetails]);

  const handleDeleteSet = useCallback(async (setId: string) => {
    if (!currentSession) return;

    setIsSaving(true);
    try {
      deleteSet(setId, {
        onSuccess: async () => {
          const updatedSession = await getSessionDetails(currentSession.id);
          setCurrentSession(updatedSession);
        },
        onError: () => {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error("Failed to delete set:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, deleteSet, getSessionDetails]);

  const handleDeleteExercise = useCallback(async (exerciseId: string) => {
    if (!currentSession) return;

    setIsSaving(true);
    try {
      deleteExercise(exerciseId, {
        onSuccess: async () => {
          const updatedSession = await getSessionDetails(currentSession.id);
          setCurrentSession(updatedSession);
        },
        onError: () => {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentSession, deleteExercise, getSessionDetails]);

  if (isLoading) {
    return (
      <Card className="system-panel">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentSession) {
    return null;
  }

  return (
    <Card className="system-panel hover-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Quest: Log Workout Session</CardTitle>
            <CardDescription>
              Track your exercises and sets to earn XP
            </CardDescription>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise List */}
        <div className="space-y-4">
          {currentSession.exercises.map((exercise, exerciseIndex) => (
            <div
              key={exercise.id}
              className="border rounded-lg p-4 bg-card/50 space-y-3"
            >
              {/* Exercise Name - Editable */}
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={exercise.exercise_name}
                  onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                  className="text-lg font-semibold border-0 shadow-none focus-visible:ring-1 px-2"
                  placeholder="Exercise Name"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Sets List */}
              <div className="space-y-2">
                {exercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-muted-foreground w-16">
                      Set {set.set_number}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        value={set.weight_kg ?? ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseFloat(e.target.value);
                          if (value !== null && value < 0) return;
                          handleUpdateSet(set.id, 'weight_kg', value === null ? 0 : value);
                        }}
                        className="w-24"
                        min="0"
                        step="0.5"
                        placeholder="0"
                      />
                      <span className="text-muted-foreground">kg</span>
                      <span className="text-muted-foreground">×</span>
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                          if (value < 1) return;
                          handleUpdateSet(set.id, 'reps', value);
                        }}
                        className="w-20"
                        min="1"
                        placeholder="1"
                      />
                      <span className="text-muted-foreground">reps</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSet(set.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSet(exercise.id)}
                className="w-full"
                disabled={isSaving}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Set
              </Button>
            </div>
          ))}
        </div>

        {/* Add Exercise Section */}
        {isAddingExercise ? (
          <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
            <Input
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Exercise Name (e.g., Bench Press)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddExercise();
                } else if (e.key === 'Escape') {
                  setIsAddingExercise(false);
                  setNewExerciseName("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim() || isSaving}
                className="flex-1"
              >
                Add Exercise
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingExercise(false);
                  setNewExerciseName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAddingExercise(true)}
            className="w-full"
            disabled={isSaving}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        )}

        {/* Duration Tracker */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <label className="text-sm font-medium">Session Duration (minutes)</label>
              <Input
                type="number"
                value={durationMinutes || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setDurationMinutes(Math.max(0, value));
                }}
                min="0"
                className="mt-1"
                placeholder="Enter duration"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 20 minutes required to complete
              </p>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        {currentSession.exercises.length > 0 && (
          <div className="pt-4 border-t">
            <Button
              onClick={async () => {
                // Validation checks
                if (durationMinutes < 20) {
                  toast.error('Session must be at least 20 minutes to complete');
                  return;
                }

                // Collect all sets from all exercises
                const allSets: XPExerciseSet[] = currentSession.exercises.flatMap(ex => 
                  ex.sets.map(set => ({
                    reps: set.reps,
                    weight_kg: set.weight_kg
                  }))
                );

                // Calculate total volume
                const totalVolume = allSets.reduce((sum, set) => {
                  return sum + ((set.weight_kg || 0) * set.reps);
                }, 0);

                if (totalVolume <= 0) {
                  toast.error('Session must have volume (weight × reps) to complete');
                  return;
                }

                // Calculate sessions this week for consistency bonus
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                
                const sessionsThisWeek = sessions.filter(s => {
                  const sessionDate = new Date(s.session_date);
                  return sessionDate >= startOfWeek && s.is_completed;
                }).length;

                // Calculate XP
                const xp = calculateSessionXP(
                  {
                    sets: allSets,
                    duration_minutes: durationMinutes,
                    is_edited: currentSession.is_edited || false
                  },
                  {
                    fatigue_level: profile?.fatigue_level || 0
                  },
                  {
                    sessions_this_week: sessionsThisWeek
                  }
                );

                // Update session with completion and XP
                updateSession(
                  {
                    id: currentSession.id,
                    duration_minutes: durationMinutes,
                    total_xp_earned: xp,
                    is_completed: true,
                    completion_time: new Date().toISOString()
                  },
                  {
                    onSuccess: () => {
                      const message = getSystemMessage(xp);
                      toast.success('SYSTEM:', {
                        description: message,
                        duration: 5000,
                      });
                      toast.info(`+${xp} XP earned`, {
                        duration: 3000,
                      });
                      if (onComplete) onComplete();
                    }
                  }
                );
              }}
              className="w-full"
            >
              Complete Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InlineWorkoutLogger;
