// components/layout/Layout.jsx — App shell with sidebar + topbar
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  LayoutDashboard, Search, ShoppingCart, BarChart2,
  Bell, BookMarked, Sparkles, Settings, LogOut, ShieldCheck, Menu, X
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard",    icon: <LayoutDashboard size={18} /> },
  { path: "/search",    label: "Search",        icon: <Search size={18} /> },
  { path: "/cart",      label: "Cart",          icon: <ShoppingCart size={18} />, badge: true },
  { path: "/compare",   label: "Compare",       icon: <BarChart2 size={18} /> },
  { path: "/alerts",    label: "Price Alerts",  icon: <Bell size={18} /> },
  { path: "/lists",     label: "Saved Lists",   icon: <BookMarked size={18} /> },
  { path: "/planner",   label: "AI Planner",    icon: <Sparkles size={18} /> },
];

export default function Layout() {
  const { user, logout }  = useAuth();
  const { cartItems }     = useCart();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">SG</div>
        <span className="font-semibold text-gray-900">SmartGrocery</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors relative ${active ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <span className={active ? "text-green-600" : "text-gray-400"}>{item.icon}</span>
              {item.label}
              {item.badge && cartItems.length > 0 && (
                <span className="ml-auto bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartItems.length}
                </span>
              )}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <Link to="/admin" onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${location.pathname === "/admin" ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
            <ShieldCheck size={18} className={location.pathname === "/admin" ? "text-purple-500" : "text-gray-400"} />
            Admin
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-gray-500">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">SG</div>
            <span className="font-semibold text-gray-900 text-sm">SmartGrocery</span>
          </div>
          <Link to="/cart" className="relative p-1 text-gray-500">
            <ShoppingCart size={20} />
            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cartItems.length}</span>}
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
