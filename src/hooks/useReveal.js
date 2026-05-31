import { useEffect, useRef } from 'react';

export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const el = ref.current;
    if (el) {
      // Observe the container and all reveal children inside it
      const revealElements = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      revealElements.forEach(child => observer.observe(child));
      // Also observe the container itself if it has a reveal class
      if (
        el.classList.contains('reveal') || 
        el.classList.contains('reveal-left') || 
        el.classList.contains('reveal-right') || 
        el.classList.contains('reveal-scale')
      ) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
