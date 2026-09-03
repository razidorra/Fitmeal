import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return <section className="py-22.5 text-center">
    <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-accent">404</span>
    <h1 className="text-[54px]">Page not found.</h1>
    <p className="mx-auto mb-7 max-w-125 text-ink-soft">The page may have moved, or the address may be incorrect.</p>
    <Link to="/" className="primary">Back to homepage</Link>
  </section>;
}
