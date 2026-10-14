import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';

export const metadata = {
  title: 'Silver Jewellery for Women in Ravulapalem',
  description:
    'Discover genuine 925 sterling silver jewellery for women in Ravulapalem — anklets, jhumkas, bangles, rings, and necklaces at Sri Kankatala Jewellers.',
  alternates: {
    canonical: '/silver/women',
  },
  openGraph: {
    title: 'Silver Jewellery for Women in Ravulapalem | Sri Kankatala Jewellers',
    description:
      'Discover genuine 925 sterling silver jewellery for women in Ravulapalem — anklets, jhumkas, bangles, rings, and necklaces at Sri Kankatala Jewellers.',
    url: '/silver/women',
    type: 'website',
  },
};

export default function SilverWomenPage() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CatalogueView material="silver" audience="women" />
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
