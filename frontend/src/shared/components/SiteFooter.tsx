import { Link } from '@tanstack/react-router';

const footerLinkClass = 'text-[#c5beb0] no-underline text-sm hover:text-accent';

export function SiteFooter() {
  return <footer className="mt-30 max-[720px]:mt-20 -mx-[max(5vw,32px)] pt-16 px-[max(5vw,32px)] pb-13.75 border-t border-line text-center">
    <nav className="flex justify-center gap-10 max-[720px]:gap-4 max-[720px]:flex-wrap">
      <a href="/#features" className={footerLinkClass}>About FitMeal</a>
      <Link to="/recipes" className={footerLinkClass}>Recipes</Link>
      <a href="/#how-it-works" className={footerLinkClass}>Nutrition</a>
      <Link to="/planner" className={footerLinkClass}>Meal Planner</Link>
      <Link to="/progress" className={footerLinkClass}>Progress</Link>
    </nav>
    <div className="flex justify-center gap-6.75 my-10 max-[720px]:my-7">
      <a href="https://facebook.com" aria-label="Facebook" className="text-xl text-ink-soft">f</a>
      <a href="https://instagram.com" aria-label="Instagram" className="text-xl text-ink-soft">◎</a>
      <a href="https://x.com" aria-label="X" className="text-xl text-ink-soft">𝕏</a>
      <a href="https://github.com" aria-label="GitHub" className="text-xl text-ink-soft">◉</a>
      <a href="https://youtube.com" aria-label="YouTube" className="text-xl text-ink-soft">▶</a>
    </div>
    <p className="m-0 text-ink-muted text-[13px]">© {new Date().getFullYear()} FitMeal. Eat well, plan simply, feel better.</p>
  </footer>;
}
