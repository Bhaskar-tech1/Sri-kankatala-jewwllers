'use client';

import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function FeaturedProducts() {
  const products = getFeaturedProducts(8);

  return (
    <section className="section-spacing bg-skj-ivory" aria-labelledby="featured-title">
      <div className="section-container">
        {/* Section header */}
        <div data-aos="fade-up">
          <h2 id="featured-title" className="section-title">
            Featured Collection
          </h2>
          <span className="section-divider" aria-hidden="true" />
          <p className="section-subtitle">
            Handpicked pieces from our finest gold and silver collections
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product, index) => (
            <div key={product.id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-10" data-aos="fade-up">
          <Link href="/gold/women" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
