"use client";

import { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10 text-center">

            <h1 className="text-4xl font-black tracking-tighter mb-2 italic">ADMIN PROTOCOL</h1>
            <p className="text-zinc-500 font-bold text-sm tracking-widest uppercase">Authorized Personnel Only</p>
          </div>

          {/* Login Form */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">

              <div className="space-y-3">
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-zinc-600 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-800/50 border border-zinc-800 text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold"
                    placeholder="ADMIN@CMA.COM"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Master Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-zinc-600 group-focus-within:text-green-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-800/50 border border-zinc-800 text-white rounded-2xl focus:ring-4 focus:ring-green-400/20 focus:border-green-400 outline-none transition-all placeholder:text-zinc-700 font-bold tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Access Denied: {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden bg-green-400 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(74,222,128,0.2)] mt-8"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? 'AUTHENTICATING...' : 'INITIALIZE OVERRIDE'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
