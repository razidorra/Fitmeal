import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../shared/api';
import { Reveal } from '../../shared/components/Reveal';
import type { ReviewSummary } from '../../shared/types';
import { ContactEmailCard } from './ContactEmailCard';

const emptySummary: ReviewSummary = { reviews: [], averageRating: 0, total: 0 };

export function ReviewsPage() {
  const [summary, setSummary] = useState<ReviewSummary>(emptySummary);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadReviews() {
      try {
        setSummary(await api.getCustomerReviews());
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load reviews.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadReviews();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (rating === 0) {
      setErrorMessage('Please choose a star rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedReview = await api.addCustomerReview({
        name,
        rating,
        comment,
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      setSummary((current) => {
        const newTotal = current.total + 1;
        return {
          reviews: [savedReview, ...current.reviews].slice(0, 30),
          averageRating: ((current.averageRating * current.total) + savedReview.rating) / newTotal,
          total: newTotal,
        };
      });
      setName('');
      setEmail('');
      setRating(0);
      setComment('');
      setSuccessMessage('Thank you! Your review is now part of the FitMeal community.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not submit your review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <>
    <Reveal className="grid grid-cols-[1fr_auto] items-end gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-6">
      <div>
        <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Community feedback</span>
        <h1 className="max-w-190 text-balance">Your experience helps FitMeal grow.</h1>
        <p className="mb-0 max-w-170 text-lg leading-[1.65] text-ink-soft">Used one of our meal plans? Rate your experience, share what worked for you, or tell us what we can improve.</p>
      </div>
      <div className="min-w-45 rounded-2xl border border-line bg-surface p-5 text-center shadow-[0_12px_35px_rgba(0,0,0,.08)]">
        <strong className="block font-display text-4xl text-accent">{summary.total ? summary.averageRating.toFixed(1) : '—'}</strong>
        <span className="my-1 block tracking-[.14em] text-accent" aria-label={summary.total ? `${summary.averageRating.toFixed(1)} out of 5 stars` : 'No ratings yet'}>{'★'.repeat(Math.round(summary.averageRating))}<span className="text-line">{'★'.repeat(5 - Math.round(summary.averageRating))}</span></span>
        <small className="text-ink-muted">{summary.total} {summary.total === 1 ? 'review' : 'reviews'}</small>
      </div>
    </Reveal>

    <section className="mt-12 grid grid-cols-[1.05fr_.95fr] gap-7 max-[900px]:grid-cols-1">
      <Reveal>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-surface p-8 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5.5">
          <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Leave a review</span>
          <h2 className="mt-2">How was your FitMeal plan?</h2>

          <fieldset className="mb-6 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold text-ink">Your rating</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`} onClick={() => setRating(star)} className={`h-11 w-11 rounded-xl border p-0 text-xl hover:scale-105 hover:translate-y-0 ${star <= rating ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface-alt text-ink-muted hover:border-accent hover:bg-badge hover:text-accent'}`}>★</button>)}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
            <label className="grid gap-2 text-sm font-semibold text-ink">Name
              <input required minLength={2} maxLength={60} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink"><span>Email <span className="font-normal text-ink-muted">(optional)</span></span>
              <input type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
          </div>
          <p className="mt-2 mb-5 text-xs text-ink-muted">You can review FitMeal without an email. If provided, it stays private and is only used if we need to follow up.</p>

          <label className="grid gap-2 text-sm font-semibold text-ink">Your comment
            <textarea required minLength={10} maxLength={800} rows={5} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you enjoy? What could we make better?" className="w-full resize-y rounded-xl border border-line-strong bg-input px-3.5 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_var(--bg-badge)]" />
          </label>

          <div className="mt-6 flex items-center gap-4 max-[560px]:items-stretch max-[560px]:flex-col">
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Publish review'}</button>
            <span className="text-xs leading-[1.45] text-ink-muted">By submitting, you agree that your name and comment may appear publicly.</span>
          </div>
          {successMessage && <p role="status" className="mt-5 mb-0 rounded-xl border border-good bg-surface-alt px-4 py-3 text-sm text-good-text">{successMessage}</p>}
          {errorMessage && <p role="alert" className="mt-5 mb-0 rounded-xl border border-poor bg-surface-alt px-4 py-3 text-sm text-poor-text">{errorMessage}</p>}
        </form>
      </Reveal>

      <Reveal delay={100} className="grid content-start gap-5">
        <ContactEmailCard />
        <div className="rounded-2xl border border-line bg-surface-alt p-6">
          <strong className="block text-ink">What makes a useful review?</strong>
          <ul className="mb-0 mt-3 grid gap-2 pl-5 text-sm leading-[1.5] text-ink-muted">
            <li>Which plan or feature you used</li>
            <li>What felt practical in everyday life</li>
            <li>What you would like us to improve</li>
          </ul>
        </div>
      </Reveal>
    </section>

    <section className="mt-24 max-[720px]:mt-16">
      <Reveal><span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[.1em] text-accent">From the community</span><h2 className="text-[clamp(34px,4vw,52px)]">Real experiences, shared openly.</h2></Reveal>
      {isLoading && <p role="status" className="text-ink-muted">Loading reviews…</p>}
      {!isLoading && summary.reviews.length === 0 && <div className="rounded-2xl border border-dashed border-line-strong bg-surface/70 p-10 text-center">
        <span className="text-3xl" aria-hidden="true">☆</span>
        <h3 className="mt-3 font-display text-2xl">Be the first to share your experience.</h3>
        <p className="mb-0 text-ink-muted">Your feedback can help the next person feel confident starting their plan.</p>
      </div>}
      <div className="grid grid-cols-3 gap-4.5 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        {summary.reviews.map((review, index) => <Reveal key={review._id} delay={(index % 3) * 80}>
          <article className="h-full rounded-2xl border border-line bg-surface p-6 shadow-[0_12px_35px_rgba(0,0,0,.08)]">
            <div className="mb-4 flex items-center justify-between gap-3"><span className="tracking-[.1em] text-accent" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span className="text-line">{'★'.repeat(5 - review.rating)}</span></span><time className="text-[11px] text-ink-muted" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>
            <blockquote className="m-0 text-[15px] leading-[1.65] text-ink-soft">“{review.comment}”</blockquote>
            <strong className="mt-5 block text-sm text-ink">— {review.name}</strong>
          </article>
        </Reveal>)}
      </div>
    </section>
  </>;
}
