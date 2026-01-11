import { z } from 'zod';
import { scanRequestSchema, scans } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  scan: {
    process: {
      method: 'POST' as const,
      path: '/api/scan',
      input: scanRequestSchema,
      responses: {
        200: z.object({
          foodName: z.string(),
          analysis: z.any().optional(),
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/scans',
      responses: {
        200: z.array(z.custom<typeof scans.$inferSelect>()),
      },
    }
  },
};
