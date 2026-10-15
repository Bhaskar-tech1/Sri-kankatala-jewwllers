'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';
import siteConfig from '@/lib/config';
import CLOUDINARY_IMAGES from '@/lib/images';

const footerCollections = [
  { label: 'Gold for Women', href: '/gold/women' },
  { label: 'Gold for Men', href: '/gold/men' },
  { label: 'Silver for Women', href: '/silver/women' },
  { label: 'Silver for Men', href: '/silver/men' },
];

const footerCategories = [
  { label: 'Necklaces', href: '/category/necklaces' },
  { label: 'Harams', href: '/category/harams' },
  { label: 'Bangles', href: '/category/bangles' },
  { label: 'Earrings', href: '/category/earrings' },
  { label: 'Rings', href: '/category/rings' },
  { label: 'Bracelets', href: '/category/bracelets' },
];

const footerLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
];

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#3B4210] text-white/90" role="contentinfo">
      {/* Main footer content */}
      <div className="section-container py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={CLOUDINARY_IMAGES.logo}
                alt="Sri Kankatala Jewellers"
                width={72}
                height={72}
                className="brightness-110"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-4 max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-skj-gold mb-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Collections
            </h3>
            <ul className="space-y-2.5">
              {footerCollections.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-skj-gold mb-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Categories
            </h3>
            <ul className="space-y-2.5">
              {footerCategories.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-skj-gold mb-4"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-skj-gold mb-3"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Contact
            </h3>
            <address className="not-italic text-sm text-white/70 space-y-1.5">
              <p>{siteConfig.address.line1}</p>
              <p>{siteConfig.address.city}, {siteConfig.address.state}</p>
              <p>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 text-center sm:text-left">
          <div>
            <p>© {currentYear} {siteConfig.businessName}. All rights reserved.</p>
            <p className="mt-1">
              Developed by{' '}
              <a
                href="mailto:panjaabhisek57@gmail.com"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
                title="Email Panja Abhishek"
              >
                Panja Abhishek <Mail size={12} />
              </a>{' '}
              and{' '}
              <a
                href="mailto:bhaskarvanjarapu207@gmail.com"
                className="hover:text-white transition-colors inline-flex items-center gap-1"
                title="Email Bhaskar Vanjarapu"
              >
                Bhaskar Vanjarapu <Mail size={12} />
              </a>
            </p>
          </div>
          <p>Crafted with care for authentic Indian jewellery lovers.</p>
        </div>
      </div>
    </footer>
  );
}
