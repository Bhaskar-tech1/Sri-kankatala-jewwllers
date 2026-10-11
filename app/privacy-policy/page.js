import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Sri Kankatala Jewellers',
  description: 'Privacy Policy for Sri Kankatala Jewellers.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-skj-ivory border-b border-skj-border/50">
        <div className="section-container pt-6 pb-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-skj-muted">
            <Link href="/" className="hover:text-skj-olive transition-colors flex items-center gap-1">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-skj-charcoal font-medium">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <div className="section-container py-12 lg:py-20 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-skj-charcoal mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Privacy Policy
        </h1>
        
        <div className="prose prose-skj max-w-none text-skj-muted space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At Sri Kankatala Jewellers, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you interact with our store, website, and WhatsApp services.
          </p>

          <h2 className="text-xl font-semibold text-skj-charcoal mt-10 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            1. Information We Collect
          </h2>
          <p>
            We may collect personal information such as your name, phone number, email address, and physical address when you:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Submit an enquiry through our website or WhatsApp.</li>
            <li>Place an order for our jewellery.</li>
            <li>Sign up for updates or promotional offers.</li>
          </ul>

          <h2 className="text-xl font-semibold text-skj-charcoal mt-10 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used strictly to provide you with the best possible service, including:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Responding to your enquiries and providing quotes.</li>
            <li>Processing your orders and arranging deliveries.</li>
            <li>Sending you relevant updates about our collections, if you have opted in.</li>
          </ul>

          <h2 className="text-xl font-semibold text-skj-charcoal mt-10 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            3. Data Security
          </h2>
          <p>
            We implement standard security measures to protect your personal information. We do not sell, trade, or rent your personal identification information to others.
          </p>

          <h2 className="text-xl font-semibold text-skj-charcoal mt-10 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            4. Contact Us
          </h2>
          <p>
            If you have any questions regarding this Privacy Policy, please contact us at our store in Ravulapalem or call us at +91 95056 08181.
          </p>
        </div>
      </div>
    </div>
  );
}
