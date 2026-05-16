"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { SUPERADMIN_USERNAME } from "@/lib/data";
import { ADMIN_ROLES, ROLE_LABELS, type Role } from "@/lib/types";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  LogOut,
  Receipt,
  Droplets,
  ChevronRight,
  KeyRound,
  Activity,
  PiggyBank,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles?: Role[];
  superAdminOnly?: boolean;
  color: string;
  bg: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    href: "/dashboard/users",
    label: "Usuarios",
    icon: Users,
    allowedRoles: ADMIN_ROLES,
    color: "text-sky-400",
    bg: "bg-sky-500/20",
  },
  {
    href: "/dashboard/monthly",
    label: "Cuotas Mensuales",
    icon: Receipt,
    allowedRoles: ["admin", "presidente", "secretario", "tesorero"],
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
  {
    href: "/dashboard/events",
    label: "Eventos",
    icon: CalendarDays,
    allowedRoles: ["admin", "presidente", "secretario", "tesorero"],
    color: "text-violet-400",
    bg: "bg-violet-500/20",
  },
  {
    href: "/dashboard/reports",
    label: "Reportes",
    icon: BarChart3,
    allowedRoles: ADMIN_ROLES,
    color: "text-amber-400",
    bg: "bg-amber-500/20",
  },
  {
    href: "/dashboard/finanzas",
    label: "Finanzas",
    icon: PiggyBank,
    allowedRoles: ["admin", "presidente", "secretario", "tesorero"],
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
  {
    href: "/dashboard/access",
    label: "Accesos",
    icon: KeyRound,
    superAdminOnly: true,
    color: "text-rose-400",
    bg: "bg-rose-500/20",
  },
  {
    href: "/dashboard/audit",
    label: "Auditoría",
    icon: Activity,
    superAdminOnly: true,
    color: "text-red-400",
    bg: "bg-red-500/20",
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser, logout } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly)
      return currentUser?.username === SUPERADMIN_USERNAME;
    if (item.allowedRoles)
      return item.allowedRoles.includes(currentUser?.role as Role);
    return true;
  });

  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            <Droplets size={17} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">
              PayManager
            </span>
            <p className="text-white/40 text-xs mt-0.5">Gestión de Pagos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          Navegación
        </p>
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:bg-white/8 hover:text-white/90"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  isActive ? item.bg : "bg-white/5 group-hover:bg-white/10"
                }`}
              >
                <Icon
                  size={14}
                  className={
                    isActive
                      ? item.color
                      : "text-white/40 group-hover:text-white/70"
                  }
                  aria-hidden="true"
                />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight size={13} className="text-white/40 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">
              {currentUser?.name}
            </p>
            <p className="text-white/40 text-[10px]">
              {currentUser?.role
                ? ROLE_LABELS[currentUser.role as Role] ?? currentUser.role
                : ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/15 hover:text-red-400 transition-all w-full group"
        >
          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors">
            <LogOut size={14} aria-hidden="true" />
          </div>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
