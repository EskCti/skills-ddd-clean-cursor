import { Email, PersonName, StrongPassword, URL } from "__SHARED_PACKAGE_NAME__";
import { v } from "@/shared/components/form/validator";

export const createUserSchema = v
  .defineObject({
    name: PersonName,
    email: Email,
    password: StrongPassword,
    avatarUrl: { vo: URL, optional: true },
  });

export type CreateUserFormData = v.infer<typeof createUserSchema>;
