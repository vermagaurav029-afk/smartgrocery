// pages/LandingPage.jsx — Professional startup landing page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingDown, Bell, BarChart2, Zap, ShieldCheck, ArrowRight } from "lucide-react";

const PLATFORMS = [
  { name: "Blinkit",          color: "#F9D72C", bg: "#FFFBEB" },
  { name: "Zepto",            color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "Swiggy Instamart", color: "#FF6B35", bg: "#FFF4EF" },
  { name: "BigBasket",        color: "#84CC16", bg: "#F7FEE7" },
  { name: "Amazon",           color: "#FF9900", bg: "#FFF7ED" },
  { name: "Flipkart",         color: "#2874F0", bg: "#EFF6FF" },
];

const FEATURES = [
  { icon: <TrendingDown size={22} />, title: "Real Price Comparison",   desc: "Compare prices across 6 platforms instantly. Never overpay for groceries again." },
  { icon: <Zap size={22} />,          title: "Smart Cart Optimizer",    desc: "Find the cheapest single platform or mix-and-match for maximum savings." },
  { icon: <Bell size={22} />,         title: "Price Drop Alerts",       desc: "Set a target price and get notified the moment it drops below your threshold." },
  { icon: <BarChart2 size={22} />,    title: "Savings Dashboard",       desc: "Track how much you've saved over time with beautiful charts and insights." },
  { icon: <Search size={22} />,       title: "AI Grocery Planner",      desc: "Tell us your family size and budget. We'll generate your perfect grocery list." },
  { icon: <ShieldCheck size={22} />,  title: "Trusted & Transparent",   desc: "No hidden charges. We show you the real final price including delivery fees." },
];

const STATS = [
  { value: "₹850",  label: "Average monthly savings" },
  { value: "6",     label: "Platforms compared" },
  { value: "50+",   label: "Product categories" },
  { value: "10 min",label: "Average time saved" },
];

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">SG</div>
            <span className="font-semibold text-gray-900 text-lg">SmartGrocery</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#platforms" className="hover:text-gray-900">Platforms</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")}  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5">Sign in</button>
            <button onClick={() => navigate("/signup")} className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap size={12} /> Save up to ₹850/month on groceries
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Compare Grocery Prices<br />
            <span className="text-green-500">Across 6 Platforms</span> Instantly
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon & Flipkart — one cart, one click, best price guaranteed.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto bg-white border border-gray-200 rounded-xl p-2 shadow-lg">
            <Search size={18} className="text-gray-400 ml-2 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for milk, rice, onions..."
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button type="submit" className="bg-green-500 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors flex-shrink-0">
              Compare
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-3">Popular: Milk · Rice · Onion · Amul Butter · Maggi</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Your Favourite Platforms</h2>
          <p className="text-gray-500 mb-10">We compare prices in real-time across the biggest quick-commerce apps in India.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PLATFORMS.map(p => (
              <div key={p.name} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors" style={{ background: p.bg }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: p.color }}>
                  <span className="text-white font-bold text-sm">{p.name[0]}</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-400">Price tracked</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything You Need to Save</h2>
          <p className="text-gray-500 mb-12">Built for urban households who shop online.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white p-6 rounded-xl border border-gray-100 text-left">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Start Saving Today</h2>
        <p className="text-green-100 mb-8 text-lg">Free to use. No credit card required.</p>
        <button onClick={() => navigate("/signup")} className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors">
          Create Free Account <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        © 2024 SmartGrocery. Built with ❤️ for Indian households.
      </footer>
    </div>
  );
}
