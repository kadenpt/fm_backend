export type Habit = {
  id: number;
  user_id: number;
  habits: unknown;
  created_at: Date;
  updated_at: Date;
};

export type CreateHabitBody = {
  user_id: number;
  habits: unknown;
};

export type UpdateHabitBody = {
  habits?: unknown;
};
