import { z } from "zod";

export const createHabitBodySchema = z.object({
  habits: z.unknown(),
});

export const updateHabitBodySchema = z.object({
  habits: z.unknown(),
});

export type CreateHabitBody = z.infer<typeof createHabitBodySchema>;
export type UpdateHabitBody = z.infer<typeof updateHabitBodySchema>;
