import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import siteConfig from '@/lib/config';

export const metadata = {
  title: {
    default: `${siteConfig.businessName} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  keywords: [
    'jewellery',
    'gold jewellery',
    'silver jewellery',
    'Indian jewellery',
    'Sri Kankatala Jewellers',
    'necklaces',
    'bangles',
    'earrings',
    'wedding jewellery',
  ],
  icons: {
    icon: [
      { url: '/SKJlogo.png' },
      { url: '/icon.png' },
    ],
    shortcut: '/SKJlogo.png',
    apple: '/SKJlogo.png',
  },
  openGraph: {
    title: siteConfig.businessName,
    description: siteConfig.description,
    type: 'website',
    locale: 'en_IN',
    siteName: siteConfig.businessName,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
