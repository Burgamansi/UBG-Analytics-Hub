"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGBarChart } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import { UBGLineChart } from "@/components/charts/line-chart";
import { Users, AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { formatPercent, formatNumber, getMonthName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RHSummary } from "@/app/api/rh/route";

const motivoCores: Record<string, string> = {
  "Melhor salário": "bg-amber-100 text-amber-700",
  "Produtividade": "bg-red-100 text-red-700",
  "Comportamento": "bg-purple-100 text-purple-700",
  "Não informado": "bg-slate-100 text-slate-600",
  "Outros": "bg-blue-100 text-blue-700",
};

const TABS = ["Visão Geral", "Turnover", "Absenteísmo", "Desligamentos"];
const CARD = "bg-white border border-gray-200 shadow-[0_0_12px_rgba(0,0,0,0.03)] p-5";
const META_TURNOVER = 6;
const META_ABSENTEISMO = 5;

export default function RHPage() {
  const [tab, setTab] = useState(0);
  const [busca, setBusca] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("Todas");
  const [summary, setSummary] = useState<RHSummary | null>(null);

  useEffect(() => {
    fetch("/api/rh")
      .then((r) => r.json())
      .then((data) => { if (data.summary) setSummary(data.summary); })
      .catch(() => {});
  }, []);

  if (!summary) {
    return <div className="p-6 text-sm text-slate-400">Carregando...</div>;
  }

  const {
    kpis,
    turnoverMeses,
    desligPorEmpresa,
    motivosDeslig,
    cids,
    desligamentos,
    empresas,
    turnoversEmpresa,
    mesesDisponiveis,
  } = summary;

  const piorMesTurnover =
    turnoverMeses.length > 0
      ? turnoverMeses.reduce((a, b) => (b.turnover > a.turnover ? b : a))
      : null;
  const multiplicador = piorMesTurnover
    ? (piorMesTurnover.turnover / META_TURNOVER).toFixed(1)
    : "?";
  const piorEmpresa = desligPorEmpresa[0];
  const pctPiorEmpresa =
    piorEmpresa && kpis.totalDesligamentos > 0
      ? Math.round((piorEmpresa.value / kpis.totalDesligamentos) * 100)
      : 0;

  const desligFiltrados = desligamentos.filter((d) => {
    const matchBusca =
      !busca ||
      d.nome.toLowerCase().includes(busca.toLowerCase()) ||
      d.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchEmpresa =
      empresaFiltro === "Todas" || d.empresa === empresaFiltro;
    return matchBusca && matchEmpresa;
  });

  const piorMesAbs =
    turnoverMeses.length > 0
      ? turnoverMeses.reduce((a, b) => (b.absenteismo > a.absenteismo ? b : a))
      : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="section-title mb-1">Módulo RH</div>
        <h1 className="page-title">
          Dashboard de Recursos Humanos {kpis.periodo.split(" ").pop()}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Turnover · Absenteísmo · Atestados · Desligamentos · {kpis.periodo}
        </p>
      </div>

      {/* Alert */}
      {piorMesTurnover && (
        <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-red-800">
              Turnover {multiplicador}× acima da meta em{" "}
              {getMonthName(piorMesTurnover.mes)} —{" "}
              {formatPercent(piorMesTurnover.turnover)} vs meta{" "}
              {formatPercent(META_TURNOVER)}
            </div>
            <div className="text-xs text-red-600 mt-0.5">
              {kpis.totalDesligamentos} desligamentos · {kpis.periodo}
              {piorEmpresa
                ? ` · ${piorEmpresa.label}: ${pctPiorEmpresa}% dos desligamentos`
                : ""}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Turnover Médio"
          value={formatPercent(kpis.turnoverMedio)}
          subtitle={`Meta: ${formatPercent(META_TURNOVER)} — +${Math.round((kpis.turnoverMedio / META_TURNOVER - 1) * 100)}% acima`}
          variation={(kpis.turnoverMedio / META_TURNOVER - 1) * 100}
          icon={TrendingDown}
          accentColor="#EF4444"
          status="danger"
          meta="⚠ Crítico"
        />
        <KPICard
          title="Total Desligamentos"
          value={String(kpis.totalDesligamentos)}
          subtitle={kpis.periodo}
          icon={Users}
          accentColor="#EF4444"
          status="danger"
          meta={piorEmpresa ? `${piorEmpresa.label}: ${piorEmpresa.value}` : undefined}
        />
        <KPICard
          title="Absenteísmo Médio"
          value={formatPercent(kpis.absenteismoMedio)}
          subtitle={`Meta: ${formatPercent(META_ABSENTEISMO)} — +${Math.round((kpis.absenteismoMedio / META_ABSENTEISMO - 1) * 100)}% acima`}
          icon={AlertTriangle}
          accentColor="#F59E0B"
          status="warning"
          meta={
            piorMesAbs
              ? `Pico: ${formatPercent(piorMesAbs.absenteismo)} ${piorMesAbs.label}`
              : undefined
          }
        />
        <KPICard
          title="Horas de Ausência"
          value={`${formatNumber(kpis.horasAusencia)}h`}
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
            <div className={CARD}>
              <div className="section-title mb-1">Turnover e Absenteísmo vs Metas</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Evolução mensal {kpis.periodo}
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
            <div className={CARD}>
              <div className="section-title mb-1">Desligamentos por Empresa</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                {kpis.periodo} — Total: {kpis.totalDesligamentos}
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
            <div className={CARD}>
              <div className="section-title mb-1">Motivos de Desligamento</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                {motivosDeslig[0]
                  ? `${Math.round((motivosDeslig[0].value / kpis.totalDesligamentos) * 100)}% "${motivosDeslig[0].name}" — falha no processo`
                  : "Distribuição de motivos"}
              </div>
              <UBGDonutChart
                data={motivosDeslig}
                formatValue={formatNumber}
                height={220}
              />
            </div>
            <div className={CARD}>
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
            <div className={CARD}>
              <div className="section-title mb-1">
                Evolução do Turnover vs Meta {formatPercent(META_TURNOVER)}
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                Tendência de alta preocupante
              </div>
              <UBGLineChart
                data={turnoverMeses}
                lines={[
                  { key: "turnover", label: "Turnover %", color: "#EF4444" },
                  { key: "meta_t", label: `Meta ${formatPercent(META_TURNOVER)}`, color: "#10B981", dashed: true },
                ]}
                xKey="label"
                formatValue={(v) => formatPercent(v)}
                height={240}
                referenceLine={{ value: META_TURNOVER, label: `Meta ${formatPercent(META_TURNOVER)}`, color: "#10B981" }}
              />
            </div>
            <div className={CARD}>
              <div className="section-title mb-1">Participação por Empresa</div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                {piorEmpresa
                  ? `${piorEmpresa.label}: ${pctPiorEmpresa}% dos desligamentos`
                  : "Distribuição por empresa"}
              </div>
              <UBGDonutChart
                data={desligPorEmpresa.map((d) => ({ name: d.label, value: d.value }))}
                formatValue={formatNumber}
                height={240}
              />
            </div>
          </div>
          {/* Tabela dinâmica por empresa/mês */}
          <div className={CARD.replace(" p-5", "")}>
            <div className="p-5 pb-0">
              <div className="section-title mb-4">Turnover Mensal por Empresa</div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Empresa</th>
                  {mesesDisponiveis.map((m) => (
                    <th key={m.mes} className="text-center p-3">{m.label}</th>
                  ))}
                  <th className="text-center p-3">Média</th>
                  <th className="text-center p-3">Meta</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {turnoversEmpresa.map((r) => {
                  const acima = r.media > r.meta;
                  const vals = mesesDisponiveis.map((m) => r.porMes[m.mes] ?? 0);
                  const ultimoVal = vals[vals.length - 1] ?? 0;
                  return (
                    <tr key={r.empresa} className="border-b border-slate-100 table-row-hover">
                      <td className="p-3 font-semibold text-slate-800">{r.empresa}</td>
                      {vals.map((val, i) => (
                        <td
                          key={i}
                          className={cn(
                            "p-3 text-center",
                            i === vals.length - 1 && ultimoVal > 20
                              ? "font-bold text-red-600"
                              : i === vals.length - 1
                              ? "font-bold text-amber-600"
                              : ""
                          )}
                        >
                          {formatPercent(val)}
                        </td>
                      ))}
                      <td
                        className={cn(
                          "p-3 text-center font-bold",
                          acima ? "text-red-600" : "text-emerald-600"
                        )}
                      >
                        {formatPercent(r.media)}
                      </td>
                      <td className="p-3 text-center text-slate-400">
                        {formatPercent(r.meta)}
                      </td>
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
            <div className={CARD}>
              <div className="section-title mb-1">
                Absenteísmo % vs Meta {formatPercent(META_ABSENTEISMO)}
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-4">
                {piorMesAbs
                  ? `Pico em ${getMonthName(piorMesAbs.mes)}: ${formatPercent(piorMesAbs.absenteismo)} (+${Math.round((piorMesAbs.absenteismo / META_ABSENTEISMO - 1) * 100)}% acima da meta)`
                  : "Evolução do absenteísmo"}
              </div>
              <UBGLineChart
                data={turnoverMeses}
                lines={[
                  { key: "absenteismo", label: "Absenteísmo %", color: "#F59E0B" },
                  { key: "meta_a", label: `Meta ${formatPercent(META_ABSENTEISMO)}`, color: "#10B981", dashed: true },
                ]}
                xKey="label"
                formatValue={(v) => formatPercent(v)}
                height={240}
                referenceLine={{ value: META_ABSENTEISMO, label: `Meta ${formatPercent(META_ABSENTEISMO)}`, color: "#10B981" }}
              />
            </div>
            <div className={CARD}>
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {turnoverMeses.map((m) => {
              const status = m.absenteismo > 7 ? "danger" : "warning";
              return (
                <div
                  key={m.mes}
                  className={cn(
                    "bg-white border border-gray-200 shadow-[0_0_12px_rgba(0,0,0,0.03)] p-5",
                    status === "danger"
                      ? "border-t-4 border-t-red-500"
                      : "border-t-4 border-t-amber-400"
                  )}
                >
                  <div className="text-sm font-bold text-slate-700 mb-3">
                    {getMonthName(m.mes)}{status === "danger" ? " ⚠" : ""}
                  </div>
                  <div
                    className={cn(
                      "text-3xl font-black",
                      status === "danger" ? "text-red-600" : "text-amber-600"
                    )}
                  >
                    {formatPercent(m.absenteismo)}
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    Meta: {formatPercent(META_ABSENTEISMO)}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">H. Justificadas:</span>
                      <span className="font-semibold">{formatNumber(m.hj)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">H. Não Justif.:</span>
                      <span className="font-semibold text-red-600">{formatNumber(m.hnj)}h</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              {["Todas", ...empresas].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              {desligFiltrados.length} de {desligamentos.length} registros
            </span>
          </div>
          <div className="bg-white border border-gray-200 shadow-[0_0_12px_rgba(0,0,0,0.03)] overflow-hidden">
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
