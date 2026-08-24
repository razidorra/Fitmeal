import { useState, type FormEvent } from 'react';
import { useAuth } from '@clerk/react';
import { api } from '../../shared/api';
import type { ChatMessage } from '../../shared/types';

export function AssistantChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;

    const history = messages;
    setMessages([...history, { role: 'user', content: message }]);
    setInput('');
    setIsSending(true);
    setErrorMessage('');

    try {
      const { reply } = await api.askAssistant(await getToken(), message, history);
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The assistant is unavailable right now.');
    } finally {
      setIsSending(false);
    }
  }

  return <aside className="bg-surface-alt p-6.5 border border-line self-start">
    <h3 className="font-display font-semibold text-[25px]">FitMeal AI</h3>
    <p className="leading-[1.55] text-ink-soft">Ask about your meal plan, a recipe swap, or nutrition basics.</p>
    {messages.length > 0 && <div className="max-h-85 overflow-y-auto grid gap-2.5 my-4 pr-1">
      {messages.map((message, index) => <p key={index} className={`leading-normal text-sm m-0 ${message.role === 'user' ? 'text-ink' : 'text-ink-soft'}`}>
        <strong>{message.role === 'user' ? 'You' : 'FitMeal AI'}:</strong> {message.content}
      </p>)}
      {isSending && <p className="leading-normal text-sm m-0 text-ink-soft"><strong>FitMeal AI:</strong> Thinking…</p>}
    </div>}
    {errorMessage && <p role="alert" className="text-poor-text text-[13px]">{errorMessage}</p>}
    <form onSubmit={handleSubmit} className="flex gap-2 my-4.25">
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="e.g. Swap the salmon for something vegetarian" disabled={isSending} className="flex-1 w-auto" />
      <button type="submit" disabled={isSending} className="px-4.5 py-2.75">Send</button>
    </form>
    <small className="text-ink-muted text-[11px]">General guidance only — not medical or dietetic advice.</small>
  </aside>;
}
