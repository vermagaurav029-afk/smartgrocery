// pages/CartPage.jsx
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, loading } = useCart();

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"/></div>;

  if (!cartItems.length) return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add groceries to compare prices across platforms.</p>
      <Link to="/search" className="inline-block bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors text-sm font-medium">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
        <span className="text-sm text-gray-400">{cartItems.length} items</span>
      </div>

      <div className="space-y-3 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <img src={item.product?.image_url || "https://via.placeholder.com/48"} alt={item.product?.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{item.product?.name}</div>
              <div className="text-xs text-gray-400">{item.product?.brand} · {item.product?.unit}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Minus size={12} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Plus size={12} />
              </button>
              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors ml-1">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link to="/compare" className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3.5 rounded-xl hover:bg-green-600 transition-colors font-semibold">
        Compare Prices Now <ArrowRight size={16} />
      </Link>
    </div>
  );
}
