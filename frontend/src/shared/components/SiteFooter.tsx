import { Link } from '@tanstack/react-router';

const footerLinkClass = 'text-ink-soft no-underline text-sm hover:text-accent';

export function SiteFooter() {
  return <footer className="mt-30 max-[720px]:mt-20 -mx-[max(4vw,32px)] max-[720px]:-mx-5 border-t border-line bg-page/70 px-[max(4vw,32px)] max-[720px]:px-5 pt-14 pb-8">
    <div className="mx-auto grid max-w-320 grid-cols-[1.4fr_.6fr_.6fr] gap-14 max-[800px]:grid-cols-2 max-[560px]:grid-cols-1">
      <div className="max-w-105">
        <Link to="/" className="font-display text-2xl font-bold text-ink no-underline">
          <span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg bg-accent font-sans text-lg text-on-accent">♡</span>
          Fit<span className="text-accent">Meal</span>
        </Link>
        <p className="mt-4 mb-0 text-sm leading-[1.65] text-ink-muted">Simple meal planning, practical nutrition guidance, and progress tools designed for everyday life.</p>
      </div>
      <nav className="grid content-start gap-3" aria-label="Explore FitMeal">
        <span className="mb-1 text-[11px] font-bold uppercase tracking-[.12em] text-accent">Explore</span>
        <Link to="/recipes" className={footerLinkClass}>Recipes</Link>
        <Link to="/planner" className={footerLinkClass}>Meal planner</Link>
        <Link to="/progress" className={footerLinkClass}>Progress</Link>
      </nav>
      <nav className="grid content-start gap-3" aria-label="Learn about FitMeal">
        <span className="mb-1 text-[11px] font-bold uppercase tracking-[.12em] text-accent">Learn</span>
        <Link to="/" hash="features" className={footerLinkClass}>What you can do</Link>
        <Link to="/" hash="how-it-works" className={footerLinkClass}>How it works</Link>
        <Link to="/" hash="nutrition-guide" className={footerLinkClass}>Nutrition guide</Link>
      </nav>
    </div>
    <div className="mx-auto mt-12 flex max-w-320 items-center justify-between gap-4 border-t border-line pt-6 text-[12px] text-ink-muted max-[620px]:flex-col max-[620px]:items-start">
      <p className="m-0">© {new Date().getFullYear()} FitMeal. All rights reserved.</p>
      <p className="m-0">General wellness guidance only — not medical advice.</p>
    </div>
  </footer>;
}
