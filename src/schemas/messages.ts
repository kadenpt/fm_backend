import { z } from "zod";

export const createMessageBodySchema = z.object({
  message_description: z.string().trim().min(1, "message_description is required"),
  focus: z.string().trim().nullish(),
  message_type: z.string().trim().min(1, "message_type is required"),
});

export const updateMessageBodySchema = z.object({
  message_description: z.string().trim().min(1, "message_description is required"),
  focus: z.string().trim().nullish(),
  message_type: z.string().trim().min(1, "message_type is required"),
});

export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;
export type UpdateMessageBody = z.infer<typeof updateMessageBodySchema>;
