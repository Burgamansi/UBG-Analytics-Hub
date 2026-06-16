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
  Activity,
  Zap,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Dashboards",
    items: [
      { label: "Visão Geral",   href: "/dashboard",  icon: LayoutDashboard, exact: true },
      { label: "Comercial",     href: "/comercial",  icon: TrendingUp,      badge: "Jan–Mai",  badgeType: "info" },
      { label: "RH",            href: "/rh",         icon: Users,           badge: "Crítico",  badgeType: "danger" },
      { label: "Financeiro",    href: "/financeiro", icon: BarChart3 },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { label: "Upload de Dados", href: "/upload", icon: Upload },
    ],
  },
];

const BADGE_STYLES: Record<string, string> = {
  info:    "bg-rjt-secondary/15 text-rjt-secondary border border-rjt-secondary/25",
  danger:  "bg-status-danger/15 text-status-danger border border-status-danger/25",
  success: "bg-status-success/15 text-status-success border border-status-success/25",
  warning: "bg-status-warning/15 text-status-warning border border-status-warning/25",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surface-app)" }}>

      {/* ════════════════════════════════════════
          SIDEBAR — Enterprise Dark
          ════════════════════════════════════════ */}
      <aside
        className="w-[216px] flex flex-col flex-shrink-0 relative z-20"
        style={{
          background: "linear-gradient(180deg, #080f1a 0%, #0a1520 50%, #080f1a 100%)",
          boxShadow: "var(--shadow-sidebar)",
          borderRight: "1px solid rgba(27,152,224,0.1)",
        }}
      >
        {/* Logo Block */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(27,152,224,0.08)" }}>
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/logo-rjt-360.png"
              alt="RJT NEXUS 360°"
              width={168}
              height={56}
              className="object-contain"
              priority
              style={{ filter: "brightness(1.05)" }}
            />
            <div className="flex items-center gap-2 mt-0.5">
              <div className="status-dot-live" />
              <span style={{
                fontSize: 9,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: "rgba(27,152,224,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}>
                Analytics Hub · 2026
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="section-title px-2 mb-1.5">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link key={item.href} href={item.href} className={cn("nav-item", isActive && "active")}>
                      {/* Icon */}
                      <div
                        className="w-7 h-7 rounded-icon flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isActive
                            ? "rgba(27,152,224,0.2)"
                            : "rgba(255,255,255,0.04)",
                          boxShadow: isActive ? "0 0 8px rgba(27,152,224,0.2)" : "none",
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: isActive ? "var(--rjt-secondary)" : "var(--text-muted)" }}
                        />
                      </div>

                      <span className="flex-1" style={{ fontSize: 13 }}>{item.label}</span>

                      {item.badge && (
                        <span className={cn("badge text-2xs", BADGE_STYLES[item.badgeType || "info"])}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(27,152,224,0.08)" }}>
          {/* System health */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-btn mb-2"
            style={{ background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.12)" }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: "var(--status-success)" }} />
            <div className="flex-1">
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--status-success)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Sistema Online
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Neon DB · Vercel</div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-btn cursor-pointer hover:bg-white/5 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--rjt-secondary), var(--rjt-accent))",
                boxShadow: "0 0 10px rgba(27,152,224,0.3)",
              }}
            >
              <span style={{ color: "white", fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>RM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }} className="truncate">
                Administrador
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 10 }} className="truncate">União Bag</div>
            </div>
            <Settings className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ─────────────────────────────── */}
        <header
          className="flex items-center justify-between px-6 py-3 flex-shrink-0 z-10"
          style={{
            background: "rgba(10,21,32,0.95)",
            borderBottom: "1px solid rgba(27,152,224,0.1)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 1px 0 rgba(27,152,224,0.06), 0 4px 24px rgba(0,0,0,0.2)",
          }}
        >
          {/* Left — Breadcrumb */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              União Bag — Big Bags e Sacarias
            </div>
            <div className="page-title" style={{ fontSize: 16 }}>
              Indicadores Gerenciais 2026
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-btn transition-all"
              style={{
                background: "rgba(27,152,224,0.06)",
                border: "1px solid rgba(27,152,224,0.15)",
                color: "var(--text-muted)",
                fontSize: 12,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buscar...</span>
            </button>

            {/* Live status */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-btn"
              style={{
                background: "rgba(0,230,118,0.06)",
                border: "1px solid rgba(0,230,118,0.15)",
              }}
            >
              <div className="status-dot-live" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--status-success)", fontFamily: "'Space Grotesk', sans-serif" }}>
                Dados atualizados
              </span>
            </div>

            {/* Help */}
            <button
              className="p-2 rounded-btn transition-all hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Bell */}
            <button
              className="relative p-2 rounded-btn transition-all hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "var(--status-danger)", boxShadow: "0 0 6px var(--status-danger)" }}
              />
            </button>

            {/* Upload CTA */}
            <Link href="/upload" className="btn-primary">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Planilha</span>
            </Link>

            {/* Avatar */}
            <div
              className="flex items-center gap-2 pl-3 ml-1 cursor-pointer"
              style={{ borderLeft: "1px solid rgba(27,152,224,0.15)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, var(--rjt-secondary), var(--rjt-accent))",
                  boxShadow: "0 0 10px rgba(27,152,224,0.3)",
                }}
              >
                <span style={{ color: "white", fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>RM</span>
              </div>
              <div className="hidden md:flex flex-col">
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Rogério M.
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Administrador</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "var(--text-muted)" }} />
            </div>
          </div>
        </header>

        {/* ── Page Content ───────────────────────── */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
