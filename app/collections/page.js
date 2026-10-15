import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';

export const metadata = {
  title: 'All Jewellery Collections in Ravulapalem | Sri Kankatala Jewellers',
  description:
    'Explore our complete collection of 22K gold and 92.5 pure silver jewellery for women and men at Sri Kankatala Jewellers, Ravulapalem.',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'All Jewellery Collections | Sri Kankatala Jewellers',
    description:
      'Explore our complete collection of 22K gold and 92.5 pure silver jewellery for women and men at Sri Kankatala Jewellers.',
    url: '/collections',
    type: 'website',
  },
};

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CatalogueLoading />}>
      <CatalogueView material="all" audience="all" />
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
