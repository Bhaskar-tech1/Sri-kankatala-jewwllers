import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';
import JsonLd from '@/components/seo/JsonLd';
import siteConfig from '@/lib/config';

export const metadata = {
  title: 'Gold Jewellery for Women in Ravulapalem',
  description:
    'Browse our exquisite collection of 22K gold jewellery for women in Ravulapalem — bridal necklaces, harams, earrings, jhumkas, bangles, and rings at Sri Kankatala Jewellers.',
  alternates: {
    canonical: '/gold/women',
  },
  openGraph: {
    title: 'Gold Jewellery for Women in Ravulapalem | Sri Kankatala Jewellers',
    description:
      'Browse our exquisite collection of 22K gold jewellery for women in Ravulapalem — bridal necklaces, harams, earrings, jhumkas, bangles, and rings at Sri Kankatala Jewellers.',
    url: '/gold/women',
    type: 'website',
  },
};

const breadcrumbs = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteConfig.siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Gold Jewellery',
      item: `${siteConfig.siteUrl}/gold/women`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Women',
      item: `${siteConfig.siteUrl}/gold/women`,
    },
  ],
};

export default function GoldWomenPage() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<CatalogueLoading />}>
        <CatalogueView material="gold" audience="women" />
      </Suspense>
    </>
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
