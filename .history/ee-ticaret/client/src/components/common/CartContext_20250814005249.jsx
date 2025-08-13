// src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/axios'; // axios instance

export const CartContext = createContext();
console.log("İstek URL'si:", `${api.defaults.baseURL}/add/basket`);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      let localCart = JSON.parse(localStorage.getItem('cart')) || [];

      if (token) {
        try {
          const { data } = await api.put('/show/basket'); // backend sepet verisi
          const merged = [...data.items];

          // Local ve backend sepetini merge et
          localCart.forEach((lcItem) => {
            const exists = merged.find((bItem) => bItem.id === lcItem.id);
            if (!exists) merged.push(lcItem);
          });

          setCartItems(merged);
          localStorage.setItem('cart', JSON.stringify(merged));
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


  // Sepete ürün ekle (hibrit: hem local hem backend)
  const addToCart = async (product) => {
    const normalizedProduct = {
      ...product,
      id: product.product_id || product._id || product.id,
    };
    console.log(
      "İstek URL'si:",
      `${api.defaults.baseURL}/add/basket`
    );

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

  const decreaseQuantity = async (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/update/basket', { productId: id, change: -1 });
      } catch (error) {
        console.error('Adet azaltma API hatası:', error);
      }
    }
  };

  const increaseQuantity = async (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/update/basket', { productId: id, change: 1 });
      } catch (error) {
        console.error('Adet artırma API hatası:', error);
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
