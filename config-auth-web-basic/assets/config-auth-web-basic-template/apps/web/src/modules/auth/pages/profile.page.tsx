'use client';

import { PersonName, URL } from '@poupig/shared';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/i18n';
import { v } from '@/shared/components/form/validator';
import { Button, FormErrorMessage, Input, Label, MiniFormCard, PageSectionHeader } from '@/shared';
import { type ChangePasswordFormData, changePasswordSchema, useAuth } from '@/modules/auth/data';
import { UserAvatarField } from '@/modules/auth/components';
import { UserAdminIndicator } from '@/modules/auth/components/user-admin-indicator.component';

const updateProfileNameSchema = v.defineObject({
  name: PersonName,
});

const updateProfileAvatarSchema = v.defineObject({
  avatarUrl: { vo: URL, optional: true },
});

type UpdateProfileNameFormData = v.infer<typeof updateProfileNameSchema>;
type UpdateProfileAvatarFormData = v.infer<typeof updateProfileAvatarSchema>;

export function ProfilePage() {
  const router = useRouter();
  const { user, logout, changePassword, updateUser, refreshUser } = useAuth();
  const [nameFormError, setNameFormError] = useState<string | null>(null);

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    formState: { errors: nameErrors, isSubmitting: isUpdatingName },
    reset: resetName,
  } = useForm<UpdateProfileNameFormData>({
    resolver: v.resolver(updateProfileNameSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isUpdatingPassword },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: v.resolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register: registerAvatar,
    handleSubmit: handleSubmitAvatar,
    formState: { errors: avatarErrors, isSubmitting: isUpdatingAvatar },
    reset: resetAvatar,
    control: avatarControl,
  } = useForm<UpdateProfileAvatarFormData>({
    resolver: v.resolver(updateProfileAvatarSchema),
    defaultValues: {
      avatarUrl: user?.avatarUrl ?? '',
    },
  });

  const avatarPreviewUrl =
    useWatch({
      control: avatarControl,
      name: 'avatarUrl',
    }) ?? '';

  useEffect(() => {
    resetName({ name: user?.name ?? '' });
  }, [resetName, user?.name]);

  useEffect(() => {
    resetAvatar({ avatarUrl: user?.avatarUrl ?? '' });
  }, [resetAvatar, user?.avatarUrl]);

  async function handleUpdateName(data: UpdateProfileNameFormData) {
    setNameFormError(null);

    if (!user?.id) {
      setNameFormError('Usuário não encontrado.');
      return;
    }

    try {
      await updateUser(user.id, { name: data.name });
      await refreshUser();
      toast.success('Nome atualizado com sucesso.');
    } catch (error) {
      setNameFormError(getErrorMessage(error));
    }
  }

  async function handleUpdateAvatar(data: UpdateProfileAvatarFormData) {
    if (!user?.id) {
      toast.error('Usuário não encontrado.');
      return;
    }

    try {
      const normalizedAvatarUrl = data.avatarUrl?.trim() || undefined;

      await updateUser(user.id, { avatarUrl: normalizedAvatarUrl });
      await refreshUser();
      resetAvatar({ avatarUrl: normalizedAvatarUrl ?? '' });
      toast.success('Avatar atualizado com sucesso.');
    } catch (error) {
      toast.error('Falha ao atualizar avatar.', {
        description: getErrorMessage(error),
      });
    }
  }

  async function handleChangePassword(data: ChangePasswordFormData) {
    try {
      await changePassword(data);
      toast.success('Senha alterada com sucesso.');
      resetPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Falha ao alterar senha.', {
        description: getErrorMessage(error),
      });
    }
  }

  function handleLogout() {
    logout();
    router.replace('/auth/sign-in');
  }

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Perfil"
        title="Perfil de Usuário"
        subtitle="Mantenha suas informações atualizadas na plataforma."
      />

      <MiniFormCard
        title="Alterar Nome"
        description="Atualize o nome exibido no seu perfil."
        actions={
          <Button type="submit" form="update-profile-name-form" disabled={isUpdatingName || !user?.id}>
            {isUpdatingName ? 'Salvando...' : 'Atualizar Nome'}
          </Button>
        }
      >
        <form id="update-profile-name-form" className="space-y-4" onSubmit={handleSubmitName(handleUpdateName)}>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" autoComplete="name" {...registerName('name')} />
            {nameErrors.name?.message ? <FormErrorMessage>{nameErrors.name.message}</FormErrorMessage> : null}
          </div>

          {nameFormError ? <FormErrorMessage size="sm">{nameFormError}</FormErrorMessage> : null}
        </form>
      </MiniFormCard>

      <MiniFormCard
        title="Alterar Avatar"
        description="Atualize a imagem do perfil usando uma URL pública."
        actions={
          <Button type="submit" form="update-profile-avatar-form" disabled={isUpdatingAvatar || !user?.id}>
            {isUpdatingAvatar ? 'Salvando...' : 'Atualizar Avatar'}
          </Button>
        }
      >
        <form id="update-profile-avatar-form" className="space-y-4" onSubmit={handleSubmitAvatar(handleUpdateAvatar)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex justify-center md:justify-start">
              <UserAvatarField
                id="profile-avatar-preview"
                value={avatarPreviewUrl}
                onChange={() => undefined}
                editable={false}
                size="large"
                desktopSize="xl"
              />
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="profile-avatar-url">URL do avatar</Label>
              <Input
                id="profile-avatar-url"
                autoComplete="off"
                placeholder="https://exemplo.com/avatar.png"
                {...registerAvatar('avatarUrl')}
              />
              {avatarErrors.avatarUrl?.message ? (
                <FormErrorMessage>{avatarErrors.avatarUrl.message}</FormErrorMessage>
              ) : null}
            </div>
          </div>
        </form>
      </MiniFormCard>

      <MiniFormCard
        title="Alterar Senha"
        description="Atualize sua credencial de acesso de forma segura."
        actions={
          <Button type="submit" form="change-password-form" disabled={isUpdatingPassword}>
            {isUpdatingPassword ? 'Salvando...' : 'Atualizar Senha'}
          </Button>
        }
      >
        <form id="change-password-form" className="space-y-4" onSubmit={handleSubmitPassword(handleChangePassword)}>
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Senha atual</Label>
            <Input
              id="oldPassword"
              type="password"
              autoComplete="current-password"
              {...registerPassword('oldPassword')}
            />
            {passwordErrors.oldPassword?.message ? (
              <FormErrorMessage>{passwordErrors.oldPassword.message}</FormErrorMessage>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" {...registerPassword('newPassword')} />
            {passwordErrors.newPassword?.message ? (
              <FormErrorMessage>{passwordErrors.newPassword.message}</FormErrorMessage>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...registerPassword('confirmPassword')}
            />
            {passwordErrors.confirmPassword?.message ? (
              <FormErrorMessage>{passwordErrors.confirmPassword.message}</FormErrorMessage>
            ) : null}
          </div>
        </form>
      </MiniFormCard>

      <MiniFormCard
        title="Usuário Logado"
        description="Informações da sessão autenticada atual."
        actions={
          <Button
            variant="outline"
            className="bg-red-600 text-white hover:bg-red-500/10 hover:text-red-400"
            onClick={handleLogout}
          >
            Encerrar Sessão
          </Button>
        }
        contentClassName="space-y-2 text-sm"
      >
        <p>
          <span className="font-medium">Nome:</span> {user?.name ?? '-'}
        </p>
        <p>
          <span className="font-medium">E-mail:</span> {user?.email ?? '-'}
        </p>
        <p>
          <span className="font-medium">ID:</span> {user?.id ?? '-'}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-medium">Perfil:</span>
          {user ? <UserAdminIndicator admin={user.admin} variant="tag" /> : '-'}
        </div>
      </MiniFormCard>
    </div>
  );
}
