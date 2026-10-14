import HeroSlider from '@/components/home/HeroSlider';
import HeroMarquee from '@/components/home/HeroMarquee';
import ShopByCategory from '@/components/home/ShopByCategory';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhySKJ from '@/components/home/WhySKJ';
import Testimonials from '@/components/home/Testimonials';
import AosInit from '@/components/home/AosInit';

export const metadata = {
  title: 'Sri Kankatala Jewellers | Gold & Silver Jewellery in Ravulapalem',
  description:
    'Explore gold, silver and bridal jewellery at Sri Kankatala Jewellers in Ravulapalem, Andhra Pradesh. Browse our curated collections of necklaces, bangles, harams, and rings.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sri Kankatala Jewellers | Gold & Silver Jewellery in Ravulapalem',
    description:
      'Explore gold, silver and bridal jewellery at Sri Kankatala Jewellers in Ravulapalem, Andhra Pradesh. Browse our curated collections of necklaces, bangles, harams, and rings.',
    url: 'https://www.srikankatalajewellers.in',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <AosInit />
      <HeroSlider />
      <HeroMarquee />

      {/* Screen-reader and search crawler semantic structure (visually hidden from UI) */}
      <section className="sr-only" aria-label="About Sri Kankatala Jewellers Ravulapalem">
        <h1>Sri Kankatala Jewellers | Gold & Silver Jewellery in Ravulapalem</h1>
        <p>
          Located on Market Road, Maruthi Nagar in Ravulapalem, Sri Kankatala Jewellers is a trusted destination for 100% hallmark-certified 22K gold jewellery, pure 925 sterling silver articles, and handcrafted bridal collections. From grand wedding harams and temple necklaces to everyday lightweight jewellery, we bring together timeless South Indian tradition and master craftsmanship.
        </p>
        <p>
          100% Hallmark Certified, Pure 22K Gold &amp; 925 Silver, Market Road, Ravulapalem, Andhra Pradesh.
        </p>
      </section>

      <ShopByCategory />
      <FeaturedProducts />
      <WhySKJ />
      <Testimonials />
    </>
  );
}
