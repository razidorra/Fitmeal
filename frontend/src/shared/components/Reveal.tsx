import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = { children: ReactNode; className?: string; delay?: number };

/** Reveals page sections once when they enter the viewport. */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transform-gpu transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${className}`}>{children}</div>;
}
