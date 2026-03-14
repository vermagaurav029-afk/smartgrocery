// pages/ComparisonPage.jsx — Core Price Comparison UI
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, TrendingDown, ShoppingBag, Truck, Shuffle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../lib/api";

const PLATFORM_COLORS = {
  blinkit:   "#F9D72C",
  zepto:     "#8B5CF6",
  swiggy:    "#FF6B35",
  bigbasket: "#84CC16",
  amazon:    "#FF9900",
  flipkart:  "#2874F0",
};

function PlatformCard({ p, rank }) {
  const isWinner = p.is_cheapest && p.is_complete;
  return (
    <div className={`relative bg-white rounded-2xl border-2 p-5 transition-all ${isWinner ? "border-green-400 shadow-lg shadow-green-100" : "border-gray-100"}`}>
      {isWinner && (
        <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <TrendingDown size={11} /> Best Price
        </div>
      )}
      {rank && !isWinner && (
        <div className="absolute -top-3 left-4 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">#{rank}</div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: p.platform_color || PLATFORM_COLORS[p.platform_slug] }}>
          {p.platform_name[0]}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{p.platform_name}</div>
          <div className={`text-xs ${p.is_complete ? "text-green-600" : "text-red-500"}`}>
            {p.is_complete ? "All items available" : `${p.missing_items?.length} items missing`}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{p.subtotal?.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1"><Truck size={12} /> Delivery</span>
          <span className={p.delivery_charge === 0 ? "text-green-600 font-medium" : ""}>
            {p.delivery_charge === 0 ? "FREE" : `₹${p.delivery_charge}`}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span className={isWinner ? "text-green-600 text-lg" : "text-gray-900"}>₹{p.total?.toFixed(0)}</span>
        </div>
        {p.savings_vs_mrp > 0 && (
          <div className="text-xs text-green-600 bg-green-50 rounded-lg px-2 py-1 text-center">
            Saving ₹{p.savings_vs_mrp?.toFixed(0)} vs MRP
          </div>
        )}
      </div>

      {p.missing_items?.length > 0 && (
        <div className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg p-2">
          Missing: {p.missing_items.slice(0, 2).join(", ")}{p.missing_items.length > 2 ? `... +${p.missing_items.length - 2}` : ""}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <img src={item.image_url || "https://via.placeholder.com/48"} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">{item.product_name}</div>
          <div className="text-xs text-gray-400">{item.quantity > 1 ? `×${item.quantity}` : ""} · Best: ₹{item.cheapest_unit_price}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Object.values(item.platforms).map(pd => (
              <div key={pd.platform_id} className={`w-2 h-2 rounded-full ${pd.is_available ? "opacity-100" : "opacity-20"}`}
                   style={{ background: pd.platform_color || "#ccc" }} title={pd.platform_name} />
            ))}
          </div>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(item.platforms).map(pd => (
              <div key={pd.platform_id} className={`rounded-lg p-2.5 border text-xs ${pd.is_cheapest ? "border-green-300 bg-green-50" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{pd.platform_name}</span>
                  {pd.is_cheapest && <CheckCircle size={11} className="text-green-500" />}
                  {!pd.is_available && <XCircle size={11} className="text-red-400" />}
                </div>
                {pd.is_available ? (
                  <>
                    <div className="font-semibold text-gray-900">₹{pd.unit_price}</div>
                    {pd.discount_pct > 0 && <div className="text-green-600">{pd.discount_pct}% off</div>}
                  </>
                ) : (
                  <div className="text-red-400">Unavailable</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparisonPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState("single"); // "single" | "mixed"
  const navigate              = useNavigate();

  useEffect(() => {
    api.get("/comparison/cart")
      .then(r => setData(r.data))
      .catch(() => navigate("/cart"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!data) return null;

  const { platforms, items, mixed_basket, summary } = data;
  const sorted = [...platforms].sort((a, b) => {
    if (!a.is_complete && b.is_complete) return 1;
    if (a.is_complete && !b.is_complete) return -1;
    return a.total - b.total;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Price Comparison</h1>
        <p className="text-gray-500 text-sm mt-1">{items.length} items · comparing across {platforms.length} platforms</p>
      </div>

      {/* Savings Banner */}
      {summary.savings_single_vs_worst > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <TrendingDown className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <div className="font-semibold text-green-800">Save up to ₹{summary.savings_single_vs_worst?.toFixed(0)}</div>
            <div className="text-sm text-green-600">by choosing {summary.cheapest_platform} over the most expensive platform</div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("single")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "single" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <ShoppingBag size={15} /> Single Platform
        </button>
        <button
          onClick={() => setView("mixed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "mixed" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          <Shuffle size={15} /> Mixed Basket
          {summary.savings_mixed_vs_single > 0 && (
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">Save ₹{summary.savings_mixed_vs_single?.toFixed(0)}</span>
          )}
        </button>
      </div>

      {view === "single" ? (
        <>
          {/* Platform Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {sorted.map((p, i) => <PlatformCard key={p.platform_id} p={p} rank={p.is_complete ? p.rank : null} />)}
          </div>

          {/* Item breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900 text-sm">Item Breakdown</div>
            {items.map(item => <ItemRow key={item.product_id} item={item} />)}
          </div>
        </>
      ) : (
        <>
          {/* Mixed basket */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="font-medium text-gray-900 text-sm">Best Price Per Item</div>
              <div className="text-xs text-gray-400 mt-0.5">Each item from the cheapest available platform</div>
            </div>
            {mixed_basket.items.map((mi, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: mi.platform_color }} />
                  <span className="text-gray-900">{mi.product_name} ×{mi.quantity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{mi.platform_name}</span>
                  <span className="font-semibold text-gray-900">₹{mi.total_price?.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mixed basket totals */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span><span>₹{mixed_basket.subtotal?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1"><Truck size={12} /> Est. delivery</span>
              <span>₹{mixed_basket.delivery_charge?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-3">
              <span>Total</span><span className="text-green-600">₹{mixed_basket.total?.toFixed(0)}</span>
            </div>
            {summary.savings_mixed_vs_single > 0 && (
              <div className="mt-3 text-center text-sm text-green-600 bg-green-50 rounded-lg p-2">
                🎉 You save ₹{summary.savings_mixed_vs_single?.toFixed(0)} vs the cheapest single platform
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {mixed_basket.platforms_used.map(pn => (
                <span key={pn} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Order from {pn}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
