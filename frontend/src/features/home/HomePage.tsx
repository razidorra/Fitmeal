import { useState } from 'react'; import { Link } from '@tanstack/react-router'; import { Reveal } from '../../shared/components/Reveal'; import { resolveImage } from '../../shared/assets';

// The phone mockup is deliberately theme-independent (always dark, like a real phone screenshot)
// except for its `small` text and progress-bar fill, which intentionally follow the site accent —
// that split already existed before the Tailwind conversion and is preserved here as-is.
function PhonePreview() {
  return <div className="absolute z-1 left-6.25 -bottom-8.75 w-69 min-h-122.5 border-10 border-[#030303] rounded-[37px] pt-4.25 px-4.25 pb-0 bg-[#111] text-[#f7f5ef] shadow-[0_18px_0_#020202,0_25px_32px_rgba(0,0,0,.4)] max-[720px]:left-0 max-[720px]:scale-[.78] max-[720px]:origin-bottom-left">
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-22.5 h-5.75 rounded-[20px] bg-[#030303]" />
    <div className="pt-0 px-px pb-5.5 flex justify-between text-[10px]"><span>9:41</span><span>▮▮▮ ◒</span></div>
    <h3 className="font-sans font-semibold text-base m-0">Hello, Alex <span>👋</span></h3>
    <p className="text-[#a5a096] text-xs mt-0.75 mb-3">Today’s Progress</p>
    <div className="flex gap-4.25 items-center">
      <div className="w-21 h-21 border-10 border-[#e5d084] border-t-[#eee] rounded-full flex flex-col items-center justify-center">
        <strong className="font-sans font-semibold text-base">1720</strong>
        <small className="text-[9px] text-ink-muted">/2300 kcal</small>
      </div>
      <div className="flex-1 grid gap-2.5">
        {[['Protein', '115/160g', 72], ['Carbs', '180/250g', 72], ['Fat', '55/70g', 78]].map(([label, value, pct]) => <div key={label as string}>
          <span className="flex justify-between text-[#c9b674] text-[10px]">{label} <b className="font-normal text-ink-muted">{value}</b></span>
          <i className="h-1.5 block bg-[#4a4944] mt-1.25 not-italic"><em className="h-full bg-accent block not-italic" style={{ width: `${pct}%` }} /></i>
        </div>)}
      </div>
    </div>
    <div className="flex justify-between mt-6.25 mb-2.5 text-[13px]"><b>Today’s Meals</b><span className="text-[#e8d784] text-[11px]">See all</span></div>
    {[['Breakfast', 'Protein bowl', '420 kcal · 28g'], ['Lunch', 'Chicken avocado', '650 kcal · 48g'], ['Dinner', 'Salmon rice', '540 kcal · 38g']].map(([time, name, macros]) => <div className="grid grid-cols-[38px_1fr_auto] gap-2.25 items-center my-2.5" key={time}>
      <span className="w-9 h-9 bg-[#2d2d2a] grid place-items-center text-[#eee]">◉</span>
      <div className="grid"><small className="text-[9px]">{time}</small><b className="text-xs">{name}</b></div>
      <small className="text-[9px]">{macros}</small>
    </div>)}
    <div className="border-t border-[#32322f] mt-3.25 -mx-4.25 pt-2.5 px-3 pb-2.5 flex items-center justify-between text-[#aaa]">
      <span className="text-[17px] grid text-center">⌂<small className="text-[7px]">Home</small></span>
      <span className="text-[17px] grid text-center">□<small className="text-[7px]">Recipes</small></span>
      <strong className="w-12.25 h-12.25 -mt-4.25 rounded-full bg-accent text-[#0b0b0b] grid place-items-center text-[22px]">＋</strong>
      <span className="text-[17px] grid text-center">▥<small className="text-[7px]">Planner</small></span>
      <span className="text-[17px] grid text-center">♙<small className="text-[7px]">Profile</small></span>
    </div>
  </div>;
}

function FaqItem({ question, answer, isOpen, onOpen }: { question: string; answer: string; isOpen: boolean; onOpen: () => void }) {
  return <article className="overflow-hidden rounded-2xl border border-line bg-surface">
    <button type="button" aria-expanded={isOpen} onClick={onOpen} className="w-full rounded-none p-5.5 border-0 bg-transparent text-ink text-left cursor-pointer font-sans font-semibold text-[17px] flex items-center gap-3.25 hover:bg-surface-alt hover:translate-y-0">
      <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-badge text-xs text-accent transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>›</span>
      {question}
    </button>
    {isOpen && <p className="pr-5.5 pb-5.5 pl-11.75 m-0 text-ink-muted leading-[1.55]">{answer}</p>}
  </article>;
}

export function HomePage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const goals = [['↓', 'Lose weight', 'A modest calorie deficit helps you make steady progress while prioritising protein, fibre and satisfying meals.'], ['=', 'Maintain weight', 'Keep your energy stable with balanced meals that support your routine, training and everyday life.'], ['↑', 'Gain weight', 'Use a gentle calorie surplus and protein-rich meals to support healthy muscle and weight gain.']];
  const steps = [['01', 'Tell us your goal', 'Add your height, weight, activity level and whether you want to lose, maintain or gain weight.'], ['02', 'Get your meal targets', 'FitMeal calculates a daily calorie and macro starting point, then creates a balanced meal outline.'], ['03', 'Check in and adjust', 'Log your weight over time, notice the trend, and refresh your plan when your needs change.']];
  const faqs = [['How does FitMeal create my calorie target?', 'FitMeal uses your age, sex, height, weight, activity level and chosen goal to estimate daily energy needs. It then applies a modest adjustment for losing or gaining weight.'], ['Can FitMeal help me lose weight or gain weight?', 'Yes. Choose lose, maintain or gain when you set up your profile. FitMeal adjusts your daily calorie target and protein goal to suit that direction.'], ['What happens after I save my profile?', 'You can generate a daily meal plan with calorie and protein estimates, ask FitMeal AI general meal-planning questions, and log weight check-ins on the Progress page.'], ['Are calorie targets exact?', 'They are a practical starting estimate, not an exact prescription. Your needs can vary, so use your energy, hunger and progress over several weeks to guide adjustments.'], ['How often should I log my weight?', 'Many people find one or two check-ins per week useful. Focus on the longer trend instead of reacting to normal daily changes from hydration, food and routine.'], ['Can I update my goal or body details later?', 'Yes. Open the Meal Planner, choose Edit profile, update your details, and save. Refresh the current plan afterwards so its targets use your newest information.'], ['Can one meal be called healthy or unhealthy?', 'Usually, no. A balanced eating pattern matters more than one individual meal. FitMeal supports flexible, nourishing habits without labelling foods as good or bad.'], ['Is FitMeal AI a doctor or dietitian?', 'No. The assistant provides general planning and nutrition guidance only. It does not diagnose, prescribe or replace advice from a doctor or registered dietitian.'], ['Where does the nutrition data come from?', 'Your starting targets are calculated from established energy-estimation formulas. Meal information is designed for planning and education; check product labels for exact packaged-food values.']];
  return <>
    <section className="grid min-h-155 grid-cols-[.92fr_1.08fr] items-center gap-16 max-[900px]:min-h-0 max-[900px]:grid-cols-1 max-[900px]:gap-12">
      <Reveal>
        <span className="inline-flex rounded-full border border-line px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent bg-badge">Personal nutrition, made practical</span>
        <h1 className="max-w-155 text-balance">Eat with clarity.<br /><em>Live with balance.</em></h1>
        <p className="max-w-142.5 text-lg leading-[1.65] text-ink-soft">FitMeal turns your goals into a simple daily meal plan, flexible recipe ideas, and progress insights you can use in real life.</p>
        <div className="mt-7 mb-9 flex items-center gap-5 max-[480px]:items-stretch max-[480px]:flex-col">
          <Link className="primary shadow-[0_10px_30px_rgba(0,0,0,.2)]" to="/planner">Create my meal plan <span aria-hidden="true" className="ml-2">→</span></Link>
          <a className="flex items-center gap-2.5 text-ink no-underline font-semibold" href="#how-it-works">
            <span className="grid place-items-center border border-line-strong rounded-full w-10 h-10 text-[10px]">▶</span>
            See how it works
          </a>
        </div>
        <div className="grid max-w-142.5 grid-cols-3 gap-4 border-t border-line pt-5">
          {[['4', 'daily meals'], ['6', 'visual themes'], ['100%', 'flexible']].map(([value, label]) => <div key={label}>
            <strong className="block text-base text-ink">{value}</strong>
            <span className="text-[12px] text-ink-muted">{label}</span>
          </div>)}
        </div>
      </Reveal>
      <Reveal delay={170} className="relative h-118.75 max-[720px]:h-100 max-[720px]:w-full max-[720px]:max-w-175 max-[720px]:ml-auto">
        <div
          aria-label="Balanced meal beside a FitMeal shaker and meal-plan notebook"
          style={{ backgroundImage: `linear-gradient(120deg, rgba(0,0,0,.05), rgba(0,0,0,.2)), url('${resolveImage('/images/hero.jpg')}')` }}
          className="ml-17.5 h-117.5 rounded-3xl border border-line bg-cover bg-right shadow-[0_30px_80px_rgba(0,0,0,.28)] max-[720px]:ml-7.5 max-[720px]:h-100"
        />
        <PhonePreview />
      </Reveal>
    </section>

    <section id="features" className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1 gap-4.25 mt-28 max-[720px]:mt-20">
      {[['01', 'Personal targets', 'Start with calorie and macro estimates shaped around your profile.'], ['02', 'Curated recipes', 'Explore practical meal ideas for losing, maintaining, or gaining weight.'], ['03', 'Flexible planning', 'Follow the suggestion, swap a meal, or refresh the day when plans change.'], ['04', 'Progress insights', 'Turn regular weight check-ins into a clear, useful trend.']].map(([icon, title, text], index) => <Reveal key={title} delay={index * 100}>
        <article className="group min-h-48 h-full rounded-2xl border border-line bg-surface p-6.5 shadow-[0_12px_35px_rgba(0,0,0,.08)] transition hover:-translate-y-1 hover:border-line-strong">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-icon font-mono text-[13px] text-accent">{icon}</span>
          <h3 className="font-display font-semibold text-[17px] mt-4.5">{title}</h3>
          <p className="text-ink-muted text-[13px] leading-[1.55]">{text}</p>
        </article>
      </Reveal>)}
    </section>

    <Reveal className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-20 max-[900px]:gap-7 items-end mt-36.25 max-[720px]:mt-20">
      <div>
        <span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Built around you</span>
        <h2 className="text-[clamp(35px,4vw,56px)] leading-[1.05]">Not another one-size-fits-all diet.</h2>
      </div>
      <p className="m-0 text-ink-soft text-[17px] leading-[1.6]">FitMeal estimates your daily energy needs from your weight, height, age, activity level and goal. It then turns those numbers into a simple daily plan you can actually follow.</p>
    </Reveal>

    <section className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-4.5 mt-9.5">
      {goals.map(([symbol, title, text], index) => <Reveal key={title} delay={index * 110}>
        <article className="h-full rounded-2xl p-7.5 border border-line bg-surface shadow-[0_12px_35px_rgba(0,0,0,.08)]">
          <span className="grid place-items-center w-12 h-12 rounded-xl border border-line-strong bg-surface-alt text-accent font-display text-[30px]">{symbol}</span>
          <h3 className="font-display font-semibold text-2xl mt-6.5 mb-2.5">{title}</h3>
          <p className="text-ink-muted leading-[1.55] m-0">{text}</p>
        </article>
      </Reveal>)}
    </section>

    <section id="how-it-works" className="mt-33.75 max-[720px]:mt-20 py-13.75 border-t border-b border-line">
      <Reveal><span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">A simple routine</span><h2 className="text-[clamp(35px,4vw,56px)] leading-[1.05]">Know what to do next.</h2></Reveal>
      <div className="mt-10.5">
        {steps.map(([number, title, text], index) => <Reveal key={number} delay={index * 140}>
          <article className="grid grid-cols-[95px_1fr] gap-7 py-6 border-t border-line max-[560px]:grid-cols-[56px_1fr] max-[560px]:gap-4">
            <span className="text-accent font-mono text-[22px]">{number}</span>
            <div><h3 className="font-display font-semibold text-2xl mt-0 mb-2">{title}</h3><p className="text-ink-muted leading-[1.55] m-0">{text}</p></div>
          </article>
        </Reveal>)}
      </div>
    </section>

    <Reveal className="grid grid-cols-[1.1fr_.9fr] max-[900px]:grid-cols-1 gap-17.5 max-[900px]:gap-7 mt-30 max-[720px]:mt-20 p-14.5 max-[720px]:p-7 rounded-3xl border border-line bg-surface shadow-[0_20px_60px_rgba(0,0,0,.12)]" >
      <div>
        <span id="nutrition-guide" className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Nutrition, made clear</span>
        <h2 className="text-[clamp(35px,4vw,56px)] leading-[1.05] mb-0">Calories give you energy.<br /><em>Macros help you use it well.</em></h2>
      </div>
      <div>
        {[['Protein', 'supports muscles and helps meals feel satisfying.'], ['Carbohydrates', 'fuel your brain, training and daily movement.'], ['Fats', 'support hormones, nutrient absorption and flavour.']].map(([label, text]) => <p key={label} className="py-3.25 m-0 border-b border-line text-ink-soft leading-[1.5]"><strong className="text-ink inline-block w-32.5 max-[720px]:w-auto max-[720px]:mr-1.25">{label}</strong> {text}</p>)}
        <small className="block mt-5 text-ink-muted leading-[1.5]">Targets are helpful starting points, not medical advice. If you have a health condition or special dietary needs, speak with a qualified professional.</small>
      </div>
    </Reveal>

    <Reveal className="grid grid-cols-[.8fr_1.2fr] max-[900px]:grid-cols-1 gap-11 mt-27.5 max-[720px]:mt-20 p-10 max-[720px]:p-6.25 rounded-3xl border border-line bg-surface-alt">
      <div>
        <h2 className="text-[29px] leading-[1.2] mt-2.5 mb-3.5">A healthy diet is more than counting calories.</h2>
        <p className="text-ink-soft text-[17px] leading-[1.55] m-0">The World Health Organization describes four foundations of healthy eating: adequacy, balance, moderation and diversity. Individual needs still vary with age, lifestyle, culture and health.</p>
        <div className="flex gap-4.5 mt-6 max-[720px]:flex-col max-[720px]:gap-2.5">
          <a href="https://www.who.int/news-room/fact-sheets/detail/healthy-diet" target="_blank" rel="noreferrer" className="text-accent font-semibold no-underline hover:underline">WHO guidance ↗</a>
          <a href="https://www.dge.de/gesunde-ernaehrung/gut-essen-und-trinken/die-dge-empfehlungen/" target="_blank" rel="noreferrer" className="text-accent font-semibold no-underline hover:underline">DGE recommendations ↗</a>
        </div>
      </div>
      <div className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-3.5">
        {[['🥕', 'Eat varied and colourful', 'Build meals around vegetables, fruit, pulses, whole grains, nuts and other nutrient-rich foods.'], ['💧', 'Choose water first', 'Water and unsweetened drinks are practical everyday choices.'], ['🌾', 'Prefer fibre-rich foods', 'Whole grains, vegetables, fruit and pulses support fibre intake and fullness.'], ['⚖️', 'Think in patterns', 'One food does not define health. Overall balance, portions and regular habits matter.']].map(([icon, title, text]) => <article key={title} className="rounded-2xl border border-line py-5.5 px-4.5 bg-surface">
          <span className="text-[29px]">{icon}</span>
          <h3 className="font-display font-semibold text-[17px] mt-3 mb-1.25">{title}</h3>
          <p className="text-ink-muted leading-[1.45] m-0 text-sm">{text}</p>
        </article>)}
      </div>
    </Reveal>

    <Reveal className="mt-27 max-[720px]:mt-20 p-11 max-[720px]:p-6.25 rounded-3xl border border-accent bg-badge">
      <span className="inline-flex rounded-full bg-accent px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-on-accent">Designed for real life</span>
      <h2 className="text-[34px] mt-4 mb-3">Your plan stays useful when the day changes.</h2>
      <p className="max-w-177.5 text-ink-soft text-[17px] leading-[1.55] m-0">FitMeal keeps the process simple: start with a clear plan, record what actually happened, and use the trend—not one imperfect meal—to decide what comes next.</p>
      <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-4.5 mt-7.5">
        {[['1', 'Plan the day', 'Use a goal-aware daily menu as a practical starting point.'], ['2', 'Stay flexible', 'Confirm the suggestion or record a different meal without losing context.'], ['3', 'Review the trend', 'Use check-ins and recent meal activity to make measured adjustments.']].map(([number, title, text]) => <article key={number} className="rounded-2xl p-5.5 border border-line bg-surface">
          <span className="grid place-items-center w-9.25 h-9.25 rounded-full bg-accent text-on-accent font-bold">{number}</span>
          <h3 className="font-display font-semibold text-[17px] mt-4 mb-1.25">{title}</h3>
          <p className="m-0 text-ink-soft leading-[1.4]">{text}</p>
        </article>)}
      </div>
    </Reveal>

    <section className="max-w-216.25 mx-auto mt-33.75 max-[720px]:mt-20">
      <Reveal><div className="text-center"><span className="inline-flex rounded-full border border-line bg-badge px-3.5 py-2 font-sans text-[12px] font-semibold uppercase tracking-[.1em] text-accent">Frequently asked</span><h2 className="text-[clamp(35px,4vw,54px)]">Questions, answered clearly.</h2></div></Reveal>
      <Reveal delay={100} className="grid gap-3.5 mt-8.75">
        {faqs.slice(0, showAllQuestions ? faqs.length : 5).map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} isOpen={openQuestion === question} onOpen={() => setOpenQuestion(current => current === question ? null : question)} />)}
        <button type="button" className="justify-self-center mt-2.5 rounded-xl border border-accent bg-transparent text-accent px-4.5 py-3 text-sm hover:bg-badge hover:border-accent" onClick={() => { setShowAllQuestions(current => !current); setOpenQuestion(null); }}>{showAllQuestions ? 'Show fewer questions' : `See all questions (${faqs.length})`}</button>
      </Reveal>
    </section>

    <Reveal className="mt-27 max-[720px]:mt-17.5 mx-auto max-w-180 text-center py-16 max-[720px]:py-11 px-8 max-[720px]:px-5 border border-line bg-surface-alt rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,.12)]">
      <h2 className="text-4xl mb-3.5">Ready for a plan that fits your life?</h2>
      <p className="text-lg text-ink-soft mb-6.75">Create your profile once and get a practical meal plan for today.</p>
      <Link className="primary" to="/planner">Build my plan <span aria-hidden="true" className="ml-2">→</span></Link>
    </Reveal>
  </>;
}
