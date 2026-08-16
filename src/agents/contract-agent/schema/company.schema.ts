import { z } from "zod";

export const CompanySchema = z.object({
    company_name: z.string().min(1, "Company name is required"),
    type: z.enum(["client", "vendor"]),
    status: z.enum(["active", "inactive", "prospect"]).default("active"),
    industry: z.string().optional(),
    primary_contact: z.string().optional(),
    relationship_since: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM format")
        .optional(),
    risk_level: z.enum(["low", "medium", "high"]).default("low"),
    notes: z.string().optional(),
    content: z.string().min(1, "Content is required for embedding"),
});

export type Company = z.infer<typeof CompanySchema>;