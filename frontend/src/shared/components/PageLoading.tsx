export function PageLoading({ label }: { label: string }) {
  return <section className="grid min-h-90 place-items-center py-16" aria-live="polite" aria-busy="true">
    <div className="grid min-w-70 justify-items-center rounded-2xl border border-line bg-surface/90 px-8 py-9 text-center shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <span className="relative mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-badge text-xl text-accent">
        ♡
        <span className="absolute -inset-1 rounded-2xl border border-accent opacity-50 animate-ping motion-reduce:animate-none" />
      </span>
      <strong className="font-display text-xl font-semibold text-ink">{label}</strong>
      <span className="mt-2 text-sm text-ink-muted">This will only take a moment.</span>
    </div>
  </section>;
}
