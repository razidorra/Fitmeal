import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import { getLocalDateString } from '../../shared/date';
import { getStoredTheme, setTheme, type Theme } from '../../shared/theme';
import type { Checkin, MealPlan, Profile } from '../../shared/types';
import { PageLoading } from '../../shared/components/PageLoading';

export function AccountPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable accounts.</p></section>;
  return <AccountContent />;
}

// swatchBg/swatchAccent are each theme's actual --bg-page/--accent literal, not a live var()
// reference — a swatch needs to preview a theme that might not be the active one, so it can't
// follow the current theme's variables the way the rest of the page does.
const themeOptions: Array<{ value: Theme; label: string; swatchBg: string; swatchAccent: string }> = [
  { value: 'dark', label: 'Midnight Gold', swatchBg: '#0a0b0b', swatchAccent: '#dfcc86' },
  { value: 'light', label: 'Warm Light', swatchBg: '#ffffff', swatchAccent: '#b8860b' },
  { value: 'rose', label: 'Rose Pink', swatchBg: '#1a1013', swatchAccent: '#e893ac' },
  { value: 'ocean', label: 'Ocean Blue', swatchBg: '#101720', swatchAccent: '#6fb3e0' },
  { value: 'forest', label: 'Forest Green', swatchBg: '#121712', swatchAccent: '#7fc879' },
  { value: 'slate', label: 'Slate Gray', swatchBg: '#131415', swatchAccent: '#9db1bd' },
];

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

  if (!authLoaded || isLoading) return <PageLoading label="Loading your account" />;

  if (!isSignedIn) return <section className="text-center py-22.5">
    <h1 className="text-[54px]">Sign in to see your account.</h1>
    <p>Create a free account to manage your profile, plan, and progress in one place.</p>
    <div className="flex items-center gap-6 mt-6 mb-8.75 justify-center">
      <SignInButton><button className="primary">Log in</button></SignInButton>
      <SignUpButton><button className="primary">Sign up</button></SignUpButton>
    </div>
  </section>;

  const isPlanToday = plan?.date === getLocalDateString();
  const panelLinkClass = 'text-accent font-bold text-[13px] no-underline hover:underline';
  const summaryStrongClass = 'block font-display font-semibold text-[28px] text-accent';
  const summarySpanClass = 'text-ink-soft text-[13px]';

  return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Your account</span>
      <h1>Everything in one place.</h1>
    </section>
    <div className="flex items-center gap-5 rounded-2xl py-6.5 px-7 border border-line bg-surface-alt mb-5.5 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[720px]:flex-col max-[720px]:items-start max-[720px]:text-left">
      <img className="w-14 h-14 rounded-full object-cover bg-hover" src={user?.imageUrl} alt="" />
      <div>
        <span className="uppercase tracking-wider font-sans font-semibold text-[11px] text-accent">Your FitMeal account</span>
        <h2 className="font-display font-semibold text-2xl mt-1.5 mb-1">{user?.fullName || user?.username || 'FitMeal member'}</h2>
        <p className="m-0 text-ink-soft text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-5 mb-5">
      <div className="rounded-2xl py-6.5 px-7 border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,.1)]">
        <div className="flex justify-between items-center">
          <span className="uppercase tracking-wider font-sans font-semibold text-[11px] text-accent">Today</span>
          <Link to="/planner" className={panelLinkClass}>Manage plan →</Link>
        </div>
        <h2 className="font-display font-semibold text-[22px] mt-1.5 mb-4">My FitMeal plan</h2>
        {!profile
          ? <div className="py-4.5 px-5 border border-accent bg-surface-alt">
            <p className="mb-3 text-ink">Set your goal, activity and body details to calculate a personal daily target.</p>
            <Link to="/planner" className={panelLinkClass}>Create my plan →</Link>
          </div>
          : isPlanToday
            ? <div><strong className={summaryStrongClass}>{plan!.targets.calories} kcal</strong><span className={summarySpanClass}>daily target · {plan!.targets.protein}g protein</span></div>
            : <div className="py-4.5 px-5 border border-accent bg-surface-alt">
              <p className="mb-3 text-ink">No plan generated for today yet.</p>
              <Link to="/planner" className={panelLinkClass}>Generate today's plan →</Link>
            </div>}
      </div>

      <div className="rounded-2xl py-6.5 px-7 border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,.1)]">
        <div className="flex justify-between items-center">
          <span className="uppercase tracking-wider font-sans font-semibold text-[11px] text-accent">Last 7 days</span>
          <Link to="/progress" className={panelLinkClass}>View details →</Link>
        </div>
        <h2 className="font-display font-semibold text-[22px] mt-1.5 mb-4">My progress</h2>
        {!profile
          ? <p className="text-ink-muted m-0">Set up your profile to start tracking.</p>
          : progressError
            ? <p role="alert">{progressError}</p>
            : !checkins || recentCheckinCount(checkins) === 0
              ? <p className="text-ink-muted m-0">No check-ins in the last 7 days.</p>
              : <div><strong className={summaryStrongClass}>{recentCheckinCount(checkins)}</strong><span className={summarySpanClass}>check-in{recentCheckinCount(checkins) === 1 ? '' : 's'} logged</span></div>}
      </div>
    </div>

    <div className="rounded-2xl py-6.5 px-7 border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,.1)]">
      <span className="uppercase tracking-wider font-sans font-semibold text-[11px] text-accent">Appearance</span>
      <h2 className="font-display font-semibold text-[22px] mt-1.5 mb-4">Website theme</h2>
      <p className="text-ink-soft mb-4.5">Your choice is saved on this device and applied across FitMeal.</p>
      <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-3.5">
        {themeOptions.map((option) => <button key={option.value} type="button" className={`flex items-center gap-3.5 rounded-xl py-4 px-5 border bg-surface-alt text-ink font-semibold hover:bg-hover hover:border-line-strong ${theme === option.value ? 'border-accent shadow-[0_0_0_2px_var(--bg-badge)]' : 'border-line-strong'}`} onClick={() => handleThemeChange(option.value)}>
          <span aria-hidden="true" className="relative w-8.5 h-5 shrink-0">
            <span aria-hidden="true" className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-line-strong" style={{ background: option.swatchBg }} />
            <span aria-hidden="true" className="absolute top-0 left-3.5 w-5 h-5 rounded-full border-2 border-line-strong" style={{ background: option.swatchAccent }} />
          </span>
          {option.label}
        </button>)}
      </div>
    </div>
  </>;
}
