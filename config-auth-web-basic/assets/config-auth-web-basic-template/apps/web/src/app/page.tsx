import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_40%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 backdrop-blur">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-sm font-medium">Application</span>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Cadastrar</Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-4xl flex-1 items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Starter Kit
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Qualidade e clareza para construir experiencias digitais de alto nivel.
            </h1>

            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Titulo e subtitulo genericos para a pagina inicial da aplicacao, prontos para
              evoluir conforme o produto e a proposta de valor forem definidos.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Comecar cadastro</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-in">Ja tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
