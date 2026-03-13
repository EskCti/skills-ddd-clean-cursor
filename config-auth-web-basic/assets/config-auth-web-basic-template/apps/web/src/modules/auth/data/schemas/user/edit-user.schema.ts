import { Email, PersonName, URL } from '@poupig/shared';
import { v } from '@/shared/components/form/validator';

export const editUserSchema = v.defineObject({
  name: PersonName,
  email: Email,
  avatarUrl: { vo: URL, optional: true },
});

export type EditUserFormData = v.infer<typeof editUserSchema>;
