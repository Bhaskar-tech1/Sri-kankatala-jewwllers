/**
 * Sri Kankatala Jewellers — Data Access Layer
 * Provides reusable functions to query product data.
 * In Phase 2, these will be replaced with Firestore queries.
 */

import products from '@/data/products';

/**
 * Get all products.
 */
export function getAllProducts() {
  return products;
}

/**
 * Get products filtered by material and audience.
 */
export function getProductsByRoute(material, audience) {
  return products.filter((p) => {
    if (material && material !== 'all' && p.material !== material) return false;
    if (audience && audience !== 'all' && p.audience !== audience) return false;
    return true;
  });
}

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getCentralizedRates, calculateProductPrice } from '@/lib/pricing';

/**
 * Get a single product by its slug (checks static products then Firestore).
 */
export async function getProductBySlug(slug) {
  // Try static first
  const staticFound = products.find((p) => p.slug === slug);
  if (staticFound) return staticFound;

  // Query Firestore
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const p = { id: docSnap.id, ...docSnap.data() };
      if (p.weightGrams && p.makingChargeValue !== undefined) {
        const rates = await getCentralizedRates();
        const dynamicPrice = calculateProductPrice({
          weightGrams: p.weightGrams,
          material: p.material,
          purity: p.purity,
          makingChargeType: p.makingChargeType,
          makingChargeValue: p.makingChargeValue,
          extraAmount: p.extraAmount || 0,
          rates,
        });
        if (dynamicPrice > 0) p.price = dynamicPrice;
      }
      return p;
    }
  } catch (err) {
    console.warn('Firestore getProductBySlug error:', err);
  }

  return null;
}

/**
 * Get featured products, optionally limited.
 */
export function getFeaturedProducts(limit) {
  const featured = products.filter((p) => p.featured && p.stockStatus === 'in_stock');
  return limit ? featured.slice(0, limit) : featured;
}

/**
 * Get related products — same material + category, excluding the current product.
 */
export function getRelatedProducts(product, limit = 4) {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.material === product.material &&
        p.category === product.category &&
        p.stockStatus === 'in_stock'
    )
    .slice(0, limit);
}

/**
 * Get all unique categories for a given material and audience.
 */
export function getCategories(material, audience) {
  const filtered = getProductsByRoute(material, audience);
  const cats = [...new Set(filtered.map((p) => p.category))];
  return cats.sort();
}

/**
 * Get all unique categories across all products.
 */
export function getAllCategories() {
  return [...new Set(products.map((p) => p.category))].sort();
}

/**
 * Get price range for a given material and audience.
 */
export function getPriceRange(material, audience) {
  const filtered = getProductsByRoute(material, audience);
  if (filtered.length === 0) return { min: 0, max: 0 };
  const prices = filtered.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * Get weight range for a given material and audience.
 */
export function getWeightRange(material, audience) {
  const filtered = getProductsByRoute(material, audience);
  if (filtered.length === 0) return { min: 0, max: 0 };
  const weights = filtered.map((p) => p.weightGrams);
  return { min: Math.min(...weights), max: Math.max(...weights) };
}

/**
 * Get unique purity options for a given material and audience.
 */
export function getPurityOptions(material, audience) {
  const filtered = getProductsByRoute(material, audience);
  return [...new Set(filtered.map((p) => p.purity))].sort();
}

/**
 * Filter and sort products.
 */
export function filterAndSortProducts(productList, filters = {}, sortBy = 'featured') {
  let result = [...productList];

  // Material filter
  if (filters.material && filters.material !== 'all') {
    if (Array.isArray(filters.material)) {
      if (filters.material.length > 0) {
        result = result.filter((p) => filters.material.includes(p.material));
      }
    } else {
      result = result.filter((p) => p.material === filters.material);
    }
  }

  // Audience filter
  if (filters.audience && filters.audience !== 'all') {
    if (Array.isArray(filters.audience)) {
      if (filters.audience.length > 0) {
        result = result.filter((p) => filters.audience.includes(p.audience));
      }
    } else {
      result = result.filter((p) => p.audience === filters.audience);
    }
  }

  // Category filter
  if (filters.category) {
    const matchCat = (pCat, fCat) => {
      if (!pCat || !fCat) return false;
      const p = pCat.toLowerCase().trim();
      const f = fCat.toLowerCase().trim();
      if (p === f) return true;
      if (p.replace(/s$/, '') === f.replace(/s$/, '')) return true;
      const clean = (str) => str.replace(/s$/, '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const fRegex = new RegExp('\\b' + clean(f) + '(?:s)?\\b', 'i');
      const pRegex = new RegExp('\\b' + clean(p) + '(?:s)?\\b', 'i');
      return fRegex.test(p) || pRegex.test(f);
    };

    if (Array.isArray(filters.category)) {
      if (filters.category.length > 0) {
        result = result.filter((p) =>
          filters.category.some((cat) => matchCat(p.category, cat))
        );
      }
    } else {
      result = result.filter((p) => matchCat(p.category, filters.category));
    }
  }

  // Price range
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    result = result.filter((p) => p.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    result = result.filter((p) => p.price <= filters.maxPrice);
  }

  // Weight range
  if (filters.minWeight !== undefined && filters.minWeight !== null) {
    result = result.filter((p) => p.weightGrams >= filters.minWeight);
  }
  if (filters.maxWeight !== undefined && filters.maxWeight !== null) {
    result = result.filter((p) => p.weightGrams <= filters.maxWeight);
  }

  // Purity
  if (filters.purity) {
    result = result.filter((p) => p.purity === filters.purity);
  }

  // Stock availability
  if (filters.inStockOnly) {
    result = result.filter((p) => p.stockStatus === 'in_stock');
  }

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
    );
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return result;
}
