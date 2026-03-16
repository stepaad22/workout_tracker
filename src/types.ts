export type WorkoutType = "push" | "pull" | "legs" | "full body";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: number;
  date: string;
  type: WorkoutType;
  note?: string;
  exercises?: Exercise[];
  exerciseCount?: number;
}

export interface Stats {
  workoutsThisWeek: number;
  totalWorkouts: number;
  workoutsThisMonth: number;
  mostFrequentExercise: string;
}