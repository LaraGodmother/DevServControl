import React, { createContext, useContext, useState } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Kit de Tomadas USB", description: "Kit com 5 tomadas duplas USB + padrão ABNT", price: 89.90, category: "Elétrica", active: true },
  { id: "2", name: "Câmera IP HD", description: "Câmera de segurança 1080p com visão noturna", price: 249.90, category: "CFTV", active: true },
  { id: "3", name: "Sensor de Presença", description: "Sensor de movimento para automação 180°", price: 45.00, category: "Automação", active: true },
  { id: "4", name: "Filtro de Ar Split", description: "Filtro de ar condicionado universal lavável", price: 29.90, category: "Refrigeração", active: true },
  { id: "5", name: "Disjuntor Bipolar 40A", description: "Disjuntor residencial bipolar 40A", price: 38.00, category: "Elétrica", active: true },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <StoreContext.Provider value={{ products, cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
