import { Suspense } from 'react';
import CatalogueView from '@/components/catalogue/CatalogueView';
import categories from '@/data/categories';

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  const categoryName = category ? category.name : slug;

  return {
    title: `${categoryName} Collection in Ravulapalem | Sri Kankatala Jewellers`,
    description: `Explore our handcrafted ${categoryName} collection in gold and silver for men and women at Sri Kankatala Jewellers, Ravulapalem.`,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${categoryName} Collection | Sri Kankatala Jewellers`,
      description: `Explore our handcrafted ${categoryName} collection in gold and silver for men and women at Sri Kankatala Jewellers.`,
      url: `/category/${slug}`,
      type: 'website',
    },
  };
}

import JsonLd from '@/components/seo/JsonLd';
import siteConfig from '@/lib/config';

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  const categoryName = category ? category.name : slug;

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
        name: 'Collections',
        item: `${siteConfig.siteUrl}/collections`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${siteConfig.siteUrl}/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<CatalogueLoading />}>
        <CatalogueView
          material="all"
          audience="all"
          category={categoryName}
          categorySlug={slug}
        />
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
