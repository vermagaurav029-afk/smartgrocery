// pages/PlannerPage.jsx — AI Grocery Planner
import { useState } from "react";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";

export default function PlannerPage() {
  const [form, setForm]     = useState({ family_size: 2, monthly_budget: 3000, food_preference: "vegetarian", shopping_frequency: "weekly" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api.post("/planner/generate", form);
      setResult(r.data);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-purple-500" size={22} />
        <h1 className="text-2xl font-bold text-gray-900">AI Grocery Planner</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">Tell us about your family and we'll generate a smart grocery list with price comparison.</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Family size</label>
            <input type="number" min="1" max="12" value={form.family_size} onChange={e => setForm({...form, family_size: +e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Monthly grocery budget (₹)</label>
            <input type="number" value={form.monthly_budget} onChange={e => setForm({...form, monthly_budget: +e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Food preference</label>
            <select value={form.food_preference} onChange={e => setForm({...form, food_preference: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400">
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Shopping frequency</label>
            <select value={form.shopping_frequency} onChange={e => setForm({...form, shopping_frequency: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={loading}
          className="mt-5 flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 transition-colors font-medium text-sm disabled:opacity-50">
          {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={16} />}
          Generate My Grocery List
        </button>
      </div>

      {result && (
        <div>
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${result.within_budget ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
            <div className={`text-2xl font-bold ${result.within_budget ? "text-green-600" : "text-amber-600"}`}>₹{result.estimated_total}</div>
            <div>
              <div className={`font-medium text-sm ${result.within_budget ? "text-green-700" : "text-amber-700"}`}>
                {result.within_budget ? "Within budget ✓" : "Over budget — consider removing items"}
              </div>
              <div className="text-xs text-gray-500">Estimated total · Budget: ₹{form.monthly_budget}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-medium text-gray-900 text-sm">{result.recommended_list.length} recommended items</span>
              <button onClick={() => result.recommended_list.forEach(i => addToCart(i.product_id))}
                className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">
                <Plus size={12} /> Add All to Cart
              </button>
            </div>
            {result.recommended_list.map(item => (
              <div key={item.product_id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.brand} · ×{item.recommended_qty} · {item.category}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-green-600 font-semibold text-sm">₹{item.min_price}</div>
                  <button onClick={() => addToCart(item.product_id)} className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
