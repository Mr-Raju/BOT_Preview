import { z } from "zod";

export const FlowButtonSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  nextNodeId: z.string().min(1).optional(),
  href: z.string().url().optional(),
});

export type FlowButton = z.infer<typeof FlowButtonSchema>;

export const FlowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["message", "image", "buttons"]),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  buttons: z.array(FlowButtonSchema).optional(),
  nextNodeId: z.string().min(1).optional(),
});

export type FlowNode = z.infer<typeof FlowNodeSchema>;

export const FlowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  startNodeId: z.string().min(1),
  nodes: z.array(FlowNodeSchema).min(1),
  version: z.number().int().nonnegative(),
  updatedAt: z.string().min(1),
});

export type Flow = z.infer<typeof FlowSchema>;

export const FlowSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.number(),
  updatedAt: z.string(),
});

export type FlowSummary = z.infer<typeof FlowSummarySchema>;

