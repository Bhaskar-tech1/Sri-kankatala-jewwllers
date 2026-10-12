'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, LogOut, Search, Edit3, Trash2, PackageCheck, PackageX,
  Loader2, RefreshCw, Sparkles, Filter, X, ChevronDown,
  Layers, Gem, Shield, Coins, AlertTriangle, ArrowRight, CheckCircle2, History
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

const RATE_VARIANTS = [
  {
    key: 'gold22k',
    label: '22K Gold',
    material: 'gold',
    purityBadge: '916 Hallmark',
    subLabel: 'Standard Jewellery Gold',
  },
  {
    key: 'gold24k',
    label: '24K Gold',
    material: 'gold',
    purityBadge: '999 Pure',
    subLabel: 'Pure Gold (Bullion)',
  },
  {
    key: 'gold18k',
    label: '18K Gold',
    material: 'gold',
    purityBadge: '750 Hallmark',
    subLabel: 'Designer & Diamond Jewellery',
  },
  {
    key: 'silver925',
    label: '92.5% Silver',
    material: 'silver',
    purityBadge: 'Sterling 925',
    subLabel: 'Standard Silver Jewellery',
  },
  {
    key: 'silverPremium',
    label: 'Premium Silver',
    material: 'silver',
    purityBadge: 'Gold Coated',
    subLabel: 'Gold-Plated / Antique Silver',
  },
  {
    key: 'silverArticles',
    label: 'Traditional Silver',
    material: 'silver',
    purityBadge: 'Articles & Pooja',
    subLabel: 'Utensils, Lamps & Murthis',
  },
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

  // Gold & Silver Rates Modal & Confirmation States
  const [ratesModalOpen, setRatesModalOpen] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesSaving, setRatesSaving] = useState(false);
  const [ratesMode, setRatesMode] = useState('specific'); // 'specific' | 'all'
  const [selectedRateKey, setSelectedRateKey] = useState('gold22k');
  const [specificNewRate, setSpecificNewRate] = useState('');
  const [loadedRates, setLoadedRates] = useState(null);
  const [editingRates, setEditingRates] = useState({
    gold22k: '',
    gold24k: '',
    gold18k: '',
    silver925: '',
    silverPremium: '',
    silverArticles: '',
  });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [rateChanges, setRateChanges] = useState([]);
  const [ratesError, setRatesError] = useState('');
  const [ratesSuccessMessage, setRatesSuccessMessage] = useState('');

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

  // Open Rates Modal & Load Saved Rates
  const handleOpenRatesModal = async () => {
    setRatesModalOpen(true);
    setRatesLoading(true);
    setRatesError('');
    setConfirmationOpen(false);
    try {
      const res = await fetch('/api/gold-rates');
      const data = await res.json();
      if (data?.rates) {
        setLoadedRates(data.rates);
        const initial = {
          gold22k: data.rates.gold22k !== undefined ? String(data.rates.gold22k) : '',
          gold24k: data.rates.gold24k !== undefined ? String(data.rates.gold24k) : '',
          gold18k: data.rates.gold18k !== undefined ? String(data.rates.gold18k) : '',
          silver925: data.rates.silver925 !== undefined ? String(data.rates.silver925) : '',
          silverPremium: data.rates.silverPremium !== undefined ? String(data.rates.silverPremium) : '',
          silverArticles: data.rates.silverArticles !== undefined ? String(data.rates.silverArticles) : '',
        };
        setEditingRates(initial);
        setSpecificNewRate(initial[selectedRateKey] || '');
      } else {
        setLoadedRates({});
        setEditingRates({
          gold22k: '',
          gold24k: '',
          gold18k: '',
          silver925: '',
          silverPremium: '',
          silverArticles: '',
        });
        setSpecificNewRate('');
      }
    } catch (err) {
      console.error('Failed to load current rates:', err);
      setRatesError('Failed to load daily rates from server.');
    } finally {
      setRatesLoading(false);
    }
  };

  // Switch Selected Variant in Specific Mode
  const handleSelectVariant = (key) => {
    setSelectedRateKey(key);
    setRatesError('');
    const currentVal = editingRates[key] !== '' && editingRates[key] !== undefined
      ? editingRates[key]
      : (loadedRates && loadedRates[key] !== undefined ? String(loadedRates[key]) : '');
    setSpecificNewRate(currentVal);
  };

  // Review Rate Change for Single Specific Variant
  const handleReviewSpecificRate = (e) => {
    e.preventDefault();
    setRatesError('');

    const val = parseFloat(specificNewRate);
    const activeMeta = RATE_VARIANTS.find((v) => v.key === selectedRateKey);
    if (isNaN(val) || val <= 0) {
      setRatesError(`Please enter a valid rate (₹/gram) for ${activeMeta?.label || 'selected variant'}.`);
      return;
    }

    const hasOld = loadedRates && loadedRates[selectedRateKey] !== undefined && loadedRates[selectedRateKey] !== null && loadedRates[selectedRateKey] !== '';
    const oldVal = hasOld ? Number(loadedRates[selectedRateKey]) : null;

    if (oldVal !== null && oldVal === val) {
      setRatesError(`No change detected. The rate is already ₹${formatPrice(val)}/g.`);
      return;
    }

    setRateChanges([
      {
        key: selectedRateKey,
        label: activeMeta?.label || selectedRateKey,
        oldVal,
        newVal: val,
        diff: oldVal !== null ? val - oldVal : null,
      },
    ]);
    setConfirmationOpen(true);
  };

  // Review Rate Changes for All Variants (Batch Mode)
  const handleReviewAllRates = (e) => {
    e.preventDefault();
    setRatesError('');

    for (const item of RATE_VARIANTS) {
      const val = parseFloat(editingRates[item.key]);
      if (isNaN(val) || val <= 0) {
        setRatesError(`Please enter a valid rate for ${item.label}.`);
        return;
      }
    }

    const changes = [];
    for (const item of RATE_VARIANTS) {
      const hasOld = loadedRates && loadedRates[item.key] !== undefined && loadedRates[item.key] !== null && loadedRates[item.key] !== '';
      const oldVal = hasOld ? Number(loadedRates[item.key]) : null;
      const newVal = parseFloat(editingRates[item.key]);
      if (oldVal !== newVal) {
        changes.push({
          key: item.key,
          label: item.label,
          oldVal,
          newVal,
          diff: oldVal !== null ? newVal - oldVal : null,
        });
      }
    }

    if (changes.length === 0) {
      setRatesError('No rate changes detected. Modify at least one rate before saving.');
      return;
    }

    setRateChanges(changes);
    setConfirmationOpen(true);
  };

  // Confirm and Save Rates to Firestore
  const handleConfirmSaveRates = async () => {
    setRatesSaving(true);
    setRatesError('');

    try {
      const payload = {};
      rateChanges.forEach((c) => {
        payload[c.key] = c.newVal;
      });

      const res = await fetch('/api/gold-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update daily rates');
      }

      if (data.rates) {
        setLoadedRates(data.rates);
        const synced = {};
        RATE_VARIANTS.forEach((v) => {
          synced[v.key] = data.rates[v.key] !== undefined ? String(data.rates[v.key]) : '';
        });
        setEditingRates(synced);
        setSpecificNewRate(synced[selectedRateKey] || '');
      }

      setConfirmationOpen(false);
      setRatesModalOpen(false);

      const successMsg = rateChanges.length === 1
        ? `${rateChanges[0].label} rate updated to ₹${formatPrice(rateChanges[0].newVal)}/g! Product prices refreshed.`
        : 'Daily market rates updated successfully! Product prices refreshed.';
      setRatesSuccessMessage(successMsg);

      // Refresh product prices automatically
      await fetchProducts();

      setTimeout(() => {
        setRatesSuccessMessage('');
      }, 4000);
    } catch (err) {
      setRatesError(err.message || 'Error updating daily rates');
    } finally {
      setRatesSaving(false);
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
            {/* Gold/Silver Prices Button */}
            <button
              onClick={handleOpenRatesModal}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Manage daily market gold & silver rates"
            >
              <Coins className="w-4 h-4 text-amber-700" />
              <span>Gold/Silver Prices</span>
            </button>

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

      {/* Floating Success Notification */}
      {ratesSuccessMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-modal-card">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{ratesSuccessMessage}</span>
          <button
            onClick={() => setRatesSuccessMessage('')}
            className="text-white/80 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gold & Silver Daily Rates Modal */}
      {ratesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-modal-backdrop">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-modal-card">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-amber-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
                    Gold & Silver Daily Rates
                  </h2>
                  <p className="text-xs text-gray-500">
                    Centralized rates in ₹ per gram used to auto-price catalog products
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRatesModalOpen(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="pt-4 px-5 sm:px-6 bg-white">
              <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200/80 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setRatesMode('specific');
                    setRatesError('');
                  }}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    ratesMode === 'specific'
                      ? 'bg-white text-gray-900 shadow-xs border border-stone-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select Specific</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRatesMode('all');
                    setRatesError('');
                  }}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    ratesMode === 'all'
                      ? 'bg-white text-gray-900 shadow-xs border border-stone-200'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-gray-600" />
                  <span>Update All</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {ratesLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
                  <span className="text-xs text-gray-500">Loading current market rates...</span>
                </div>
              ) : ratesMode === 'specific' ? (
                /* SPECIFIC VARIANT SELECTION & EDIT MODE */
                <form id="specific-rate-form" onSubmit={handleReviewSpecificRate} className="space-y-5">
                  {ratesError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                      <span>{ratesError}</span>
                    </div>
                  )}

                  {/* Section 1: Visual Rate Selector Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-serif">
                        1. Select Metal Variant to Edit
                      </span>
                      <span className="text-[11px] text-gray-400">Click any card to select</span>
                    </div>

                    {/* Gold Rates Cards */}
                    <div className="mb-3">
                      <span className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider block mb-1.5">
                        Gold Prices
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {RATE_VARIANTS.filter((v) => v.material === 'gold').map((v) => {
                          const isSelected = selectedRateKey === v.key;
                          const currentVal = loadedRates && loadedRates[v.key] !== undefined && loadedRates[v.key] !== null
                            ? Number(loadedRates[v.key])
                            : null;
                          return (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => handleSelectVariant(v.key)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/50 shadow-xs'
                                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-stone-50/60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-serif font-bold text-gray-900 text-sm">
                                  {v.label}
                                </span>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                                    ✓ Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">
                                    {v.purityBadge}
                                  </span>
                                )}
                              </div>
                              <div className="font-mono font-bold text-base text-gray-900">
                                {currentVal !== null ? `${formatPrice(currentVal)}/g` : 'Not set'}
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                                {v.subLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Silver Rates Cards */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Silver Prices
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {RATE_VARIANTS.filter((v) => v.material === 'silver').map((v) => {
                          const isSelected = selectedRateKey === v.key;
                          const currentVal = loadedRates && loadedRates[v.key] !== undefined && loadedRates[v.key] !== null
                            ? Number(loadedRates[v.key])
                            : null;
                          return (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => handleSelectVariant(v.key)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/50 shadow-xs'
                                  : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-stone-50/60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-serif font-bold text-gray-900 text-sm">
                                  {v.label}
                                </span>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                                    ✓ Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">
                                    {v.purityBadge}
                                  </span>
                                )}
                              </div>
                              <div className="font-mono font-bold text-base text-gray-900">
                                {currentVal !== null ? `${formatPrice(currentVal)}/g` : 'Not set'}
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                                {v.subLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Focused Edit Card for Selected Variant */}
                  {(() => {
                    const activeMeta = RATE_VARIANTS.find((v) => v.key === selectedRateKey) || RATE_VARIANTS[0];
                    const activeCurrentVal = loadedRates && loadedRates[selectedRateKey] !== undefined && loadedRates[selectedRateKey] !== null
                      ? Number(loadedRates[selectedRateKey])
                      : null;
                    const newEnteredNum = parseFloat(specificNewRate);
                    const liveDiff = (!isNaN(newEnteredNum) && activeCurrentVal !== null)
                      ? newEnteredNum - activeCurrentVal
                      : null;

                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                              <h3 className="text-sm font-bold text-gray-900 font-serif">
                                Updating: {activeMeta.label}
                              </h3>
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md">
                                {activeMeta.purityBadge}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-500 mt-0.5 block">
                              {activeMeta.subLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-center bg-white px-3 py-1.5 rounded-xl border border-amber-200/80 text-xs font-semibold text-gray-700">
                            <span className="text-gray-400">Current:</span>
                            <span className="font-mono text-gray-900">
                              {activeCurrentVal !== null ? `${formatPrice(activeCurrentVal)}/g` : 'Not set'}
                            </span>
                          </div>
                        </div>

                        {/* Input & Live Difference */}
                        <div>
                          <label className="block text-xs font-bold text-gray-800 mb-1.5">
                            New Rate for {activeMeta.label} (₹ / gram) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-400 pointer-events-none">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={specificNewRate}
                              onChange={(e) => {
                                setSpecificNewRate(e.target.value);
                                setEditingRates((prev) => ({ ...prev, [selectedRateKey]: e.target.value }));
                              }}
                              placeholder={activeCurrentVal ? String(activeCurrentVal) : 'Enter rate'}
                              className="w-full pl-8 pr-14 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                            />
                            <span className="absolute right-3.5 top-3 text-xs font-medium text-gray-400 pointer-events-none">
                              / gram
                            </span>
                          </div>

                          {/* Live Difference Pill */}
                          <div className="mt-2.5 min-h-[20px]">
                            {liveDiff !== null && liveDiff !== 0 && (
                              <div
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                                  liveDiff > 0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span>
                                  {liveDiff > 0 ? `+${formatPrice(liveDiff)}` : `-${formatPrice(Math.abs(liveDiff))}`} /g{' '}
                                  ({activeCurrentVal ? `${((liveDiff / activeCurrentVal) * 100).toFixed(1)}%` : ''})
                                </span>
                              </div>
                            )}
                            {liveDiff === 0 && (
                              <span className="text-[11px] text-gray-400 italic">
                                Entered rate matches current saved rate.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Metadata display */}
                  {loadedRates?.updatedAt && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                      <History className="w-3.5 h-3.5" />
                      <span>
                        Last updated:{' '}
                        {new Date(loadedRates.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {loadedRates.updatedBy ? ` by ${loadedRates.updatedBy}` : ''}
                      </span>
                    </div>
                  )}
                </form>
              ) : (
                /* BATCH / ALL RATES EDIT MODE */
                <form id="all-rates-form" onSubmit={handleReviewAllRates} className="space-y-6">
                  {ratesError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                      <span>{ratesError}</span>
                    </div>
                  )}

                  {/* Section 1: Gold Prices */}
                  <div className="p-4 bg-amber-50/30 border border-amber-200/60 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-serif">
                          Gold Prices (₹ / gram)
                        </h3>
                      </div>
                      <span className="text-[11px] text-amber-900/70">Per 1 Gram</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {RATE_VARIANTS.filter((v) => v.material === 'gold').map((v) => (
                        <div key={v.key}>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                            {v.label} *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400 pointer-events-none">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={editingRates[v.key]}
                              onChange={(e) =>
                                setEditingRates((prev) => ({ ...prev, [v.key]: e.target.value }))
                              }
                              placeholder="0"
                              className="w-full pl-7 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono"
                            />
                            <span className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 pointer-events-none">
                              /g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Silver Prices */}
                  <div className="p-4 bg-gray-50/70 border border-gray-200/70 rounded-2xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 font-serif">
                          Silver Prices (₹ / gram)
                        </h3>
                      </div>
                      <span className="text-[11px] text-gray-500">Per 1 Gram</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {RATE_VARIANTS.filter((v) => v.material === 'silver').map((v) => (
                        <div key={v.key}>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
                            {v.label} *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400 pointer-events-none">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={editingRates[v.key]}
                              onChange={(e) =>
                                setEditingRates((prev) => ({ ...prev, [v.key]: e.target.value }))
                              }
                              placeholder="0"
                              className="w-full pl-7 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-mono"
                            />
                            <span className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 pointer-events-none">
                              /g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata display */}
                  {loadedRates?.updatedAt && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <History className="w-3.5 h-3.5" />
                      <span>
                        Last updated:{' '}
                        {new Date(loadedRates.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {loadedRates.updatedBy ? ` by ${loadedRates.updatedBy}` : ''}
                      </span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setRatesModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {ratesMode === 'specific' ? (
                <button
                  type="submit"
                  form="specific-rate-form"
                  disabled={ratesLoading}
                  className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#A00D24] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#C8102E]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Save {RATE_VARIANTS.find((v) => v.key === selectedRateKey)?.label || 'Rate'}
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  form="all-rates-form"
                  disabled={ratesLoading}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-amber-800/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <span>Save All Rates</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Confirmation Dialog (Saves nothing until explicitly confirmed) */}
      {confirmationOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-modal-backdrop">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-left animate-modal-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight">
                  {rateChanges.length === 1
                    ? `Confirm ${rateChanges[0].label} Rate Update`
                    : 'Confirm Daily Rate Updates'}
                </h3>
                <p className="text-xs text-gray-500">
                  Please review the rate change before saving
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl mb-4 leading-relaxed">
              <strong>Warning:</strong> Updating daily metal rates will automatically recalculate catalogue prices for all matching products in the store and admin panel.
            </div>

            {/* If Single Rate Changed */}
            {rateChanges.length === 1 ? (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-bold text-gray-900 text-sm font-serif">
                    {rateChanges[0].label}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Rate Update
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center bg-white p-3 rounded-xl border border-amber-100">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                      Current Rate
                    </span>
                    <span className="text-sm font-semibold text-gray-700 font-mono">
                      {rateChanges[0].oldVal !== null ? `${formatPrice(rateChanges[0].oldVal)}/g` : 'Not set'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-amber-800 block">
                      New Rate
                    </span>
                    <span className="text-base font-bold text-gray-900 font-mono">
                      {formatPrice(rateChanges[0].newVal)}/g
                    </span>
                    <span
                      className={`block text-[11px] font-bold ${
                        rateChanges[0].diff === null || rateChanges[0].diff >= 0
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {rateChanges[0].diff === null
                        ? 'New rate configured'
                        : rateChanges[0].diff >= 0
                        ? `+${formatPrice(rateChanges[0].diff)} /g`
                        : `-${formatPrice(Math.abs(rateChanges[0].diff))} /g`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* If Multiple Rates Changed (Batch Mode) */
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-5">
                <div className="bg-gray-50 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 grid grid-cols-3">
                  <span>Metal Variant</span>
                  <span className="text-center">Current</span>
                  <span className="text-right">New Rate</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                  {rateChanges.map((change) => (
                    <div key={change.key} className="px-3.5 py-2.5 text-xs grid grid-cols-3 items-center">
                      <span className="font-medium text-gray-800">{change.label}</span>
                      <span className="text-gray-500 text-center font-mono">
                        {change.oldVal !== null ? `${formatPrice(change.oldVal)}/g` : 'Not set'}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 font-mono">{formatPrice(change.newVal)}/g</span>
                        <span
                          className={`block text-[10px] font-semibold ${
                            change.diff === null || change.diff >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {change.diff === null
                            ? 'New rate'
                            : change.diff >= 0
                            ? `+${formatPrice(change.diff)}`
                            : `-${formatPrice(Math.abs(change.diff))}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={ratesSaving}
                onClick={() => setConfirmationOpen(false)}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                disabled={ratesSaving}
                onClick={handleConfirmSaveRates}
                className="px-5 py-2.5 bg-[#C8102E] hover:bg-[#A00D24] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-[#C8102E]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {ratesSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Applying Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {rateChanges.length === 1
                        ? `Confirm & Update ${rateChanges[0].label}`
                        : 'Confirm & Update Rates'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
