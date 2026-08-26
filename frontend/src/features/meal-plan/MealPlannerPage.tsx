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

export function MealPlannerPage() {
  if (!isClerkConfigured) return <section className="text-center py-22.5"><h1 className="text-[54px]">Sign-in is not configured.</h1><p>Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable the meal planner.</p></section>;
  return <MealPlannerContent />;
}

function MealPlannerContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
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
            api.generatePlan(token, savedProfile._id, getLocalDateString()),
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
  }, [isLoaded, isSignedIn, getToken]);

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
      setPlan(await api.generatePlan(token, savedProfile._id, getLocalDateString()));
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
      setProfile(await api.updateProfile(token, profile._id, updatedProfile));
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
      setPlan(await api.generatePlan(token, profile._id, getLocalDateString(), true));
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

  return <>
    <section className="mb-9.5">
      <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Today's meal plan — {formatDisplayDate(plan?.date ?? getLocalDateString())}</span>
      <h1>Your food, mapped out.</h1>
      <p className="text-lg leading-[1.45] text-ink-soft max-w-142.5">A flexible starting point for your {profile.goal} goal.</p>
      <div className="flex items-center gap-6 mt-6 mb-8.75 max-[720px]:flex-wrap">
        <button className="primary" onClick={handleGeneratePlan} disabled={isGenerating}>{isGenerating ? 'Creating…' : 'Refresh plan'}</button>
        <button type="button" className="bg-transparent border-0 p-0 mt-2 text-accent text-[13px] font-semibold underline cursor-pointer inline-block hover:bg-transparent hover:text-accent-hover" onClick={() => setIsEditingProfile(true)}>Edit profile</button>
      </div>
      {profileUpdatedNotice && <p>Profile updated. Refresh your plan above to recalculate today's targets.</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </section>
    {plan && <div className="mt-10">
      <MealPlanCard plan={plan} onPlanChange={setPlan} />
    </div>}
    <PlanHistory history={history} />
  </>;
}
