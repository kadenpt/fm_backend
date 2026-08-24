import { z } from "zod";

export const createExerciseBodySchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  exercise_description: z.string().trim().min(1, "exercise_description is required"),
  video_url: z.string().url("Invalid video_url").nullish(),
  focus: z.string().trim().nullish(),
  duration: z.number().int().positive().nullish(),
});

export const updateExerciseBodySchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  exercise_description: z.string().trim().min(1, "exercise_description is required"),
  video_url: z.string().url("Invalid video_url").nullish(),
  focus: z.string().trim().nullish(),
  duration: z.number().int().positive().nullish(),
});

export type CreateExerciseBody = z.infer<typeof createExerciseBodySchema>;
export type UpdateExerciseBody = z.infer<typeof updateExerciseBodySchema>;
