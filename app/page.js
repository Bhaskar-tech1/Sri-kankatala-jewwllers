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
    url: 'https://srikankatalajewellers.in',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <AosInit />
      <HeroSlider />
      <HeroMarquee />

      {/* Semantic Primary Heading & Local Showroom Introduction */}
      <section
        className="bg-white py-12 lg:py-16 border-b border-skj-border/40"
        aria-label="Welcome to Sri Kankatala Jewellers"
      >
        <div className="section-container text-center max-w-4xl mx-auto">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-skj-olive mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Welcome to Our Showroom in Ravulapalem
          </p>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-skj-charcoal mb-5 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Gold & Silver Jewellery in Ravulapalem
          </h1>
          <div
            className="w-16 h-0.5 bg-gradient-to-r from-skj-olive to-skj-gold mx-auto mb-6"
            aria-hidden="true"
          />
          <p className="text-sm sm:text-base text-skj-muted leading-relaxed mb-6">
            Located on Market Road, Maruthi Nagar in Ravulapalem, Sri Kankatala Jewellers is a trusted destination for 100% hallmark-certified 22K gold jewellery, pure 925 sterling silver articles, and handcrafted bridal collections. From grand wedding harams and temple necklaces to everyday lightweight jewellery, we bring together timeless South Indian tradition and master craftsmanship.
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold tracking-wider text-skj-charcoal uppercase"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <span className="flex items-center gap-1.5 bg-skj-ivory px-3.5 py-2 rounded-full border border-skj-border/60">
              <span className="w-2 h-2 rounded-full bg-skj-gold" aria-hidden="true" />
              100% Hallmark Certified
            </span>
            <span className="flex items-center gap-1.5 bg-skj-ivory px-3.5 py-2 rounded-full border border-skj-border/60">
              <span className="w-2 h-2 rounded-full bg-skj-gold" aria-hidden="true" />
              Pure 22K Gold & 925 Silver
            </span>
            <span className="flex items-center gap-1.5 bg-skj-ivory px-3.5 py-2 rounded-full border border-skj-border/60">
              <span className="w-2 h-2 rounded-full bg-skj-gold" aria-hidden="true" />
              Market Road, Ravulapalem
            </span>
          </div>
        </div>
      </section>

      <ShopByCategory />
      <FeaturedProducts />
      <WhySKJ />
      <Testimonials />
    </>
  );
}
