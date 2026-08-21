// Two named themes ("Midnight Gold" / "Warm Light"), not an OS-preference toggle — the user picks
// explicitly on the Account page, so there's no `prefers-color-scheme` fallback here. The choice is
// applied via a `data-theme` attribute on <html>; CSS custom properties in styles.css react to it.
export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'fitmeal-theme';

export function getStoredTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}
