import { z } from 'zod'

// Helper for ISO datetime string validation (compatible with Zod v4)
const isoDateString = z
  .string()
  .refine((v) => {
    if (!v) return false
    const t = Date.parse(v)
    return Number.isFinite(t)
  }, 'Invalid date-time string')

export const userRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
})

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(''),
  status: z.enum(['active', 'completed', 'on-hold']).optional().default('active'),
  progress: z.number().int().min(0).max(100).optional().default(0),
  dueDate: isoDateString.optional(),
  members: z.array(userRefSchema).optional().default([]),
})

export const projectPatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'completed', 'on-hold']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  dueDate: isoDateString.nullable().optional(),
  members: z.array(userRefSchema).optional(),
})

export const taskCreateSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
  status: z.enum(['todo', 'in-progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: isoDateString.optional(),
  assignee: userRefSchema.optional(),
})

export const notificationCreateSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  isRead: z.boolean().optional(),
  time: isoDateString.optional(),
  sender: userRefSchema.optional(),
})

export const chatMessageCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  sender: userRefSchema,
})