import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthScreenLayout({ title, subtitle, children }: AuthScreenLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_40%)]" />

      <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(440px,38vw)] xl:grid-cols-[minmax(0,1fr)_minmax(520px,42vw)]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="https://picsum.photos/1400/1800"
            alt="Imagem ilustrativa"
            fill
            sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 38vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background/75 via-background/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background/75 to-transparent" />
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:justify-end lg:px-10 xl:px-12">
          <div className="w-full rounded-2xl border border-border/80 bg-card/80 p-7 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8 lg:p-9 xl:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="text-sm font-medium">Application</span>
              </div>

              <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Voltar
              </Link>
            </div>

            <header className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </header>

            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
