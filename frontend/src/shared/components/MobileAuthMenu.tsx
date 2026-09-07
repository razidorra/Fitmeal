import { Show, SignInButton, SignUpButton, useClerk } from '@clerk/react';
import { Link } from '@tanstack/react-router';

const mobileActiveLinkClass = 'bg-accent! text-on-accent! font-semibold shadow-[0_4px_14px_rgba(0,0,0,.14)]';

export function MobileAuthMenu({ onNavigate }: { onNavigate: () => void }) {
  const { signOut } = useClerk();

  function handleSignOut() {
    onNavigate();
    void signOut({ redirectUrl: import.meta.env.BASE_URL });
  }

  return <>
    <Show when="signed-out">
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <SignInButton><button onClick={onNavigate} className="rounded-lg border border-line-strong bg-transparent px-4 py-3 text-sm text-ink hover:bg-hover">Log in</button></SignInButton>
        <SignUpButton><button onClick={onNavigate} className="rounded-lg px-4 py-3 text-sm">Create account</button></SignUpButton>
      </div>
    </Show>
    <Show when="signed-in">
      <Link to="/account" className="rounded-lg px-4 py-3 text-ink-soft no-underline" activeProps={{ className: mobileActiveLinkClass }} onClick={onNavigate}>Account</Link>
      <button type="button" onClick={handleSignOut} className="mt-2 w-full justify-start rounded-lg border border-line-strong bg-transparent px-4 py-3 text-ink-soft hover:bg-hover hover:text-ink">Log out</button>
    </Show>
  </>;
}
