import siteConfig from '@/lib/config';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = siteConfig.siteUrl || 'https://srikankatalajewellers.in';

  // Core static canonical pages
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gold/women`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gold/men`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/silver/women`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/silver/men`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic products from Firestore
  let productRoutes = [];
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(query(productsRef));

    if (!snapshot.empty) {
      productRoutes = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.slug) return null;

          let lastMod = new Date();
          if (data.updatedAt) {
            lastMod = new Date(data.updatedAt);
          } else if (data.createdAt) {
            lastMod = new Date(data.createdAt);
          }

          return {
            url: `${baseUrl}/product/${data.slug}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.8,
          };
        })
        .filter(Boolean);
    }
  } catch (err) {
    console.warn('Sitemap dynamic product generation fallback:', err.message);
  }

  return [...staticRoutes, ...productRoutes];
}
