import { useEffect, useState } from 'react';
import { useAuth, SignInButton, SignUpButton } from '@clerk/react';
import { api } from '../../shared/api';
import { isClerkConfigured } from '../../shared/clerk';
import { getLocalDateString, formatDisplayDate } from '../../shared/date';
import type { MealPlan, Profile } from '../../shared/types';
import { MealPlanCard } from './MealPlanCard';
import { ProfileForm } from './ProfileForm';
import { PlanHistory } from './PlanHistory';
import { PageLoading } from '../../shared/components/PageLoading';
import { Reveal } from '../../shared/components/Reveal';
import { announceProfileName } from '../../shared/profileEvents';

const goalLabels: Record<Profile['goal'], string> = {
  lose: 'Weight loss',
  maintain: 'Weight maintenance',
  gain: 'Weight gain',
};

export function MealPlannerPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable the meal planner.</p></section>;
  return <MealPlannerContent />;
}

function MealPlannerContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(getLocalDateString);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [history, setHistory] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileUpdatedNotice, setProfileUpdatedNotice] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  useEffect(() => {
    let midnightTimer: number;

    function syncCurrentDate() {
      setCurrentDate(getLocalDateString());
    }

    function scheduleNextDay() {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      midnightTimer = window.setTimeout(() => {
        syncCurrentDate();
        scheduleNextDay();
      }, nextMidnight.getTime() - now.getTime() + 100);
    }

    scheduleNextDay();
    window.addEventListener('focus', syncCurrentDate);
    document.addEventListener('visibilitychange', syncCurrentDate);

    return () => {
      window.clearTimeout(midnightTimer);
      window.removeEventListener('focus', syncCurrentDate);
      document.removeEventListener('visibilitychange', syncCurrentDate);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadPlanner() {
      try {
        const token = await getToken();
        const savedProfile = await api.getProfile(token);
        setProfile(savedProfile);

        if (savedProfile) {
          const [todayPlan, recentHistory] = await Promise.all([
            api.generatePlan(token, savedProfile._id, currentDate),
            api.getPlanHistory(token, savedProfile._id),
          ]);
          setPlan(todayPlan);
          setHistory(recentHistory);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load the meal planner.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadPlanner();
  }, [isLoaded, isSignedIn, getToken, currentDate]);

  async function refreshHistory(token: string | null, profileId: string) {
    try {
      setHistory(await api.getPlanHistory(token, profileId));
    } catch {
      // History is a nice-to-have; a failed refresh here shouldn't block the rest of the page.
    }
  }

  async function handleSaveProfile(newProfile: Omit<Profile, '_id'>) {
    setIsSavingProfile(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const savedProfile = await api.saveProfile(token, newProfile);
      setProfile(savedProfile);
      announceProfileName(savedProfile.name);
      setPlan(await api.generatePlan(token, savedProfile._id, currentDate));
      void refreshHistory(token, savedProfile._id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleUpdateProfile(updatedProfile: Omit<Profile, '_id'>) {
    if (!profile) return;

    setIsSavingProfile(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const savedProfile = await api.updateProfile(token, profile._id, updatedProfile);
      setProfile(savedProfile);
      announceProfileName(savedProfile.name);
      setIsEditingProfile(false);
      setProfileUpdatedNotice(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleGeneratePlan() {
    if (!profile) return;

    setIsGenerating(true);
    setErrorMessage('');
    setProfileUpdatedNotice(false);

    try {
      const token = await getToken();
      setPlan(await api.generatePlan(token, profile._id, currentDate, true));
      void refreshHistory(token, profile._id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate a meal plan.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (!isLoaded || isLoading) return <PageLoading label="Preparing your meal planner" />;

  if (!isSignedIn) return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Set up your profile</span>
      <h1>Let's build your plan.</h1>
      <p className="text-lg leading-[1.65] text-ink-soft max-w-155">Try the form below to see what FitMeal needs — sign in to save it and receive your personalised meal plan.</p>
    </section>
    <ProfileForm onSave={() => setShowGuestPrompt(true)} isSaving={false} />
    {showGuestPrompt && <div className="mt-6 rounded-2xl p-5.5 border border-accent bg-surface-alt">
      <p role="alert" className="mb-4.5 text-accent font-semibold text-[15px]">Please sign in to see your personalised meal plan.</p>
      <div className="flex items-center gap-6 m-0">
        <SignInButton><button className="primary">Log in</button></SignInButton>
        <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>
    </div>}
  </>;

  if (!profile) return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Set up your profile</span>
      <h1>Let's build your plan.</h1>
      <p className="text-lg leading-[1.65] text-ink-soft max-w-155">Add your details once — FitMeal uses them to calculate your daily targets and generate a meal plan.</p>
    </section>
    <ProfileForm onSave={handleSaveProfile} isSaving={isSavingProfile} />
    {errorMessage && <p role="alert">{errorMessage}</p>}
  </>;

  if (isEditingProfile) return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Edit your profile</span>
      <h1>Update your details.</h1>
      <p className="text-lg leading-[1.45] text-ink-soft max-w-142.5">Changing your stats won't touch today's plan — hit "Refresh plan" afterwards if you want new targets.</p>
    </section>
    <ProfileForm onSave={handleUpdateProfile} isSaving={isSavingProfile} initialProfile={profile} submitLabel="Update profile" savingLabel="Updating…" />
    <button type="button" className="bg-transparent border-0 p-0 mt-4 text-accent text-[13px] font-semibold underline cursor-pointer inline-block hover:bg-transparent hover:text-accent-hover" onClick={() => setIsEditingProfile(false)}>Cancel</button>
    {errorMessage && <p role="alert">{errorMessage}</p>}
  </>;

  const completedMeals = plan?.meals.filter((meal) => meal.confirmed === true || meal.isCustom).length ?? 0;
  const totalMeals = plan?.meals.length ?? 0;

  return <>
    <section className="mb-9 grid grid-cols-[1fr_auto] items-end gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-6">
      <div>
        <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Today's plan · {formatDisplayDate(plan?.date ?? currentDate)}</span>
        <h1 className="max-w-190 text-balance">Your food, mapped out.</h1>
        <p className="mb-0 max-w-155 text-lg leading-[1.6] text-ink-soft">A practical daily structure built around your {goalLabels[profile.goal].toLowerCase()} goal, with fresh meal suggestions every day. Follow it closely or adapt meals as your day changes.</p>
      </div>
      <div className="flex gap-2.5 max-[480px]:grid max-[480px]:grid-cols-2">
        <button type="button" onClick={handleGeneratePlan} disabled={isGenerating} className="rounded-full px-5 py-2.75 shadow-[0_8px_22px_rgba(0,0,0,.14)]">{isGenerating ? 'Creating…' : 'Refresh plan'}</button>
        <button type="button" className="rounded-full border border-line-strong bg-surface px-5 py-2.75 text-sm text-ink hover:bg-hover hover:border-accent" onClick={() => setIsEditingProfile(true)}>Edit profile</button>
      </div>
    </section>
    <Reveal className="mb-7 grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-[0_12px_35px_rgba(0,0,0,.08)] max-[620px]:grid-cols-1">
      <div className="border-r border-line p-5.5 max-[620px]:border-r-0 max-[620px]:border-b"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.12em] text-ink-muted">Current goal</span><strong className="text-[15px] text-ink">{goalLabels[profile.goal]}</strong></div>
      <div className="border-r border-line p-5.5 max-[620px]:border-r-0 max-[620px]:border-b"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.12em] text-ink-muted">Daily schedule</span><strong className="text-[15px] text-ink">{totalMeals} planned meals</strong></div>
      <div className="p-5.5"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.12em] text-ink-muted">Today's progress</span><strong className="text-[15px] text-accent">{completedMeals} of {totalMeals} logged</strong></div>
    </Reveal>
    {profileUpdatedNotice && <p role="status" className="mb-6 rounded-xl border border-accent bg-badge py-3.5 px-4.5 text-sm text-accent-soft"><strong className="text-accent">Profile updated.</strong> Refresh your plan to recalculate today's targets.</p>}
    {errorMessage && <p role="alert" className="mb-6 rounded-xl border border-poor bg-surface-alt py-3.5 px-4.5 text-poor-text">{errorMessage}</p>}
    {plan && <Reveal delay={80}><MealPlanCard plan={plan} onPlanChange={setPlan} /></Reveal>}
    {history.length > 0 && <Reveal delay={140}><PlanHistory history={history} /></Reveal>}
  </>;
}
