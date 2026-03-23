"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  AlertCircle,
  Droplets,
} from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [invalidToken, setInvalidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer la contraseña");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Enlace inválido</h3>
        <p className="text-gray-600">
          Este enlace de recuperación no es válido o ha expirado.
        </p>
        <button
          onClick={() => router.push("/forgot-password")}
          className="text-blue-600 hover:underline"
        >
          Solicitar un nuevo enlace
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          ¡Contraseña actualizada!
        </h3>
        <p className="text-gray-600">
          Tu contraseña ha sido cambiada exitosamente.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm text-white
            bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700
            transition-all duration-200 shadow-md shadow-violet-200"
        >
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Nueva contraseña
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </span>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="pl-9 h-11 border-gray-200 focus-visible:ring-violet-500 focus-visible:border-violet-400 rounded-xl bg-gray-50/60"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmar contraseña
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </span>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pl-9 h-11 border-gray-200 focus-visible:ring-violet-500 focus-visible:border-violet-400 rounded-xl bg-gray-50/60"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white
          bg-linear-to-r from-blue-600 to-violet-600
          hover:from-blue-700 hover:to-violet-700
          active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 shadow-md shadow-violet-200"
      >
        {loading ? (
          <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : null}
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)" }}
      >
        <span className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <span className="absolute top-10 right-0 w-64 h-64 rounded-full bg-white/10" />
        <span className="absolute bottom-0 -left-12 w-72 h-72 rounded-full bg-white/5" />
        <span className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Droplets className="w-10 h-10 text-white" strokeWidth={1.8} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              PayManager
            </h1>
            <p className="text-lg text-white/70 font-medium">
              Sistema de Gestión de Pagos
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-violet-600 shadow-md mb-1">
              <Lock className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Crear nueva contraseña
            </h2>
            <p className="text-sm text-gray-500">
              Ingresa tu nueva contraseña para acceder a tu cuenta
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
            <Suspense fallback={<div className="text-center">Cargando...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
