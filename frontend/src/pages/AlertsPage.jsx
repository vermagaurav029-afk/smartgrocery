// pages/AlertsPage.jsx
import { useEffect, useState } from "react";
import { Bell, Trash2, Plus } from "lucide-react";
import api from "../lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", target_price: "" });

  useEffect(() => {
    api.get("/alerts").then(r => setAlerts(r.data));
    api.get("/products", { params: { limit: 50 } }).then(r => setProducts(r.data.results));
  }, []);

  const create = async () => {
    if (!form.product_id || !form.target_price) return;
    await api.post("/alerts", { product_id: +form.product_id, target_price: +form.target_price });
    setForm({ product_id: "", target_price: "" });
    api.get("/alerts").then(r => setAlerts(r.data));
  };

  const del = async (id) => {
    await api.delete(`/alerts/${id}`);
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Price Alerts</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Create New Alert</h2>
        <div className="flex gap-2 flex-wrap">
          <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400">
            <option value="">Select product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
          </select>
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3">
            <span className="text-gray-400 text-sm">₹</span>
            <input type="number" placeholder="Target price" value={form.target_price}
              onChange={e => setForm({...form, target_price: e.target.value})}
              className="w-28 py-2.5 text-sm outline-none" />
          </div>
          <button onClick={create} className="bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1">
            <Plus size={15} /> Add Alert
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Bell size={36} className="mx-auto mb-3 opacity-30" />
            <div>No alerts yet. Create one above to get notified on price drops.</div>
          </div>
        )}
        {alerts.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border p-4 flex items-center justify-between ${a.triggered ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
            <div>
              <div className="font-medium text-gray-900 text-sm">{a.product_name}</div>
              <div className="text-xs text-gray-400 mt-0.5">Alert at ₹{a.target_price}</div>
              {a.triggered && <div className="text-xs text-green-600 font-medium mt-1">✓ Alert triggered!</div>}
            </div>
            <button onClick={() => del(a.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
