import { useEffect, useState } from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import type { Checkin, Profile, ProgressReview } from '../../shared/types';

// `useAuth()` only works inside <ClerkProvider>, which main.tsx only renders when Clerk is
// configured. Splitting into this outer guard + an inner component means the hook-calling
// component is simply never mounted when it wouldn't be safe to call it — same pattern used by
// MealPlannerPage and AccountPage.
export function ProgressPage() {
  if (!isClerkConfigured) return <section className="empty"><h1>Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable progress tracking.</p></section>;
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

  if (!isLoaded || isLoading) return <section className="empty"><p>Loading your progress…</p></section>;

  // Guests see the real form and can fill it in, but submitting never calls the API (which would
  // 401 anyway) — it just reveals the "please sign in" prompt below instead of a dead end.
  if (!isSignedIn) return <>
    <section className="page-intro">
      <span className="eyebrow">Progress</span>
      <h1>Small check-ins. Clear direction.</h1>
      <p>Try logging a check-in to see how it works — sign in to save it and track your real trend.</p>
    </section>
    <section className="progress-grid">
      <form className="checkin" onSubmit={(event) => { event.preventDefault(); setShowGuestPrompt(true); }}>
        <h2>Log today’s weight</h2>
        <input required type="number" step="0.1" placeholder="70" />
        <span>kg</span>
        <button className="primary">Save check-in</button>
      </form>
      <div className="history">
        <h2>Check-in history</h2>
        <p>Sign in to see your check-in history.</p>
      </div>
    </section>
    <section className="review">
      <div className="review-header">
        <h2>How am I doing?</h2>
        <button className="primary" onClick={() => setShowGuestPrompt(true)}>Get my review</button>
      </div>
    </section>
    {showGuestPrompt && <div className="guest-alert">
      <p role="alert">Please sign in to see your progress reviews.</p>
      <div className="hero-actions">
        <SignInButton><button className="primary">Log in</button></SignInButton>
        <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>
    </div>}
  </>;

  if (errorMessage && !profile) return <section className="empty"><h1>Progress unavailable</h1><p>{errorMessage}</p></section>;
  if (!profile) return <section className="empty"><h1>No saved profile found.</h1><p>Set up your profile on the Meal Planner page first.</p></section>;

  const firstWeight = checkins[0]?.weightKg ?? profile.weightKg;
  const latestWeight = checkins.at(-1)?.weightKg ?? profile.weightKg;
  const weightDifference = (latestWeight - firstWeight).toFixed(1);
  const verdictClass = review?.stats.onTrack === true ? 'verdict-good' : review?.stats.onTrack === false ? 'verdict-poor' : 'verdict-ok';

  return <>
    <section className="page-intro">
      <span className="eyebrow">Progress</span>
      <h1>Small check-ins. Clear direction.</h1>
      <p>{checkins.length ? `${weightDifference} kg since your first check-in.` : 'Log your first check-in to start your trend.'}</p>
    </section>
    <section className="progress-grid">
      <form className="checkin" onSubmit={handleSubmit}>
        <h2>Log today’s weight</h2>
        <input required type="number" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder={`${profile.weightKg}`} />
        <span>kg</span>
        <button className="primary">Save check-in</button>
        {errorMessage && <p role="alert">{errorMessage}</p>}
      </form>
      <div className="history">
        <h2>Check-in history</h2>
        {checkins.length ? checkins.slice().reverse().map((checkin) => <div key={checkin._id}><span>{new Date(checkin.date).toLocaleDateString()}</span><strong>{checkin.weightKg} kg</strong></div>) : <p>No check-ins yet — your starting weight is {profile.weightKg} kg.</p>}
      </div>
    </section>
    <section className="review">
      <div className="review-header">
        <h2>How am I doing?</h2>
        <button className="primary" onClick={handleGetReview} disabled={isReviewing}>{isReviewing ? 'Reviewing…' : review ? 'Refresh review' : 'Get my review'}</button>
      </div>
      {reviewError && <p role="alert">{reviewError}</p>}
      {review && <>
        <div className="review-stats">
          <div><strong>{review.stats.onTrack === null ? '—' : review.stats.onTrack ? 'On track' : 'Adjust plan'}</strong><span>status</span></div>
          <div><strong>{review.stats.weeklyRateKg === null ? '—' : `${review.stats.weeklyRateKg > 0 ? '+' : ''}${review.stats.weeklyRateKg} kg`}</strong><span>per week</span></div>
          <div><strong>{review.stats.totalChangeKg > 0 ? '+' : ''}{review.stats.totalChangeKg} kg</strong><span>total change</span></div>
          <div><strong>{review.stats.mealsChecked}</strong><span>meals checked</span></div>
        </div>
        <p className={`review-verdict ${verdictClass}`}>{review.summary}</p>
      </>}
    </section>
  </>;
}
