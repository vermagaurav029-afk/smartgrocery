// src/App.jsx — Main app with routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";

import LandingPage       from "./pages/LandingPage";
import LoginPage         from "./pages/LoginPage";
import SignupPage        from "./pages/SignupPage";
import DashboardPage     from "./pages/DashboardPage";
import SearchPage        from "./pages/SearchPage";
import CartPage          from "./pages/CartPage";
import ComparisonPage    from "./pages/ComparisonPage";
import AlertsPage        from "./pages/AlertsPage";
import SavedListsPage    from "./pages/SavedListsPage";
import PlannerPage       from "./pages/PlannerPage";
import AdminPage         from "./pages/AdminPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "admin" ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<Layout />}>
              <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/search"      element={<SearchPage />} />
              <Route path="/cart"        element={<PrivateRoute><CartPage /></PrivateRoute>} />
              <Route path="/compare"     element={<PrivateRoute><ComparisonPage /></PrivateRoute>} />
              <Route path="/alerts"      element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
              <Route path="/lists"       element={<PrivateRoute><SavedListsPage /></PrivateRoute>} />
              <Route path="/planner"     element={<PrivateRoute><PlannerPage /></PrivateRoute>} />
              <Route path="/admin"       element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
