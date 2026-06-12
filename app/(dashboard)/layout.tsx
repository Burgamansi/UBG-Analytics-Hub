"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Upload,
  BarChart3,
  Building2,
  ChevronRight,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Visão Geral",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Comercial",
    href: "/dashboard/comercial",
    icon: TrendingUp,
    badge: "Jan–Mai",
  },
  {
    label: "RH",
    href: "/dashboard/rh",
    icon: Users,
    badge: "Crítico",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    label: "Financeiro",
    href: "/dashboard/financeiro",
    icon: BarChart3,
    badge: "Em breve",
    badgeColor: "bg-slate-100 text-slate-500",
    disabled: true,
  },
  {
    label: "Upload de Dados",
    href: "/dashboard/upload",
    icon: Upload,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-navy flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 flex-shrink-0">
              <Building2 className="w-5 h-5 text-brand-navy" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                União Bag
              </div>
              <div className="text-brand-cyan text-xs font-medium">
                Analytics Hub
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-white/40 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
            Módulos
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-brand-cyan/20 text-brand-cyan border-l-2 border-brand-cyan"
                    : "text-white/70 hover:text-white hover:bg-white/5 border-l-2 border-transparent",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 font-semibold",
                      item.badgeColor || "bg-brand-cyan/20 text-brand-cyan"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {!item.disabled && !item.badge && (
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-cyan/20 flex items-center justify-content-center flex-shrink-0 flex items-center justify-center">
              <span className="text-brand-cyan text-xs font-bold">UB</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">
                Administrador
              </div>
              <div className="text-white/40 text-xs truncate">
                União Bag 2026
              </div>
            </div>
            <Settings className="w-4 h-4 text-white/40 hover:text-white cursor-pointer flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              União Bag — Big Bags e Sacarias
            </div>
            <div className="text-sm font-semibold text-slate-700">
              Indicadores Gerenciais 2026
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                Dados atualizados
              </span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link
              href="/dashboard/upload"
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Planilha
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
