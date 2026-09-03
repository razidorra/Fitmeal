import { useState, type FormEvent } from 'react';
import type { Goal, Profile } from '../../shared/types';

const activityLevels: Array<Profile['activity']> = ['low', 'light', 'moderate', 'high'];
const goals: Goal[] = ['lose', 'maintain', 'gain'];
const activityLabels: Record<Profile['activity'], string> = { low: 'Mostly sedentary', light: 'Lightly active', moderate: 'Moderately active', high: 'Very active' };
const goalLabels: Record<Goal, string> = { lose: 'Lose weight', maintain: 'Maintain weight', gain: 'Gain weight' };

// Doubles as both the first-time creation form and the "edit profile" form — pass `initialProfile`
// to pre-fill it for editing; omit it for a blank create form. The caller decides which API call
// `onSave` makes, this component only collects the fields.
export function ProfileForm({ onSave, isSaving, initialProfile, submitLabel = 'Save profile', savingLabel = 'Saving…' }: {
  onSave: (profile: Omit<Profile, '_id'>) => void;
  isSaving: boolean;
  initialProfile?: Profile;
  submitLabel?: string;
  savingLabel?: string;
}) {
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [age, setAge] = useState(initialProfile?.age ?? 30);
  const [sex, setSex] = useState<Profile['sex']>(initialProfile?.sex ?? 'female');
  const [heightCm, setHeightCm] = useState(initialProfile?.heightCm ?? 170);
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg ?? 70);
  const [activity, setActivity] = useState<Profile['activity']>(initialProfile?.activity ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(initialProfile?.goal ?? 'maintain');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ name: name.trim(), age, sex, heightCm, weightKg, activity, goal });
  }

  const labelClass = 'text-[12px] font-semibold text-ink-soft grid gap-2';

  return <form className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-4.5 rounded-2xl border border-line bg-surface p-7 max-[560px]:p-5 shadow-[0_18px_50px_rgba(0,0,0,.1)]" onSubmit={handleSubmit}>
    <div className="col-span-full mb-1 border-b border-line pb-5">
      <span className="text-[10px] font-bold uppercase tracking-[.12em] text-accent">Personalisation</span>
      <h2 className="mb-2 mt-1 text-[26px]">Profile and nutrition goal</h2>
      <p className="m-0 max-w-165 text-sm leading-[1.55] text-ink-soft">These details are used to estimate your daily calorie and macro targets. You can update them whenever your routine changes.</p>
    </div>
    <label className={labelClass}>Name<input value={name} onChange={(event) => setName(event.target.value)} minLength={1} maxLength={80} required /></label>
    <label className={labelClass}>Age<input type="number" min={16} max={100} value={age} onChange={(event) => setAge(Number(event.target.value))} required /></label>
    <label className={labelClass}>Calorie equation
      <select value={sex} onChange={(event) => setSex(event.target.value as Profile['sex'])} aria-describedby="calorie-equation-help">
        <option value="female">Female equation (−161)</option>
        <option value="male">Male equation (+5)</option>
        <option value="other">Other / prefer not to say (uses −161)</option>
      </select>
      <span id="calorie-equation-help" className="text-[11px] font-normal leading-[1.45] text-ink-muted">Mifflin–St Jeor defines only these two constants. Choose the estimate you prefer; this is not used as a gender-identity field.</span>
    </label>
    <label className={labelClass}>Height (cm)<input type="number" min={100} max={250} value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} required /></label>
    <label className={labelClass}>Weight (kg)<input type="number" min={30} max={350} value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} required /></label>
    <label className={labelClass}>Activity level
      <select value={activity} onChange={(event) => setActivity(event.target.value as Profile['activity'])}>
        {activityLevels.map((level) => <option key={level} value={level}>{activityLabels[level]}</option>)}
      </select>
    </label>
    <label className={labelClass}>Goal
      <select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
        {goals.map((option) => <option key={option} value={option}>{goalLabels[option]}</option>)}
      </select>
    </label>
    <button type="submit" className="self-end min-h-12 shadow-[0_8px_22px_rgba(0,0,0,.16)]" disabled={isSaving}>{isSaving ? savingLabel : submitLabel}</button>
  </form>;
}
