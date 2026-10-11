import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <p
          className="text-6xl font-bold text-skj-olive/20 mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold text-skj-charcoal mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Page Not Found
        </h1>
        <p className="text-sm text-skj-muted mb-6 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/gold/women" className="btn-secondary">
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
