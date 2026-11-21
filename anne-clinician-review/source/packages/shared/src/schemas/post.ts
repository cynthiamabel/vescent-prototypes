import { z } from "zod";

export const postCreateSchema = z.object({
  content: z.string().max(5000).optional(),
  mediaUrl: z.string().url().optional(),
  sharpenReference: z.string().max(500).optional(),
  groupId: z.number().optional(),
});

export const replyCreateSchema = z.object({
  content: z.string().min(1, "Reply cannot be empty").max(2000),
});

export const groupCreateSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export type PostCreateData = z.infer<typeof postCreateSchema>;
export type ReplyCreateData = z.infer<typeof replyCreateSchema>;
export type GroupCreateData = z.infer<typeof groupCreateSchema>;
