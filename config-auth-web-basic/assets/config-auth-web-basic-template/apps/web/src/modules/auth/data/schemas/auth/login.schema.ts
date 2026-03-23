import { Email, StrongPassword } from '@poupig/shared';
import { v } from '@/shared/components/form/validator';

export const loginSchema = v.defineObject({
  email: Email,
  password: StrongPassword,
});

export type LoginFormData = v.infer<typeof loginSchema>;
