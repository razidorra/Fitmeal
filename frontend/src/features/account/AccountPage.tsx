import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import { getLocalDateString } from '../../shared/date';
import { clearStoredTheme, getStoredTheme, setTheme, type Theme } from '../../shared/theme';
import type { Checkin, MealPlan, Profile } from '../../shared/types';
import { PageLoading } from '../../shared/components/PageLoading';
import { announceProfileName } from '../../shared/profileEvents';

export function AccountPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable accounts.</p></section>;
  return <AccountContent />;
}

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: 'dark', label: 'Midnight Gold' },
  { value: 'light', label: 'Warm Light' },
  { value: 'rose', label: 'Rose Pink' },
  { value: 'ocean', label: 'Ocean Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'slate', label: 'Slate Gray' },
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
  const [accountError, setAccountError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isConfirmingDeletion, setIsConfirmingDeletion] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [deletionError, setDeletionError] = useState('');
  const [deletionNotice, setDeletionNotice] = useState('');

  useEffect(() => {
    setThemeState(getStoredTheme(user?.id));
  }, [user?.id]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) { setIsLoading(false); return; }
    setAccountError('');

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
      } catch (error) {
        setAccountError(error instanceof Error ? error.message : 'Could not load your account.');
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [authLoaded, isSignedIn, getToken, loadAttempt]);

  function handleRetryLoad() {
    setIsLoading(true);
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  }

  function handleThemeChange(next: Theme) {
    if (!user) return;
    setTheme(user.id, next);
    setThemeState(next);
  }

  async function handleDeleteData() {
    if (!profile || !user || isDeletingData) return;
    setIsDeletingData(true);
    setDeletionError('');

    try {
      await api.deleteProfile(await getToken(), profile._id);
      clearStoredTheme(user.id);
      setThemeState('dark');
      announceProfileName('');
      setProfile(null);
      setPlan(null);
      setCheckins(null);
      setIsConfirmingDeletion(false);
      setDeletionNotice('Your FitMeal profile, meal plans, and check-ins were deleted. Your Clerk sign-in account remains active.');
    } catch (error) {
      setDeletionError(error instanceof Error ? error.message : 'Could not delete your FitMeal data.');
    } finally {
      setIsDeletingData(false);
    }
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

  if (accountError) return <section className="mx-auto max-w-160 rounded-3xl border border-line bg-surface py-16 px-8 text-center shadow-[0_20px_60px_rgba(0,0,0,.12)]">
    <span className="inline-flex rounded-full border border-poor bg-surface-alt px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-poor-text">Account unavailable</span>
    <h1 className="text-[clamp(40px,5vw,60px)]">We couldn’t load your account.</h1>
    <p role="alert" className="mx-auto mb-7 max-w-125 text-ink-soft">{accountError}</p>
    <button type="button" onClick={handleRetryLoad} className="rounded-full">Try again</button>
  </section>;

  const isPlanToday = plan?.date === getLocalDateString();
  const accountDisplayName = profile?.name || user?.fullName || user?.username || 'FitMeal member';
  const panelLinkClass = 'text-accent font-bold text-[13px] no-underline hover:underline';
  const summaryStrongClass = 'block font-display font-semibold text-[28px] text-accent';
  const summarySpanClass = 'text-ink-soft text-[13px]';

  return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Your account</span>
      <h1>Everything in one place.</h1>
    </section>
    <div className="flex items-center gap-5 rounded-2xl py-6.5 px-7 border border-line bg-surface-alt mb-5.5 shadow-[0_18px_50px_rgba(0,0,0,.1)] max-[720px]:flex-col max-[720px]:items-start max-[720px]:text-left">
      {user?.imageUrl
        ? <img className="w-14 h-14 rounded-full object-cover bg-hover" src={user.imageUrl} alt="" />
        : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent font-display text-xl font-bold text-on-accent">{accountDisplayName.charAt(0).toUpperCase()}</span>}
      <div>
        <span className="uppercase tracking-wider font-sans font-semibold text-[11px] text-accent">Your FitMeal account</span>
        <h2 className="font-display font-semibold text-2xl mt-1.5 mb-1">{accountDisplayName}</h2>
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
      <p className="text-ink-soft mb-4.5">Your choice is saved for this account on this device and applied across FitMeal.</p>
      <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-3.5">
        {themeOptions.map((option) => <button key={option.value} type="button" className={`flex items-center gap-3.5 rounded-xl py-4 px-5 border bg-surface-alt text-ink font-semibold hover:bg-hover hover:border-line-strong ${theme === option.value ? 'border-accent shadow-[0_0_0_2px_var(--bg-badge)]' : 'border-line-strong'}`} onClick={() => handleThemeChange(option.value)}>
          <span aria-hidden="true" data-theme-preview={option.value} className="relative w-8.5 h-5 shrink-0">
            <span aria-hidden="true" className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-line-strong bg-page" />
            <span aria-hidden="true" className="absolute top-0 left-3.5 w-5 h-5 rounded-full border-2 border-line-strong bg-accent" />
          </span>
          {option.label}
        </button>)}
      </div>
    </div>

    <section className="mt-5 rounded-2xl border border-poor bg-surface py-6.5 px-7 shadow-[0_18px_50px_rgba(0,0,0,.1)]" aria-labelledby="privacy-heading">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-poor-text">Privacy and data</span>
      <h2 id="privacy-heading" className="mt-1.5 mb-3 font-display text-[22px] font-semibold">Delete stored FitMeal data</h2>
      <p className="mb-4.5 max-w-190 text-sm leading-[1.6] text-ink-soft">FitMeal stores your nutrition profile, generated meal plans, and weight check-ins in MongoDB under your Clerk user ID. Deleting removes those FitMeal records and this device’s theme preference, but does not delete your Clerk sign-in account.</p>
      {deletionNotice && <p role="status" className="rounded-xl border border-good bg-surface-alt p-4 text-good-text">{deletionNotice}</p>}
      {deletionError && <p role="alert" className="text-poor-text">{deletionError}</p>}
      {!isConfirmingDeletion
        ? <button type="button" disabled={!profile} onClick={() => setIsConfirmingDeletion(true)} className="rounded-full border border-poor bg-transparent px-5 py-2.75 text-poor-text hover:bg-surface-alt">{profile ? 'Delete my FitMeal data' : 'No FitMeal data to delete'}</button>
        : <div className="rounded-xl border border-poor bg-surface-alt p-4.5">
          <p className="mt-0 font-semibold text-poor-text">This cannot be undone. Permanently delete your profile, every generated plan, and all check-ins?</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={isDeletingData} onClick={handleDeleteData} className="rounded-full border border-poor bg-poor px-5 py-2.5 text-on-accent">{isDeletingData ? 'Deleting…' : 'Permanently delete data'}</button>
            <button type="button" disabled={isDeletingData} onClick={() => setIsConfirmingDeletion(false)} className="rounded-full border border-line-strong bg-transparent px-5 py-2.5 text-ink">Cancel</button>
          </div>
        </div>}
    </section>
  </>;
}
