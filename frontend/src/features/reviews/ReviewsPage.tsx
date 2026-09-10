import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import { Reveal } from '../../shared/components/Reveal';
import type { ReviewSummary } from '../../shared/types';
import { ContactEmailCard } from './ContactEmailCard';
import { ReviewForm } from './ReviewForm';
import { isClerkConfigured } from '../../shared/clerk';

const emptySummary: ReviewSummary = { reviews: [], averageRating: 0, total: 0 };

export function ReviewsPage() {
  const [summary, setSummary] = useState<ReviewSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function loadReviews() {
    setSummary(await api.getCustomerReviews());
  }

  useEffect(() => {
    async function loadInitialReviews() {
      try {
        await loadReviews();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load reviews.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialReviews();
  }, []);

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
        {isClerkConfigured
          ? <ReviewForm onSaved={loadReviews} />
          : <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5.5"><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Verified reviews</span><h2 className="mt-2">Review sign-in is not configured.</h2><p className="mb-0 leading-[1.6] text-ink-soft">Connect Clerk to let members with a FitMeal profile publish one verified review.</p></div>}
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
      {errorMessage && <p role="alert" className="mb-5 rounded-xl border border-poor bg-surface-alt px-4 py-3 text-sm text-poor-text">{errorMessage}</p>}
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
            <div className="mt-5 flex items-center justify-between gap-3"><strong className="text-sm text-ink">— {review.name}</strong><span className="rounded-full bg-badge px-2.5 py-1 text-[10px] font-semibold text-accent">✓ Verified profile</span></div>
          </article>
        </Reveal>)}
      </div>
    </section>
  </>;
}
