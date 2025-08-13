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

  // Sepeti backend ile senkronize et
  const syncCartWithBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Backend'ten sepeti al
      const { data } = await api.get('/show/basket');
      const backendItems = data.items.map(item => ({
        id: item.id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Local sepetteki ürünleri backend'e ekle
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      for (const localItem of localCart) {
        const existsInBackend = backendItems.find(b => b.id === localItem.id);
        
        if (!existsInBackend) {
          try {
            await api.put('/add/basket', { 
              productId: localItem.id, 
              quantity: localItem.quantity 
            });
            console.log(`Local ürün backend'e eklendi: ${localItem.id}`);
          } catch (error) {
            console.warn(`Ürün backend'e eklenemedi (muhtemelen silinmiş): ${localItem.id}`);
          }
        } else if (existsInBackend.quantity !== localItem.quantity) {
          // Quantity farkı varsa güncelle
          const diff = localItem.quantity - existsInBackend.quantity;
          try {
            await api.put('/update/basket', { 
              productId: localItem.id, 
              change: diff 
            });
            console.log(`Quantity güncellendi: ${localItem.id}`);
          } catch (error) {
            console.warn(`Quantity güncellenemedi: ${localItem.id}`);
          }
        }
      }

      // Final sepeti al ve state'i güncelle
      const finalResponse = await api.get('/show/basket');
      const finalItems = finalResponse.data.items.map(item => ({
        id: item.id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      setCartItems(finalItems);
    } catch (error) {
      console.error('Sepet senkronizasyonu başarısız:', error);
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      const token = localStorage.getItem('token');
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];

      if (token) {
        await syncCartWithBackend();
      } else {
        setCartItems(localCart);
      }
    };

    initializeCart();
  }, []);

  // Sepete ürün ekle
  const addToCart = async (product) => {
    console.log('Sepete eklenen ürün:', product);

    const normalizedProduct = {
      ...product,
      id: product._id || product.productId || product.id || product.product_id,
    };

    console.log('Normalized product:', normalizedProduct);

    // Önce local state'i güncelle (optimistic update)
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
        });
        
        await api.put('/add/basket', { 
          productId: normalizedProduct.id, 
          quantity: 1 
        });
        
        console.log('Backend başarılı');
        
        // Backend başarılı olduysa, güncel sepeti al
        const { data } = await api.get('/show/basket');
        const updatedItems = data.items.map(item => ({
          id: item.id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));
        
        setCartItems(updatedItems);
        
      } catch (error) {
        console.error('Sepet API hatası:', error);
        console.error('Error response:', error.response?.data);
        
        if (error.response?.status === 404) {
          console.warn('Ürün backend\'te bulunamadı, sadece local sepette tutulacak');
        } else {
          // Diğer hatalar için state'i geri al
          setCartItems(prev => {
            const exists = prev.find(i => i.id === normalizedProduct.id);
            if (exists && exists.quantity === 1) {
              return prev.filter(i => i.id !== normalizedProduct.id);
            } else if (exists) {
              return prev.map(i =>
                i.id === normalizedProduct.id
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              );
            }
            return prev;
          });
        }
      }
    } else {
      console.log('Token yok, sadece local sepette tutuldu');
    }
  };

  const updateQuantity = async (id, change) => {
    console.log('updateQuantity called:', { id, change });

    // Önce local state'i güncelle
    setCartItems(prev => 
      prev
        .map(i => (i.id === id ? { ...i, quantity: i.quantity + change } : i))
        .filter(i => i.quantity > 0)
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Sending to backend:', { productId: id, change });
        
        await api.put('/update/basket', { 
          productId: id, 
          change 
        });
        
        console.log('Backend update successful');
      } catch (error) {
        console.error('Adet güncelleme API hatası:', error);
        console.error('Error details:', error.response?.data);
        
        if (error.response?.status === 404) {
          console.warn('Ürün sadece local sepette var, backend güncellemesi atlandı');
          return;
        }
        
        // Diğer hatalar için state'i geri al
        setCartItems(prev => 
          prev.map(i => (i.id === id ? { ...i, quantity: i.quantity - change } : i))
        );
      }
    }
  };

  const removeFromCart = async (id) => {
    console.log('removeFromCart called with id:', id);
    
    // Önce local state'ten kaldır
    setCartItems(prev => prev.filter(i => i.id !== id));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/remove/basket', { 
          productId: id 
        });
        console.log('Backend\'ten başarıyla kaldırıldı');
      } catch (error) {
        console.error('Sepetten çıkarma API hatası:', error);
        console.error('Error response:', error.response?.data);
        
        if (error.response?.status === 404) {
          console.warn('Ürün zaten backend sepetinde yoktu, sadece local\'den kaldırıldı');
          return;
        }
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
        syncCartWithBackend, // Manuel senkronizasyon için
      }}
    >
      {children}
    </CartContext.Provider>
  );
};