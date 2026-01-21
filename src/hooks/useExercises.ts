import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Exercise = Tables<"exercises">;
export type MuscleGroup = Tables<"muscle_groups">;

export const useExercises = () => {
  // Fetch all exercises
  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Exercise[];
    },
  });

  // Fetch all muscle groups
  const { data: muscleGroups, isLoading: muscleGroupsLoading } = useQuery({
    queryKey: ["muscle_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muscle_groups")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as MuscleGroup[];
    },
  });

  // Function to filter exercises by muscle groups
  const getExercisesByMuscleGroups = (selectedMuscleGroups: string[]): Exercise[] => {
    if (!exercises || selectedMuscleGroups.length === 0) return exercises || [];
    
    return exercises.filter((exercise) => {
      return selectedMuscleGroups.some((muscleGroup) =>
        exercise.muscle_groups.includes(muscleGroup)
      );
    });
  };

  return {
    exercises,
    muscleGroups,
    isLoading: exercisesLoading || muscleGroupsLoading,
    getExercisesByMuscleGroups,
  };
};
