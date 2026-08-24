import { z } from "zod";

export const createJournalBodySchema = z.object({
  user_text: z.string().trim().min(1, "user_text is required"),
});

export const updateJournalBodySchema = z.object({
  user_text: z.string().trim().min(1, "user_text is required"),
});

export type CreateJournalBody = z.infer<typeof createJournalBodySchema>;
export type UpdateJournalBody = z.infer<typeof updateJournalBodySchema>;
