'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      disable: () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });

    const timer = setTimeout(() => {
      AOS.refresh();
    }, 300);

    return () => {
      clearTimeout(timer);
      AOS.refresh();
    };
  }, []);

  return null;
}
