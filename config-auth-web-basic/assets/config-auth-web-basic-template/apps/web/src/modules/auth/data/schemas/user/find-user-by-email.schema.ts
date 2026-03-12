import { Email } from "__SHARED_PACKAGE_NAME__";
import { v } from "@/shared/components/form/validator";

export const findUserByEmailSchema = v.defineObject({
  email: Email,
});

export type FindUserByEmailFormData = v.infer<typeof findUserByEmailSchema>;
