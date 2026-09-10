import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useModalDialog } from '../../shared/hooks/useModalDialog';

const demoSteps = [
  {
    label: 'Your profile',
    title: 'Tell FitMeal what you need.',
    text: 'Add your goal, body details and activity level once.',
  },
  {
    label: 'Daily menu',
    title: 'Wake up to a fresh plan.',
    text: 'Four practical suggestions rotate every day around your targets.',
  },
  {
    label: 'Your progress',
    title: 'Check in and see the trend.',
    text: 'Log what happened and use the bigger picture to adjust.',
  },
];

function DemoVisual({ activeStep }: { activeStep: number }) {
  if (activeStep === 0) return <div className="grid gap-3 animate-[fitmeal-demo-step_420ms_ease-out]">
    <div className="flex items-center justify-between"><span className="text-xs text-ink-muted">Your goal</span><strong className="rounded-full bg-accent px-3 py-1.5 text-xs text-on-accent">Maintain weight</strong></div>
    {[['Activity', 'Moderate', '68%'], ['Daily movement', 'Active', '82%']].map(([label, value, width]) => <div key={label} className="rounded-xl border border-line bg-surface p-3.5">
      <div className="mb-2 flex justify-between text-xs"><span>{label}</span><strong className="text-accent">{value}</strong></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-icon"><span className="block h-full rounded-full bg-accent transition-all duration-700" style={{ width }} /></div>
    </div>)}
    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
      {['Lose', 'Maintain', 'Gain'].map((goal, index) => <span key={goal} className={`rounded-lg border py-2 ${index === 1 ? 'border-accent bg-badge text-accent' : 'border-line text-ink-muted'}`}>{goal}</span>)}
    </div>
  </div>;

  if (activeStep === 1) return <div className="grid gap-2.5 animate-[fitmeal-demo-step_420ms_ease-out]">
    {[['Breakfast', 'Protein oatmeal', '352'], ['Lunch', 'Chicken quinoa bowl', '417'], ['Dinner', 'Lemon garlic salmon', '365']].map(([time, meal, calories], index) => <div key={time} className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface p-3" style={{ animationDelay: `${index * 90}ms` }}>
      <span className="grid h-9.5 w-9.5 place-items-center rounded-lg bg-icon text-accent" aria-hidden="true">{index === 0 ? '◒' : index === 1 ? '◐' : '◓'}</span>
      <div><small className="block text-[9px] uppercase tracking-wider text-accent">{time}</small><strong className="text-xs text-ink">{meal}</strong></div>
      <span className="text-[10px] text-ink-muted">{calories} kcal</span>
    </div>)}
    <p className="m-0 text-center text-[11px] text-accent">Tomorrow, a new menu appears automatically ✦</p>
  </div>;

  return <div className="animate-[fitmeal-demo-step_420ms_ease-out]">
    <div className="mb-5 flex items-center gap-4">
      <div className="grid h-21 w-21 shrink-0 place-items-center rounded-full border-8 border-accent border-r-line text-center"><strong className="text-lg">3/4</strong><small className="block text-[9px] text-ink-muted">meals</small></div>
      <div><small className="uppercase tracking-wider text-accent">This week</small><strong className="mt-1 block font-display text-2xl">Steady progress</strong><span className="text-xs text-ink-muted">Small actions add up.</span></div>
    </div>
    <div className="flex h-24 items-end gap-2 border-b border-line px-2">
      {[42, 55, 48, 72, 64, 83, 78].map((height, index) => <span key={index} className="flex-1 rounded-t bg-accent/75 transition-all duration-700" style={{ height: `${height}%` }} />)}
    </div>
    <div className="mt-2 flex justify-between text-[9px] uppercase text-ink-muted"><span>Mon</span><span>Today</span></div>
  </div>;
}

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const dialogRef = useModalDialog(onClose);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActiveStep((current) => (current + 1) % demoSteps.length), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const step = demoSteps[activeStep];

  return <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(6,6,5,.82)] p-8 backdrop-blur-sm animate-[recipe-modal-fade_180ms_ease] max-[560px]:p-3" onClick={onClose}>
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="how-it-works-title" className="relative grid w-full max-w-215 grid-cols-[.9fr_1.1fr] overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_90px_rgba(0,0,0,.5)] max-[760px]:max-h-[92vh] max-[760px]:grid-cols-1 max-[760px]:overflow-y-auto" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} aria-label="Close demo" className="absolute right-4 top-4 z-1 grid h-9.5 w-9.5 place-items-center rounded-full border border-line-strong bg-surface-alt p-0 text-xl leading-none text-ink hover:bg-hover">×</button>

      <div className="flex min-h-110 flex-col justify-between bg-surface-alt p-9 max-[760px]:min-h-0 max-[560px]:p-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[.14em] text-accent">FitMeal in 30 seconds</span>
          <h2 id="how-it-works-title" className="mt-3 max-w-90 text-[clamp(30px,4vw,44px)]">A plan that moves with you.</h2>
          <p className="max-w-90 leading-[1.6] text-ink-soft">From your goal to tomorrow's menu, see how FitMeal keeps healthy planning simple.</p>
        </div>
        <Link to="/planner" onClick={onClose} className="primary mt-6 self-start">Create my plan <span aria-hidden="true" className="ml-2">→</span></Link>
      </div>

      <div className="flex min-h-110 flex-col p-9 pt-16 max-[760px]:min-h-100 max-[560px]:p-6 max-[560px]:pt-14">
        <div className="mb-7 flex gap-2" aria-label="Demo steps">
          {demoSteps.map((item, index) => <button key={item.label} type="button" aria-label={`Show step ${index + 1}: ${item.label}`} aria-pressed={activeStep === index} onClick={() => setActiveStep(index)} className={`h-1.5 flex-1 rounded-full border-0 p-0 hover:translate-y-0 ${activeStep === index ? 'bg-accent' : 'bg-icon'}`} />)}
        </div>
        <div className="mb-6">
          <span className="font-mono text-xs text-accent">0{activeStep + 1} / 03 · {step.label}</span>
          <h3 className="mt-2 font-display text-[25px] font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-[1.55] text-ink-muted">{step.text}</p>
        </div>
        <div className="mt-auto rounded-2xl border border-line bg-page p-5 shadow-[0_15px_35px_rgba(0,0,0,.18)]">
          <DemoVisual activeStep={activeStep} />
        </div>
      </div>
    </div>
  </div>;
}
