// pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">SG</div>
          <span className="font-semibold text-gray-900 text-lg">SmartGrocery</span>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-400 text-sm mb-6">Welcome back</p>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5 mb-4 border border-red-100">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Sign in
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-600 font-medium hover:underline">Sign up</Link>
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
            Demo admin: <span className="font-mono">admin@smartgrocery.in</span> / Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}
