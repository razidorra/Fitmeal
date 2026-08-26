import { useEffect, useState } from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import type { Checkin, Profile, ProgressReview } from '../../shared/types';
import { PageLoading } from '../../shared/components/PageLoading';

// `useAuth()` only works inside <ClerkProvider>, which main.tsx only renders when Clerk is
// configured. Splitting into this outer guard + an inner component means the hook-calling
// component is simply never mounted when it wouldn't be safe to call it — same pattern used by
// MealPlannerPage and AccountPage.
const verdictToneClass: Record<'good' | 'ok' | 'poor', string> = { good: 'border-good text-good-text', ok: 'border-accent text-accent-soft', poor: 'border-poor text-poor-text' };

export function ProgressPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable progress tracking.</p></section>;
  return <ProgressContent />;
}

function ProgressContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [review, setReview] = useState<ProgressReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadProgress() {
      try {
        const token = await getToken();
        const savedProfile = await api.getProfile(token);
        setProfile(savedProfile);

        if (savedProfile) {
          setCheckins(await api.getCheckins(token, savedProfile._id));
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load progress data.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProgress();
  }, [isLoaded, isSignedIn, getToken]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setErrorMessage('');

    try {
      const token = await getToken();
      const newCheckin = await api.addCheckin(token, { profileId: profile._id, weightKg: Number(weight) });
      setCheckins((currentCheckins) => [...currentCheckins, newCheckin]);
      setWeight('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save the check-in.');
    }
  }

  async function handleGetReview() {
    if (!profile) return;

    setIsReviewing(true);
    setReviewError('');

    try {
      const token = await getToken();
      setReview(await api.getReview(token, profile._id));
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Could not generate your review.');
    } finally {
      setIsReviewing(false);
    }
  }

  if (!isLoaded || isLoading) return <PageLoading label="Loading your progress" />;

  // Guests see the real form and can fill it in, but submitting never calls the API (which would
  // 401 anyway) — it just reveals the "please sign in" prompt below instead of a dead end.
  if (!isSignedIn) return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Progress</span>
      <h1>Small check-ins. Clear direction.</h1>
      <p className="text-lg leading-[1.45] text-ink-soft max-w-142.5">Try logging a check-in to see how it works — sign in to save it and track your real trend.</p>
    </section>
    <section className="grid grid-cols-[.8fr_1.2fr] max-[720px]:grid-cols-1 gap-6.25 max-[720px]:gap-8.75">
      <form className="rounded-2xl bg-surface p-7 border border-line grid grid-cols-[1fr_auto] gap-3 items-center shadow-[0_18px_50px_rgba(0,0,0,.1)]" onSubmit={(event) => { event.preventDefault(); setShowGuestPrompt(true); }}>
        <h2 className="col-span-full">Log today’s weight</h2>
        <input required type="number" step="0.1" placeholder="70" />
        <span>kg</span>
        <button className="primary col-span-full">Save check-in</button>
      </form>
      <div className="rounded-2xl bg-surface p-7 border border-line shadow-[0_18px_50px_rgba(0,0,0,.1)]">
        <h2>Check-in history</h2>
        <p>Sign in to see your check-in history.</p>
      </div>
    </section>
    <section className="rounded-2xl bg-surface border border-line p-7 mt-6.25 shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <div className="flex justify-between items-center gap-5 flex-wrap">
        <h2 className="m-0">How am I doing?</h2>
        <button className="primary" onClick={() => setShowGuestPrompt(true)}>Get my review</button>
      </div>
    </section>
    {showGuestPrompt && <div className="mt-6 rounded-2xl p-5.5 border border-accent bg-surface-alt">
      <p role="alert" className="mb-4.5 text-accent font-semibold text-[15px]">Please sign in to see your progress reviews.</p>
      <div className="flex items-center gap-6 m-0">
        <SignInButton><button className="primary">Log in</button></SignInButton>
        <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>
    </div>}
  </>;

  if (errorMessage && !profile) return <section className="text-center py-22.5"><h1 className="text-[54px]">Progress unavailable</h1><p>{errorMessage}</p></section>;
  if (!profile) return <section className="text-center py-22.5"><h1 className="text-[54px]">No saved profile found.</h1><p>Set up your profile on the Meal Planner page first.</p></section>;

  const firstWeight = checkins[0]?.weightKg ?? profile.weightKg;
  const latestWeight = checkins.at(-1)?.weightKg ?? profile.weightKg;
  const weightDifference = (latestWeight - firstWeight).toFixed(1);
  const verdictTone = review?.stats.onTrack === true ? 'good' as const : review?.stats.onTrack === false ? 'poor' as const : 'ok' as const;

  return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Progress</span>
      <h1>Small check-ins. Clear direction.</h1>
      <p className="text-lg leading-[1.45] text-ink-soft max-w-142.5">{checkins.length ? `${weightDifference} kg since your first check-in.` : 'Log your first check-in to start your trend.'}</p>
    </section>
    <section className="grid grid-cols-[.8fr_1.2fr] max-[720px]:grid-cols-1 gap-6.25 max-[720px]:gap-8.75">
      <form className="rounded-2xl bg-surface p-7 border border-line grid grid-cols-[1fr_auto] gap-3 items-center shadow-[0_18px_50px_rgba(0,0,0,.1)]" onSubmit={handleSubmit}>
        <h2 className="col-span-full">Log today’s weight</h2>
        <input required type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder={`${profile.weightKg}`} />
        <span>kg</span>
        <button className="primary col-span-full">Save check-in</button>
        {errorMessage && <p role="alert" className="col-span-full">{errorMessage}</p>}
      </form>
      <div className="rounded-2xl bg-surface p-7 border border-line shadow-[0_18px_50px_rgba(0,0,0,.1)]">
        <h2>Check-in history</h2>
        {checkins.length ? checkins.slice().reverse().map((checkin) => <div key={checkin._id} className="py-3.5 border-t border-line flex justify-between"><span className="text-ink-muted">{new Date(checkin.date).toLocaleDateString()}</span><strong>{checkin.weightKg} kg</strong></div>) : <p className="text-ink-muted">No check-ins yet — your starting weight is {profile.weightKg} kg.</p>}
      </div>
    </section>
    <section className="rounded-2xl bg-surface border border-line p-7 mt-6.25 shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <div className="flex justify-between items-center gap-5 flex-wrap">
        <h2 className="m-0">How am I doing?</h2>
        <button className="primary" onClick={handleGetReview} disabled={isReviewing}>{isReviewing ? 'Reviewing…' : review ? 'Refresh review' : 'Get my review'}</button>
      </div>
      {reviewError && <p role="alert">{reviewError}</p>}
      {review && <>
        <div className="grid grid-cols-4 max-[720px]:grid-cols-2 gap-4 my-5.5">
          <div className="rounded-xl bg-surface-alt border border-line-strong p-4.5 text-center"><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.onTrack === null ? '—' : review.stats.onTrack ? 'On track' : 'Adjust plan'}</strong><span className="capitalize text-ink-soft text-xs">status</span></div>
          <div className="rounded-xl bg-surface-alt border border-line-strong p-4.5 text-center"><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.weeklyRateKg === null ? '—' : `${review.stats.weeklyRateKg > 0 ? '+' : ''}${review.stats.weeklyRateKg} kg`}</strong><span className="capitalize text-ink-soft text-xs">per week</span></div>
          <div className="rounded-xl bg-surface-alt border border-line-strong p-4.5 text-center"><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.totalChangeKg > 0 ? '+' : ''}{review.stats.totalChangeKg} kg</strong><span className="capitalize text-ink-soft text-xs">total change</span></div>
          <div className="rounded-xl bg-surface-alt border border-line-strong p-4.5 text-center"><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.loggedMealCount}</strong><span className="capitalize text-ink-soft text-xs">meals logged</span></div>
        </div>
        <p className={`leading-[1.6] py-4 px-4.5 border-l-[3px] bg-surface-alt m-0 ${verdictToneClass[verdictTone]}`}>{review.summary}</p>
      </>}
    </section>
  </>;
}
