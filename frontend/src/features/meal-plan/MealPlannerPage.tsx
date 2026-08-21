import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import type { MealPlan, Profile } from '../../shared/types';
import { MealPlanCard } from './MealPlanCard';
import { ProfileForm } from './ProfileForm';
import { AssistantChat } from './AssistantChat';

export function MealPlannerPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPlanner() {
      try {
        const savedProfile = await api.getProfile();
        setProfile(savedProfile);

        if (savedProfile) {
          setPlan(await api.getPlan(savedProfile._id));
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load the meal planner.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadPlanner();
  }, []);

  async function handleSaveProfile(newProfile: Omit<Profile, '_id'>) {
    setIsSavingProfile(true);
    setErrorMessage('');

    try {
      const savedProfile = await api.saveProfile(newProfile);
      setProfile(savedProfile);
      setPlan(await api.generatePlan(savedProfile._id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleGeneratePlan() {
    if (!profile) return;

    setIsGenerating(true);
    setErrorMessage('');

    try {
      setPlan(await api.generatePlan(profile._id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate a meal plan.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) return <section className="empty"><p>Loading your meal planner…</p></section>;

  if (!profile) return <>
    <section className="page-intro">
      <span className="eyebrow">Set up your profile</span>
      <h1>Let's build your plan.</h1>
      <p>Add your details once — FitMeal uses them to calculate your daily targets and generate a meal plan.</p>
    </section>
    <ProfileForm onSave={handleSaveProfile} isSaving={isSavingProfile} />
    {errorMessage && <p role="alert">{errorMessage}</p>}
  </>;

  return <>
    <section className="page-intro">
      <span className="eyebrow">Daily meal planner</span>
      <h1>Your food, mapped out.</h1>
      <p>A flexible starting point for your {profile.goal} goal.</p>
      <button className="primary" onClick={handleGeneratePlan} disabled={isGenerating}>
        {isGenerating ? 'Creating…' : plan ? 'Refresh plan' : 'Generate my plan'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </section>
    {plan && <div className="split">
      <div><MealPlanCard plan={plan} onPlanChange={setPlan} /></div>
      <AssistantChat />
    </div>}
  </>;
}
