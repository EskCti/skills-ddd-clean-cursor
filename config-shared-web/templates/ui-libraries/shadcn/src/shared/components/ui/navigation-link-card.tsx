import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/class-name.util';

type NavigationLinkCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
};

export function NavigationLinkCard({ href, title, description, icon, className }: NavigationLinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block h-full overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-5 text-card-foreground transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_20px_55px_-35px_hsl(var(--primary)/0.8)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.16),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background/70 text-primary shadow-sm transition-colors duration-300 group-hover:border-primary/40 group-hover:text-primary">
          {icon}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
