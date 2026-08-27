export const profileNameChangedEvent = 'fitmeal-profile-name-changed';

export function announceProfileName(name: string) {
  window.dispatchEvent(new CustomEvent(profileNameChangedEvent, { detail: name }));
}
