import type { ReactNode } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/class-name.util";

type PageSectionHeaderProps = {
  badge: ReactNode;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function PageSectionHeader({
  badge,
  title,
  subtitle,
  aside,
  className,
  contentClassName,
  titleClassName,
  subtitleClassName,
}: PageSectionHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <Badge variant="secondary">{badge}</Badge>

      <div
        className={cn(
          aside
            ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            : "space-y-1",
          contentClassName,
        )}
      >
        <div className="space-y-1 flex flex-col">
          <h2
            className={cn(
              "inline-block w-fit self-start bg-linear-to-r from-white to-zinc-500 bg-clip-text text-xl font-semibold text-transparent",
              titleClassName,
            )}
          >
            {title}
          </h2>

          {subtitle ? (
            <p
              className={cn(
                "text-zinc-400 text-sm",
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}
