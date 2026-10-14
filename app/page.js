'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HeroSlider from '@/components/home/HeroSlider';
import HeroMarquee from '@/components/home/HeroMarquee';
import ShopByCategory from '@/components/home/ShopByCategory';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhySKJ from '@/components/home/WhySKJ';
import Testimonials from '@/components/home/Testimonials';

export default function HomePage() {
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

  return (
    <>
      <HeroSlider />
      <HeroMarquee />
      <ShopByCategory />
      <FeaturedProducts />
      <WhySKJ />
      <Testimonials />
    </>
  );
}
