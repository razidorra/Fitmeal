import { env } from '../config/env.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isGeminiConfigured() {
  return Boolean(env.geminiApiKey);
}

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type GeminiContent = { role: 'user' | 'model'; parts: Array<{ text: string }> };

// Google's free-tier "flash-latest" model intermittently returns 503 "high demand" even on valid
// requests. A short retry with backoff smooths that over instead of surfacing a flaky error to the user.
async function callWithRetry(body: unknown, attempt = 1): Promise<Response> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );

  if (response.status === 503 && attempt < 3) {
    await sleep(attempt * 500);
    return callWithRetry(body, attempt + 1);
  }

  return response;
}

/** Sends a chat request to Gemini and returns the reply text. Set `json: true` to ask for a JSON-only reply. */
export async function askGemini(systemInstruction: string, contents: GeminiContent[], json = false): Promise<string> {
  if (!env.geminiApiKey) {
    throw new GeminiError('The AI assistant is not set up yet — add a GEMINI_API_KEY to enable it.', 503);
  }

  const response = await callWithRetry({
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    ...(json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  });

  if (!response.ok) {
    if (response.status === 503) throw new GeminiError('Gemini is temporarily overloaded — please try again in a moment.', 503);
    if (response.status === 429) throw new GeminiError("The AI assistant has hit its free usage limit for now — it'll work again once the quota resets (usually within a day).", 429);
    throw new GeminiError(`Gemini API error (${response.status}): ${(await response.text()).slice(0, 300)}`, 502);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/** Parses a Gemini JSON reply, stripping the occasional markdown code fence some models add even in JSON mode. */
export function parseGeminiJson<T>(text: string): T {
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
}
