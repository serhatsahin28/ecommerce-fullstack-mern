// src/components/common/CartContext.js
import React, { createContext, useState, useEffect } from 'react';

// 1. Context nesnesini oluştur
export const CartContext = createContext();

// 2. Provider bileşeni
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // 3. LocalStorage güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 4. Sepete ürün ekle
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // 5. Sepetten ürün sil
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 6. Adet azalt (ve 0 olursa sil)
 const decreaseQuantity = (id) => {
  setCartItems((prev) =>
    prev
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0)
  );
};
const increaseQuantity = (id) => {
  setCartItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    )
  );
};
  // 7. Tümünü temizle
  const clearCart = () => {
    setCartItems([]);
  };
const removeFromCart = (id) => {
  setCartItems((prev) => prev.filter((item) => item.id !== id));
};
  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, decreaseQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
