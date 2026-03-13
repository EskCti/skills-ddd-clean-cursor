import { Email } from '@poupig/shared';
import { v } from '@/shared/components/form/validator';

export const findUserByEmailSchema = v.defineObject({
  email: Email,
});

export type FindUserByEmailFormData = v.infer<typeof findUserByEmailSchema>;
