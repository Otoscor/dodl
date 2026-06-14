"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CartContextType {
  count: number;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({ count: 0, refresh: async () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCount(data.item_count || 0);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CartContext.Provider value={{ count, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
