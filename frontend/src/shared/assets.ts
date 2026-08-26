// Vite does not rewrite root-absolute `url()`/`src` references to files in `public/` when `base`
// is not "/" (e.g. GitHub Pages, served from /Fitmeal/) — it only base-prefixes assets it actually
// bundles. Every local (non-hotlinked) image path from our own recipe/meal-plan data must go
// through this helper, or it 404s under a subpath deployment while working fine locally and on
// Render (both serve from "/"). Hotlinked photos (full https:// URLs) are returned unchanged.
export function resolveImage(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}
