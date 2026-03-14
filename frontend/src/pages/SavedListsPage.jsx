// pages/SavedListsPage.jsx
import { useEffect, useState } from "react";
import { BookMarked, Plus, Trash2, ShoppingCart } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";

export default function SavedListsPage() {
  const [lists, setLists]   = useState([]);
  const [name, setName]     = useState("");
  const { addToCart }       = useCart();

  useEffect(() => { fetchLists(); }, []);

  const fetchLists = () => api.get("/cart/saved-lists").then(r => setLists(r.data)).catch(() => setLists([]));

  const createList = async () => {
    if (!name.trim()) return;
    await api.post("/cart/saved-lists", { name }).catch(() => {});
    setName("");
    fetchLists();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Lists</h1>

      {/* Create list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Create New List</h2>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Weekly Groceries, Monthly Essentials..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" />
          <button onClick={createList}
            className="bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 flex items-center gap-1">
            <Plus size={15} /> Create
          </button>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
          <div className="font-medium">No saved lists yet</div>
          <div className="text-sm mt-1">Create a list above to save and reuse your grocery sets.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map(list => (
            <div key={list.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{list.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{list.items?.length || 0} items</div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100">
                    <ShoppingCart size={12} /> Load to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
