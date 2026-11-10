import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurant: string;
  isVeg: boolean;
  isExtra?: boolean;
  mealSlot?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (!storedCart) return [];
      const parsed = JSON.parse(storedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(Array.isArray(items) ? items : []));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const safeItems = Array.isArray(items) ? items : [];

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? prevItems : [];
      const existingIndex = list.findIndex(i => String(i.id) === String(item.id));
      if (existingIndex > -1) {
        return list.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: (Number(i.quantity) || 1) + qty } : i
        );
      }
      return [...list, { ...item, id: String(item.id), price: Number(item.price) || 0, quantity: qty }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? prevItems : [];
      return list.map(item =>
        String(item.id) === String(id) ? { ...item, quantity } : item
      );
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? prevItems : [];
      return list.filter(item => String(item.id) !== String(id));
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = safeItems.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0);
  const totalItems = safeItems.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);

  return (
    <CartContext.Provider value={{
      items: safeItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};