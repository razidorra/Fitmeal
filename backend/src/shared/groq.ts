import { env } from '../config/env.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isGroqConfigured() {
  return Boolean(env.groqApiKey);
}

export class GroqError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type GroqMessage = { role: 'user' | 'assistant'; content: string };

// Groq's API can intermittently return 503 under high demand, same as most hosted LLM APIs. A
// short retry with backoff smooths that over instead of surfacing a flaky error to the user.
async function callWithRetry(body: unknown, signal: AbortSignal, attempt = 1): Promise<Response> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.groqApiKey}` },
    body: JSON.stringify(body),
    signal,
  });

  if (response.status === 503 && attempt < 3) {
    await sleep(attempt * 500);
    return callWithRetry(body, signal, attempt + 1);
  }

  return response;
}

/** Sends a chat request to Groq and returns the reply text. Set `json: true` to ask for a JSON-only reply. */
export async function askGroq(systemInstruction: string, messages: GroqMessage[], json = false): Promise<string> {
  if (!env.groqApiKey) {
    throw new GroqError('The AI assistant is not set up yet — add a GROQ_API_KEY to enable it.', 503);
  }

  let response: Response;
  try {
    response = await callWithRetry({
      model: env.groqModel,
      messages: [{ role: 'system', content: systemInstruction }, ...messages],
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }, AbortSignal.timeout(12_000));
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new GroqError('The AI assistant took too long to answer — please try again.', 504);
    }
    throw new GroqError('The AI assistant could not reach Groq — please try again in a moment.', 502);
  }

  if (!response.ok) {
    if (response.status === 503) throw new GroqError('Groq is temporarily overloaded — please try again in a moment.', 503);
    if (response.status === 429) throw new GroqError("The AI assistant has hit its free usage limit for now — it'll work again once the quota resets.", 429);
    throw new GroqError(`Groq API error (${response.status}): ${(await response.text()).slice(0, 300)}`, 502);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/** Parses a Groq JSON reply, stripping the occasional markdown code fence some models add even in JSON mode. */
export function parseGroqJson<T>(text: string): T {
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
}
