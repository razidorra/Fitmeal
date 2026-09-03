import { useEffect } from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';
import { useModalDialog } from '../../shared/hooks/useModalDialog';

// Same backdrop/close/Escape behavior as RecipeModal, but for the "sign in to see this" case —
// recipe details aren't sensitive data (they ship in the public JS bundle either way), this is
// purely a sign-up nudge, matching the guest-prompt pattern used on Planner/Progress.
export function SignInPromptModal({ onClose, isAuthConfigured = true }: { onClose: () => void; isAuthConfigured?: boolean }) {
  const dialogRef = useModalDialog(onClose);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <div className="fixed inset-0 bg-[rgba(6,6,5,.82)] backdrop-blur-sm flex items-center justify-center p-8 max-[560px]:p-4 z-100 animate-[recipe-modal-fade_180ms_ease]" onClick={onClose}>
    <div ref={dialogRef} tabIndex={-1} className="relative bg-surface border border-line rounded-3xl max-w-115 w-full py-11 px-10 max-[560px]:px-6 text-center shadow-[0_30px_90px_rgba(0,0,0,.5)]" role="dialog" aria-modal="true" aria-labelledby="sign-in-dialog-title" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 w-9.5 h-9.5 rounded-full bg-surface-alt border border-line-strong text-ink text-xl leading-none grid place-items-center p-0 hover:bg-hover">×</button>
      <h2 id="sign-in-dialog-title" className="font-display font-semibold text-2xl mt-0 mb-3.5">{isAuthConfigured ? 'Sign in to see the full recipe.' : 'Recipe details require an account.'}</h2>
      <p className="text-ink-soft leading-[1.55] mb-6.5">{isAuthConfigured ? 'Create a free account to view ingredients, preparation steps, and nutrition details.' : 'Sign-in is not available on this deployment yet. The site owner needs to configure Clerk and redeploy the frontend.'}</p>
      {isAuthConfigured && <div className="flex items-center justify-center gap-3 m-0 max-[420px]:flex-col max-[420px]:items-stretch">
          <SignInButton><button className="primary">Log in</button></SignInButton>
          <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>}
    </div>
  </div>;
}
