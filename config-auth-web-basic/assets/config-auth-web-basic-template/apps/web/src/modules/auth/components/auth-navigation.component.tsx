"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Shield, UserCircle2, Users } from "lucide-react";
import { authMenuItems } from "@/modules/auth/data";
import { cn } from "@/shared/lib/class-name.util";

const iconById = {
  back: ArrowLeft,
  overview: Shield,
  users: Users,
  profile: UserCircle2,
} as const;

type AuthSidebarMenuProps = {
  collapsed: boolean;
};

export function AuthSidebarMenu({ collapsed }: AuthSidebarMenuProps) {
  const pathname = usePathname();
  const backItem = authMenuItems.find((item) => item.id === "back");
  const sectionItems = authMenuItems.filter((item) => item.id !== "back");

  return (
    <nav className="px-2 py-4">
      {backItem ? (
        <div className="space-y-1">
          <Link
            href={backItem.href}
            aria-label={collapsed ? backItem.label : undefined}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center px-2",
              (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
                "bg-accent text-accent-foreground",
            )}
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className={cn("truncate", collapsed && "sr-only")}>{backItem.label}</span>
            {collapsed ? (
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                {backItem.label}
              </span>
            ) : null}
          </Link>
        </div>
      ) : null}

      <div className="my-4 h-px bg-border" />

      {!collapsed ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Autenticacao
        </p>
      ) : (
        <p className="sr-only">Autenticacao</p>
      )}

      <div className="space-y-1">
        {sectionItems.map((item) => {
          const Icon = iconById[item.id];
          const active =
            pathname === item.href ||
            (item.href !== "/auth" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
              {collapsed ? (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                  {item.label}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
