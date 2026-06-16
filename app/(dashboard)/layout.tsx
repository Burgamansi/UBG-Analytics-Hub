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
  info:    "bg-blue-500/20 text-blue-200 border border-blue-400/30",
  danger:  "bg-red-500/20 text-red-300 border border-red-400/30",
  success: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
  warning: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ════════════════════════════════════════
          SIDEBAR — Navy Premium
          ════════════════════════════════════════ */}
      <aside
        className="w-[240px] flex flex-col flex-shrink-0 relative z-20"
        style={{
          background: "linear-gradient(180deg, #13233d 0%, #0f1c30 100%)",
          boxShadow: "2px 0 20px rgba(0,0,0,0.12)",
        }}
      >
        {/* Logo Block */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/logo-rjt-360.png"
              alt="RJT NEXUS 360°"
              width={160}
              height={54}
              className="object-contain"
              priority
            />
            <div className="flex items-center gap-2">
              <div className="status-dot-live" />
              <span style={{
                fontSize: 10,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                Analytics Hub · 2026
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="nav-section-label mb-2">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link key={item.href} href={item.href} className={cn("nav-item", isActive && "active")}>
                      <div
                        className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive
                            ? "rgba(27,152,224,0.3)"
                            : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{
                            color: isActive ? "#1b98e0" : "rgba(255,255,255,0.45)",
                          }}
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
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {/* System health */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] mb-3"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
            <div className="flex-1">
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: "#10b981",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Sistema Online
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Neon DB · Vercel</div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-[10px] cursor-pointer hover:bg-white/5 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1b98e0, #0ea5e9)",
                boxShadow: "0 2px 8px rgba(27,152,224,0.35)",
              }}
            >
              <span style={{
                color: "white", fontSize: 11, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>RM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{
                color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
              }} className="truncate">
                Administrador
              </div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }} className="truncate">
                União Bag
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT — Light Executive
          ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Topbar ─────────────────────────────── */}
        <header
          className="flex items-center justify-between px-8 py-4 flex-shrink-0 z-10 bg-white"
          style={{
            borderBottom: "1px solid #E5E7EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Left — Breadcrumb */}
          <div>
            <div style={{
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 2,
            }}>
              União Bag — Big Bags e Sacarias
            </div>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}>
              Indicadores Gerenciais 2026
            </div>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] transition-all"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E5E7EB",
                color: "#9CA3AF",
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
              }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Buscar...</span>
            </button>

            {/* Live status */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[10px]"
              style={{
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
              }}
            >
              <div className="status-dot-live" />
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: "#059669",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Dados atualizados
              </span>
            </div>

            {/* Help */}
            <button
              className="p-2.5 rounded-[10px] transition-all hover:bg-gray-100"
              style={{ color: "#9CA3AF" }}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Bell */}
            <button
              className="relative p-2.5 rounded-[10px] transition-all hover:bg-gray-100"
              style={{ color: "#9CA3AF" }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: "#DC2626" }}
              />
            </button>

            {/* Upload CTA */}
            <Link href="/upload" className="btn-primary">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Planilha</span>
            </Link>

            {/* Avatar */}
            <div
              className="flex items-center gap-2.5 pl-4 ml-1 cursor-pointer"
              style={{ borderLeft: "1px solid #E5E7EB" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #13233d, #1b98e0)",
                  boxShadow: "0 2px 8px rgba(19,35,61,0.2)",
                }}
              >
                <span style={{
                  color: "white", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>RM</span>
              </div>
              <div className="hidden md:flex flex-col">
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: "#111827",
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.3,
                }}>
                  Rogério M.
                </span>
                <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                  Administrador
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "#9CA3AF" }} />
            </div>
          </div>
        </header>

        {/* ── Page Content ───────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">{children}</main>
      </div>
    </div>
  );
}
