import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';
import JsonLd from '@/components/seo/JsonLd';
import siteConfig from '@/lib/config';

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
      name: 'Silver Jewellery',
      item: `${siteConfig.siteUrl}/silver/men`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Men',
      item: `${siteConfig.siteUrl}/silver/men`,
    },
  ],
};

export default function SilverMenPage() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<CatalogueLoading />}>
        <CatalogueView material="silver" audience="men" />
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
