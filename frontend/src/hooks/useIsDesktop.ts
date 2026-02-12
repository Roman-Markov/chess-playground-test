import { useState, useEffect } from 'react';

/**
 * True when primary input is fine pointer (mouse), not touch.
 * Use to enable desktop-only features like right-click annotations.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
