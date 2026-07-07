import { z } from 'zod';

export const incidentSchema = z.object({
  type: z.enum(['Medical', 'Crowd', 'Maintenance', 'Security', 'Hardware'], {
    errorMap: () => ({ message: 'Incident type must be one of Medical, Crowd, Maintenance, Security, or Hardware' })
  }),
  loc: z.string().min(1, { message: 'Incident location is required' }),
  desc: z.string()
    .min(4, { message: 'Description must be at least 4 characters long' })
    .max(200, { message: 'Description must be 200 characters or less' })
});

export type IncidentInput = z.infer<typeof incidentSchema>;

export const validateIncidentInput = (input: unknown) => {
  return incidentSchema.safeParse(input);
};
