#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { resolveSkillPaths } from "../../utils/resolve-skill-config.mjs";
import { createSkillRunLogger } from "../../utils/skill-run-log.mjs";

const THEME_MAP = {
  fuchsia: "#d946ef",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  emerald: "#10b981",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

function usage() {
  console.log(`Usage:
  node init-shared-web.mjs [--theme <name-or-hex>] [--mode dark|light] [--skip-install] [--dry-run]

Examples:
  node init-shared-web.mjs
  node init-shared-web.mjs --theme fuchsia --mode dark
  node init-shared-web.mjs --theme '#22c55e' --mode dark
  node init-shared-web.mjs --skip-install
  node init-shared-web.mjs --dry-run`);
}

function parseArgs(argv) {
  const options = {
    theme: "fuchsia",
    mode: "dark",
    skipInstall: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }

    if (arg === "--skip-install") {
      options.skipInstall = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--theme") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --theme");
      options.theme = value.trim();
      i += 1;
      continue;
    }

    if (arg === "--mode") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --mode");
      options.mode = value.trim().toLowerCase();
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (!["dark", "light"].includes(options.mode)) {
    throw new Error(`Invalid mode "${options.mode}". Use "dark" or "light".`);
  }

  return options;
}

function normalizeThemeColor(themeInput) {
  const value = String(themeInput ?? "").trim();
  if (!value) return THEME_MAP.fuchsia;

  const lower = value.toLowerCase();
  if (THEME_MAP[lower]) return THEME_MAP[lower];

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return value;
  }

  if (/^[a-z][a-z0-9-]*$/i.test(value)) {
    return value;
  }

  throw new Error(
    `Invalid theme color "${themeInput}". Use a known color name or #RRGGBB.`,
  );
}

function runCommand(cmd, args, cwd, logger) {
  logger.command(cmd, args);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${code})`));
    });
  });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeManagedFile({
  absolutePath,
  relativePath,
  content,
  dryRun,
  logger,
  stats,
}) {
  const exists = await fileExists(absolutePath);

  if (exists) {
    const previous = await fs.readFile(absolutePath, "utf8");
    if (previous === content) {
      stats.unchanged += 1;
      return;
    }

    stats.updated += 1;
    logger.step(`${dryRun ? "[dry-run] " : ""}arquivo atualizado: ${relativePath}`);
    if (!dryRun) {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, "utf8");
    }
    return;
  }

  stats.created += 1;
  logger.step(`${dryRun ? "[dry-run] " : ""}arquivo criado: ${relativePath}`);
  if (!dryRun) {
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }
}

async function removeLegacyFile({ absolutePath, relativePath, dryRun, logger }) {
  if (!(await fileExists(absolutePath))) return false;
  logger.step(`${dryRun ? "[dry-run] " : ""}arquivo legado removido: ${relativePath}`);
  if (!dryRun) {
    await fs.rm(absolutePath, { force: true });
  }
  return true;
}

function getFiles({ primaryColor, mode }) {
  const bodyModeClass = mode === "dark" ? "dark" : "";

  const componentsJson = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: {
      components: "@/shared/components",
      ui: "@/shared/components/ui",
      hooks: "@/shared/hooks",
      utils: "@/shared/lib/class-name.util",
    },
  };

  const files = {
    "components.json": `${JSON.stringify(componentsJson, null, 2)}\n`,
    "src/app/layout.tsx": `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poupig Web Shell",
  description: "Base compartilhada para aplicacao administrativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={[geistSans.variable, geistMono.variable, "${bodyModeClass}", "bg-background text-foreground antialiased"].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
`,
    "src/app/page.tsx": `import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Poupig Shared Web</h1>
        <p className="max-w-2xl text-muted-foreground">
          Estrutura base configurada. Acesse as rotas de exemplo privada e publica.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/private"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Ir para /private
          </Link>
          <Link
            href="/public"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
          >
            Ir para /public
          </Link>
        </div>
      </div>
    </main>
  );
}
`,
    "src/app/globals.css": `@import "tailwindcss";

:root {
  --background: #f4f4f5;
  --foreground: #111827;
  --card: #ffffff;
  --card-foreground: #111827;
  --popover: #ffffff;
  --popover-foreground: #111827;
  --primary: ${primaryColor};
  --primary-foreground: #ffffff;
  --secondary: #e4e4e7;
  --secondary-foreground: #18181b;
  --muted: #e4e4e7;
  --muted-foreground: #52525b;
  --accent: #e4e4e7;
  --accent-foreground: #18181b;
  --border: #d4d4d8;
  --input: #d4d4d8;
  --ring: ${primaryColor};
  --radius: 0.625rem;
}

.dark {
  --background: #09090b;
  --foreground: #fafafa;
  --card: #111113;
  --card-foreground: #fafafa;
  --popover: #111113;
  --popover-foreground: #fafafa;
  --primary: ${primaryColor};
  --primary-foreground: #ffffff;
  --secondary: #18181b;
  --secondary-foreground: #fafafa;
  --muted: #18181b;
  --muted-foreground: #a1a1aa;
  --accent: #18181b;
  --accent-foreground: #fafafa;
  --border: #27272a;
  --input: #27272a;
  --ring: ${primaryColor};
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

* {
  border-color: var(--border);
}

html,
body {
  min-height: 100%;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}
`,
    "src/app/(private)/layout.tsx": `"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Boxes, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import { ShellProvider } from "@/shared/context/shell.context";
import { useShell } from "@/shared/hooks/shell.hook";
import { cn } from "@/shared/lib/class-name.util";
import { AdminShell } from "@/shared/template/admin-shell.component";

type MenuIcon = ComponentType<{ className?: string }>;

type MenuItem = {
  label: string;
  href: string;
  icon: MenuIcon;
};

const dashboardItem: MenuItem = {
  label: "Dashboard",
  href: "/private",
  icon: LayoutDashboard,
};

const moduleItems: MenuItem[] = [
  { label: "Clientes", href: "/private", icon: Users },
  { label: "Produtos", href: "/private", icon: Package },
  { label: "Configuracoes", href: "/private", icon: Settings },
];

function SidebarLink({
  item,
  collapsed,
}: {
  item: MenuItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2",
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
}

function PrivateSidebarMenu() {
  const { isSidebarOpen, isMobile } = useShell();
  const collapsed = !isMobile && !isSidebarOpen;

  return (
    <nav className="px-2 py-4">
      <div className="space-y-1">
        <SidebarLink item={dashboardItem} collapsed={collapsed} />
      </div>

      <div className="my-4 h-px bg-border" />

      {!collapsed ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Modulos
        </p>
      ) : (
        <p className="sr-only">Modulos</p>
      )}

      <div className="space-y-1">
        {moduleItems.map((item) => (
          <SidebarLink key={item.label} item={item} collapsed={collapsed} />
        ))}
      </div>
    </nav>
  );
}

export default function PrivateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellProvider defaultOpen>
      <AdminShell
        sidebar={<PrivateSidebarMenu />}
        logoIcon={<Boxes className="size-5" />}
        logoText="Poupig"
        userName="Admin"
      >
        {children}
      </AdminShell>
    </ShellProvider>
  );
}
`,
    "src/app/(private)/private/page.tsx": `import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export default function PrivateDashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard privado</h1>
        <p className="text-sm text-muted-foreground">
          Estrutura inicial pronta para composicao de modulos administrativos.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Usuarios", value: "1.240" },
          { label: "Pedidos", value: "328" },
          { label: "Conversao", value: "18,2%" },
        ].map((item) => (
          <article key={item.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-lg border border-border bg-card p-4 md:p-6">
        <h2 className="text-lg font-medium">Busca rapida</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Exemplo de uso dos componentes compartilhados de formulario.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Buscar por cliente, pedido ou email" className="sm:max-w-md" />
          <Button>Pesquisar</Button>
        </div>
      </article>
    </section>
  );
}
`,
    "src/app/(public)/layout.tsx": `import { PublicBoxedLayout } from "@/shared/template/public-boxed-layout.component";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicBoxedLayout>{children}</PublicBoxedLayout>;
}
`,
    "src/app/(public)/public/page.tsx": `import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <section className="space-y-6 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Area publica</h1>
        <p className="text-sm text-muted-foreground">
          Layout boxed ideal para autenticacao, onboarding e landing pages.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 text-left">
        <h2 className="text-base font-medium">Exemplo de bloco de autenticacao</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Este espaco pode ser substituido por login, cadastro ou recuperacao de senha.
        </p>
        <div className="mt-4">
          <Link href="/private" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Continuar para area privada
          </Link>
        </div>
      </div>
    </section>
  );
}
`,
    "src/shared/index.ts": `export * from "./components/ui/button";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/input";
export * from "./components/ui/sheet";
export * from "./context/shell.context";
export * from "./hooks/shell.hook";
export * from "./template";
`,
    "src/shared/lib/class-name.util.ts": `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
    "src/shared/hooks/shell.hook.ts": `import { useShellContext } from "@/shared/context/shell.context";

export function useShell() {
  return useShellContext();
}
`,
    "src/shared/context/shell.context.tsx": `"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ShellContextValue = {
  isSidebarOpen: boolean;
  isMobile: boolean;
  setSidebarOpen: (next: boolean) => void;
  toggleSidebar: () => void;
};

type ShellProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const MOBILE_BREAKPOINT = 1024;

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children, defaultOpen = true }: ShellProviderProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      isMobile,
      setSidebarOpen,
      toggleSidebar,
    }),
    [isSidebarOpen, isMobile, toggleSidebar],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShellContext() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShellContext must be used within <ShellProvider>");
  }
  return context;
}
`,
    "src/shared/template/index.ts": `export * from "./admin-shell.component";
export * from "./public-boxed-layout.component";
`,
    "src/shared/template/public-boxed-layout.component.tsx": `type PublicBoxedLayoutProps = {
  children: React.ReactNode;
};

export function PublicBoxedLayout({ children }: PublicBoxedLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10 md:px-6">
        <section className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
`,
    "src/shared/template/admin-shell.component.tsx": `"use client";

import type { ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useShell } from "@/shared/hooks/shell.hook";
import { cn } from "@/shared/lib/class-name.util";

type AdminShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
  logoIcon?: ReactNode;
  logoText?: ReactNode;
  userName?: string;
  onLogout?: () => void;
};

export function AdminShell({
  sidebar,
  children,
  logoIcon,
  logoText,
  userName = "Usuario",
  onLogout,
}: AdminShellProps) {
  const { isSidebarOpen, isMobile, setSidebarOpen, toggleSidebar } = useShell();
  const collapsed = !isMobile && !isSidebarOpen;

  const brandIcon = logoIcon ?? (
    <span className="text-xs font-bold tracking-tight">PG</span>
  );
  const brandText = logoText ?? "App";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden border-r border-border bg-card lg:flex lg:flex-col",
            collapsed ? "w-[72px]" : "w-72",
          )}
        >
          <div
            className={cn(
              "flex h-16 border-b border-border",
              collapsed ? "items-center justify-center px-2" : "items-center gap-2 px-4",
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              {brandIcon}
            </div>
            {!collapsed ? (
              <div className="truncate text-sm font-semibold">{brandText}</div>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto">{sidebar}</div>
        </aside>

        <Sheet open={isMobile && isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 border-border bg-card p-0">
            <SheetHeader className="border-b border-border px-4 py-3 text-left">
              <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                  {brandIcon}
                </span>
                <span>{brandText}</span>
              </SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto">{sidebar}</div>
          </SheetContent>
        </Sheet>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Alternar menu lateral">
              <Menu className="size-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notificacoes">
                <Bell className="size-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-3">
                    <span className="text-sm">{userName}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
`,
    "src/shared/components/ui/button.tsx": `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/class-name.util";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
`,
    "src/shared/components/ui/input.tsx": `import * as React from "react";
import { cn } from "@/shared/lib/class-name.util";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
`,
    "src/shared/components/ui/dropdown-menu.tsx": `import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/shared/lib/class-name.util";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DropdownMenuPortal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    />
  </DropdownMenuPortal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
`,
    "src/shared/components/ui/sheet.tsx": `import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/shared/lib/class-name.util";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ side = "right", className, children, ...props }, ref) => {
  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-background p-6 shadow-lg transition ease-in-out",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
};
`,
  };

  const extendedFiles = getExtendedFiles();
  return { ...files, ...extendedFiles };
}

function getExtendedFiles() {
  const files = {
    "src/app/layout.tsx": `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/shared/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poupig Web Shell",
  description: "Base compartilhada para aplicacao administrativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={[geistSans.variable, geistMono.variable, "dark", "bg-background text-foreground antialiased"].join(" ")}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
`,
    "src/app/page.tsx": `import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Poupig Dashboard Starter</h1>
          <p className="max-w-3xl text-muted-foreground">
            Estrutura inicial preparada com shell administrativo, modulo de exemplos e componentes base para uma aplicacao dashboard.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-medium">Dashboard principal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesso ao shell privado com visao geral da aplicacao.
            </p>
            <Link
              href="/private"
              className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Abrir dashboard
            </Link>
          </article>

          <article className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-medium">Modulo Examples</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Catalogo com exemplos de formularios, botoes, tabelas, navegacao e widgets.
            </p>
            <Link
              href="/example"
              className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium"
            >
              Abrir exemplos
            </Link>
          </article>
        </div>
      </div>
    </main>
  );
}
`,
    "src/app/(private)/layout.tsx": `"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Boxes, FlaskConical, LayoutDashboard } from "lucide-react";
import { ShellProvider } from "@/shared/context/shell.context";
import { useShell } from "@/shared/hooks/shell.hook";
import { cn } from "@/shared/lib/class-name.util";
import { AdminShell } from "@/shared/template/admin-shell.component";

type MenuIcon = ComponentType<{ className?: string }>;

type MenuItem = {
  label: string;
  href: string;
  icon: MenuIcon;
};

const dashboardItem: MenuItem = {
  label: "Dashboard",
  href: "/private",
  icon: LayoutDashboard,
};

const moduleItems: MenuItem[] = [
  { label: "Examples", href: "/example", icon: FlaskConical },
];

function SidebarLink({
  item,
  collapsed,
}: {
  item: MenuItem;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2",
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
}

function PrivateSidebarMenu() {
  const { isSidebarOpen, isMobile } = useShell();
  const collapsed = !isMobile && !isSidebarOpen;

  return (
    <nav className="px-2 py-4">
      <div className="space-y-1">
        <SidebarLink item={dashboardItem} collapsed={collapsed} />
      </div>

      <div className="my-4 h-px bg-border" />

      {!collapsed ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Modulos
        </p>
      ) : (
        <p className="sr-only">Modulos</p>
      )}

      <div className="space-y-1">
        {moduleItems.map((item) => (
          <SidebarLink key={item.label} item={item} collapsed={collapsed} />
        ))}
      </div>
    </nav>
  );
}

export default function PrivateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShellProvider defaultOpen>
      <AdminShell
        sidebar={<PrivateSidebarMenu />}
        logoIcon={<Boxes className="size-5" />}
        logoText="Poupig"
        userName="Admin"
      >
        {children}
      </AdminShell>
    </ShellProvider>
  );
}
`,
    "src/app/(private)/private/page.tsx": `import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export default function PrivateDashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard principal</h1>
        <p className="text-sm text-muted-foreground">
          Entrada da area privada com atalhos para os modulos da aplicacao.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Usuarios", value: "1.240" },
          { label: "Pedidos", value: "328" },
          { label: "Conversao", value: "18,2%" },
        ].map((item) => (
          <article key={item.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-lg border border-border bg-card p-4 md:p-6">
        <h2 className="text-lg font-medium">Busca rapida</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Exemplo de uso dos componentes compartilhados de formulario.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Buscar por cliente, pedido ou email" className="sm:max-w-md" />
          <Button>Pesquisar</Button>
        </div>
      </article>

      <article className="rounded-lg border border-border bg-card p-4 md:p-6">
        <h2 className="text-lg font-medium">Modulo examples</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Navegue por exemplos de formularios, botoes, tabelas, navegacao e widgets.
        </p>
        <Link
          href="/example"
          className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          Abrir modulo examples
        </Link>
      </article>
    </section>
  );
}
`,
    "src/app/(private)/example/layout.tsx": `import { ExampleNavigation } from "@/modules/examples/components/example-navigation.component";

export default function ExampleModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Modulo Examples</h1>
        <p className="text-sm text-muted-foreground">
          Playground do design system para componentes e padroes de dashboard.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border border-border bg-card p-3">
          <ExampleNavigation />
        </aside>
        <div className="rounded-lg border border-border bg-card p-4 md:p-6">{children}</div>
      </div>
    </section>
  );
}
`,
    "src/app/(private)/example/page.tsx": `import { ExampleOverviewPage } from "@/modules/examples/pages/example-overview.page";

export default function ExamplePage() {
  return <ExampleOverviewPage />;
}
`,
    "src/app/(private)/example/buttons/page.tsx": `import { ExampleButtonsPage } from "@/modules/examples/pages/example-buttons.page";

export default function ExampleButtonsRoutePage() {
  return <ExampleButtonsPage />;
}
`,
    "src/app/(private)/example/forms/page.tsx": `import { ExampleFormsPage } from "@/modules/examples/pages/example-forms.page";

export default function ExampleFormsRoutePage() {
  return <ExampleFormsPage />;
}
`,
    "src/app/(private)/example/tables/page.tsx": `import { ExampleTablesPage } from "@/modules/examples/pages/example-tables.page";

export default function ExampleTablesRoutePage() {
  return <ExampleTablesPage />;
}
`,
    "src/app/(private)/example/widgets/page.tsx": `import { ExampleWidgetsPage } from "@/modules/examples/pages/example-widgets.page";

export default function ExampleWidgetsRoutePage() {
  return <ExampleWidgetsPage />;
}
`,
    "src/modules/examples/index.ts": `export * from "./pages/example-overview.page";
export * from "./pages/example-buttons.page";
export * from "./pages/example-forms.page";
export * from "./pages/example-tables.page";
export * from "./pages/example-widgets.page";
`,
    "src/modules/examples/data/example-menu.data.ts": `export type ExampleMenuItem = {
  id: "back" | "overview" | "buttons" | "forms" | "tables" | "widgets";
  label: string;
  href: string;
  description: string;
};

export const exampleMenuItems: ExampleMenuItem[] = [
  {
    id: "back",
    label: "Voltar ao dashboard",
    href: "/private",
    description: "Retorna para a tela principal da area privada",
  },
  {
    id: "overview",
    label: "Visao geral",
    href: "/example",
    description: "Resumo do modulo examples",
  },
  {
    id: "buttons",
    label: "Botoes e dialog",
    href: "/example/buttons",
    description: "Variacoes de botoes, dialog e toast",
  },
  {
    id: "forms",
    label: "Formularios",
    href: "/example/forms",
    description: "Campos, combobox, radio, checkbox e tabs",
  },
  {
    id: "tables",
    label: "Tabelas",
    href: "/example/tables",
    description: "Tabela com filtros e navegacao de paginas",
  },
  {
    id: "widgets",
    label: "Widgets",
    href: "/example/widgets",
    description: "Cards operacionais para dashboard",
  },
];
`,
    "src/modules/examples/components/example-navigation.component.tsx": `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  FormInput,
  LayoutGrid,
  MousePointerClick,
  Rows3,
  Table2,
} from "lucide-react";
import { exampleMenuItems } from "@/modules/examples/data/example-menu.data";
import { cn } from "@/shared/lib/class-name.util";

const iconById = {
  back: ArrowLeft,
  overview: LayoutGrid,
  buttons: MousePointerClick,
  forms: FormInput,
  tables: Table2,
  widgets: Rows3,
} as const;

export function ExampleNavigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {exampleMenuItems.map((item) => {
        const Icon = iconById[item.id];
        const active =
          pathname === item.href ||
          (item.href !== "/example" && pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group block rounded-md border border-transparent px-3 py-2 transition-colors hover:bg-accent",
              active && "border-border bg-accent",
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Icon className="size-4 shrink-0" />
              {item.label}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {item.description}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
`,
    "src/modules/examples/pages/example-overview.page.tsx": `import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const blocks = [
  {
    title: "Formularios",
    description: "Campos de texto, combobox, radio, checkbox e tabs.",
    href: "/example/forms",
  },
  {
    title: "Botoes e dialog",
    description: "Botoes em variacoes, modal de dialogo e toasts.",
    href: "/example/buttons",
  },
  {
    title: "Tabelas",
    description: "Tabela com filtros e navegacao de paginas.",
    href: "/example/tables",
  },
  {
    title: "Widgets",
    description: "Cards e indicadores para paineis de monitoramento.",
    href: "/example/widgets",
  },
];

export function ExampleOverviewPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <Badge variant="secondary">Overview</Badge>
        <h2 className="text-xl font-semibold">Guia inicial do modulo examples</h2>
        <p className="text-sm text-muted-foreground">
          Use esse modulo para acelerar novas telas e manter padroes visuais consistentes.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {blocks.map((block) => (
          <Card key={block.title}>
            <CardHeader>
              <CardTitle className="text-base">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{block.description}</p>
              <Link href={block.href} className="font-medium text-primary">
                Abrir secao
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
`,
    "src/modules/examples/pages/example-buttons.page.tsx": `"use client";

import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

export function ExampleButtonsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary">Buttons</Badge>
        <h2 className="text-xl font-semibold">Botoes, dialog e mensagens</h2>
      </header>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Variacoes de botoes</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Dialogo de confirmacao</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar publicacao</DialogTitle>
              <DialogDescription>
                Esta acao publica o conteudo no ambiente principal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary">Cancelar</Button>
              <Button>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h3 className="font-medium">Mensagens (toast)</h3>
        <Button
          onClick={() =>
            toast.success("Acao executada com sucesso", {
              description: "Exemplo de notificacao no topo direito.",
            })
          }
        >
          Exibir mensagem
        </Button>
      </section>
    </div>
  );
}
`,
    "src/modules/examples/pages/example-forms.page.tsx": `"use client";

import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox } from "@/shared/components/ui/combobox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";

const teamOptions = [
  { label: "Financeiro", value: "financeiro" },
  { label: "Operacoes", value: "operacoes" },
  { label: "Suporte", value: "suporte" },
  { label: "Produto", value: "produto" },
];

export function ExampleFormsPage() {
  const [team, setTeam] = useState("financeiro");
  const [channel, setChannel] = useState("email");
  const [sendReport, setSendReport] = useState(true);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Badge variant="secondary">Forms</Badge>
        <h2 className="text-xl font-semibold">Exemplos de formularios</h2>
      </header>

      <Tabs defaultValue="cadastro" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Ex.: Marina Costa" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="marina@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label>Equipe</Label>
            <Combobox options={teamOptions} value={team} onChange={setTeam} placeholder="Selecione uma equipe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observacao</Label>
            <Textarea id="observacao" placeholder="Descreva contexto adicional..." />
          </div>
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-3">
            <Label>Canal principal</Label>
            <RadioGroup value={channel} onValueChange={setChannel} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem id="canal-email" value="email" />
                <Label htmlFor="canal-email">Email</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="canal-whatsapp" value="whatsapp" />
                <Label htmlFor="canal-whatsapp">WhatsApp</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="relatorio"
              checked={sendReport}
              onCheckedChange={(checked) => setSendReport(checked === true)}
            />
            <Label htmlFor="relatorio">Receber relatorio semanal automatico</Label>
          </div>
        </TabsContent>
      </Tabs>

      <Button>Salvar configuracoes</Button>
    </div>
  );
}
`,
    "src/modules/examples/pages/example-tables.page.tsx": `"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const rows = [
  { id: "PED-001", customer: "Ana Souza", status: "Pago", total: "R$ 320,00" },
  { id: "PED-002", customer: "Lucas Lima", status: "Pendente", total: "R$ 89,00" },
  { id: "PED-003", customer: "Aline Costa", status: "Pago", total: "R$ 1.240,00" },
  { id: "PED-004", customer: "Tiago Alves", status: "Em analise", total: "R$ 420,00" },
  { id: "PED-005", customer: "Julia Mendes", status: "Pago", total: "R$ 215,00" },
  { id: "PED-006", customer: "Bruno Rocha", status: "Pendente", total: "R$ 560,00" },
];

export function ExampleTablesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 3;

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((item) =>
      [item.id, item.customer, item.status].join(" ").toLowerCase().includes(normalized),
    );
  }, [search]);

  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, maxPage);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <Badge variant="secondary">Tables</Badge>
        <h2 className="text-xl font-semibold">Tabela com navegacao</h2>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Filtrar por pedido, cliente ou status"
          className="sm:max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          Exibindo {paginated.length} de {filtered.length} itens
        </p>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage((previous) => Math.max(1, previous - 1))}
          disabled={currentPage === 1}
        >
          Pagina anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Pagina {currentPage} de {maxPage}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((previous) => Math.min(maxPage, previous + 1))}
          disabled={currentPage === maxPage}
        >
          Proxima pagina
        </Button>
      </div>
    </div>
  );
}
`,
    "src/modules/examples/pages/example-widgets.page.tsx": `import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

const cards = [
  { title: "Receita mensal", value: "R$ 124.520", variation: "+12,8%" },
  { title: "Tickets abertos", value: "87", variation: "-4,2%" },
  { title: "NPS", value: "71", variation: "+2,0 pts" },
];

const progress = [
  { label: "Backoffice", value: 82 },
  { label: "CRM", value: 63 },
  { label: "Checkout", value: 91 },
];

export function ExampleWidgetsPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <Badge variant="secondary">Widgets</Badge>
        <h2 className="text-xl font-semibold">Blocos para dashboard</h2>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
              <p className="text-xs text-emerald-500">{card.variation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso por modulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: item.value + "%" }} />
              </div>
            </div>
          ))}
          <Separator />
          <p className="text-xs text-muted-foreground">
            Exemplo de widget composto para monitoramento de modulos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
`,
    "src/shared/index.ts": `export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/checkbox";
export * from "./components/ui/combobox";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/popover";
export * from "./components/ui/radio-group";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/table";
export * from "./components/ui/tabs";
export * from "./components/ui/textarea";
export * from "./components/ui/toaster";
export * from "./context/shell.context";
export * from "./hooks/shell.hook";
export * from "./template";
`,
    "src/shared/components/ui/badge.tsx": `import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/class-name.util";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
`,
    "src/shared/components/ui/card.tsx": `import * as React from "react";
import { cn } from "@/shared/lib/class-name.util";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card text-card-foreground", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardFooter, CardHeader, CardTitle };
`,
    "src/shared/components/ui/label.tsx": `import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/shared/lib/class-name.util";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
`,
    "src/shared/components/ui/textarea.tsx": `import * as React from "react";
import { cn } from "@/shared/lib/class-name.util";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
`,
    "src/shared/components/ui/checkbox.tsx": `"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/class-name.util";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
`,
    "src/shared/components/ui/radio-group.tsx": `"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/shared/lib/class-name.util";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
`,
    "src/shared/components/ui/tabs.tsx": `"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/shared/lib/class-name.util";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
`,
    "src/shared/components/ui/dialog.tsx": `"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/class-name.util";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/50", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg duration-200",
        className,
      )}
      {...props}
    >
      {children}
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="size-4" />
        <span className="sr-only">Fechar</span>
      </DialogClose>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
};
`,
    "src/shared/components/ui/separator.tsx": `import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/shared/lib/class-name.util";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
`,
    "src/shared/components/ui/table.tsx": `import * as React from "react";
import { cn } from "@/shared/lib/class-name.util";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className)}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-2 align-middle", className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
`,
    "src/shared/components/ui/popover.tsx": `"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/shared/lib/class-name.util";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
`,
    "src/shared/components/ui/combobox.tsx": `"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/class-name.util";

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  emptyText = "Nenhum item encontrado.",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      [option.label, option.value].join(" ").toLowerCase().includes(normalized),
    );
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filtrar..."
          className="mb-2"
        />
        <div className="max-h-56 space-y-1 overflow-auto">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                  option.value === value && "bg-accent",
                )}
              >
                <span>{option.label}</span>
                <Check className={cn("size-4", option.value === value ? "opacity-100" : "opacity-0")} />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
`,
    "src/shared/components/ui/toaster.tsx": `"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return <Sonner richColors position="top-right" closeButton />;
}
`,
  };

  return files;
}

async function installDependencies({ rootDir, frontendAppPath, logger, dryRun }) {
  const runtimeDeps = [
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
    "sonner",
    "@radix-ui/react-slot",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-dialog",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-label",
    "@radix-ui/react-popover",
    "@radix-ui/react-radio-group",
    "@radix-ui/react-separator",
    "@radix-ui/react-tabs",
  ];

  const shadcnDevDep = ["shadcn"];

  if (dryRun) {
    logger.step(
      `[dry-run] instalaria dependencias runtime no frontend: ${runtimeDeps.join(", ")}`,
    );
    logger.step(
      `[dry-run] instalaria dependencia dev no frontend: ${shadcnDevDep.join(", ")}`,
    );
    return;
  }

  await runCommand(
    "npm",
    ["--workspace", frontendAppPath, "install", ...runtimeDeps],
    rootDir,
    logger,
  );

  await runCommand(
    "npm",
    ["--workspace", frontendAppPath, "install", "-D", ...shadcnDevDep],
    rootDir,
    logger,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(scriptDir, "../../../..");
  const logger = await createSkillRunLogger({
    rootDir,
    skillName: "config-shared-web",
    commandArgs: process.argv.slice(2),
  });

  try {
    const { config } = await resolveSkillPaths(rootDir);
    const frontendAppPath = config.defaults.frontendAppPath;
    const frontendRoot = path.join(rootDir, frontendAppPath);
    const frontendPackageJsonPath = path.join(frontendRoot, "package.json");

    if (!(await fileExists(frontendPackageJsonPath))) {
      throw new Error(
        `Frontend package.json not found: ${frontendPackageJsonPath}. Run config-project first.`,
      );
    }

    const themeColor = normalizeThemeColor(options.theme);

    logger.step(`Frontend alvo: ${frontendAppPath}.`);
    logger.step(`Tema resolvido: ${themeColor}.`);
    logger.step(`Modo resolvido: ${options.mode}.`);

    if (!options.skipInstall) {
      await installDependencies({
        rootDir,
        frontendAppPath,
        logger,
        dryRun: options.dryRun,
      });
    } else {
      logger.step("Instalacao de dependencias ignorada por --skip-install.");
    }

    const files = getFiles({ primaryColor: themeColor, mode: options.mode });
    const stats = { created: 0, updated: 0, unchanged: 0 };
    const legacyFiles = [
      "src/shared/context/shell-context.tsx",
      "src/shared/hooks/use-shell.ts",
      "src/shared/lib/utils.ts",
      "src/shared/template/admin-shell.tsx",
      "src/shared/template/public-boxed-layout.tsx",
    ];

    for (const legacyRelativePath of legacyFiles) {
      const absoluteLegacyPath = path.join(frontendRoot, legacyRelativePath);
      const logLegacyPath = path.posix.join(
        frontendAppPath,
        legacyRelativePath.replace(/\\/g, "/"),
      );
      await removeLegacyFile({
        absolutePath: absoluteLegacyPath,
        relativePath: logLegacyPath,
        dryRun: options.dryRun,
        logger,
      });
    }

    const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b));

    for (const [relativePath, content] of entries) {
      const absolutePath = path.join(frontendRoot, relativePath);
      const logPath = path.posix.join(frontendAppPath, relativePath.replace(/\\/g, "/"));
      await writeManagedFile({
        absolutePath,
        relativePath: logPath,
        content,
        dryRun: options.dryRun,
        logger,
        stats,
      });
    }

    logger.step(
      `Resumo de arquivos: criados=${stats.created}, atualizados=${stats.updated}, inalterados=${stats.unchanged}.`,
    );

    if (options.dryRun) {
      logger.step("Execucao concluida em dry-run (sem persistencia).");
    }

    await logger.success();

    console.log("Shared web shell configured successfully.");
    console.log(`Frontend: ${frontendAppPath}`);
    console.log(`Theme: ${themeColor}`);
    console.log(`Mode: ${options.mode}`);
    console.log(
      `Files -> created: ${stats.created}, updated: ${stats.updated}, unchanged: ${stats.unchanged}`,
    );
  } catch (error) {
    await logger.failure(error);
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
