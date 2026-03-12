type PublicBoxedLayoutProps = {
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
