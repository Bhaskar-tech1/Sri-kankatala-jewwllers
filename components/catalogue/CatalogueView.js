'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  LayoutGrid, List, Plus,
} from 'lucide-react';
import { getProductsByRoute, getCategories, getPurityOptions, filterAndSortProducts } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import allDefaultCategories from '@/data/categories';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

function matchCategory(productCat, filterCat) {
  if (!productCat || !filterCat) return false;
  const p = productCat.toLowerCase().trim();
  const f = filterCat.toLowerCase().trim();
  if (p === f) return true;
  if (p.replace(/s$/, '') === f.replace(/s$/, '')) return true;

  // Use word boundaries so "rings" NEVER matches inside the word "earrings"
  const clean = (str) => str.replace(/s$/, '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const fRegex = new RegExp('\\b' + clean(f) + '(?:s)?\\b', 'i');
  const pRegex = new RegExp('\\b' + clean(p) + '(?:s)?\\b', 'i');
  return fRegex.test(p) || pRegex.test(f);
}

export default function CatalogueView({
  material = 'all',
  audience = 'all',
  category = null,
  categorySlug = null,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isMaterialFixed = Boolean(material && material !== 'all');
  const isAudienceFixed = Boolean(audience && audience !== 'all');

  // Read initial filter state from URL or props
  const initialCategories = useMemo(() => {
    if (category) return [category];
    const catParam = searchParams.get('category');
    return catParam ? catParam.split(',') : [];
  }, [category, searchParams]);

  const initialMaterial = isMaterialFixed ? material : (searchParams.get('material') || 'all');
  const initialAudience = isAudienceFixed ? audience : (searchParams.get('audience') || 'all');
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialPurity = searchParams.get('purity') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(initialCategories);
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);
  const [selectedAudience, setSelectedAudience] = useState(initialAudience);
  const [selectedPurity, setSelectedPurity] = useState(initialPurity);
  const [sortBy, setSortBy] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [weightRange, setWeightRange] = useState({ min: '', max: '' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9); // 9 products per batch (3x3 grid) to conserve Cloudinary bandwidth

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
        const queryParams = new URLSearchParams();
        if (isMaterialFixed) queryParams.set('material', material);
        if (isAudienceFixed) queryParams.set('audience', audience);
        const qs = queryParams.toString();
        const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`);
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      } catch (err) {
        console.warn('Dynamic fetch fallback active:', err);
      }
    }
    fetchDynamicProducts();
  }, [material, audience, isMaterialFixed, isAudienceFixed]);

  // Keep category in sync if prop changes
  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    }
  }, [category]);

  const availableCategories = useMemo(() => {
    const activeCats = [];
    allProducts.forEach((p) => {
      if (!p.category) return;
      const matchedStandard = allDefaultCategories.find((c) => matchCategory(p.category, c.name));
      const catName = matchedStandard ? matchedStandard.name : p.category;
      if (!activeCats.some((item) => matchCategory(item, catName))) {
        activeCats.push(catName);
      }
    });

    // Also include any currently selected category so it remains visible and toggleable
    selectedCategories.forEach((sel) => {
      if (!activeCats.some((item) => matchCategory(item, sel))) {
        activeCats.push(sel);
      }
    });

    return activeCats.sort();
  }, [allProducts, selectedCategories]);

  const purityOptions = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.purity).filter(Boolean))].sort();
  }, [allProducts]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some((cat) => matchCategory(p.category, cat))
      );
    }

    // Material filter
    if (isMaterialFixed) {
      result = result.filter((p) => p.material?.toLowerCase() === material.toLowerCase());
    } else if (selectedMaterial && selectedMaterial !== 'all') {
      result = result.filter((p) => p.material?.toLowerCase() === selectedMaterial.toLowerCase());
    }

    // Audience filter
    if (isAudienceFixed) {
      result = result.filter((p) => p.audience?.toLowerCase() === audience.toLowerCase());
    } else if (selectedAudience && selectedAudience !== 'all') {
      result = result.filter((p) => p.audience?.toLowerCase() === selectedAudience.toLowerCase());
    }

    // Purity filter
    if (selectedPurity) {
      result = result.filter((p) => p.purity === selectedPurity);
    }

    // Stock availability
    if (inStockOnly) {
      result = result.filter((p) => p.stockStatus === 'in_stock');
    }

    // Price range
    if (priceRange.min) {
      result = result.filter((p) => (p.price || 0) >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((p) => (p.price || 0) <= Number(priceRange.max));
    }

    // Weight range
    if (weightRange.min) {
      result = result.filter((p) => (p.weightGrams || 0) >= Number(weightRange.min));
    }
    if (weightRange.max) {
      result = result.filter((p) => (p.weightGrams || 0) <= Number(weightRange.max));
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.purity?.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [
    allProducts,
    selectedCategories,
    selectedMaterial,
    selectedAudience,
    isMaterialFixed,
    isAudienceFixed,
    material,
    audience,
    selectedPurity,
    searchQuery,
    sortBy,
    inStockOnly,
    priceRange,
    weightRange,
  ]);

  // Sliced products for display (loads 9 at a time to conserve Cloudinary image bandwidth)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Reset pagination to 9 whenever search, filters, or sorting change
  useEffect(() => {
    setVisibleCount(9);
  }, [
    selectedCategories,
    selectedMaterial,
    selectedAudience,
    selectedPurity,
    inStockOnly,
    priceRange,
    weightRange,
    searchQuery,
    sortBy,
  ]);

  // Update URL params when filters change
  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams();
      if (!category && params.categories && params.categories.length > 0) {
        newParams.set('category', params.categories.join(','));
      }
      if (!isMaterialFixed && params.material && params.material !== 'all') {
        newParams.set('material', params.material);
      }
      if (!isAudienceFixed && params.audience && params.audience !== 'all') {
        newParams.set('audience', params.audience);
      }
      if (params.search) newParams.set('search', params.search);
      if (params.sort && params.sort !== 'featured') newParams.set('sort', params.sort);
      if (params.purity) newParams.set('purity', params.purity);
      const qs = newParams.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [pathname, router, category, isMaterialFixed, isAudienceFixed]
  );

  // Debounced search URL update
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL({
        categories: selectedCategories,
        material: selectedMaterial,
        audience: selectedAudience,
        search: searchQuery,
        sort: sortBy,
        purity: selectedPurity,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategories, selectedMaterial, selectedAudience, sortBy, selectedPurity, updateURL]);

  // Lock body when mobile filters open
  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  const activeFilterCount =
    (!category ? selectedCategories.length : (selectedCategories.length > 1 ? selectedCategories.length - 1 : 0)) +
    (!isMaterialFixed && selectedMaterial !== 'all' ? 1 : 0) +
    (!isAudienceFixed && selectedAudience !== 'all' ? 1 : 0) +
    [
      selectedPurity,
      inStockOnly,
      priceRange.min,
      priceRange.max,
      weightRange.min,
      weightRange.max,
    ].filter(Boolean).length;

  const clearAllFilters = () => {
    if (!category) setSelectedCategories([]);
    if (!isMaterialFixed) setSelectedMaterial('all');
    if (!isAudienceFixed) setSelectedAudience('all');
    setSelectedPurity('');
    setInStockOnly(false);
    setPriceRange({ min: '', max: '' });
    setWeightRange({ min: '', max: '' });
    setSearchQuery('');
    setSortBy('featured');
    setVisibleCount(9);
  };

  // Dynamic header titles
  let pageTitle = '';
  let pageDescription = '';

  if (category) {
    pageTitle = `${category} Collection`;
    pageDescription = `Explore our curated handcrafted ${category.toLowerCase()} designs in pure gold and silver for women and men.`;
  } else if (isMaterialFixed && isAudienceFixed) {
    const matText = material === 'gold' ? 'Gold' : 'Silver';
    const audText = audience === 'men' ? 'Men' : 'Women';
    pageTitle = `${matText} Jewellery for ${audText}`;
    pageDescription = `Explore our collection of ${matText.toLowerCase()} jewellery designed for ${audText.toLowerCase()}.`;
  } else if (isMaterialFixed) {
    const matText = material === 'gold' ? 'Gold' : 'Silver';
    pageTitle = `${matText} Jewellery Collection`;
    pageDescription = `Explore our collection of pure ${matText.toLowerCase()} jewellery.`;
  } else {
    pageTitle = 'All Jewellery Collections';
    pageDescription = 'Explore our complete collection of 22K gold and 92.5 pure silver jewellery for women and men.';
  }

  // Shared filter panel content
  const filterContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-skj-border/60 p-6 space-y-7 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
      {/* Metal Filter (when not fixed to a specific material route) */}
      {!isMaterialFixed && (
        <div>
          <h3
            className="text-xs font-bold uppercase tracking-widest text-skj-charcoal mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Metal
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Metals' },
              { id: 'gold', label: 'Gold' },
              { id: 'silver', label: 'Silver' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterial(m.id)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedMaterial === m.id
                    ? 'border-skj-olive bg-skj-olive text-white'
                    : 'border-skj-border text-skj-charcoal hover:border-skj-olive'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gender / Audience Filter (when not fixed to a specific audience route) */}
      {!isAudienceFixed && (
        <div>
          <h3
            className="text-xs font-bold uppercase tracking-widest text-skj-charcoal mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Gender
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'women', label: 'Women' },
              { id: 'men', label: 'Men' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAudience(a.id)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedAudience === a.id
                    ? 'border-skj-olive bg-skj-olive text-white'
                    : 'border-skj-border text-skj-charcoal hover:border-skj-olive'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div>
          <h3
            className="text-xs font-bold uppercase tracking-widest text-skj-charcoal mb-4"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Category
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-3">
            {availableCategories.map((cat) => {
              const count = allProducts.filter((p) => matchCategory(p.category, cat)).length;
              const isChecked = selectedCategories.some((c) => matchCategory(c, cat));

              return (
                <label key={cat} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.some((c) => matchCategory(c, cat))
                            ? prev.filter((c) => !matchCategory(c, cat))
                            : [...prev, cat]
                        );
                      }}
                      className="w-4 h-4 rounded border-skj-border/80 text-skj-olive focus:ring-skj-olive accent-skj-olive cursor-pointer"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        isChecked
                          ? 'text-skj-olive font-semibold'
                          : 'text-skj-charcoal group-hover:text-skj-olive'
                      }`}
                    >
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-skj-muted/60">{count}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Purity */}
      {purityOptions.length > 0 && (
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
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
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
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
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-skj-charcoal mb-3"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
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
      {/* Page header */}
      <div className="bg-skj-ivory/50 border-b border-skj-border/30">
        <div className="section-container py-6 sm:py-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold text-skj-charcoal mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {pageTitle}
          </h1>
          <p className="text-sm text-skj-muted">{pageDescription}</p>
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
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-skj-muted pointer-events-none"
            />
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
            {!isMaterialFixed && selectedMaterial !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium rounded-full capitalize">
                Metal: {selectedMaterial}
                <button
                  onClick={() => setSelectedMaterial('all')}
                  aria-label="Remove metal filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {!isAudienceFixed && selectedAudience !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium rounded-full capitalize">
                Gender: {selectedAudience}
                <button
                  onClick={() => setSelectedAudience('all')}
                  aria-label="Remove gender filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-3 py-1 bg-skj-olive/10 text-skj-olive text-xs font-medium rounded-full"
              >
                {cat}
                <button
                  onClick={() =>
                    setSelectedCategories((prev) => prev.filter((c) => !matchCategory(c, cat)))
                  }
                  aria-label={`Remove ${cat} filter`}
                >
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
          Showing <span className="font-semibold text-skj-charcoal">{Math.min(visibleCount, filteredProducts.length)}</span> of{' '}
          <span className="font-semibold text-skj-charcoal">{filteredProducts.length}</span>{' '}
          {filteredProducts.length === 1 ? 'product' : 'products'}
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
              {filterContent}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button matching User Design & Brand Theme */}
                {visibleCount < filteredProducts.length && (
                  <div className="mt-12 mb-8 flex flex-col items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 9)}
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl border-2 border-skj-olive text-skj-olive font-semibold text-sm hover:bg-skj-olive hover:text-white transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group"
                    >
                      <Plus size={16} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
                      <span>Load More Products</span>
                    </button>
                    <p className="text-xs text-skj-muted">
                      Showing {displayedProducts.length} of {filteredProducts.length} products
                    </p>
                  </div>
                )}

                {/* All products loaded indicator */}
                {filteredProducts.length > 9 && visibleCount >= filteredProducts.length && (
                  <div className="mt-10 mb-6 text-center">
                    <p className="text-xs text-skj-muted font-medium bg-skj-ivory/60 border border-skj-border/60 rounded-full py-2 px-5 inline-block">
                      ✓ All {filteredProducts.length} products loaded
                    </p>
                  </div>
                )}
              </>
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
              <h2
                className="text-sm font-semibold text-skj-charcoal uppercase tracking-wider"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
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
            <div className="p-5">{filterContent}</div>
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
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
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
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5f5f01;
        }
      `}</style>
    </div>
  );
}
