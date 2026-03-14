// pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { TrendingDown, Bell, ShoppingCart, Star, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/dashboard").then(r => setData(r.data)); }, []);

  const mockMonthly = [
    { month: "Sep", saved: 320 }, { month: "Oct", saved: 540 }, { month: "Nov", saved: 480 },
    { month: "Dec", saved: 720 }, { month: "Jan", saved: 610 }, { month: "Feb", saved: 850 },
  ];

  const stats = [
    { icon: <TrendingDown size={20} className="text-green-500" />, label: "Total Saved",    value: `₹${data?.total_saved || 0}`,      bg: "bg-green-50" },
    { icon: <ShoppingCart size={20} className="text-blue-500" />, label: "Cart Items",     value: data?.cart_items || 0,              bg: "bg-blue-50" },
    { icon: <Bell size={20} className="text-amber-500" />,        label: "Active Alerts",  value: data?.active_alerts || 0,           bg: "bg-amber-50" },
    { icon: <Star size={20} className="text-purple-500" />,       label: "Best Platform",  value: data?.best_platform || "—",         bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.full_name?.split(" ")[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's your savings overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-gray-400" />
            <span className="font-medium text-gray-900 text-sm">Monthly Savings</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data?.monthly_data?.length ? data.monthly_data : mockMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v}`, "Saved"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="saved" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <Link to="/search" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-green-600">🔍</div>
            <div><div className="font-medium text-sm text-gray-900">Search Products</div><div className="text-xs text-gray-400">Add to cart & compare</div></div>
          </Link>
          <Link to="/compare" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">📊</div>
            <div><div className="font-medium text-sm text-gray-900">Compare Cart</div><div className="text-xs text-gray-400">Find cheapest platform</div></div>
          </Link>
          <Link to="/planner" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">🤖</div>
            <div><div className="font-medium text-sm text-gray-900">AI Planner</div><div className="text-xs text-gray-400">Generate your grocery list</div></div>
          </Link>
          <Link to="/alerts" className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 transition-colors">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">🔔</div>
            <div><div className="font-medium text-sm text-gray-900">Price Alerts</div><div className="text-xs text-gray-400">Get notified on drops</div></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
