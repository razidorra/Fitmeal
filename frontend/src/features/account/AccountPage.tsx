import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import { getLocalDateString } from '../../shared/date';
import { getStoredTheme, setTheme, type Theme } from '../../shared/theme';
import type { Checkin, MealPlan, Profile } from '../../shared/types';

export function AccountPage() {
  if (!isClerkConfigured) return <section className="empty"><h1>Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable accounts.</p></section>;
  return <AccountContent />;
}

function recentCheckinCount(checkins: Checkin[]) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return checkins.filter((checkin) => new Date(checkin.date) >= sevenDaysAgo).length;
}

function AccountContent() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [checkins, setCheckins] = useState<Checkin[] | null>(null);
  const [progressError, setProgressError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) { setIsLoading(false); return; }

    async function load() {
      try {
        const token = await getToken();
        const savedProfile = await api.getProfile(token);
        setProfile(savedProfile);

        if (savedProfile) {
          try {
            setPlan(await api.getPlan(token, savedProfile._id));
          } catch {
            // No plan yet — the card below just offers to create one.
          }
          try {
            setCheckins(await api.getCheckins(token, savedProfile._id));
          } catch (error) {
            setProgressError(error instanceof Error ? error.message : 'Failed to fetch');
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [authLoaded, isSignedIn, getToken]);

  function handleThemeChange(next: Theme) {
    setTheme(next);
    setThemeState(next);
  }

  if (!authLoaded || isLoading) return <section className="empty"><p>Loading your account…</p></section>;

  if (!isSignedIn) return <section className="empty">
    <h1>Sign in to see your account.</h1>
    <p>Create a free account to manage your profile, plan, and progress in one place.</p>
    <div className="hero-actions">
      <SignInButton><button className="primary">Log in</button></SignInButton>
      <SignUpButton><button className="primary">Sign up</button></SignUpButton>
    </div>
  </section>;

  const isPlanToday = plan?.date === getLocalDateString();

  return <>
    <section className="page-intro">
      <span className="eyebrow">Your account</span>
      <h1>Everything in one place.</h1>
    </section>
    <div className="account-card">
      <img className="account-avatar" src={user?.imageUrl} alt="" />
      <div>
        <span className="account-label">Your FitMeal account</span>
        <h2>{user?.fullName || user?.username || 'FitMeal member'}</h2>
        <p>{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>

    <div className="account-grid">
      <div className="account-panel">
        <div className="account-panel-header">
          <span className="account-label">Today</span>
          <Link to="/planner" className="account-panel-link">Manage plan →</Link>
        </div>
        <h2>My FitMeal plan</h2>
        {!profile
          ? <div className="account-callout">
            <p>Set your goal, activity and body details to calculate a personal daily target.</p>
            <Link to="/planner" className="account-panel-link">Create my plan →</Link>
          </div>
          : isPlanToday
            ? <div className="account-summary"><strong>{plan!.targets.calories} kcal</strong><span>daily target · {plan!.targets.protein}g protein</span></div>
            : <div className="account-callout">
              <p>No plan generated for today yet.</p>
              <Link to="/planner" className="account-panel-link">Generate today's plan →</Link>
            </div>}
      </div>

      <div className="account-panel">
        <div className="account-panel-header">
          <span className="account-label">Last 7 days</span>
          <Link to="/progress" className="account-panel-link">View details →</Link>
        </div>
        <h2>My progress</h2>
        {!profile
          ? <p className="account-muted">Set up your profile to start tracking.</p>
          : progressError
            ? <p role="alert">{progressError}</p>
            : !checkins || recentCheckinCount(checkins) === 0
              ? <p className="account-muted">No check-ins in the last 7 days.</p>
              : <div className="account-summary"><strong>{recentCheckinCount(checkins)}</strong><span>check-in{recentCheckinCount(checkins) === 1 ? '' : 's'} logged</span></div>}
      </div>
    </div>

    <div className="account-panel account-theme">
      <span className="account-label">Appearance</span>
      <h2>Website theme</h2>
      <p>Your choice is saved on this device and applied across FitMeal.</p>
      <div className="theme-options">
        <button type="button" className={`theme-option ${theme === 'dark' ? 'is-selected' : ''}`} onClick={() => handleThemeChange('dark')}>
          <span className="theme-swatch theme-swatch-dark" aria-hidden="true" />
          Midnight Gold
        </button>
        <button type="button" className={`theme-option ${theme === 'light' ? 'is-selected' : ''}`} onClick={() => handleThemeChange('light')}>
          <span className="theme-swatch theme-swatch-light" aria-hidden="true" />
          Warm Light
        </button>
      </div>
    </div>
  </>;
}
