import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import siteConfig from '@/lib/config';

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.businessName} | Gold & Silver Jewellery in Ravulapalem`,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  keywords: [
    'Sri Kankatala Jewellers',
    'Sri Kankatala Jewellers Ravulapalem',
    'jewellery shops in Ravulapalem',
    'gold jewellery in Ravulapalem',
    'silver jewellery in Ravulapalem',
    'bridal gold jewellery in Ravulapalem',
    'jewellery',
    'gold jewellery',
    'silver jewellery',
    'Indian jewellery',
    'necklaces',
    'bangles',
    'earrings',
    'jhumkas',
    'wedding jewellery',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/SKJlogo.png' },
      { url: '/icon.png' },
    ],
    shortcut: '/SKJlogo.png',
    apple: '/SKJlogo.png',
  },
  openGraph: {
    title: {
      default: `${siteConfig.businessName} | Gold & Silver Jewellery in Ravulapalem`,
      template: `%s | ${siteConfig.businessName}`,
    },
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    type: 'website',
    locale: 'en_IN',
    siteName: siteConfig.businessName,
    images: [
      {
        url: 'https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040219/skj/SKJlogo.png',
        width: 600,
        height: 600,
        alt: `${siteConfig.businessName} — Ravulapalem`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.businessName} | Gold & Silver Jewellery in Ravulapalem`,
    description: siteConfig.description,
    images: ['https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040219/skj/SKJlogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ObRywB_1-I8exnp0_AvHguXbvxF2g00WCGBqN6oiYQU',
  },
};

import JsonLd from '@/components/seo/JsonLd';

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  '@id': `${siteConfig.siteUrl}/#jewelrystore`,
  name: siteConfig.businessName,
  alternateName: ['SKJ', 'Sri Kankatala Jewellers Ravulapalem', 'Sri Kankatala Jewellery', 'Sri Kankatala Jewellers Official Website'],
  url: siteConfig.siteUrl,
  logo: 'https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040219/skj/SKJlogo.png',
  image: [
    'https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040219/skj/SKJlogo.png',
    'https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040217/skj/skjshop.jpg',
    'https://res.cloudinary.com/i8sv3vs8/image/upload/f_auto,q_auto/v1792040218/skj/skjshop1.png',
  ],
  description: siteConfig.description,
  telephone: siteConfig.phone,
  priceRange: '₹₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking',
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.state,
    postalCode: siteConfig.address.pincode,
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 16.7486,
    longitude: 81.8436,
  },
  areaServed: [
    {
      '@type': 'City',
      name: 'Ravulapalem',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Dr. B.R. Ambedkar Konaseema District',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Andhra Pradesh',
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '10:00',
      closes: '20:30',
    },
  ],
  hasMap: 'https://maps.google.com/maps?q=Sri+Kankatala+Jewellers+Ravulapalem',
  sameAs: [
    'https://www.instagram.com/srikankatalajewellers/',
    'https://www.facebook.com/srikankatalajewellers',
    'https://maps.google.com/maps?q=Sri+Kankatala+Jewellers+Ravulapalem',
    'https://www.justdial.com/Ravulapalem/Sri-Kankatala-Jewellers-Near-Pedda-Anjaneyaswamy-Temple-Market-Road/9999P8833-8833-221102143431-Y1E7_BZDET',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.siteUrl}/#website`,
  name: siteConfig.businessName,
  alternateName: ['SKJ', 'Sri Kankatala Jewellers Ravulapalem', 'Sri Kankatala Jewellers Official Website'],
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  publisher: {
    '@id': `${siteConfig.siteUrl}/#jewelrystore`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <JsonLd data={storeSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
