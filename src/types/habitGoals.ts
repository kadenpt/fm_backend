export type HabitGoal = {
  id: number;
  user_id: number;
  habit_goals: unknown;
  created_at: Date;
  updated_at: Date;
};

export type CreateHabitGoalBody = {
  user_id: number;
  habit_goals: unknown;
};

export type UpdateHabitGoalBody = {
  habit_goals?: unknown;
};
