// context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user }              = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await api.get("/cart");
      setCartItems(r.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return;
    await api.post("/cart/add", { product_id: productId, quantity });
    await fetchCart();
  };

  const removeFromCart = async (itemId) => {
    await api.delete(`/cart/item/${itemId}`);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQty = async (itemId, qty) => {
    await api.put(`/cart/item/${itemId}`, null, { params: { qty } });
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    }
  };

  const clearCart = async () => {
    await api.delete("/cart/clear");
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, loading, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
