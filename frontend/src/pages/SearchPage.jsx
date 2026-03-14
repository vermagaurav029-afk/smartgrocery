// pages/SearchPage.jsx — Unsplash food images + emoji fallbacks
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Check } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { slug: "", label: "All" },
  { slug: "dairy-eggs",    label: "🥛 Dairy" },
  { slug: "fruits",        label: "🍎 Fruits" },
  { slug: "vegetables",    label: "🥦 Vegetables" },
  { slug: "grains-pulses", label: "🌾 Grains" },
  { slug: "snacks",        label: "🍿 Snacks" },
  { slug: "beverages",     label: "🧃 Beverages" },
  { slug: "oils-ghee",     label: "🫙 Oils" },
  { slug: "household",     label: "🧹 Household" },
  { slug: "personal-care", label: "🧴 Personal Care" },
  { slug: "bakery",        label: "🍞 Bakery" },
];

const CATEGORY_ICONS = {
  "Dairy & Eggs":    { icon: "🥛", bg: "#EFF6FF" },
  "Fruits":          { icon: "🍎", bg: "#FFF7ED" },
  "Vegetables":      { icon: "🥦", bg: "#F0FDF4" },
  "Grains & Pulses": { icon: "🌾", bg: "#FEFCE8" },
  "Snacks":          { icon: "🍿", bg: "#FFF1F2" },
  "Beverages":       { icon: "🧃", bg: "#F0FDFA" },
  "Oils & Ghee":     { icon: "🫙", bg: "#FFFBEB" },
  "Household":       { icon: "🧹", bg: "#F5F3FF" },
  "Personal Care":   { icon: "🧴", bg: "#FDF4FF" },
  "Bakery":          { icon: "🍞", bg: "#FFF7ED" },
  "default":         { icon: "🛒", bg: "#F9FAFB" },
};

// Curated Unsplash photo IDs for each product — free to use, no copyright
const PRODUCT_IMAGES = {
  "Full Cream Milk":          "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
  "Toned Milk":               "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop",
  "Paneer":                   "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop",
  "Curd":                     "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
  "Eggs":                     "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop",
  "Butter":                   "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop",
  "Cheese Slices":            "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=200&h=200&fit=crop",
  "Banana":                   "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop",
  "Apple (Shimla)":           "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&h=200&fit=crop",
  "Watermelon":               "https://images.unsplash.com/photo-1563114773-84221bd62daa?w=200&h=200&fit=crop",
  "Mango (Alphonso)":         "https://images.unsplash.com/photo-1553279768-865429fa0078?w=200&h=200&fit=crop",
  "Onion":                    "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=200&h=200&fit=crop",
  "Potato":                   "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop",
  "Tomato":                   "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop",
  "Spinach (Palak)":          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop",
  "Garlic":                   "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=200&h=200&fit=crop",
  "Capsicum":                 "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop",
  "Basmati Rice":             "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
  "Toor Dal":                 "https://images.unsplash.com/photo-1612257999756-c7c4f9ae4d78?w=200&h=200&fit=crop",
  "Whole Wheat Atta":         "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop",
  "Chana Dal":                "https://images.unsplash.com/photo-1612257999756-c7c4f9ae4d78?w=200&h=200&fit=crop",
  "Moong Dal":                "https://images.unsplash.com/photo-1612257999756-c7c4f9ae4d78?w=200&h=200&fit=crop",
  "Poha":                     "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
  "Salt":                     "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=200&h=200&fit=crop",
  "Sugar":                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
  "Turmeric Powder":          "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=200&h=200&fit=crop",
  "Maggi Noodles":            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop",
  "Lay's Classic Salted":     "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop",
  "Digestive Biscuits":       "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop",
  "Kurkure Masala Munch":     "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop",
  "Dark Fantasy Chocofills":  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop",
  "Tropicana Orange Juice":   "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop",
  "Coca-Cola":                "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop",
  "Green Tea":                "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop",
  "Coffee (Instant)":         "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop",
  "Tender Coconut Water":     "https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=200&h=200&fit=crop",
  "Sunflower Oil":            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
  "Desi Ghee":                "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop",
  "Mustard Oil":              "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
  "Olive Oil (Extra Virgin)": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
  "Surf Excel Matic":         "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=200&h=200&fit=crop",
  "Vim Dishwash Bar":         "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
  "Lizol Floor Cleaner":      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
  "Harpic Toilet Cleaner":    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
  "Tissue Paper Roll":        "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&h=200&fit=crop",
  "Dove Body Wash":           "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop",
  "Head & Shoulders Shampoo": "https://images.unsplash.com/photo-1556760544-74068565f05c?w=200&h=200&fit=crop",
  "Colgate Strong Teeth":     "https://images.unsplash.com/photo-1559591937-1e6b28e5aeee?w=200&h=200&fit=crop",
  "Dettol Hand Wash":         "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=200&h=200&fit=crop",
  "Britannia Bread":          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  "Good Day Butter Cookies":  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop",
  "Croissant":                "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop",
  "Brown Bread":              "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  "Milk Rusk":                "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop",
};

function ProductImage({ product }) {
  const [error, setError]   = useState(false);
  const fallback            = CATEGORY_ICONS[product.category] || CATEGORY_ICONS["default"];
  const imgUrl              = PRODUCT_IMAGES[product.name];

  if (!imgUrl || error) {
    return (
      <div className="w-full h-28 rounded-xl flex items-center justify-center"
           style={{ background: fallback.bg, fontSize: "3.5rem" }}>
        {fallback.icon}
      </div>
    );
  }

  return (
    <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-50">
      <img
        src={imgUrl}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const inCart = cartItems.some(c => c.product_id === product.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all">
      <ProductImage product={product} />
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-0.5">{product.brand}</div>
        <div className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-2">{product.name}</div>
        <div className="text-xs text-gray-400 mb-3">{product.unit}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-green-600 font-bold">₹{product.min_price}</div>
            <div className="text-xs text-gray-400">{product.platforms_available} platforms</div>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              inCart ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600"
            }`}
          >
            {inCart ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [params]                = useSearchParams();
  const [query, setQuery]       = useState(params.get("q") || "");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [total, setTotal]       = useState(0);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/products", { params: { q: query, category, limit: 24 } });
      setProducts(r.data.results);
      setTotal(r.data.total);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => { search(); }, [search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search groceries..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c.slug} onClick={() => setCategory(c.slug)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === c.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-4">{total} products found</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium">No products found</div>
              <div className="text-sm mt-1">Try a different search term</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
