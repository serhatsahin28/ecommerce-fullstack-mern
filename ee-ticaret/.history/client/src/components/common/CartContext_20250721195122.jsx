// src/context/CartContext.js

import React, { createContext, useState, useEffect } from 'react';

// 1. Context nesnesi oluşturuluyor
export const CartContext = createContext();

// 2. Provider bileşeni tanımlanıyor
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // 3. Sepet her değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 4. Sepete ürün ekle
  const addToCart = (product) => {
    const normalizedProduct = {
      ...product,
      id: product._id || product.id, // _id varsa id olarak kullan
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === normalizedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...normalizedProduct, quantity: 1 }];
    });
  };

  // 5. Sepetten ürün çıkar
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 6. Ürün adedini azalt (0 olursa sil)
  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 7. Ürün adedini artır
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // 8. Tüm sepeti temizle
  const clearCart = () => {
    setCartItems([]);
  };

  // 9. Toplam ürün adedi
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        increaseQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
