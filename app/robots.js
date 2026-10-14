import siteConfig from '@/lib/config';

export default function robots() {
  const baseUrl = siteConfig.siteUrl || 'https://srikankatalajewellers.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/admin',
          '/api/admin/',
          '/cart',
          '/cart/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
