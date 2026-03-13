'use client';

import type { UserDTO } from '@poupig/auth';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/shared';
import { UserAvatarField } from '@/modules/auth/components/user-avatar-field.component';
import { UserAdminIndicator } from '@/modules/auth/components/user-admin-indicator.component';

type CopyableFieldId = 'id' | 'name' | 'email';

type UserDetailsCardProps = {
  user: UserDTO;
};

type CopyableReadonlyFieldProps = {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
};

function CopyableReadonlyField({ label, value, copied, onCopy }: CopyableReadonlyFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Input value={value} readOnly className="font-mono text-xs" />
        <Button
          type="button"
          size="icon"
          variant={copied ? 'secondary' : 'outline'}
          onClick={onCopy}
          aria-label={`Copiar ${label}`}
          title={`Copiar ${label}`}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  const [copiedField, setCopiedField] = useState<CopyableFieldId | null>(null);

  async function copyToClipboard(fieldId: CopyableFieldId, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldId);
      toast.success('Informação copiada para a área de transferência.');
      window.setTimeout(() => {
        setCopiedField((currentField) => (currentField === fieldId ? null : currentField));
      }, 1200);
    } catch {
      toast.error('Não foi possível copiar o conteúdo.');
    }
  }

  return (
    <div className="space-y-5">
      <UserAvatarField
        id={`view-user-avatar-${user.id}`}
        value={user.avatarUrl ?? ''}
        onChange={() => undefined}
        editable={false}
        size="large"
        desktopSize="xl"
      />

      <div className="space-y-4">
        <CopyableReadonlyField
          label="ID"
          value={user.id ?? '-'}
          copied={copiedField === 'id'}
          onCopy={() => copyToClipboard('id', user.id ?? '-')}
        />

        <CopyableReadonlyField
          label="Nome"
          value={user.name}
          copied={copiedField === 'name'}
          onCopy={() => copyToClipboard('name', user.name)}
        />

        <CopyableReadonlyField
          label="E-mail"
          value={user.email}
          copied={copiedField === 'email'}
          onCopy={() => copyToClipboard('email', user.email)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Perfis</p>
        <div className="flex flex-wrap gap-2">
          <UserAdminIndicator admin={user.admin} variant="tag" />
        </div>
      </div>
    </div>
  );
}
