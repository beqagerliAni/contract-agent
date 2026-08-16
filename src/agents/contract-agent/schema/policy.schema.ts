import { z } from "zod";

export const PolicySchema = z.object({
    policy_id: z.string().min(1, "Policy id is required"),
    category: z.string().min(1, "Category is required"),
    title: z.string().min(1, "Title is required"),
    rule: z.string().min(1, "Rule is required"),
    content: z.string().min(1, "Content is required for embedding"),
});

export type Policy = z.infer<typeof PolicySchema>;
