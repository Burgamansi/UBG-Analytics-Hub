"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Upload,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  HelpCircle,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: Array<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}> = [
  {
    label: "Visão Geral",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Comercial",
    href: "/comercial",
    icon: TrendingUp,
    badge: "Jan–Mai",
  },
  {
    label: "RH",
    href: "/rh",
    icon: Users,
    badge: "Crítico",
    badgeColor: "bg-red-500/20 text-red-400",
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: BarChart3,
  },
  {
    label: "Upload de Dados",
    href: "/upload",
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
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-bg)" }}>

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className="w-[220px] flex flex-col flex-shrink-0 relative"
        style={{
          background: "linear-gradient(180deg, #0D1B2E 0%, #0f2035 60%, #0D1B2E 100%)",
          boxShadow: "var(--shadow-sidebar)",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-full flex items-center justify-center">
              <Image
                src="/logo-rjt-nexus.png"
                alt="RJT NEXUS"
                width={160}
                height={54}
                className="object-contain"
                priority
              />
            </div>
            <div className="w-full flex items-center justify-center gap-1.5 mt-1">
              <div className="status-dot-live" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "0.06em" }}>
                ANALYTICS HUB
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div
            className="px-3 mb-3"
            style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            Módulos
          </div>

          <div className="space-y-0.5">
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
                    "nav-item",
                    isActive && "active",
                    item.disabled && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all",
                      isActive
                        ? "bg-brand-cyan/20"
                        : "bg-white/5 group-hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 nav-icon" />
                  </div>
                  <span className="flex-1 font-medium" style={{ fontSize: 13 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-2xs px-2 py-0.5 rounded-full font-semibold",
                        item.badgeColor || "bg-brand-cyan/20 text-brand-cyan"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/8" />

          {/* Quick actions */}
          <div
            className="px-3 mb-2"
            style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            Sistema
          </div>
          <Link href="/upload" className="nav-item">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 flex-shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span style={{ fontSize: 13 }}>Importar Dados</span>
          </Link>
        </nav>

        {/* Footer / User */}
        <div className="px-4 py-4 border-t border-white/8">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))" }}
            >
              <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>RM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600 }} className="truncate">
                Administrador
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }} className="truncate">
                União Bag · 2026
              </div>
            </div>
            <Settings className="w-4 h-4 flex-shrink-0 cursor-pointer" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{
            background: "white",
            borderBottom: "1px solid rgba(226,232,240,0.8)",
            boxShadow: "0 1px 4px rgba(13,27,46,0.04)",
          }}
        >
          {/* Left: breadcrumb */}
          <div className="flex flex-col">
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              União Bag — Big Bags e Sacarias
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
              Indicadores Gerenciais 2026
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ background: "#F8FAFC", border: "1px solid rgba(226,232,240,0.8)", color: "var(--text-muted)", fontSize: 13 }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buscar...</span>
            </button>

            {/* Status live */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <div className="status-dot-live" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>Dados atualizados</span>
            </div>

            {/* Help */}
            <button className="p-2 rounded-lg transition-colors hover:bg-slate-50" style={{ color: "var(--text-muted)" }}>
              <HelpCircle className="w-4.5 h-4.5" />
            </button>

            {/* Bell */}
            <button className="relative p-2 rounded-lg transition-colors hover:bg-slate-50" style={{ color: "var(--text-muted)" }}>
              <Bell className="w-4.5 h-4.5" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "var(--status-danger)", boxShadow: "0 0 0 2px white" }}
              />
            </button>

            {/* Upload CTA */}
            <Link href="/upload" className="btn-primary">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Planilha</span>
            </Link>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200 cursor-pointer">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--brand-cyan), var(--brand-cyan-dark))" }}
              >
                <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>RM</span>
              </div>
              <div className="hidden md:flex flex-col">
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Rogério M.</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Administrador</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
