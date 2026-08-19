import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import type { MealPlan, Profile } from '../../shared/types';
import { MealPlanCard } from './MealPlanCard';

export function MealPlannerPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
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
  if (errorMessage && !profile) return <section className="empty"><h1>Meal planner unavailable</h1><p>{errorMessage}</p></section>;
  if (!profile) return <section className="empty"><h1>No saved profile found.</h1><p>A personalised meal plan needs a profile saved in the database.</p></section>;

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
    {plan && <MealPlanCard plan={plan} />}
  </>;
}
