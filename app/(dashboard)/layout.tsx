"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  BarChart3,
  Upload,
  Bell,
  ChevronDown,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Comercial",   href: "/comercial", icon: TrendingUp,      badge: "Jan–Mai",  badgeType: "info" },
  { label: "RH",          href: "/rh",         icon: Users,           badge: "Crítico",  badgeType: "danger" },
  { label: "Financeiro",  href: "/financeiro", icon: BarChart3 },
  { label: "Upload",      href: "/upload",     icon: Upload },
];

const BADGE_STYLES: Record<string, string> = {
  info:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* HEADER SUPERIOR CORPORATIVO */}
      <header 
        className="w-full flex items-center justify-between px-6 bg-[#13233d] h-16 flex-shrink-0 z-30"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 py-1">
            <Image
              src="/logo-rjt-360.png"
              alt="RJT NEXUS 360°"
              width={120}
              height={38}
              className="object-contain brightness-0 invert"
              priority
            />
          </Link>
          <div className="hidden lg:flex flex-col border-l border-white/10 pl-4">
            <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase font-mono">
              União Bag
            </span>
            <span className="text-xs font-semibold text-white/70">
              Analytics Hub · 2026
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 h-full text-sm font-medium transition-all relative border-b-2",
                  isActive 
                    ? "text-white border-[#1b98e0] bg-white/5 font-semibold" 
                    : "text-white/60 border-transparent hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#1b98e0]" : "text-white/40")} />
                <span>{item.label}</span>
                
                {item.badge && (
                  <span className={cn("ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight", BADGE_STYLES[item.badgeType || "info"])}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 font-mono">Online</span>
          </div>

          <button className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1b98e0] to-[#0ea5e9] flex items-center justify-center shadow-md shadow-black/20">
              <span className="text-white text-xs font-bold font-mono">RM</span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-tight">Rogério M.</span>
              <span className="text-[10px] text-white/40 font-medium">Administrador</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/30 hidden lg:block" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] z-10">
        <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
