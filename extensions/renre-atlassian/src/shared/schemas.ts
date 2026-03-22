import { z } from 'zod';

// --- Jira pagination ---
export const paginationSchema = z.object({
  startAt: z.coerce.number().int().min(0).default(0),
  maxResults: z.coerce.number().int().min(1).max(100).default(50),
});

// --- Confluence pagination ---
export const confluencePaginationSchema = z.object({
  start: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

// --- Common field schemas ---
export const issueKeySchema = z.string().min(1, 'issueKey is required');
export const pageIdSchema = z.string().min(1, 'pageId is required');
export const accountIdSchema = z.string().min(1, 'accountId is required');
export const projectKeySchema = z.string().min(1, 'projectKey is required');
export const boardIdSchema = z.coerce.number().int().positive('boardId must be a positive integer');
export const sprintIdSchema = z.coerce
  .number()
  .int()
  .positive('sprintId must be a positive integer');

// --- Config validation ---
export const atlassianConfigSchema = z.object({
  domain: z
    .string()
    .min(1, 'domain is required')
    .refine((d) => d.includes('.'), 'domain must be a valid hostname (e.g. company.atlassian.net)'),
  email: z.string().email('email must be a valid email address'),
  apiToken: z.string().min(1, 'apiToken is required'),
});
