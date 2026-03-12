'use client';

import Image from 'next/image';
import { Check, Pencil, RefreshCw, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, FormErrorMessage, Input } from '@/shared';

type UserAvatarSize = 'small' | 'medium' | 'large' | 'xl';

type UserAvatarFieldProps = {
  id: string;
  value?: string;
  onChange: (nextAvatarUrl: string) => void;
  error?: string;
  editable?: boolean;
  size?: UserAvatarSize;
  desktopSize?: UserAvatarSize;
};

const avatarSizeClasses: Record<
  UserAvatarSize,
  {
    container: string;
    fallbackIcon: string;
    hoverIcon: string;
  }
> = {
  small: {
    container: 'size-12',
    fallbackIcon: 'size-5',
    hoverIcon: 'size-3.5',
  },
  medium: {
    container: 'size-18',
    fallbackIcon: 'size-8',
    hoverIcon: 'size-4',
  },
  large: {
    container: 'size-24',
    fallbackIcon: 'size-10',
    hoverIcon: 'size-5',
  },
  xl: {
    container: 'size-28',
    fallbackIcon: 'size-12',
    hoverIcon: 'size-6',
  },
};

const avatarSizePixels: Record<UserAvatarSize, number> = {
  small: 48,
  medium: 72,
  large: 96,
  xl: 112,
};

function resolveResponsiveClasses(size: UserAvatarSize, desktopSize?: UserAvatarSize) {
  if (!desktopSize || desktopSize === size) {
    return avatarSizeClasses[size];
  }

  if (size === 'large' && desktopSize === 'xl') {
    return {
      container: 'size-24 md:size-28',
      fallbackIcon: 'size-10 md:size-12',
      hoverIcon: 'size-5 md:size-6',
    };
  }

  return avatarSizeClasses[size];
}

function resolveResponsiveImageSizes(size: UserAvatarSize, desktopSize?: UserAvatarSize) {
  const mobilePixels = avatarSizePixels[size];
  const desktopPixels = avatarSizePixels[desktopSize ?? size];

  if (!desktopSize || desktopSize === size) {
    return `${mobilePixels}px`;
  }

  return `(min-width: 768px) ${desktopPixels}px, ${mobilePixels}px`;
}

function generateRandomAvatarUrl() {
  const profileType = Math.random() < 0.5 ? 'women' : 'men';
  const profileNumber = Math.floor(Math.random() * 100);
  return `https://randomuser.me/api/portraits/${profileType}/${profileNumber}.jpg`;
}

export function UserAvatarField({
  id,
  value = '',
  onChange,
  error,
  editable = true,
  size = 'medium',
  desktopSize,
}: UserAvatarFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftAvatarUrl, setDraftAvatarUrl] = useState(value);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const sizeClasses = resolveResponsiveClasses(size, desktopSize);
  const imageSizes = resolveResponsiveImageSizes(size, desktopSize);

  const normalizedAvatarUrl = useMemo(() => value.trim(), [value]);
  const resolvedAvatarUrl = normalizedAvatarUrl && failedAvatarUrl !== normalizedAvatarUrl ? normalizedAvatarUrl : null;

  function openEditMode() {
    if (!editable) {
      return;
    }

    setDraftAvatarUrl(value);
    setIsEditing(true);
  }

  function applyAvatarUrl() {
    const normalizedDraft = draftAvatarUrl.trim();
    onChange(normalizedDraft);
    setFailedAvatarUrl(null);
    setIsEditing(false);
  }

  function useRandomAvatar() {
    const randomAvatarUrl = generateRandomAvatarUrl();
    onChange(randomAvatarUrl);
    setDraftAvatarUrl(randomAvatarUrl);
    setFailedAvatarUrl(null);
  }

  return (
    <div className="space-y-2">
      <div className={editable && isEditing ? 'rounded-lg border border-border bg-muted/15 p-3' : ''}>
        <div className={editable && isEditing ? 'space-y-3' : ''}>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={openEditMode}
              disabled={!editable}
              className="group relative inline-flex rounded-full disabled:cursor-default"
              aria-label={editable ? 'Editar avatar' : 'Avatar do usuário'}
            >
              {resolvedAvatarUrl ? (
                <span
                  className={`${sizeClasses.container} relative block overflow-hidden rounded-full border border-border`}
                >
                  <Image
                    src={resolvedAvatarUrl}
                    alt="Prévia do avatar"
                    fill
                    sizes={imageSizes}
                    className="object-cover"
                    onError={() => setFailedAvatarUrl(normalizedAvatarUrl)}
                  />
                </span>
              ) : (
                <span
                  className={`${sizeClasses.container} flex items-center justify-center rounded-full border border-border bg-muted text-muted-foreground`}
                >
                  <UserRound className={sizeClasses.fallbackIcon} />
                </span>
              )}

              {editable && !isEditing ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                  <Pencil className={`${sizeClasses.hoverIcon} text-zinc-100`} />
                </div>
              ) : null}
            </button>
          </div>

          {editable && isEditing ? (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Input
                  id={id}
                  value={draftAvatarUrl}
                  onChange={(event) => setDraftAvatarUrl(event.target.value)}
                  placeholder="https://exemplo.com/avatar.png"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  size="icon"
                  className="size-8"
                  onClick={applyAvatarUrl}
                  aria-label="Aplicar URL de avatar"
                  title="Aplicar URL"
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-8"
                  onClick={useRandomAvatar}
                  aria-label="Gerar avatar aleatório"
                  title="Gerar avatar aleatório"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </div>
  );
}
