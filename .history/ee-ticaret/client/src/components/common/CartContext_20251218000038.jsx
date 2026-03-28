import React, { createContext, useState, useEffect } from 'react';
import api from '../../utils/axios';
import { useLocation, useNavigate } from 'react-router-dom';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [cartError, setCartError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // URL'den dil kodunu çek
  const lng = location.pathname.split('/')[1] || 'en';

  // localStorage'ı her cartItems değişiminde güncelle
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Context içinde
  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];

    setCartItems(localCart);

    if (token) {
      try {
        const { data } = await api.get('/show/basket');
        const backendCart = data.items.map(item => ({
          id: item.id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }));

        const itemsToAdd = localCart.filter(localItem =>
          !backendCart.some(bItem => bItem.id === localItem.id)
        );

        for (const item of itemsToAdd) {
          await api.put('/add/basket', {
            productId: item.id,
            quantity: item.quantity
          });
        }

        setCartItems([...backendCart, ...itemsToAdd]);
        localStorage.removeItem('cart');
      } catch (error) {
        // console.error(error);
      }
    }
  };

  // useEffect sadece ilk yüklemede çalışır
  useEffect(() => {
    fetchCart();
  }, [location.pathname]);


  const addToCart = async (product) => {
    const normalizedProduct = {
      ...product,
      id: product._id || product.productId || product.id || product.product_id,
    };

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

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/add/basket', {
          productId: normalizedProduct.id,
          quantity: 1
        });
      } catch (error) {
        // console.error('Sepet API hatası:', error);
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
  const token = localStorage.getItem('token');
  setCartError(null);

  if (!token) {
    setCartItems(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, quantity: i.quantity + change } : i
        )
        .filter(i => i.quantity > 0)
    );
    return;
  }

  try {
    await api.put('/update/basket', { productId: id, change });

    setCartItems(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, quantity: i.quantity + change } : i
        )
        .filter(i => i.quantity > 0)
    );
  } catch (error) {
    const message =
      error.response?.data?.message || 'Stokta yeterli ürün yok';

    setCartError(message);

    // 3 saniye sonra kaybolsun (isteğe bağlı)
    setTimeout(() => setCartError(null), 3000);
  }
};



  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cart');

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.delete('/clear/basket');
      } catch (error) {
        console.error('Sepeti temizleme API hatası:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCartItems([]);
    localStorage.removeItem('cart');
    navigate(`/${lng}/login`);
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartError,  
      addToCart,
      removeFromCart,
      increaseQuantity: (id) => updateQuantity(id, 1),
      decreaseQuantity: (id) => updateQuantity(id, -1),
      clearCart,
      totalItems,
      handleLogout,
      fetchCart, // burası önemli
    }}>

      {children}
    </CartContext.Provider>
  );
};
