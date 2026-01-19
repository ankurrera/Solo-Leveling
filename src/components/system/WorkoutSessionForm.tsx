import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useWorkoutSessions } from "@/hooks/useWorkoutSessions";

interface ExerciseFormData {
  exercise_name: string;
  exercise_type: string;
  sets: {
    set_number: number;
    reps: number;
    weight: number | null;
  }[];
}

const WorkoutSessionForm = () => {
  const { createSession, addExercise, addSet, isCreatingSession } = useWorkoutSessions();
  const [open, setOpen] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    type: "strength",
    sets: [{ reps: 10, weight: 0 }]
  });

  const addSetToCurrentExercise = () => {
    setCurrentExercise({
      ...currentExercise,
      sets: [...currentExercise.sets, { reps: 10, weight: 0 }]
    });
  };

  const updateSet = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...currentExercise.sets];
    newSets[index][field] = value;
    setCurrentExercise({ ...currentExercise, sets: newSets });
  };

  const removeSet = (index: number) => {
    setCurrentExercise({
      ...currentExercise,
      sets: currentExercise.sets.filter((_, i) => i !== index)
    });
  };

  const addExerciseToList = () => {
    if (!currentExercise.name) return;
    
    setExercises([
      ...exercises,
      {
        exercise_name: currentExercise.name,
        exercise_type: currentExercise.type,
        sets: currentExercise.sets.map((set, idx) => ({
          set_number: idx + 1,
          reps: set.reps,
          weight: set.weight || null
        }))
      }
    ]);

    // Reset current exercise
    setCurrentExercise({
      name: "",
      type: "strength",
      sets: [{ reps: 10, weight: 0 }]
    });
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Create the session first
      createSession(
        {
          session_date: new Date().toISOString(),
          duration_minutes: durationMinutes,
          notes: notes || null
        },
        {
          onSuccess: async (session) => {
            // Add each exercise and its sets
            for (let i = 0; i < exercises.length; i++) {
              const exercise = exercises[i];
              
              addExercise(
                {
                  session_id: session.id,
                  exercise_name: exercise.exercise_name,
                  exercise_type: exercise.exercise_type,
                  order_index: i,
                  notes: null
                },
                {
                  onSuccess: async (exerciseData) => {
                    // Add sets for this exercise
                    for (const set of exercise.sets) {
                      addSet({
                        exercise_id: exerciseData.id,
                        set_number: set.set_number,
                        reps: set.reps,
                        weight: set.weight,
                        duration_seconds: null,
                        distance_meters: null,
                        notes: null
                      });
                    }
                  }
                }
              );
            }

            // Reset form and close dialog
            setDurationMinutes(60);
            setNotes("");
            setExercises([]);
            setCurrentExercise({
              name: "",
              type: "strength",
              sets: [{ reps: 10, weight: 0 }]
            });
            setOpen(false);
          }
        }
      );
    } catch (error) {
      console.error("Error creating workout session:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Workout Session</DialogTitle>
          <DialogDescription>
            Track your exercises, sets, and reps to earn XP and level up!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Details */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any PRs?"
              rows={2}
            />
          </div>

          {/* Added Exercises List */}
          {exercises.length > 0 && (
            <div className="space-y-2">
              <Label>Added Exercises ({exercises.length})</Label>
              <div className="space-y-2">
                {exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <div className="font-medium">{exercise.exercise_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {exercise.sets.length} sets × {exercise.sets[0].reps} reps
                        {exercise.sets[0].weight ? ` @ ${exercise.sets[0].weight}kg` : ''}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Exercise Form */}
          <div className="border-t pt-4 space-y-4">
            <Label className="text-base">Add Exercise</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="exercise_name">Exercise Name</Label>
                <Input
                  id="exercise_name"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  placeholder="e.g., Bench Press"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise_type">Type</Label>
                <select
                  id="exercise_type"
                  value={currentExercise.type}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Sets</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSetToCurrentExercise}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Set
                </Button>
              </div>

              <div className="space-y-2">
                {currentExercise.sets.map((set, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground w-12">Set {index + 1}</span>
                    <Input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(index, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="Reps"
                      className="flex-1"
                      min="1"
                    />
                    <Input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(index, 'weight', parseFloat(e.target.value) || 0)}
                      placeholder="Weight (kg)"
                      className="flex-1"
                      min="0"
                      step="0.5"
                    />
                    {currentExercise.sets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSet(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={addExerciseToList}
              disabled={!currentExercise.name}
              className="w-full"
            >
              Add Exercise to Workout
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={exercises.length === 0 || isCreatingSession}
          >
            {isCreatingSession ? "Saving..." : "Complete Workout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutSessionForm;
