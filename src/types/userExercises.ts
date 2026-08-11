export type UserExercise = {
  id: number;
  user_id: number;
  exercise_id: number;
  times_completed: number;
  created_at: Date;
  updated_at: Date;
};

export type CreateUserExerciseBody = {
  exercise_id: number;
};

export type UpdateUserExerciseBody = {
  times_completed?: number;
};
