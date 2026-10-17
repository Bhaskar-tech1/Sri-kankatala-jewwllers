'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, ChevronDown, ChevronRight, Coins } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CLOUDINARY_IMAGES from '@/lib/images';
import TodayRatesModal from '@/components/layout/TodayRatesModal';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { DEFAULT_RATES } from '@/lib/pricing';

const BANNER_MESSAGES = [
  "Timeless Tradition. Trusted Craftsmanship.",
  "Celebrating Every Occasion with the Beauty of Fine Jewellery",
  "Elegance That Lasts. Traditions That Shine.",
  "Discover Exquisite Gold & Silver Jewellery for Every Occasion",
  "Where Indian Traditions Meet Timeless Jewellery"
];

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Gold',
    children: [
      { label: 'Women', href: '/gold/women' },
      { label: 'Men', href: '/gold/men' },
    ],
  },
  {
    label: 'Silver',
    children: [
      { label: 'Women', href: '/silver/women' },
      { label: 'Men', href: '/silver/men' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount, isHydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [ratesModalOpen, setRatesModalOpen] = useState(false);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Subscribe to real-time daily gold & silver rates from Firestore
  useEffect(() => {
    let unsubscribe = () => {};

    const fetchRatesFromApi = async () => {
      try {
        const res = await fetch('/api/gold-rates');
        if (res.ok) {
          const json = await res.json();
          if (json?.rates) {
            setRates((prev) => ({ ...prev, ...json.rates }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch daily rates from API:', err);
      }
    };

    try {
      if (db) {
        const docRef = doc(db, 'settings', 'goldRates');
        unsubscribe = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              setRates((prev) => ({ ...prev, ...snap.data() }));
            } else {
              fetchRatesFromApi();
            }
          },
          (err) => {
            console.warn('Realtime gold rates listener error, falling back to API:', err.message);
            fetchRatesFromApi();
          }
        );
      } else {
        fetchRatesFromApi();
      }
    } catch (e) {
      fetchRatesFromApi();
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Scroll detection for compact header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rotate banner message every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNER_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      // Ignore clicks inside the mobile drawer completely
      if (mobileMenuRef.current && mobileMenuRef.current.contains(e.target)) {
        return;
      }
      // If clicking outside the desktop nav, close the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const cartCount = isHydrated ? getCartCount() : 0;

  const isActive = (href) => pathname === href;
  const isParentActive = (children) =>
    children?.some((c) => pathname === c.href);

  // Hide storefront navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        {/* Top bar — subtle brand accent */}
        <div className="hidden lg:block bg-skj-deep-olive text-white overflow-hidden">
          <div className="section-container flex items-center justify-center py-1.5 text-xs tracking-wide h-[28px]">
            <span key={bannerIndex} className="opacity-90 text-center">
              {BANNER_MESSAGES[bannerIndex]}
            </span>
          </div>
        </div>

        {/* Main navigation bar */}
        <nav
          ref={dropdownRef}
          className="section-container"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'py-2' : 'py-3 lg:py-4'
          }`}>
            {/* Logo & Brand Name */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3.5 flex-shrink min-w-0 mr-2 sm:mr-4 group"
              aria-label="Sri Kankatala Jewellers — Home"
            >
              <Image
                src={CLOUDINARY_IMAGES.logo}
                alt="Sri Kankatala Jewellers Logo"
                width={scrolled ? 48 : 60}
                height={scrolled ? 48 : 60}
                className="transition-all duration-300 w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-contain flex-shrink-0"
                priority
              />
              <span
                className="font-serif font-bold text-skj-charcoal text-[13.5px] sm:text-lg lg:text-xl tracking-tight group-hover:text-skj-olive transition-colors whitespace-nowrap truncate"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Sri Kankatala Jewellers
              </span>
            </Link>

            {/* Desktop navigation links */}
            <ul className="hidden lg:flex flex-1 items-center justify-center gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <li key={link.label} className="relative">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === link.label ? null : link.label)
                      }
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                        isParentActive(link.children)
                          ? 'text-skj-olive'
                          : 'text-skj-charcoal hover:text-skj-olive'
                      }`}
                      aria-expanded={openDropdown === link.label}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          openDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-skj-border shadow-lg min-w-[180px] py-2 animate-fadeIn">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-5 py-2.5 text-sm transition-colors ${
                              isActive(child.href)
                                ? 'text-skj-olive bg-skj-ivory font-medium'
                                : 'text-skj-charcoal hover:bg-skj-ivory hover:text-skj-olive'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                        isActive(link.href)
                          ? 'text-skj-olive'
                          : 'text-skj-charcoal hover:text-skj-olive'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>

            {/* Right actions: Today's Rates, Cart, Mobile menu */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Today's Rates Button & Pop-up */}
              <div className="relative">
                <button
                  onClick={() => setRatesModalOpen((prev) => !prev)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-300/90 bg-gradient-to-r from-amber-50 to-amber-100/70 hover:from-amber-100 hover:to-amber-200/80 text-amber-950 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer group flex-shrink-0"
                  title="View Today's Gold & Silver Rates"
                  aria-label="View Today's Gold & Silver Rates"
                  aria-expanded={ratesModalOpen}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <Coins className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-amber-950 font-semibold tracking-tight">
                    <span className="hidden sm:inline">Today&apos;s Rates</span>
                    <span className="sm:hidden text-[11px]">Rates</span>
                  </span>
                </button>

                {/* Pop-up Card */}
                <TodayRatesModal
                  isOpen={ratesModalOpen}
                  onClose={() => setRatesModalOpen(false)}
                  rates={rates}
                />
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-skj-charcoal hover:text-skj-olive transition-colors"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-skj-red text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-skj-charcoal hover:text-skj-olive transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slideInRight"
            role="dialog"
            aria-label="Mobile navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-skj-border">
              <div className="flex items-center gap-2.5">
                <Image
                  src={CLOUDINARY_IMAGES.logo}
                  alt="Sri Kankatala Jewellers"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain flex-shrink-0"
                />
                <span
                  className="font-serif font-bold text-skj-charcoal text-base leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Sri Kankatala Jewellers
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-skj-charcoal cursor-pointer"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Menu links */}
            <nav className="py-4" aria-label="Mobile navigation">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="border-b border-skj-border/50">
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === link.label ? null : link.label)
                      }
                      className={`flex items-center justify-between w-full px-5 py-3.5 text-sm font-medium ${
                        isParentActive(link.children)
                          ? 'text-skj-olive'
                          : 'text-skj-charcoal'
                      }`}
                      aria-expanded={openDropdown === link.label}
                    >
                      {link.label}
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdown === link.label ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === link.label && (
                      <div className="bg-skj-ivory/60 py-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-8 py-3 text-sm ${
                              isActive(child.href)
                                ? 'text-skj-olive font-medium'
                                : 'text-skj-charcoal hover:text-skj-olive'
                            }`}
                            onClick={() => {
                              setMobileOpen(false);
                            }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block px-5 py-3.5 text-sm font-medium border-b border-skj-border/50 ${
                      isActive(link.href)
                        ? 'text-skj-olive'
                        : 'text-skj-charcoal hover:text-skj-olive'
                    }`}
                    onClick={() => {
                      setMobileOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile drawer footer */}
            <div className="px-5 py-4 mt-4 border-t border-skj-border">
              <Link
                href="/cart"
                className="btn-primary w-full justify-center"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                <ShoppingBag size={16} />
                View Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="h-[72px] lg:h-[104px]" aria-hidden="true" />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
