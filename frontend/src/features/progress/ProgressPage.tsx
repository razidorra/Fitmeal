import { useEffect, useState } from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import type { Checkin, Profile, ProgressReview } from '../../shared/types';
import { PageLoading } from '../../shared/components/PageLoading';
import { Reveal } from '../../shared/components/Reveal';
import { WeightTrendChart } from './WeightTrendChart';

// `useAuth()` only works inside <ClerkProvider>, which main.tsx only renders when Clerk is
// configured. Splitting into this outer guard + an inner component means the hook-calling
// component is simply never mounted when it wouldn't be safe to call it — same pattern used by
// MealPlannerPage and AccountPage.
const verdictToneClass: Record<'good' | 'ok' | 'poor', string> = { good: 'border-good text-good-text', ok: 'border-accent text-accent-soft', poor: 'border-poor text-poor-text' };
const goalLabels: Record<Profile['goal'], string> = { lose: 'Weight loss', maintain: 'Maintain weight', gain: 'Weight gain' };

export function ProgressPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable progress tracking.</p></section>;
  return <ProgressContent />;
}

function ProgressContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);
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
    setIsSavingCheckin(true);

    try {
      const token = await getToken();
      const newCheckin = await api.addCheckin(token, { profileId: profile._id, weightKg: Number(weight), ...(note.trim() ? { note: note.trim() } : {}) });
      setCheckins((currentCheckins) => [...currentCheckins, newCheckin]);
      setWeight('');
      setNote('');
      setReview(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save the check-in.');
    } finally {
      setIsSavingCheckin(false);
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
  const weightDifference = Number((latestWeight - firstWeight).toFixed(1));
  const verdictTone = review?.stats.onTrack === true ? 'good' as const : review?.stats.onTrack === false ? 'poor' as const : 'ok' as const;
  const latestCheckinDate = checkins.length ? new Date(checkins.at(-1)!.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not started';
  const signedDifference = `${weightDifference > 0 ? '+' : ''}${weightDifference.toFixed(1)} kg`;

  return <>
    <section className="mb-9 grid grid-cols-[1fr_auto] items-end gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-4">
      <div>
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Progress</span>
        <h1 className="max-w-190 text-balance">Small check-ins. Clear direction.</h1>
        <p className="mb-0 max-w-165 text-lg leading-[1.6] text-ink-soft">Track the trend without overreacting to one measurement. Regular check-ins help FitMeal compare your direction with your {goalLabels[profile.goal].toLowerCase()} goal.</p>
      </div>
      <span className="rounded-full border border-line bg-surface px-4 py-2 text-xs text-ink-soft">Last check-in: <strong className="text-ink">{latestCheckinDate}</strong></span>
    </section>
    <Reveal className="mb-6 grid grid-cols-4 overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-[0_12px_35px_rgba(0,0,0,.08)] max-[780px]:grid-cols-2">
      {[
        [`${latestWeight.toFixed(1)} kg`, 'Current weight', checkins.length ? 'Latest check-in' : 'Profile starting weight'],
        [checkins.length ? signedDifference : '—', 'Total change', checkins.length > 1 ? 'Since first check-in' : 'Needs another entry'],
        [`${checkins.length}`, 'Check-ins', checkins.length > 1 ? 'Trend is active' : 'Build your history'],
        [goalLabels[profile.goal], 'Current goal', 'From your profile'],
      ].map(([value, label, detail], index) => <div key={label} className={`p-5.5 ${index < 3 ? 'border-r border-line' : ''} max-[780px]:border-b max-[780px]:odd:border-r max-[780px]:even:border-r-0`}>
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.12em] text-ink-muted">{label}</span><strong className="block font-display text-[25px] text-accent">{value}</strong><span className="mt-1 block text-[11px] text-ink-soft">{detail}</span>
      </div>)}
    </Reveal>
    <section className="grid grid-cols-[1.35fr_.65fr] gap-6 max-[850px]:grid-cols-1">
      <Reveal className="rounded-2xl border border-line bg-surface p-6.5 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-4.5">
        <div className="mb-5 flex items-end justify-between gap-4 max-[520px]:items-start max-[520px]:flex-col">
          <div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Weight trend</span><h2 className="mb-0 mt-1 text-[27px]">Your direction over time</h2></div>
          <span className="text-xs text-ink-muted">{checkins.length < 2 ? 'Add 2+ check-ins for a trend' : `${checkins.length} measurements`}</span>
        </div>
        <WeightTrendChart checkins={checkins} />
        <p className="mb-0 mt-3 text-[11px] leading-[1.5] text-ink-muted">Daily weight can move with hydration, meals, and timing. Look at the longer trend rather than a single point.</p>
      </Reveal>
      <Reveal delay={100} className="rounded-2xl border border-line bg-surface-alt p-6.5 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-4.5">
        <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">New measurement</span><h2 className="mb-2 mt-1 text-[27px]">Log a check-in</h2><p className="mt-0 text-sm leading-[1.55] text-ink-soft">For a clearer comparison, use roughly the same time and conditions each time.</p>
        <form className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3" onSubmit={handleSubmit}>
          <label className="col-span-full grid gap-2 text-[12px] font-semibold text-ink-soft">Weight
            <span className="relative"><input required type="number" min="30" max="350" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder={`${latestWeight.toFixed(1)}`} className="pr-12" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted">kg</span></span>
          </label>
          <label className="col-span-full grid gap-2 text-[12px] font-semibold text-ink-soft">Context <span className="font-normal text-ink-muted">(optional)</span><input maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Morning, before breakfast" /></label>
          <button type="submit" disabled={isSavingCheckin} className="col-span-full mt-1 rounded-full">{isSavingCheckin ? 'Saving…' : 'Save check-in'}</button>
          {errorMessage && <p role="alert" className="col-span-full mb-0 text-sm text-poor-text">{errorMessage}</p>}
        </form>
      </Reveal>
    </section>
    <Reveal className="mt-6 rounded-2xl border border-line bg-surface p-7 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[560px]:p-5">
      <div className="flex justify-between items-center gap-5 flex-wrap">
        <div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Progress review</span><h2 className="mb-1 mt-1 text-[28px]">How is your plan working?</h2><p className="m-0 text-sm text-ink-soft">A rule-based review of your weight direction and latest meal logging.</p></div>
        <button className="rounded-full" onClick={handleGetReview} disabled={isReviewing}>{isReviewing ? 'Reviewing…' : review ? 'Refresh review' : 'Get my review'}</button>
      </div>
      {reviewError && <p role="alert" className="text-poor-text">{reviewError}</p>}
      {review && <>
        <div className="grid grid-cols-4 max-[720px]:grid-cols-2 gap-4 my-5.5">
          <div className="rounded-xl bg-surface-alt border border-line p-4.5"><span className="mb-2 block text-[10px] uppercase tracking-wider text-ink-muted">Status</span><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.onTrack === null ? 'Not enough data' : review.stats.onTrack ? 'On track' : 'Adjust plan'}</strong></div>
          <div className="rounded-xl bg-surface-alt border border-line p-4.5"><span className="mb-2 block text-[10px] uppercase tracking-wider text-ink-muted">Weekly rate</span><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.weeklyRateKg === null ? '—' : `${review.stats.weeklyRateKg > 0 ? '+' : ''}${review.stats.weeklyRateKg} kg`}</strong></div>
          <div className="rounded-xl bg-surface-alt border border-line p-4.5"><span className="mb-2 block text-[10px] uppercase tracking-wider text-ink-muted">Total change</span><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.totalChangeKg > 0 ? '+' : ''}{review.stats.totalChangeKg} kg</strong></div>
          <div className="rounded-xl bg-surface-alt border border-line p-4.5"><span className="mb-2 block text-[10px] uppercase tracking-wider text-ink-muted">Meals logged</span><strong className="block font-display font-semibold text-[22px] text-accent">{review.stats.loggedMealCount}</strong></div>
        </div>
        <p className={`m-0 rounded-r-xl border-l-[3px] bg-surface-alt py-4 px-4.5 leading-[1.65] ${verdictToneClass[verdictTone]}`}>{review.summary}</p>
      </>}
    </Reveal>
    <Reveal className="mt-6 rounded-2xl border border-line bg-surface-alt p-6.5 shadow-[0_12px_35px_rgba(0,0,0,.08)] max-[560px]:p-4.5">
      <div className="mb-4 flex items-end justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">History</span><h2 className="mb-0 mt-1 text-[27px]">Check-in log</h2></div><span className="text-xs text-ink-muted">{checkins.length} total</span></div>
      {checkins.length
        ? <div className="max-h-100 overflow-y-auto rounded-xl border border-line bg-surface px-4.5">{checkins.slice().reverse().map((checkin, index) => <div key={checkin._id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-line py-4 last:border-b-0">
          <div><strong className="block text-sm text-ink">{new Date(checkin.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong><span className="mt-1 block text-xs text-ink-muted">{checkin.note || (index === checkins.length - 1 ? 'First recorded check-in' : 'No context added')}</span></div><strong className="self-center font-display text-[21px] text-accent">{checkin.weightKg.toFixed(1)} kg</strong>
        </div>)}</div>
        : <div className="rounded-xl border border-dashed border-line-strong bg-surface p-7 text-center text-sm text-ink-muted">No check-ins yet. Your profile starting weight is {profile.weightKg.toFixed(1)} kg.</div>}
    </Reveal>
  </>;
}
