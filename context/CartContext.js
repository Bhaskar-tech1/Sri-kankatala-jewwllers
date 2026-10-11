'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'skj_cart';

/**
 * Read cart from localStorage safely.
 */
function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each item has at minimum an id and quantity
    return parsed.filter(
      (item) => item && typeof item.id === 'string' && typeof item.quantity === 'number' && item.quantity > 0
    );
  } catch {
    return [];
  }
}

/**
 * Write cart to localStorage.
 */
function saveCart(cart) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = loadCart();
    setCart(stored);
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on every change (after initial hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCart(cart);
    }
  }, [cart, isHydrated]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || product.stockStatus === 'out_of_stock') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          material: product.material,
          purity: product.purity,
          weightGrams: product.weightGrams,
          image: product.images?.[0] || '',
          quantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const isInCart = useCallback(
    (productId) => {
      return cart.some((item) => item.id === productId);
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isHydrated,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
