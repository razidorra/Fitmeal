import { describe, expect, it } from 'vitest';
import { getFallbackAssistantReply } from './assistant.service.js';

describe('getFallbackAssistantReply', () => {
  it('welcomes a greeting and offers relevant help', () => {
    expect(getFallbackAssistantReply('hi')).toContain('meal ideas');
  });

  it('gives a relevant answer for a protein question', () => {
    const reply = getFallbackAssistantReply('What are good protein foods?');
    expect(reply).toContain('Greek yogurt');
    expect(reply).toContain('tofu');
  });

  it('returns useful general guidance for an unknown question', () => {
    expect(getFallbackAssistantReply('Can you help me?')).toContain('balanced meal');
  });
});
