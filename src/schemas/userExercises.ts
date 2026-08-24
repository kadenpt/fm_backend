import { z } from "zod";

export const createUserExerciseBodySchema = z.object({
  exercise_id: z.number().int().positive("exercise_id must be a positive integer"),
});

export type CreateUserExerciseBody = z.infer<typeof createUserExerciseBodySchema>;
