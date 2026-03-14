// pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function SignupPage() {
  const [form, setForm]       = useState({ full_name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-6">Start saving on groceries today — it's free</p>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5 mb-4 border border-red-100">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name</label>
              <input type="text" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-colors"
                placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-colors"
                placeholder="Min 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
              Create account
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
