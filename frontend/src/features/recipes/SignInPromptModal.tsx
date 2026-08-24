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

  return <div className="recipe-modal-backdrop" onClick={onClose}>
    <div className="signin-prompt-modal" role="dialog" aria-modal="true" aria-label="Sign in required" onClick={(event) => event.stopPropagation()}>
      <button type="button" className="recipe-modal-close" onClick={onClose} aria-label="Close">×</button>
      <h2>Sign in to see the full recipe.</h2>
      <p>Create a free account to view ingredients, preparation steps, and nutrition details.</p>
      <div className="hero-actions">
        <SignInButton><button className="primary">Log in</button></SignInButton>
        <SignUpButton><button className="primary">Sign up</button></SignUpButton>
      </div>
    </div>
  </div>;
}
