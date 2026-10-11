'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, LogOut, Search, Edit3, Trash2, PackageCheck, PackageX,
  Loader2, RefreshCw, Sparkles, Filter, X, ChevronDown,
  Layers, Gem, Shield
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const DEFAULT_CATEGORIES = [
  'Necklaces',
  'Chokers',
  'Harams',
  'Kasumala / Temple Jewellery',
  'Earrings',
  'Jhumkas',
  'Chandbalis',
  'Studs',
  'Bangles',
  'Kadas',
  'Bracelets',
  'Rings',
  'Pendants',
  'Mangalsutras / Nallapusalu',
  'Anklets (Payal / Pattilu)',
  'Nose Pins / Mukkupudaka',
  'Maang Tikka / Papidi Billa',
  'Vaddanam (Waist Belts)',
  'Vanki (Armlets / Bajuband)',
  'Chains',
  'Coins (Gold & Silver)',
  'Silver Articles & Pooja Items',
  'Idols & Murthis',
  'Watches',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('all'); // all | gold | silver
  const [filterAudience, setFilterAudience] = useState('all'); // all | women | men
  const [filterCategory, setFilterCategory] = useState('all'); // all | [categoryName]
  const [filterStock, setFilterStock] = useState('all');       // all | in_stock | out_of_stock

  // 1. Check Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
          fetchProducts();
        }
      } catch {
        router.push('/admin/login');
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 4. Toggle Stock Status
  const handleToggleStock = async (product) => {
    setActionLoadingId(product.id);
    const newStatus = product.stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockStatus: newStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stockStatus: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Delete Product
  const handleDeleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setActionLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterMaterial('all');
    setFilterAudience('all');
    setFilterCategory('all');
    setFilterStock('all');
  };

  const isFilterActive =
    searchQuery.trim() !== '' ||
    filterMaterial !== 'all' ||
    filterAudience !== 'all' ||
    filterCategory !== 'all' ||
    filterStock !== 'all';

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const gold = products.filter((p) => p.material === 'gold').length;
    const silver = products.filter((p) => p.material === 'silver').length;
    const inStock = products.filter((p) => p.stockStatus === 'in_stock').length;
    const outOfStock = total - inStock;
    return { total, gold, silver, inStock, outOfStock };
  }, [products]);

  // Dynamic available categories list (combines inventory categories + defaults)
  const availableCategories = useMemo(() => {
    const inventoryCats = products
      .map((p) => p.category)
      .filter(Boolean);
    const combined = Array.from(new Set([...inventoryCats, ...DEFAULT_CATEGORIES]));
    return combined.sort();
  }, [products]);

  // Combinatorial Multi-Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.purity?.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Material Filter (gold / silver)
      if (filterMaterial !== 'all' && p.material !== filterMaterial) {
        return false;
      }

      // 3. Audience Filter (women / men)
      if (filterAudience !== 'all' && p.audience !== filterAudience) {
        return false;
      }

      // 4. Category Filter
      if (filterCategory !== 'all' && p.category?.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }

      // 5. Stock Status Filter (in_stock / out_of_stock)
      if (filterStock !== 'all' && p.stockStatus !== filterStock) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, filterMaterial, filterAudience, filterCategory, filterStock]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C8102E] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-gray-900 pb-20">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#EAE6DF] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hover:opacity-85 transition-opacity flex items-center gap-3">
              <div
                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                className="rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xs border border-stone-200 flex-shrink-0"
              >
                <img
                  src="/SKJlogo.png"
                  alt="SKJ Logo"
                  style={{ width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }}
                  className="block"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-gray-900 text-base leading-tight tracking-tight">
                  Sri Kankatala Jewellers
                </span>
                <span className="text-[10px] font-semibold text-[#8B0000] uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/admin/add"
              className="px-4 py-2 bg-[#C8102E] hover:bg-[#A00D24] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#C8102E]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Products */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E4DC] shadow-xs relative overflow-hidden group hover:border-[#C8102E]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Inventory
              </span>
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2 font-serif">
              {metrics.total}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {metrics.inStock} In Stock
              </span>
              {metrics.outOfStock > 0 && (
                <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  {metrics.outOfStock} Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Gold Collection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E4DC] shadow-xs relative overflow-hidden group hover:border-[#C9A34A]/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Gold Collection
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFF9EA] border border-[#F1E1B2] text-[#B38728] flex items-center justify-center">
                <Gem className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#B38728] mt-2 font-serif">
              {metrics.gold}
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              22K & 24K Handcrafted Pieces
            </span>
          </div>

          {/* Silver Collection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E4DC] shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Silver Collection
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-700 mt-2 font-serif">
              {metrics.silver}
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              92.5 Sterling & Pure Silver Articles
            </span>
          </div>
        </div>

        {/* Enhanced Multi-Filter Control Center */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1D8] shadow-xs space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, category, purity, or slug..."
              className="w-full pl-11 pr-10 py-2.5 bg-[#FAF9F6] border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 4 Dedicated Dropdowns: Material, Audience, Category, Stock Status */}
          <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Material Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Material
              </label>
              <div className="relative">
                <select
                  value={filterMaterial}
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-[#FAF9F6] hover:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Materials (Gold & Silver)</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 2. Audience Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Audience / Section
              </label>
              <div className="relative">
                <select
                  value={filterAudience}
                  onChange={(e) => setFilterAudience(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-[#FAF9F6] hover:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Audiences (Women & Men)</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 3. Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-[#FAF9F6] hover:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 4. Stock Availability Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Stock Availability
              </label>
              <div className="relative">
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2 bg-[#FAF9F6] hover:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Status (In & Out of Stock)</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="out_of_stock">Out of Stock Only</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Indicators & Reset Button */}
          {isFilterActive && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-gray-500">
                <span className="font-semibold text-gray-400">Active:</span>
                {filterMaterial !== 'all' && (
                  <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                    {filterMaterial === 'gold' ? 'Gold' : 'Silver'}
                  </span>
                )}
                {filterAudience !== 'all' && (
                  <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200 font-medium">
                    {filterAudience === 'women' ? 'Women' : 'Men'}
                  </span>
                )}
                {filterCategory !== 'all' && (
                  <span className="bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200 font-medium">
                    {filterCategory}
                  </span>
                )}
                {filterStock !== 'all' && (
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
                    {filterStock === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium">
                    "{searchQuery}"
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#C8102E] hover:text-[#9B001F] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Count Indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Showing <strong className="text-gray-900">{filteredProducts.length}</strong> of{' '}
            <strong className="text-gray-900">{products.length}</strong> products
          </span>

          <button
            onClick={fetchProducts}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-[#E5E1D8] shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#C8102E] mb-2" />
              <span className="text-sm">Loading products from Firestore...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-400 px-4">
              <PackageX className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                {products.length === 0
                  ? 'No products in inventory yet.'
                  : 'No products found matching the selected filters.'}
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                {products.length === 0
                  ? 'Click below to manually add your first jewellery item.'
                  : 'Try resetting the filters or searching with different keywords.'}
              </p>
              {products.length === 0 ? (
                <Link
                  href="/admin/add"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C8102E] hover:bg-[#A00D24] text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Product</span>
                </Link>
              ) : (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* 1. Mobile Cards View (displayed on mobile screens without sliding) */}
              <div className="block md:hidden divide-y divide-[#F0EDE6] bg-white rounded-2xl border border-[#E5E1D8] shadow-xs overflow-hidden">
                {filteredProducts.map((product) => {
                  const isOperating = actionLoadingId === product.id;
                  const isGold = product.material === 'gold';
                  const isInStock = product.stockStatus === 'in_stock';
                  const mainImage = product.images?.[0] || '/images/categories/Necklaces.png';

                  return (
                    <div key={product.id} className="p-4 space-y-3">
                      {/* Top Row: Thumbnail + Product Details */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 shadow-xs">
                          <Image
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Purity & Section Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isGold
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {product.purity || (isGold ? '22K' : '92.5')} {isGold ? 'Gold' : 'Silver'}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 capitalize bg-gray-100 px-1.5 py-0.5 rounded">
                              {product.audience === 'men' ? 'Men' : 'Women'}
                            </span>
                            {product.featured && (
                              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Product Name */}
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="font-bold text-gray-900 hover:text-[#C8102E] transition-colors line-clamp-1 mt-1 text-sm block"
                          >
                            {product.name}
                          </Link>

                          {/* Price & Weight */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-900 text-sm font-sans">
                              {formatPrice(product.price)}
                            </span>
                            {product.weightGrams ? (
                              <span className="text-xs text-gray-400">
                                · {product.weightGrams}g
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Category & Stock on Left, Actions on Right */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-medium text-gray-700 bg-[#FAF9F6] px-2 py-0.5 rounded-lg border border-gray-200/60">
                            {product.category}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                              isInStock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isInStock ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                              }`}
                            />
                            {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Stock Toggle */}
                          <button
                            onClick={() => handleToggleStock(product)}
                            disabled={isOperating}
                            title={isInStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isInStock
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {isInStock ? (
                              <PackageX className="w-4 h-4" />
                            ) : (
                              <PackageCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit */}
                          <Link
                            href={`/admin/edit/${product.id}`}
                            title="Edit Product"
                            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={isOperating}
                            title="Delete Product"
                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Desktop Table View (displayed on md screens and wider) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF9F6] border-b border-[#EAE6DF] text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Product</th>
                      <th className="py-3.5 px-4">Type & Section</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price & Weight</th>
                      <th className="py-3.5 px-4">Stock Status</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                      const isOperating = actionLoadingId === product.id;
                      const isGold = product.material === 'gold';
                      const isInStock = product.stockStatus === 'in_stock';
                      const mainImage = product.images?.[0] || '/images/categories/Necklaces.png';

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          {/* Product Column */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 shadow-xs">
                                <Image
                                  src={mainImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                    isGold
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-200 text-slate-800'
                                  }`}>
                                    {product.purity || (isGold ? '22K' : '92.5')}
                                  </span>
                                  {product.featured && (
                                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <Link
                                  href={`/product/${product.slug}`}
                                  target="_blank"
                                  className="font-semibold text-gray-900 hover:text-[#C8102E] transition-colors line-clamp-1 mt-0.5 text-sm"
                                >
                                  {product.name}
                                </Link>
                                <span className="text-[11px] text-gray-400 block font-mono">
                                  {product.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type & Section Column */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isGold
                                    ? 'bg-[#FFF9EA] text-[#977319] border border-[#F1E1B2]'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {isGold ? 'Gold' : 'Silver'}
                              </span>
                              <span className="text-xs text-gray-500 font-medium capitalize">
                                {product.audience === 'men' ? 'Men' : 'Women'}
                              </span>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-medium text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200/60">
                              {product.category}
                            </span>
                          </td>

                          {/* Price & Weight Column */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-900 block font-sans">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-xs text-gray-400 block">
                              {product.weightGrams ? `${product.weightGrams}g` : '—'}
                            </span>
                          </td>

                          {/* Stock Status Column */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                                isInStock
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isInStock ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                                }`}
                              />
                              {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Stock Toggle Button */}
                              <button
                                onClick={() => handleToggleStock(product)}
                                disabled={isOperating}
                                title={isInStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isInStock
                                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {isInStock ? (
                                  <PackageX className="w-4 h-4" />
                                ) : (
                                  <PackageCheck className="w-4 h-4" />
                                )}
                              </button>

                              {/* Edit Button */}
                              <Link
                                href={`/admin/edit/${product.id}`}
                                title="Edit Product"
                                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                disabled={isOperating}
                                title="Delete Product"
                                className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
