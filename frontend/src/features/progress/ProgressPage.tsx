import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import type { Checkin, Profile } from '../../shared/types';

export function ProgressPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

  if (isLoading) return <section className="empty"><p>Loading your progress…</p></section>;
  if (errorMessage && !profile) return <section className="empty"><h1>Progress unavailable</h1><p>{errorMessage}</p></section>;
  if (!profile) return <section className="empty"><h1>No saved profile found.</h1><p>Progress tracking needs a profile saved in the database.</p></section>;

  const firstWeight = checkins[0]?.weightKg ?? profile.weightKg;
  const latestWeight = checkins.at(-1)?.weightKg ?? profile.weightKg;
  const weightDifference = (latestWeight - firstWeight).toFixed(1);

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
  </>;
}
