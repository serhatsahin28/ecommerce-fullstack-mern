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

  // 4. Sepete ürün ekle (id normalize edilir)
  const addToCart = (product) => {
    const normalizedProduct = {
      ...product,
      id: product._id || product.id, // _id varsa id olarak ata
    };

    console.log("product",producr);
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

  // 5. Sepetten ürün sil
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id === id ? false : true));
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

  // 7. Adet artır
  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // 8. Tümünü temizle
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        increaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
