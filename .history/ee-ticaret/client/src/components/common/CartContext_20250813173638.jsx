// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/axios'; // axios instance

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sepete ürün ekle
  const addToCart = async (product) => {
    const normalizedProduct = {
      ...product,
      id: product.product_id || product._id || product.id,
    };

    console.log("📦 Sepet API isteği:", `${api.defaults.baseURL}/add/basket`);

    // Local state güncelle
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

    // Kullanıcı login ise backend'e gönder
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.put('/add/basket', {
        productId: normalizedProduct.id,
        quantity: 1,
      });
      console.log("✅ Sepet güncellendi:", response.data);
    } catch (error) {
      console.error('❌ Sepet API hatası:', error.message, error);
    }
  };

  const removeFromCart = async (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.put('/remove/basket', { productId: id });
    } catch (error) {
      console.error('❌ Sepetten çıkarma API hatası:', error.message);
    }
  };

  const decreaseQuantity = async (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.put('/update/basket', { productId: id, change: -1 });
    } catch (error) {
      console.error('❌ Adet azaltma API hatası:', error.message);
    }
  };

  const increaseQuantity = async (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.put('/update/basket', { productId: id, change: 1 });
    } catch (error) {
      console.error('❌ Adet artırma API hatası:', error.message);
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.delete('/clear/basket');
    } catch (error) {
      console.error('❌ Sepeti temizleme API hatası:', error.message);
    }
  };

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
