// pages/AdminPage.jsx — Admin Dashboard
import { useEffect, useState } from "react";
import { Users, Package, Bell, ShoppingCart, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../lib/api";

export default function AdminPage() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab]           = useState("overview");

  useEffect(() => {
    api.get("/admin/stats").then(r => setStats(r.data));
    api.get("/admin/users").then(r => setUsers(r.data));
    api.get("/admin/products").then(r => setProducts(r.data));
  }, []);

  const toggleProduct = async (id, current) => {
    await api.put(`/admin/products/${id}/toggle`);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const STAT_CARDS = [
    { icon: <Users size={20} className="text-blue-500" />,    label: "Total Users",    value: stats?.total_users    || 0, bg: "bg-blue-50" },
    { icon: <Package size={20} className="text-green-500" />, label: "Products",       value: stats?.total_products || 0, bg: "bg-green-50" },
    { icon: <Bell size={20} className="text-amber-500" />,    label: "Price Alerts",   value: stats?.total_alerts   || 0, bg: "bg-amber-50" },
    { icon: <ShoppingCart size={20} className="text-purple-500" />, label: "Total Carts", value: stats?.total_carts || 0, bg: "bg-purple-50" },
  ];

  const TABS = ["overview", "users", "products"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">A</div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-medium text-sm text-gray-900">All Users ({users.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{u.full_name}</td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-medium text-sm text-gray-900">All Products ({products.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Product</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Brand</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Unit</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.brand}</td>
                    <td className="px-5 py-3 text-gray-500">{p.category}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.unit}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleProduct(p.id, p.is_active)}
                        className={`flex items-center gap-1.5 text-xs font-medium ${p.is_active !== false ? "text-green-600" : "text-gray-400"}`}>
                        {p.is_active !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {p.is_active !== false ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
