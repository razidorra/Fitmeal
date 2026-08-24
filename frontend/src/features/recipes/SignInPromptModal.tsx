import { useEffect } from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';

// Same backdrop/close/Escape behavior as RecipeModal, but for the "sign in to see this" case —
// recipe details aren't sensitive data (they ship in the public JS bundle either way), this is
// purely a sign-up nudge, matching the guest-prompt pattern used on Planner/Progress.
export function SignInPromptModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return <div className="fixed inset-0 bg-[rgba(6,6,5,.82)] flex items-center justify-center p-8 z-100 animate-[recipe-modal-fade_180ms_ease]" onClick={onClose}>
    <div className="relative bg-surface border border-line max-w-115 w-full py-11 px-10 text-center" role="dialog" aria-modal="true" aria-label="Sign in required" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 w-9.5 h-9.5 rounded-full bg-surface-alt border border-line-strong text-ink text-xl leading-none grid place-items-center p-0 hover:bg-hover">×</button>
      <h2 className="font-display font-semibold text-2xl mt-0 mb-3.5">Sign in to see the full recipe.</h2>
      <p className="text-ink-soft leading-[1.55] mb-6.5">Create a free account to view ingredients, preparation steps, and nutrition details.</p>
      <div className="flex items-center justify-center gap-6 m-0">
        <SignInButton><button className="primary">Log in</button></SignInButton>
        <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>
    </div>
  </div>;
}
