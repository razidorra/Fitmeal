import { Link } from '@tanstack/react-router';

export function SiteFooter() {
  return <footer className="site-footer">
    <nav>
      <a href="/#features">About FitMeal</a>
      <Link to="/recipes">Recipes</Link>
      <a href="/#how-it-works">Nutrition</a>
      <Link to="/planner">Meal Planner</Link>
      <Link to="/progress">Progress</Link>
    </nav>
    <div className="social-links">
      <a href="https://facebook.com" aria-label="Facebook">f</a>
      <a href="https://instagram.com" aria-label="Instagram">◎</a>
      <a href="https://x.com" aria-label="X">𝕏</a>
      <a href="https://github.com" aria-label="GitHub">◉</a>
      <a href="https://youtube.com" aria-label="YouTube">▶</a>
    </div>
    <p>© {new Date().getFullYear()} FitMeal. Eat well, plan simply, feel better.</p>
  </footer>;
}
