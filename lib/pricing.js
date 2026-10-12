import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Sri Kankatala Jewellers — Centralized Pricing Engine
 * Handles daily market gold/silver rates and product price calculations.
 */

export const DEFAULT_RATES = {
  gold24k: 7400, // ₹ per gram (24K Pure Gold)
  gold22k: 6800, // ₹ per gram (22K 916 BIS Hallmark)
  gold18k: 5550, // ₹ per gram (18K Designer Gold)
  silver925: 95, // ₹ per gram (92.5% Sterling Silver)
  silverPremium: 110, // ₹ per gram (Premium Gold Coated Silver)
  silverPure: 100, // ₹ per gram (99.9 Pure Silver)
  silverArticles: 90, // ₹ per gram (Traditional Silver)
  updatedAt: new Date().toISOString(),
};

/**
 * Resolve rate per gram based on material and purity.
 */
export function getRatePerGram(material, purity, rates = DEFAULT_RATES) {
  const mat = (material || 'gold').toLowerCase();
  const pur = (purity || '').toUpperCase();
  const activeRates = { ...DEFAULT_RATES, ...(rates || {}) };

  if (mat === 'silver') {
    if (pur.includes('PREMIUM') || pur.includes('COATED')) return Number(activeRates.silverPremium) || 110;
    if (pur.includes('92.5') || pur.includes('STERLING')) return Number(activeRates.silver925) || 95;
    if (pur.includes('99.9') || pur.includes('PURE')) return Number(activeRates.silverPure) || 100;
    return Number(activeRates.silverArticles) || 90;
  }

  // Gold
  if (pur.includes('24K')) return Number(activeRates.gold24k) || 7400;
  if (pur.includes('18K')) return Number(activeRates.gold18k) || 5550;
  // Default to 22K (916 BIS Hallmark)
  return Number(activeRates.gold22k) || 6800;
}

/**
 * Calculate total product price:
 * Base Metal Value = weightGrams * ratePerGram
 * Making Charges:
 *  - Percentage (%): Base Metal Value * (makingChargeValue / 100)
 *  - Milligrams (mg/g): (weightGrams * (makingChargeValue / 1000)) * ratePerGram
 */
export function calculateProductPrice({
  weightGrams = 0,
  material = 'gold',
  purity = '22K',
  makingChargeType = 'percentage',
  makingChargeValue = 0,
  extraAmount = 0,
  rates = DEFAULT_RATES,
}) {
  const weight = Number(weightGrams) || 0;
  if (weight <= 0) return 0;

  const ratePerGram = getRatePerGram(material, purity, rates);
  const baseMetalValue = weight * ratePerGram;

  let makingChargeAmount = 0;
  const mcVal = Number(makingChargeValue) || 0;

  if (makingChargeType === 'milligrams') {
    // e.g. 150 mg per gram wastage/making
    const extraWeightGrams = weight * (mcVal / 1000);
    makingChargeAmount = extraWeightGrams * ratePerGram;
  } else {
    // e.g. 12% making charge
    makingChargeAmount = baseMetalValue * (mcVal / 100);
  }

  const extra = Number(extraAmount) || 0;
  return Math.round(baseMetalValue + makingChargeAmount + extra);
}

/**
 * Fetch centralized rates from Firestore settings/goldRates document,
 * with fallback to DEFAULT_RATES.
 */
export async function getCentralizedRates() {
  try {
    const docRef = doc(db, 'settings', 'goldRates');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_RATES, ...snap.data() };
    }
  } catch (err) {
    console.warn('Could not fetch centralized gold rates from Firestore:', err.message);
  }
  return DEFAULT_RATES;
}

/**
 * Save centralized rates to Firestore settings/goldRates document.
 */
export async function saveCentralizedRates(rates) {
  const docRef = doc(db, 'settings', 'goldRates');
  const payload = {
    ...DEFAULT_RATES,
    ...rates,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, payload, { merge: true });
  return payload;
}
