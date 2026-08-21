import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import type { Checkin, Profile, ProgressReview } from '../../shared/types';

export function ProgressPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [review, setReview] = useState<ProgressReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function loadProgress() {
      try {
        const savedProfile = await api.getProfile();
        setProfile(savedProfile);

        if (savedProfile) {
          setCheckins(await api.getCheckins(savedProfile._id));
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load progress data.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProgress();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    setErrorMessage('');

    try {
      const newCheckin = await api.addCheckin({ profileId: profile._id, weightKg: Number(weight) });
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
      setReview(await api.getReview(profile._id));
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Could not generate your review.');
    } finally {
      setIsReviewing(false);
    }
  }

  if (isLoading) return <section className="empty"><p>Loading your progress…</p></section>;
  if (errorMessage && !profile) return <section className="empty"><h1>Progress unavailable</h1><p>{errorMessage}</p></section>;
  if (!profile) return <section className="empty"><h1>No saved profile found.</h1><p>Progress tracking needs a profile saved in the database.</p></section>;

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
