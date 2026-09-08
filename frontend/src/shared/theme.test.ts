import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, clearStoredTheme, getStoredTheme, setTheme } from './theme';

describe('account themes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    applyTheme('dark');
  });

  it('stores independent preferences for each account', () => {
    setTheme('user-a', 'rose');
    setTheme('user-b', 'ocean');

    expect(getStoredTheme('user-a')).toBe('rose');
    expect(getStoredTheme('user-b')).toBe('ocean');
    expect(getStoredTheme()).toBe('dark');
  });

  it('falls back safely when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new DOMException('Blocked'); });

    expect(getStoredTheme('user-a')).toBe('dark');
    expect(() => setTheme('user-a', 'forest')).not.toThrow();
    expect(document.documentElement).toHaveAttribute('data-theme', 'forest');
    expect(() => clearStoredTheme('user-a')).not.toThrow();
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });
});
