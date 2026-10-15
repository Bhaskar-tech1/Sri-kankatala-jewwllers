import { getAllProducts, getProductBySlug, getRelatedProductsAsync } from '@/lib/api';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import { notFound } from 'next/navigation';
import CLOUDINARY_IMAGES from '@/lib/images';

export const dynamic = 'force-dynamic';

// Generate static params for all products
export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Dynamic metadata for each product
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false },
    };
  }

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : CLOUDINARY_IMAGES.logo;

  const title = `${product.name} | Sri Kankatala Jewellers`;
  const description =
    product.description ||
    `Buy ${product.name} handcrafted in ${product.purity || ''} ${product.material || 'gold'} at Sri Kankatala Jewellers, Ravulapalem.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: 'website',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

import JsonLd from '@/components/seo/JsonLd';
import siteConfig from '@/lib/config';

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : CLOUDINARY_IMAGES.logo;

  const materialLabel = product.material === 'silver' ? 'Silver' : 'Gold';
  const audienceRoute = product.audience === 'men' ? 'men' : 'women';
  const collectionUrl = `${siteConfig.siteUrl}/${product.material === 'silver' ? 'silver' : 'gold'}/${audienceRoute}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ||
      `Handcrafted ${product.name} at Sri Kankatala Jewellers, Ravulapalem.`,
    image:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [primaryImage],
    sku: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: siteConfig.businessName,
    },
    material: `${product.purity || ''} ${product.material || ''}`.trim() || 'Gold',
    category: product.category,
    ...(product.price && product.price > 0
      ? {
          offers: {
            '@type': 'Offer',
            url: `${siteConfig.siteUrl}/product/${product.slug}`,
            priceCurrency: 'INR',
            price: product.price,
            availability:
              product.stockStatus === 'out_of_stock'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'Organization',
              name: siteConfig.businessName,
            },
          },
        }
      : {}),
  };

  const breadcrumbSchema = {
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
        name: `${materialLabel} Jewellery`,
        item: collectionUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${siteConfig.siteUrl}/product/${product.slug}`,
      },
    ],
  };

  const relatedProducts = await getRelatedProductsAsync(product, 4);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductDetailClient
        product={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
