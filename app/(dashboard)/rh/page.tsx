"use client";

import { useState } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGBarChart } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import { UBGLineChart } from "@/components/charts/line-chart";
import { Users, AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { formatPercent, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const turnoverMeses = [
  { label: "Jan", turnover: 10.4, absenteismo: 7.3, meta_t: 6, meta_a: 5 },
  { label: "Fev", turnover: 12.0, absenteismo: 6.1, meta_t: 6, meta_a: 5 },
  { label: "Mar", turnover: 19.2, absenteismo: 8.4, meta_t: 6, meta_a: 5 },
];

const desligPorEmpresa = [
  { label: "Rafcorte", value: 20 },
  { label: "LPL", value: 15 },
  { label: "Lima", value: 7 },
  { label: "OP", value: 3 },
];

const motivosDeslig = [
  { name: "Não informado", value: 25 },
  { name: "Melhor salário", value: 10 },
  { name: "Produtividade", value: 5 },
  { name: "Comportamento", value: 3 },
  { name: "Outros", value: 2 },
];

const cids = [
  { label: "Falta (n. justif.)", value: 34 },
  { label: "Dores Musculares", value: 26 },
  { label: "Consulta Médica", value: 13 },
  { label: "Gripe/Resfriado", value: 8 },
  { label: "Outros", value: 6 },
];

const desligamentos = [
  { nome: "Colaborador 01", empresa: "Rafcorte", cargo: "Operador de Produção", motivo: "Melhor salário", mes: "Janeiro" },
  { nome: "Colaborador 02", empresa: "LPL", cargo: "Auxiliar Logístico", motivo: "Não informado", mes: "Janeiro" },
  { nome: "Colaborador 03", empresa: "Rafcorte", cargo: "Costureira", motivo: "Produtividade", mes: "Fevereiro" },
  { nome: "Colaborador 04", empresa: "Lima", cargo: "Auxiliar Administrativo", motivo: "Não informado", mes: "Fevereiro" },
  { nome: "Colaborador 05", empresa: "Rafcorte", cargo: "Operador de Máquina", motivo: "Comportamento", mes: "Março" },
  { nome: "Colaborador 06", empresa: "LPL", cargo: "Motorista", motivo: "Melhor salário", mes: "Março" },
  { nome: "Colaborador 07", empresa: "Rafcorte", cargo: "Costureira", motivo: "Não informado", mes: "Março" },
  { nome: "Colaborador 08", empresa: "OP", cargo: "Auxiliar Geral", motivo: "Não informado", mes: "Março" },
];

const motivoCores: Record<string, string> = {
  "Melhor salário": "bg-amber-100 text-amber-700",
  "Produtividade": "bg-red-100 text-red-700",
  "Comportamento": "bg-purple-100 text-purple-700",
  "Não informado": "bg-slate-100 text-slate-600",
  "Outros": "bg-blue-100 text-blue-700",
};

const TABS = ["Visão Geral", "Turnover", "Absenteísmo", "Desligamentos"];

export default function RHPage() {
  const [tab, setTab] = useState(0);
  const [busca, setBusca] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("Todas");

  const desligFiltrados = desligamentos.filter((d) => {
    const matchBusca =
      !busca ||
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchEmpresa =
      empresaFiltro === "Todas" || d.empresa === empresaFiltro;
    return matchBusca && matchEmpresa;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="section-title mb-1">Módulo RH</div>
        <h1 className="page-title">Dashboard de Recursos Humanos 2026</h1>
        <p className="text-sm text-slate-500 mt-1">
          Turnover · Absenteísmo · Atestados · Desligamentos · Jan–Mar 2026
        </p>
      </div>

      {/* Alert */}
      <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-red-800">
            Turnover 3,2× acima da meta em Março — 19,2% vs meta 6%
          </div>
          <div className="text-xs text-red-600 mt-0.5">
            45 desligamentos em 3 meses · Custo oculto estimado: R$ 135–225K ·
            Rafcorte: 47% dos desligamentos
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Turnover Médio"
          value="13,9%"
          subtitle="Meta: 6% — +131% acima"
          variation={131}
          icon={TrendingDown}
          accentColor="#EF4444"
          status="danger"
          meta="⚠ Crítico"
        />
        <KPICard
          title="Total Desligamentos"
          value="45"
          subtitle="Jan–Mar 2026"
          icon={Users}
          accentColor="#EF4444"
          status="danger"
          meta="Rafcorte: 20"
        />
        <KPICard
          title="Absenteísmo Médio"
          value="7,3%"
          subtitle="Meta: 5% — +46% acima"
          icon={AlertTriangle}
          accentColor="#F59E0B"
          status="warning"
          meta="Pico: 8,4% Mar"
        />
        <KPICard
          title="Horas de Ausência"
          value="2.657h"
          subtitle="Justificadas + Não justificadas"
          icon={Clock}
          accentColor="#F59E0B"
          status="warning"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={cn(
              "px-5 py-2.5 text-sm font-semibold border-b-2 transition-all",
              tab === i
                ? "border-brand-cyan text-brand-cyan"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Visão Geral */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Turnover e Absenteísmo vs Metas</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Evolução mensal Jan–Mar 2026
              </div>
              <UBGLineChart
                data={turnoverMeses}
                lines={[
                  { key: "turnover", label: "Turnover %", color: "#EF4444" },
                  { key: "absenteismo", label: "Absenteísmo %", color: "#F59E0B" },
                  { key: "meta_t", label: "Meta Turnover 6%", color: "#10B981", dashed: true },
                  { key: "meta_a", label: "Meta Abs. 5%", color: "#6366F1", dashed: true },
                ]}
                xKey="label"
                formatValue={(v) => formatPercent(v)}
                height={240}
              />
            </div>
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Desligamentos por Empresa</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Jan–Mar 2026 — Total: 45
              </div>
              <UBGBarChart
                data={desligPorEmpresa}
                formatValue={formatNumber}
                color="#EF4444"
                height={220}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Motivos de Desligamento</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                56% sem motivo registrado — falha no processo
              </div>
              <UBGDonutChart
                data={motivosDeslig}
                formatValue={formatNumber}
                height={220}
              />
            </div>
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Top CIDs — Dias de Afastamento</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Dores musculares = risco ergonômico na produção
              </div>
              <UBGBarChart
                data={cids}
                formatValue={formatNumber}
                color="#F59E0B"
                height={220}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Turnover */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Evolução do Turnover vs Meta 6%</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Tendência de alta preocupante
              </div>
              <UBGLineChart
                data={turnoverMeses}
                lines={[
                  { key: "turnover", label: "Turnover %", color: "#EF4444" },
                  { key: "meta_t", label: "Meta 6%", color: "#10B981", dashed: true },
                ]}
                xKey="label"
                formatValue={(v) => formatPercent(v)}
                height={240}
                referenceLine={{ value: 6, label: "Meta 6%", color: "#10B981" }}
              />
            </div>
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Participação por Empresa</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Rafcorte: 47% dos desligamentos
              </div>
              <UBGDonutChart
                data={desligPorEmpresa}
                formatValue={formatNumber}
                height={240}
              />
            </div>
          </div>
          {/* Tabela mensal */}
          <div className="bg-white border border-slate-200 p-5">
            <div className="section-title mb-4">Turnover Mensal por Empresa</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Empresa</th>
                  <th className="text-center p-3">Janeiro</th>
                  <th className="text-center p-3">Fevereiro</th>
                  <th className="text-center p-3">Março</th>
                  <th className="text-center p-3">Média</th>
                  <th className="text-center p-3">Meta</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { empresa: "Rafcorte", jan: 14.2, fev: 18.5, mar: 28.6, meta: 6 },
                  { empresa: "LPL", jan: 12.1, fev: 14.8, mar: 22.4, meta: 6 },
                  { empresa: "Lima", jan: 7.8, fev: 8.2, mar: 11.4, meta: 6 },
                  { empresa: "OP", jan: 5.2, fev: 6.1, mar: 9.8, meta: 6 },
                ].map((r) => {
                  const media = ((r.jan + r.fev + r.mar) / 3);
                  const acima = media > r.meta;
                  return (
                    <tr key={r.empresa} className="border-b border-slate-100 table-row-hover">
                      <td className="p-3 font-semibold text-slate-800">{r.empresa}</td>
                      <td className="p-3 text-center">{formatPercent(r.jan)}</td>
                      <td className="p-3 text-center">{formatPercent(r.fev)}</td>
                      <td className={cn("p-3 text-center font-bold", r.mar > 20 ? "text-red-600" : "text-amber-600")}>
                        {formatPercent(r.mar)}
                      </td>
                      <td className={cn("p-3 text-center font-bold", acima ? "text-red-600" : "text-emerald-600")}>
                        {formatPercent(media)}
                      </td>
                      <td className="p-3 text-center text-slate-400">{formatPercent(r.meta)}</td>
                      <td className="p-3 text-center">
                        <span className={cn("badge", acima ? "badge-danger" : "badge-success")}>
                          {acima ? "Acima" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Absenteísmo */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Absenteísmo % vs Meta 5%</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Pico em Março: 8,4% (+68% acima da meta)
              </div>
              <UBGLineChart
                data={turnoverMeses}
                lines={[
                  { key: "absenteismo", label: "Absenteísmo %", color: "#F59E0B" },
                  { key: "meta_a", label: "Meta 5%", color: "#10B981", dashed: true },
                ]}
                xKey="label"
                formatValue={(v) => formatPercent(v)}
                height={240}
                referenceLine={{ value: 5, label: "Meta 5%", color: "#10B981" }}
              />
            </div>
            <div className="bg-white border border-slate-200 p-5">
              <div className="section-title mb-1">Top CIDs — Dias Afastados</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Dores musculares = 2º maior CID (risco ergonômico)
              </div>
              <UBGBarChart
                data={cids}
                formatValue={formatNumber}
                color="#F59E0B"
                height={240}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Janeiro", pct: 7.3, hj: 768, hnj: 150, status: "warning" },
              { label: "Fevereiro", pct: 6.1, hj: 724, hnj: 180, status: "warning" },
              { label: "Março ⚠", pct: 8.4, hj: 655, hnj: 180, status: "danger" },
            ].map((m) => (
              <div
                key={m.label}
                className={cn(
                  "bg-white border border-slate-200 p-5",
                  m.status === "danger" ? "border-t-4 border-t-red-500" : "border-t-4 border-t-amber-400"
                )}
              >
                <div className="text-sm font-bold text-slate-700 mb-3">{m.label}</div>
                <div className={cn("text-3xl font-black", m.status === "danger" ? "text-red-600" : "text-amber-600")}>
                  {formatPercent(m.pct)}
                </div>
                <div className="text-xs text-slate-400 mb-3">Meta: 5%</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">H. Justificadas:</span>
                    <span className="font-semibold">{m.hj}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">H. Não Justif.:</span>
                    <span className="font-semibold text-red-600">{m.hnj}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Desligamentos */}
      {tab === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Buscar por nome ou cargo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="border border-slate-200 px-3 py-2 text-sm w-64 focus:outline-none focus:border-brand-cyan"
            />
            <select
              value={empresaFiltro}
              onChange={(e) => setEmpresaFiltro(e.target.value)}
              className="border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-cyan"
            >
              {["Todas", "Rafcorte", "LPL", "Lima", "OP"].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              {desligFiltrados.length} de {desligamentos.length} registros
            </span>
          </div>
          <div className="bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Empresa</th>
                  <th className="text-left p-3">Cargo</th>
                  <th className="text-left p-3">Motivo</th>
                  <th className="text-left p-3">Mês</th>
                </tr>
              </thead>
              <tbody>
                {desligFiltrados.map((d, i) => (
                  <tr key={i} className="border-b border-slate-100 table-row-hover">
                    <td className="p-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">{d.nome}</td>
                    <td className="p-3">
                      <span className="badge badge-info">{d.empresa}</span>
                    </td>
                    <td className="p-3 text-slate-600">{d.cargo}</td>
                    <td className="p-3">
                      <span className={cn("badge", motivoCores[d.motivo] || "badge-info")}>
                        {d.motivo}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{d.mes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
