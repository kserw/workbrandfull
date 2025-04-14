import { z } from 'zod';

// Schema for onChange validation - won't validate email
export const formSchemaOnChange = z.object({
  companyName: z.string().min(1, 'Organization name is required'),
  email: z.string(),
  competitorName: z.string().min(1, 'Competitor name is required'),
});

// Schema for onSubmit validation - will validate email
export const formSchemaOnSubmit = z.object({
  companyName: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Please enter a valid email address'),
  competitorName: z.string().min(1, 'Competitor name is required'),
});

export type FormSchema = z.infer<typeof formSchemaOnSubmit>; 