import { useState, type FormEvent } from 'react';
import type { Goal, Profile } from '../../shared/types';

const activityLevels: Array<Profile['activity']> = ['low', 'light', 'moderate', 'high'];
const goals: Goal[] = ['lose', 'maintain', 'gain'];

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
    onSave({ name, age, sex, heightCm, weightKg, activity, goal });
  }

  const labelClass = 'text-[13px] text-ink-soft grid gap-1.5';

  return <form className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-3.75" onSubmit={handleSubmit}>
    <label className={labelClass}>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
    <label className={labelClass}>Age<input type="number" min={16} max={100} value={age} onChange={(event) => setAge(Number(event.target.value))} required /></label>
    <label className={labelClass}>Sex
      <select value={sex} onChange={(event) => setSex(event.target.value as Profile['sex'])}>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>
    </label>
    <label className={labelClass}>Height (cm)<input type="number" min={100} max={250} value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} required /></label>
    <label className={labelClass}>Weight (kg)<input type="number" min={30} max={350} value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} required /></label>
    <label className={labelClass}>Activity level
      <select value={activity} onChange={(event) => setActivity(event.target.value as Profile['activity'])}>
        {activityLevels.map((level) => <option key={level} value={level}>{level}</option>)}
      </select>
    </label>
    <label className={labelClass}>Goal
      <select value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
        {goals.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
    <button type="submit" className="self-end" disabled={isSaving}>{isSaving ? savingLabel : submitLabel}</button>
  </form>;
}
