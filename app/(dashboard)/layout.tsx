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
  info:   "bg-blue-500/10 text-blue-400 border border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]",
  danger: "bg-red-500/10 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* HEADER SUPERIOR COM CONTORNOS DE ALTA DEFINIÇÃO */}
      <header 
        className="w-full flex items-center justify-between px-6 bg-[#13233d] h-16 flex-shrink-0 z-30 border-b border-white/10"
        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      >
        {/* Lado Esquerdo — Logo com Divisor Técnico */}
        <div className="flex h-full items-center gap-4">
          <Link href="/dashboard" className="flex items-center h-full pr-4 border-r border-white/10 transition-opacity hover:opacity-90">
            <div className="relative p-1 rounded-md bg-white/5 border border-white/10">
              <Image
                src="/logo-rjt-360.png"
                alt="RJT NEXUS 360°"
                width={110}
                height={32}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </Link>
          <div className="hidden lg:flex flex-col pl-2">
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase font-mono">
              União Bag
            </span>
            <span className="text-xs font-semibold text-white/60">
              Analytics Hub · 2026
            </span>
          </div>
        </div>

        {/* Centro — Itens de Navegação com Bordas de Estado */}
        <nav className="hidden md:flex items-center gap-1 h-full px-4 border-l border-r border-white/5">
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
                <Icon className={cn("w-4 h-4", isActive ? "text-[#1b98e0]" : "text-white/30")} />
                <span>{item.label}</span>
                
                {item.badge && (
                  <span className={cn("ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight", BADGE_STYLES[item.badgeType || "info"])}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Lado Direito — Status, Alertas e Perfil Conectado */}
        <div className="flex items-center gap-4 h-full pl-4">
          
          {/* Status Caixa Neon Clean */}
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">ONLINE</span>
          </div>

          {/* Notificações com Divisor */}
          <div className="flex items-center h-full border-l border-white/10 pl-4">
            <button className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_6px_#ef4444]" />
            </button>
          </div>

          {/* Perfil Slim Executivo */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10 h-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1b98e0] to-[#0ea5e9] flex items-center justify-center border border-white/20 shadow-md">
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

      {/* CONTEÚDO PRINCIPAL — Foco Total nos Dashboards */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] z-10">
        <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
