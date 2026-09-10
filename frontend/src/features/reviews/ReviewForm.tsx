import { useEffect, useState, type FormEvent } from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/react';
import { Link } from '@tanstack/react-router';
import { api } from '../../shared/api';
import type { CustomerReview, Profile } from '../../shared/types';

export function ReviewForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [existingReview, setExistingReview] = useState<CustomerReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadReviewer() {
      try {
        const token = await getToken();
        const [savedProfile, savedReview] = await Promise.all([
          api.getProfile(token),
          api.getMyCustomerReview(token),
        ]);
        setProfile(savedProfile);
        setExistingReview(savedReview);
        setRating(savedReview?.rating ?? 0);
        setComment(savedReview?.comment ?? '');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not prepare the review form.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadReviewer();
  }, [getToken, isLoaded, isSignedIn]);

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
      const savedReview = await api.saveCustomerReview(await getToken(), { rating, comment: comment.trim() });
      setExistingReview(savedReview);
      await onSaved();
      setSuccessMessage(existingReview ? 'Your review has been updated.' : 'Thank you! Your review is now part of the FitMeal community.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your review.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded || isLoading) return <div className="rounded-3xl border border-line bg-surface p-8 text-ink-muted">Preparing the review form…</div>;

  if (!isSignedIn) return <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5.5">
    <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Verified reviews</span>
    <h2 className="mt-2">Sign in to leave a review.</h2>
    <p className="leading-[1.6] text-ink-soft">Only FitMeal members with a saved profile can publish one review.</p>
    <div className="mt-5 flex gap-3 max-[420px]:flex-col"><SignInButton><button>Log in</button></SignInButton><SignUpButton><button className="border border-line-strong bg-surface-alt text-ink hover:bg-hover">Create account</button></SignUpButton></div>
  </div>;

  if (!profile) return <div className="rounded-3xl border border-line bg-surface p-8 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5.5">
    <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Profile required</span>
    <h2 className="mt-2">Create your FitMeal profile first.</h2>
    <p className="leading-[1.6] text-ink-soft">A saved profile verifies that you use FitMeal and prevents duplicate reviews under different names.</p>
    <Link to="/planner" className="primary mt-3">Create my profile <span aria-hidden="true" className="ml-2">→</span></Link>
  </div>;

  return <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-surface p-8 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5.5">
    <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">{existingReview ? 'Update your review' : 'Leave a review'}</span>
    <h2 className="mt-2">How was your FitMeal plan?</h2>
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-line bg-surface-alt px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-on-accent" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
      <div><small className="block text-[10px] uppercase tracking-wider text-ink-muted">Posting as</small><strong className="text-sm text-ink">{profile.name}</strong></div>
    </div>

    <fieldset className="mb-6 border-0 p-0">
      <legend className="mb-2.5 text-sm font-semibold text-ink">Your rating</legend>
      <div className="flex gap-2" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`} onClick={() => setRating(star)} disabled={isSubmitting} className={`h-11 w-11 rounded-xl border p-0 text-xl hover:scale-105 hover:translate-y-0 ${star <= rating ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface-alt text-ink-muted hover:border-accent hover:bg-badge hover:text-accent'}`}>★</button>)}
      </div>
    </fieldset>

    <label className="grid gap-2 text-sm font-semibold text-ink">Your comment
      <textarea required minLength={10} maxLength={800} rows={5} value={comment} onChange={(event) => setComment(event.target.value)} disabled={isSubmitting} placeholder="What did you enjoy? What could we make better?" className="w-full resize-y rounded-xl border border-line-strong bg-input px-3.5 py-3 font-sans text-base text-ink outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_var(--bg-badge)]" />
    </label>

    <div className="mt-6 flex items-center gap-4 max-[560px]:items-stretch max-[560px]:flex-col">
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : existingReview ? 'Update review' : 'Publish review'}</button>
      <span className="text-xs leading-[1.45] text-ink-muted">One review per profile. Your profile name and comment appear publicly.</span>
    </div>
    {successMessage && <p role="status" className="mt-5 mb-0 rounded-xl border border-good bg-surface-alt px-4 py-3 text-sm text-good-text">{successMessage}</p>}
    {errorMessage && <p role="alert" className="mt-5 mb-0 rounded-xl border border-poor bg-surface-alt px-4 py-3 text-sm text-poor-text">{errorMessage}</p>}
  </form>;
}
