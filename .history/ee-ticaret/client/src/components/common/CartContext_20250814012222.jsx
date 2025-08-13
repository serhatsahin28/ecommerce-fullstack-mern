// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // localStorage'ı her cartItems değişiminde güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      let localCart = JSON.parse(localStorage.getItem('cart')) || [];

      if (token) {
        try {
          const { data } = await api.get('/show/basket');
          let merged = data.items.map(item => ({
            id: item.id || item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }));

          // Local ile merge, quantity toplama
          localCart.forEach(lcItem => {
            const exists = merged.find(m => m.id === lcItem.id);
            if (exists) {
              exists.quantity += lcItem.quantity;
            } else {
              merged.push(lcItem);
            }
          });

          setCartItems(merged);
        } catch (error) {
          console.error('Backend sepet yüklenemedi:', error);
          setCartItems(localCart);
        }
      } else {
        setCartItems(localCart);
      }
    };

    fetchCart();
  }, []);

  // Sepete ürün ekle
  const addToCart = async (product) => {
    const normalizedProduct = {
      ...product,
      id: product._id || product.productId || product.id,
    };

    console.log('Normalized product:', normalizedProduct); // Debug için

    // State'i güncelle
    setCartItems(prev => {
      const exists = prev.find(i => i.id === normalizedProduct.id);
      
      if (exists) {
        return prev.map(i =>
          i.id === normalizedProduct.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...normalizedProduct, quantity: 1 }];
      }
    });

    // Backend'e gönder
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Backend\'e gönderilecek data:', { 
          productId: normalizedProduct.id, 
          quantity: 1 
        }); // Debug için
        
        await api.put('/add/basket', { 
          productId: normalizedProduct.id, 
          quantity: 1 
        });
        console.log('Backend başarılı');
      } catch (error) {
        console.error('Sepet API hatası:', error);
        console.error('Error response:', error.response?.data); // Detaylı hata
      }
    }
  };

  const removeFromCart = async (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/remove/basket', { productId: id });
      } catch (error) {
        console.error('Sepetten çıkarma API hatası:', error);
      }
    }
  };

  const updateQuantity = async (id, change) => {
    setCartItems(prev => 
      prev
        .map(i => (i.id === id ? { ...i, quantity: i.quantity + change } : i))
        .filter(i => i.quantity > 0)
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/update/basket', { productId: id, change });
      } catch (error) {
        console.error('Adet güncelleme API hatası:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.delete('/clear/basket');
      } catch (error) {
        console.error('Sepeti temizleme API hatası:', error);
      }
    }
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity: (id) => updateQuantity(id, 1),
        decreaseQuantity: (id) => updateQuantity(id, -1),
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};