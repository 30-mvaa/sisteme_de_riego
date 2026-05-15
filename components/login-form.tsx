"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Droplets,
} from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      const result = await login(username, password);
      if (result.ok) {
        router.push("/dashboard");
      } else {
        setError(result.error ?? "Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)",
      }}
    >
      <span className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      <span className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg mb-4">
            <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 20C60 20 35 55 35 72C35 85.8 46.2 97 60 97C73.8 97 85 85.8 85 72C85 55 60 20 60 20Z"
                fill="#7dd3fc" opacity="0.9" />
              <ellipse cx="52" cy="55" rx="8" ry="12" fill="white" opacity="0.25" transform="rotate(-15 52 55)" />
              <path d="M60 75C60 75 52 68 50 62C48 56 52 52 56 52C60 52 62 56 60 60"
                fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M60 60C60 60 58 56 60 52C62 48 66 46 68 50C70 54 66 58 60 60"
                fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-white/80">
                Usuario
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <User className="w-4 h-4 text-white/40" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  className="pl-9 h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-white/80">
                Contraseña
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Lock className="w-4 h-4 text-white/40" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-9 h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white
                bg-cyan-500 hover:bg-cyan-400
                active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-white/60 hover:text-white/90 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
