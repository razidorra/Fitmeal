import { useEffect, useRef, useState } from 'react';
import { AssistantChat } from './AssistantChat';

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return <div className="fixed right-5 bottom-5 z-90 grid justify-items-end gap-3 max-[480px]:right-3 max-[480px]:bottom-3">
    {isOpen && <div ref={panelRef} id="floating-assistant-panel" role="dialog" aria-label="FitMeal AI assistant" className="relative w-[min(420px,calc(100vw-24px))] max-h-[calc(100vh-100px)] overflow-y-auto rounded-2xl shadow-[0_18px_50px_rgba(0,0,0,.35)]">
      <button
        type="button"
        aria-label="Close FitMeal AI"
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 z-1 grid place-items-center w-8 h-8 rounded-full p-0 border border-line-strong bg-surface text-ink text-lg hover:bg-hover hover:border-line-strong"
      >
        ×
      </button>
      <AssistantChat />
    </div>}
    <button
      ref={triggerRef}
      type="button"
      aria-controls="floating-assistant-panel"
      aria-expanded={isOpen}
      onClick={() => setIsOpen((current) => !current)}
      className="rounded-full px-5 py-3 bg-accent text-on-accent border border-accent font-semibold shadow-[0_10px_30px_rgba(0,0,0,.28)]"
    >
      {isOpen ? 'Close AI' : '♡ FitMeal AI'}
    </button>
  </div>;
}
