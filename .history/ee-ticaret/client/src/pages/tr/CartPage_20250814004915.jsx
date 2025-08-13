// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Sepeti initialize et (local + backend)
  useEffect(() => {
    const fetchCart = async () => {
      let localCart = JSON.parse(localStorage.getItem('cart')) || [];

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/get/basket'); // backend’den sepet verisi
          // Local ve backend sepetini birleştir
          const merged = [...data.items];
          localCart.forEach((lcItem) => {
            const exists = merged.find((bItem) => bItem.id === lcItem.id);
            if (!exists) merged.push(lcItem);
          });
          setCartItems(merged);
          localStorage.setItem('cart', JSON.stringify(merged));
        } catch (err) {
          console.error('Sepet yüklenemedi:', err);
          setCartItems(localCart);
        }
      } else {
        setCartItems(localCart);
      }
    };

    fetchCart();
  }, []);

  // Sepeti localStorage ve backend ile güncelleme fonksiyonları
  const addToCart = async (product) => {
    const normalizedProduct = {
      ...product,
      id: product.product_id || product._id || product.id,
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

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/add/basket', {
          productId: normalizedProduct.id,
          quantity: 1,
        });
      } catch (error) {
        console.error('Sepet API hatası:', error);
      }
    }
  };

  const removeFromCart = async (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/remove/basket', { productId: id });
      } catch (error) {
        console.error('Sepetten çıkarma API hatası:', error);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
