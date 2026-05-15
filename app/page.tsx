"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #0ea5e9 70%, #06b6d4 100%)",
      }}
    >
      {/* Decorative elements */}
      <span className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
      <span className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5" />
      <span className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-white/20" />
      <span className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-white/15" />
      <span className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-white/20" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Water drop */}
            <defs>
              <linearGradient id="dropGrad" x1="60" y1="0" x2="60" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="circleGrad" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#38bdf8" stopOpacity="0.15" />
                <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Outer circle */}
            <circle cx="60" cy="60" r="58" stroke="#38bdf8" strokeWidth="2" fill="url(#circleGrad)" />
            {/* Water drop path */}
            <path d="M60 20C60 20 35 55 35 72C35 85.8 46.2 97 60 97C73.8 97 85 85.8 85 72C85 55 60 20 60 20Z"
              fill="url(#dropGrad)" opacity="0.9" />
            {/* Highlight on drop */}
            <ellipse cx="52" cy="55" rx="8" ry="12" fill="white" opacity="0.25" transform="rotate(-15 52 55)" />
            {/* Sprout */}
            <path d="M60 75C60 75 52 68 50 62C48 56 52 52 56 52C60 52 62 56 60 60"
              fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M60 60C60 60 58 56 60 52C62 48 66 46 68 50C70 54 66 58 60 60"
              fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Sistema de Gestión de Riego
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light">
            Ana Maria
          </p>
        </div>

        {/* Divider */}
        <div className="w-32 h-0.5 rounded-full bg-white/30" />

        {/* Description */}
        <p className="text-white/60 text-sm max-w-md text-center">
          Gestión eficiente de cuotas, eventos y pagos comunitarios
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/login")}
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-base text-white
            bg-white/10 backdrop-blur-sm border border-white/20
            hover:bg-white/20 hover:border-white/40
            active:scale-[0.97]
            transition-all duration-300 shadow-xl shadow-black/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Gestionar
          <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
