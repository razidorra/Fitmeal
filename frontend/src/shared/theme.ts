// Named themes, not an OS-preference toggle — the user picks explicitly on the Account page.
// "dark" is the original look and stays the bare :root default (no attribute).
const THEMES = ['dark', 'light', 'rose', 'ocean', 'forest', 'slate'] as const;
export type Theme = typeof THEMES[number];
const STORAGE_KEY_PREFIX = 'fitmeal-theme';

function isTheme(value: string | null): value is Theme {
  return THEMES.some((theme) => theme === value);
}

export function getStoredTheme(userId?: string): Theme {
  if (!userId) return 'dark';

  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${userId}`);
    return isTheme(stored) ? stored : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function setTheme(userId: string, theme: Theme) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${userId}`, theme);
  } catch {
    // The selected theme still applies for this session when storage is blocked or unavailable.
  }
  applyTheme(theme);
}

export function clearStoredTheme(userId: string) {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}:${userId}`);
  } catch {
    // Applying the default remains useful even when browser storage cannot be changed.
  }
  applyTheme('dark');
}
