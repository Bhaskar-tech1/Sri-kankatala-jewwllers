'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronRight,
  Home, LayoutGrid, List,
} from 'lucide-react';
import { getProductsByRoute, getCategories, getPurityOptions, filterAndSortProducts } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

export default function CatalogueView({ material, audience }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial filter state from URL
  const initialCategories = searchParams.get('category') ? searchParams.get('category').split(',') : [];
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialPurity = searchParams.get('purity') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [selectedPurity, setSelectedPurity] = useState(initialPurity);
  const [sortBy, setSortBy] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [weightRange, setWeightRange] = useState({ min: '', max: '' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initial static fallback products for instant rendering
  const staticProducts = useMemo(
    () => getProductsByRoute(material, audience),
    [material, audience]
  );

  const [allProducts, setAllProducts] = useState(staticProducts);

  // Sync with Firestore dynamic catalogue
  useEffect(() => {
    async function fetchDynamicProducts() {
      try {
        const res = await fetch(`/api/products?material=${material}&audience=${audience}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.warn('Dynamic fetch fallback active:', err);
      }
    }
    fetchDynamicProducts();
  }, [material, audience]);

  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category))];
    return cats.sort();
  }, [allProducts]);

  const purityOptions = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.purity))].sort();
  }, [allProducts]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    const filters = {
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      purity: selectedPurity || undefined,
      search: searchQuery || undefined,
      inStockOnly,
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
      minWeight: weightRange.min ? Number(weightRange.min) : undefined,
      maxWeight: weightRange.max ? Number(weightRange.max) : undefined,
    };
    return filterAndSortProducts(allProducts, filters, sortBy);
  }, [allProducts, selectedCategories, selectedPurity, searchQuery, sortBy, inStockOnly, priceRange, weightRange]);

  // Update URL params when filters change
  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams();
      if (params.categories && params.categories.length > 0) {
        newParams.set('category', params.categories.join(','));
      }
      if (params.search) newParams.set('search', params.search);
      if (params.sort && params.sort !== 'featured') newParams.set('sort', params.sort);
      if (params.purity) newParams.set('purity', params.purity);
      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [pathname, router]
  );

  // Debounced search URL update
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL({
        categories: selectedCategories,
        search: searchQuery,
        sort: sortBy,
        purity: selectedPurity,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategories, sortBy, selectedPurity, updateURL]);

  // Lock body when mobile filters open
  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  const activeFilterCount = selectedCategories.length + [
    selectedPurity,
    inStockOnly,
    priceRange.min,
    priceRange.max,
    weightRange.min,
    weightRange.max,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPurity('');
    setInStockOnly(false);
    setPriceRange({ min: '', max: '' });
    setWeightRange({ min: '', max: '' });
    setSearchQuery('');
    setSortBy('featured');
  };

  const materialLabel = material === 'gold' ? 'Gold' : 'Silver';
  const audienceLabel = audience === 'men' ? 'Men' : 'Women';
  const pageTitle = `${materialLabel} Jewellery for ${audienceLabel}`;

  // Shared filter panel content
  const FilterContent = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-skj-border/60 p-6 space-y-8 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-skj-charcoal mb-4"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Category
        </h3>
        <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-3">
          {categories.map((cat) => {
            const count = allProducts.filter(p => p.category === cat).length;
            const isChecked = selectedCategories.includes(cat);
            return (
              <label key={cat} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedCategories(prev =>
                        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                      );
                    }}
                    className="w-4 h-4 rounded border-skj-border/80 text-skj-olive focus:ring-skj-olive accent-skj-olive cursor-pointer"
                  />
                  <span className={`text-sm transition-colors ${isChecked ? 'text-skj-olive font-semibold' : 'text-skj-charcoal group-hover:text-skj-olive'}`}>
                    {cat}
                  </span>
                </div>
                <span className="text-xs font-medium text-skj-muted/60">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Purity */}
      {purityOptions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Purity
          </h3>
          <div className="flex flex-wrap gap-2">
            {purityOptions.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPurity(p === selectedPurity ? '' : p)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedPurity === p
                    ? 'border-skj-olive bg-skj-olive text-white'
                    : 'border-skj-border text-skj-charcoal hover:border-skj-olive'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Price Range (₹)
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive"
            min="0"
          />
          <span className="text-skj-muted self-center text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive"
            min="0"
          />
        </div>
      </div>

      {/* Weight Range */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Weight (grams)
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={weightRange.min}
            onChange={(e) => setWeightRange((prev) => ({ ...prev, min: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive"
            min="0"
          />
          <span className="text-skj-muted self-center text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={weightRange.max}
            onChange={(e) => setWeightRange((prev) => ({ ...prev, max: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive"
            min="0"
          />
        </div>
      </div>

      {/* Stock filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-skj-olive"
          />
          <span className="text-sm text-skj-charcoal">In stock only</span>
        </label>
      </div>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 text-sm text-skj-red font-medium hover:bg-red-50 transition-colors border border-skj-red/20"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-skj-ivory border-b border-skj-border/50">
        <div className="section-container pt-6 pb-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-skj-muted">
            <Link href="/" className="hover:text-skj-olive transition-colors flex items-center gap-1">
              <Home size={12} />
              Home
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-skj-charcoal font-medium">
              {pageTitle}
            </span>
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-skj-ivory/50 border-b border-skj-border/30">
        <div className="section-container py-6 sm:py-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold text-skj-charcoal mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {pageTitle}
          </h1>
          <p className="text-sm text-skj-muted">
            Explore our collection of {materialLabel.toLowerCase()} jewellery designed for {audienceLabel.toLowerCase()}.
          </p>
        </div>
      </div>

      <div className="section-container py-6">
        {/* Toolbar: Search, Sort, Mobile filter toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-skj-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-skj-muted hover:text-skj-charcoal"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full sm:w-[200px] px-4 py-2.5 pr-10 text-sm border border-skj-border bg-white focus:outline-none focus:border-skj-olive cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-skj-muted pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-skj-border hover:border-skj-olive transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-skj-olive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium rounded-full">
                {cat}
                <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))} aria-label={`Remove ${cat} filter`}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedPurity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium">
                {selectedPurity}
                <button onClick={() => setSelectedPurity('')} aria-label={`Remove ${selectedPurity} filter`}>
                  <X size={12} />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium">
                In Stock
                <button onClick={() => setInStockOnly(false)} aria-label="Remove in-stock filter">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product count */}
        <p className="text-xs text-skj-muted mb-4">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>

        {/* Main content: Sidebar + Product grid */}
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-28">
              <h2
                className="text-sm font-semibold text-skj-charcoal mb-4 uppercase tracking-wider"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Filters
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-skj-ivory flex items-center justify-center rounded-2xl border border-skj-border/60">
                  <Search size={24} className="text-skj-muted" />
                </div>
                <h3
                  className="text-lg font-semibold text-skj-charcoal mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {allProducts.length === 0 ? 'Collection Coming Soon' : 'No products found'}
                </h3>
                <p className="text-sm text-skj-muted mb-4 max-w-sm mx-auto">
                  {allProducts.length === 0
                    ? 'Our handcrafted pieces will appear here as soon as they are added to inventory.'
                    : 'Try adjusting your filters or search query to find what you are looking for.'}
                </p>
                {allProducts.length > 0 && (
                  <button onClick={clearAllFilters} className="btn-secondary text-sm">
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-white overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b border-skj-border flex items-center justify-between px-5 py-3 z-10">
              <h2 className="text-sm font-semibold text-skj-charcoal uppercase tracking-wider"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-skj-charcoal"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <FilterContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-skj-border p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full justify-center"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        /* Custom scrollbar for filter card */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5F5F01;
        }
      `}</style>
    </div>
  );
}
