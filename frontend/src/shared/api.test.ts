import { describe, expect, it } from 'vitest';
import { getApiBaseUrl } from './api';

describe('getApiBaseUrl', () => {
  it('uses the local proxy path when the value is missing or blank', () => {
    expect(getApiBaseUrl(undefined)).toBe('/api');
    expect(getApiBaseUrl('   ')).toBe('/api');
  });

  it('trims configuration and removes one trailing slash', () => {
    expect(getApiBaseUrl(' https://api.example.com/api/ ')).toBe('https://api.example.com/api');
  });
});
