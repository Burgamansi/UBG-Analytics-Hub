"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGLineChart } from "@/components/charts/line-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import {
  ShoppingCart,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ShieldAlert,
  FileSpreadsheet,
} from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";

// Mock Fallback Data (conforming to provider structure)
const DEFAULT_MOCK_DATA = {
  source: "mock" as "real" | "mock",
  sourceLabel: "Dados demonstrativos",
  technicalAlert: undefined as string | undefined,
  kpis: {
    totalFornecedores: 147,
    totalHomologados: 124,
    totalPendentes: 18,
    totalBloqueados: 5,
    valorComprado: 3150250,
    economiaObtida: 245180,
    leadTimeMedio: 8.2,
    avaliacoesPendentes: 12,
    fornecedoresCriticos: 7,
  },
  comprasMeses: [
    { label: "Jan", valor: 480000, economia: 35000 },
    { label: "Fev", valor: 520000, economia: 42000 },
    { label: "Mar", valor: 610000, economia: 48000 },
    { label: "Abr", valor: 590000, economia: 38000 },
    { label: "Mai", valor: 450000, economia: 30000 },
    { label: "Jun", valor: 500250, economia: 52180 },
  ],
  fornecedoresStatus: [
    { name: "Homologados", value: 124 },
    { name: "Pendentes", value: 18 },
    { name: "Bloqueados", value: 5 },
  ],
  fornecedoresRecentes: [
    { nome: "Big Bags Brasil Ltda", cnpj: "12.345.678/0001-90", status: "homologado" },
    { nome: "Sacarias União Industrial", cnpj: "98.765.432/0001-10", status: "homologado" },
    { nome: "Plásticos Sul-Sudeste S/A", cnpj: "45.678.901/0002-20", status: "pendente" },
    { nome: "Tecidos e Fios Nordeste", cnpj: "23.456.789/0001-30", status: "bloqueado" },
    { nome: "Insumos Químicos Paraná", cnpj: "34.567.890/0001-40", status: "homologado" },
  ],
  pedidosRecentes: [
    { numero: "PED-98741", fornecedor: "Big Bags Brasil Ltda", data: "2026-06-20", valor: 85000, leadTime: 6 },
    { numero: "PED-98735", fornecedor: "Sacarias União Industrial", data: "2026-06-18", valor: 124000, leadTime: 9 },
    { numero: "PED-98730", fornecedor: "Insumos Químicos Paraná", data: "2026-06-15", valor: 45000, leadTime: 5 },
    { numero: "PED-98722", fornecedor: "Plásticos Sul-Sudeste S/A", data: "2026-06-12", valor: 62000, leadTime: 12 },
    { numero: "PED-98715", fornecedor: "Tecidos e Fios Nordeste", data: "2026-06-08", valor: 195000, leadTime: 8 },
  ],
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function ComprasDashboardPage() {
  const [data, setData] = useState(DEFAULT_MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compras")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && !resData.error) {
          // Normaliza chaves de graficos se houver pequenos desvios de formato
          const normalizedMeses = (resData.comprasMeses || []).map((m: any) => ({
            label: m.label || "",
            valor: Number(m.valor || 0),
            economia: Number(m.economia || m.economia_obtida || 0),
          }));
          setData({
            ...resData,
            comprasMeses: normalizedMeses,
          });
        }
      })
      .catch((err) => console.error("Error loading Compras data:", err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data.comprasMeses.map((m) => ({
    name: m.label,
    "Valor Comprado": m.valor,
    Economia: m.economia ?? 0,
  }));

  const chartLines = [
    { key: "Valor Comprado", label: "Valor Comprado", color: "#2563EB" },
    { key: "Economia", label: "Economia Obtida", color: "#10B981" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="section-title mb-1">Módulo Compras</div>
          <h1 className="page-title">Painel de Suprimentos & Fornecedores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de Fornecedores · Homologações · Cotações · Pedidos de Compras
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className={cn(
            "inline-flex items-center gap-2 bg-white border px-3 py-2 text-slate-600 shadow-sm",
            data.source === "real" ? "border-emerald-200" : "border-slate-200"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              data.source === "real" ? "bg-emerald-500" : "bg-amber-500"
            )} />
            {data.sourceLabel}
          </span>
        </div>
      </div>

      {data.technicalAlert && (
        <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 p-4 text-sm text-blue-800 rounded">
          <strong>Aviso Técnico:</strong> {data.technicalAlert}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Homologados"
          value={formatNumber(data.kpis.totalHomologados)}
          icon={CheckCircle2}
          subtitle="Fornecedores aprovados"
          status="success"
          accentColor="#10B981"
        />
        <KPICard
          title="Total Pendentes"
          value={formatNumber(data.kpis.totalPendentes)}
          icon={Users}
          subtitle="Homologação em análise"
          status="warning"
          accentColor="#F59E0B"
        />
        <KPICard
          title="Total Bloqueados"
          value={formatNumber(data.kpis.totalBloqueados)}
          icon={ShieldAlert}
          subtitle="Inativos ou suspensos"
          status="danger"
          accentColor="#EF4444"
        />
        <KPICard
          title="Valor Comprado"
          value={formatCurrency(data.kpis.valorComprado)}
          icon={ShoppingCart}
          subtitle="Volume de compras acumulado"
          status="neutral"
          accentColor="#2563EB"
        />
        <KPICard
          title="Economia Obtida"
          value={formatCurrency(data.kpis.economiaObtida)}
          icon={TrendingUp}
          subtitle="Savings gerados em negociação"
          status="success"
          accentColor="#10B981"
        />
        <KPICard
          title="Lead Time Médio"
          value={`${data.kpis.leadTimeMedio.toFixed(1)} dias`}
          icon={Clock}
          subtitle="Prazo médio de atendimento"
          status="neutral"
          accentColor="#2563EB"
        />
        <KPICard
          title="Avaliações Pendentes"
          value={formatNumber(data.kpis.avaliacoesPendentes)}
          icon={FileSpreadsheet}
          subtitle="Questionários aguardando retorno"
          status="warning"
          accentColor="#F59E0B"
        />
        <KPICard
          title="Fornecedores Críticos"
          value={formatNumber(data.kpis.fornecedoresCriticos)}
          icon={AlertTriangle}
          subtitle="Desempenho operacional abaixo de 70%"
          status="danger"
          accentColor="#EF4444"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 shadow-sm rounded-lg">
          <h2 className="text-base font-bold text-slate-800 mb-4">Evolução Mensal de Compras e Economia</h2>
          <div className="h-80">
            <UBGLineChart
              data={chartData}
              lines={chartLines}
              xKey="name"
              height={300}
              formatValue={(val) => formatCurrency(val)}
              showLegend
            />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 shadow-sm rounded-lg">
          <h2 className="text-base font-bold text-slate-800 mb-4">Distribuição de Status de Fornecedores</h2>
          <div className="h-80 flex items-center justify-center">
            <UBGDonutChart
              data={data.fornecedoresStatus}
              height={260}
            />
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white border border-slate-100 p-6 shadow-sm rounded-lg">
          <h2 className="text-base font-bold text-slate-800 mb-4">Últimos Pedidos de Compras</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Nº Pedido</th>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.pedidosRecentes.map((ped, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{ped.numero}</td>
                    <td className="px-4 py-3 truncate max-w-[180px]">{ped.fornecedor}</td>
                    <td className="px-4 py-3">{ped.data}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(ped.valor)}</td>
                    <td className="px-4 py-3">{ped.leadTime} dias</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Suppliers */}
        <div className="bg-white border border-slate-100 p-6 shadow-sm rounded-lg">
          <h2 className="text-base font-bold text-slate-800 mb-4">Últimos Fornecedores Homologados/Cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Fornecedor</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.fornecedoresRecentes.map((forn, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{forn.nome}</td>
                    <td className="px-4 py-3">{forn.cnpj}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        forn.status === "homologado" && "bg-emerald-100 text-emerald-800",
                        forn.status === "pendente" && "bg-amber-100 text-amber-800",
                        forn.status === "bloqueado" && "bg-rose-100 text-rose-800"
                      )}>
                        {forn.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
