// Named themes, not an OS-preference toggle — the user picks explicitly on the Account page, so
// there's no `prefers-color-scheme` fallback here. "dark" is the original look and stays the bare
// :root default (no attribute); every other theme is applied via a `data-theme` attribute on
// <html>, matched by its own :root[data-theme="..."] block in styles.css.
export type Theme = 'dark' | 'light' | 'rose' | 'ocean' | 'forest' | 'slate';

const THEMES: Theme[] = ['dark', 'light', 'rose', 'ocean', 'forest', 'slate'];
const STORAGE_KEY = 'fitmeal-theme';

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (THEMES as string[]).includes(stored ?? '') ? (stored as Theme) : 'dark';
}

export function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}
