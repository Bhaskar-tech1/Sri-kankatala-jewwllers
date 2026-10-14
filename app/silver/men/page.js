import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';

export const metadata = {
  title: 'Silver Jewellery for Men in Ravulapalem',
  description:
    'Shop premium 925 sterling silver jewellery for men in Ravulapalem — rings, bracelets, chains, and kadas at Sri Kankatala Jewellers.',
  alternates: {
    canonical: '/silver/men',
  },
  openGraph: {
    title: 'Silver Jewellery for Men in Ravulapalem | Sri Kankatala Jewellers',
    description:
      'Shop premium 925 sterling silver jewellery for men in Ravulapalem — rings, bracelets, chains, and kadas at Sri Kankatala Jewellers.',
    url: '/silver/men',
    type: 'website',
  },
};

export default function SilverMenPage() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CatalogueView material="silver" audience="men" />
    </Suspense>
  );
}

function CatalogueLoading() {
  return (
    <div className="section-container py-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] skeleton" />
        ))}
      </div>
    </div>
  );
}
