import { Shield, ShieldCheck } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

type UserAdminIndicatorProps = {
  admin?: boolean;
  variant?: 'dot' | 'tag';
};

export function UserAdminIndicator({ admin = false, variant = 'dot' }: UserAdminIndicatorProps) {
  const label = admin ? 'Administrador' : 'Usuário padrão';

  if (variant === 'dot') {
    return (
      <span
        title={label}
        aria-label={label}
        className={
          admin
            ? 'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
            : 'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground'
        }
      >
        {admin ? <ShieldCheck className="size-3" /> : <Shield className="size-3" />}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={
        admin
          ? 'inline-flex items-center gap-1.5 border-emerald-500/55 bg-emerald-500/10 text-emerald-400'
          : 'inline-flex items-center gap-1.5 border-border bg-muted/40 text-muted-foreground'
      }
    >
      {admin ? <ShieldCheck className="size-3.5" /> : <Shield className="size-3.5" />}
      {label}
    </Badge>
  );
}
