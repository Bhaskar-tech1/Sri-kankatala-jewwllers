import ContactClient from '@/components/contact/ContactClient';
import JsonLd from '@/components/seo/JsonLd';
import siteConfig from '@/lib/config';

export const metadata = {
  title: 'Contact Sri Kankatala Jewellers | Ravulapalem',
  description:
    'Find Sri Kankatala Jewellers at Maruthi nagar, near pedda anjaneyaswamy temple, Ravulapalem, Andhra Pradesh 533238. Contact our jewellery showroom for bridal jewellery, gold rates, and custom orders.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Sri Kankatala Jewellers | Ravulapalem',
    description:
      'Find Sri Kankatala Jewellers at Maruthi nagar, near pedda anjaneyaswamy temple, Ravulapalem, Andhra Pradesh 533238. Contact our jewellery showroom for bridal jewellery, gold rates, and custom orders.',
    url: '/contact',
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
      name: 'Contact Us',
      item: `${siteConfig.siteUrl}/contact`,
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ContactClient />
    </>
  );
}
