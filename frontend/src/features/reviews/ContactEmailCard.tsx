import { useState, type FormEvent } from 'react';
import { api } from '../../shared/api';

const contactTopics = [
  'Feedback about a meal plan',
  'Technical support',
  'Partnership or business',
  'Privacy request',
  'Other question',
];

export function ContactEmailCard() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [topic, setTopic] = useState(contactTopics[0]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.sendContactMessage({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        topic,
        message: message.trim(),
      });
      setSuccessMessage(response.message);
      setSenderName('');
      setSenderEmail('');
      setMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send your message.');
    } finally {
      setIsSending(false);
    }
  }

  return <section className="rounded-3xl border border-accent bg-badge p-8 max-[560px]:p-5.5" aria-labelledby="contact-email-title">
    <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Private contact</span>
    <h2 id="contact-email-title" className="mt-2 text-[28px]">Email the FitMeal team.</h2>
    <p className="leading-[1.6] text-ink-soft">Send a private message without leaving FitMeal. Your reply address is used only so our team can answer you.</p>

    <div className="my-5 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-icon text-accent" aria-hidden="true">✉</span>
      <div className="min-w-0"><small className="block text-[10px] uppercase tracking-wider text-ink-muted">Private recipient</small><strong className="text-sm text-ink">FitMeal support team</strong></div>
    </div>

    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-ink">Your name
        <input required minLength={2} maxLength={60} autoComplete="name" value={senderName} onChange={(event) => setSenderName(event.target.value)} placeholder="How should we address you?" disabled={isSending} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">Reply email
        <input required type="email" maxLength={254} autoComplete="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} placeholder="you@example.com" disabled={isSending} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">What can we help with?
        <select value={topic} onChange={(event) => setTopic(event.target.value)} disabled={isSending}>
          {contactTopics.map((contactTopic) => <option key={contactTopic}>{contactTopic}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">Your message
        <textarea required maxLength={1500} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us how we can help…" disabled={isSending} className="w-full resize-y rounded-xl border border-line-strong bg-input px-3.5 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_var(--bg-badge)]" />
      </label>
      <button type="submit" disabled={isSending} className="mt-1 w-full">{isSending ? 'Sending…' : 'Send message'} <span aria-hidden="true" className="ml-2">→</span></button>
    </form>
    {successMessage && <p role="status" className="mt-4 mb-0 rounded-xl border border-good bg-surface px-4 py-3 text-sm text-good-text">{successMessage}</p>}
    {errorMessage && <p role="alert" className="mt-4 mb-0 rounded-xl border border-poor bg-surface px-4 py-3 text-sm text-poor-text">{errorMessage}</p>}
    <p className="mb-0 mt-3 text-center text-[11px] leading-[1.45] text-ink-muted">Your message is sent privately and never appears in public reviews.</p>
  </section>;
}
