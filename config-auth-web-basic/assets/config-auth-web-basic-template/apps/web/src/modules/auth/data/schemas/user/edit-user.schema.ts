import { Email, PersonName, URL } from "__SHARED_PACKAGE_NAME__";
import { v } from "@/shared/components/form/validator";

export const editUserSchema = v.defineObject({
  name: PersonName,
  email: Email,
  avatarUrl: { vo: URL, optional: true },
});

export type EditUserFormData = v.infer<typeof editUserSchema>;
