import { z } from "zod";

export const createHabitGoalBodySchema = z.object({
  habit_goals: z.unknown(),
});

export const updateHabitGoalBodySchema = z.object({
  habit_goals: z.unknown(),
});

export type CreateHabitGoalBody = z.infer<typeof createHabitGoalBodySchema>;
export type UpdateHabitGoalBody = z.infer<typeof updateHabitGoalBodySchema>;
