import { useState, type FormEvent } from 'react';
import { api } from '../../shared/api';
import type { ChatMessage } from '../../shared/types';

export function AssistantChat() {
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
      const { reply } = await api.askAssistant(message, history);
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The assistant is unavailable right now.');
    } finally {
      setIsSending(false);
    }
  }

  return <aside className="assistant">
    <h3>FitMeal AI</h3>
    <p>Ask about your meal plan, a recipe swap, or nutrition basics.</p>
    {messages.length > 0 && <div className="assistant-messages">
      {messages.map((message, index) => <p key={index} className={message.role === 'user' ? 'assistant-msg-user' : 'assistant-msg-ai'}>
        <strong>{message.role === 'user' ? 'You' : 'FitMeal AI'}:</strong> {message.content}
      </p>)}
      {isSending && <p className="assistant-msg-ai"><strong>FitMeal AI:</strong> Thinking…</p>}
    </div>}
    {errorMessage && <p role="alert">{errorMessage}</p>}
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="e.g. Swap the salmon for something vegetarian" disabled={isSending} />
      <button type="submit" disabled={isSending}>Send</button>
    </form>
    <small>General guidance only — not medical or dietetic advice.</small>
  </aside>;
}
