"use client";

import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button, FormErrorMessage, Input, Label } from "@/shared";
import { UserAvatarField } from "@/modules/auth/components/user-avatar-field.component";

type UserFormMode = "create" | "update";

type UserFormFieldsProps = {
  mode: UserFormMode;
  idPrefix: string;
  userId?: string;
  nameField: UseFormRegisterReturn;
  emailField: UseFormRegisterReturn;
  nameError?: string;
  emailError?: string;
  passwordField?: UseFormRegisterReturn;
  passwordError?: string;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  avatarField: UseFormRegisterReturn;
  avatarUrl: string;
  avatarError?: string;
  onAvatarUrlChange: (nextAvatarUrl: string) => void;
  avatarEditable?: boolean;
};

export function UserFormFields({
  mode,
  idPrefix,
  userId,
  nameField,
  emailField,
  nameError,
  emailError,
  passwordField,
  passwordError,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
  avatarField,
  avatarUrl,
  avatarError,
  onAvatarUrlChange,
  avatarEditable = true,
}: UserFormFieldsProps) {
  const nameInputId = `${idPrefix}-name`;
  const emailInputId = `${idPrefix}-email`;
  const passwordInputId = `${idPrefix}-password`;
  const idInputId = `${idPrefix}-id`;

  return (
    <>
      <input type="hidden" {...avatarField} />

      <UserAvatarField
        id={`${idPrefix}-avatar-url`}
        value={avatarUrl}
        onChange={onAvatarUrlChange}
        error={avatarError}
        editable={avatarEditable}
        size="large"
        desktopSize="xl"
      />

      {mode === "update" ? (
        <div className="space-y-2">
          <Label htmlFor={idInputId}>ID</Label>
          <Input
            id={idInputId}
            value={userId ?? ""}
            readOnly
            className="font-mono text-xs"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={nameInputId}>Nome</Label>
        <Input id={nameInputId} {...nameField} />
        {nameError ? <FormErrorMessage>{nameError}</FormErrorMessage> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={emailInputId}>E-mail</Label>
        <Input id={emailInputId} type="email" {...emailField} />
        {emailError ? <FormErrorMessage>{emailError}</FormErrorMessage> : null}
      </div>

      {mode === "create" ? (
        <div className="space-y-2">
          <Label htmlFor={passwordInputId}>Senha</Label>
          <div className="relative">
            <Input
              id={passwordInputId}
              type={isPasswordVisible ? "text" : "password"}
              className="pr-10"
              autoComplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              {...passwordField}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
              onClick={onTogglePasswordVisibility}
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            >
              {isPasswordVisible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
          {passwordError ? <FormErrorMessage>{passwordError}</FormErrorMessage> : null}
        </div>
      ) : null}
    </>
  );
}
