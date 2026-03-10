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

  return files;
}

async function installDependencies({ rootDir, frontendAppPath, logger, dryRun }) {
  const runtimeDeps = [
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "lucide-react",
    "@radix-ui/react-slot",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-dialog",
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
