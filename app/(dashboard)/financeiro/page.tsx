"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGLineChart } from "@/components/charts/line-chart";
import { DollarSign, TrendingDown, Wallet, Percent, Info } from "lucide-react";
import { formatMillions, formatPercent, getMonthShort } from "@/lib/utils";
import type { FinanceiroSummary } from "@/lib/parsers/parse-financeiro";

export const dynamic = "force-dynamic";

const DEMO_SUMMARY: FinanceiroSummary = {
  receita_total: 0,
  custos: 0,
  despesas: 0,
  lucro_bruto: 0,
  resultado_liquido: 0,
  margem_pct: 0,
  evolucao_mensal: [],
};

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinanceiroSummary | null>(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/financeiro")
      .then((res) => res.json())
      .then((data) => {
        setAvailable(Boolean(data.available));
        setSummary(data.summary ?? DEMO_SUMMARY);
      })
      .catch(() => {
        setAvailable(false);
        setSummary(DEMO_SUMMARY);
      })
      .finally(() => setLoading(false));
  }, []);

  const dados = summary ?? DEMO_SUMMARY;

  const evolucaoData = dados.evolucao_mensal.map((m) => ({
    label: getMonthShort(m.mes),
    receita: m.receita,
    custos: m.custos,
    despesas: m.despesas,
    resultado: m.resultado,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="section-title mb-1">Módulo Financeiro</div>
        <h1 className="page-title">Dashboard Financeiro / DRE</h1>
        <p className="text-sm text-slate-500 mt-1">
          Receitas, custos, despesas e resultado · Importado via Upload de Dados
        </p>
      </div>

      {!loading && !available && (
        <div className="bg-sky-50 border border-sky-200 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <strong>Nenhum dado importado ainda.</strong> Vá em{" "}
            <span className="font-semibold">Upload de Dados</span>, selecione o módulo{" "}
            <span className="font-semibold">Financeiro / DRE</span> e envie a planilha de
            custos para alimentar este painel.
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Receita Total"
          value={formatMillions(dados.receita_total)}
          subtitle="Faturamento / Receita"
          icon={DollarSign}
          accentColor="#10B981"
          status="success"
        />
        <KPICard
          title="Custos"
          value={formatMillions(dados.custos)}
          subtitle="Custo do Produto (CMV)"
          icon={TrendingDown}
          accentColor="#F59E0B"
        />
        <KPICard
          title="Despesas"
          value={formatMillions(dados.despesas)}
          subtitle="Demais categorias do DRE"
          icon={Wallet}
          accentColor="#EF4444"
        />
        <KPICard
          title="Margem"
          value={formatPercent(dados.margem_pct)}
          subtitle="Resultado líquido / Receita"
          icon={Percent}
          accentColor="#29ABE2"
          status={dados.margem_pct >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Lucro bruto / Resultado líquido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-5" style={{ borderTop: "3px solid #1a3a5c" }}>
          <div className="section-title mb-1">Lucro Bruto</div>
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Receita Total − Custos
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatMillions(dados.lucro_bruto)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5" style={{ borderTop: "3px solid #29ABE2" }}>
          <div className="section-title mb-1">Resultado Líquido</div>
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Lucro Bruto − Despesas
          </div>
          <div className="text-3xl font-black text-slate-900">
            {formatMillions(dados.resultado_liquido)}
          </div>
        </div>
      </div>

      {/* Evolução mensal */}
      <div className="bg-white border border-slate-200 p-5">
        <div className="section-title mb-1">Evolução Mensal</div>
        <div className="text-sm font-semibold text-slate-700 mb-4">
          Receita, custos, despesas e resultado por mês
        </div>
        {evolucaoData.length > 0 ? (
          <UBGLineChart
            data={evolucaoData}
            lines={[
              { key: "receita", label: "Receita", color: "#10B981" },
              { key: "custos", label: "Custos", color: "#F59E0B" },
              { key: "despesas", label: "Despesas", color: "#EF4444" },
              { key: "resultado", label: "Resultado", color: "#29ABE2", dashed: true },
            ]}
            formatValue={formatMillions}
            height={280}
          />
        ) : (
          <div className="text-sm text-slate-400 py-10 text-center">
            Sem dados de evolução mensal. Importe a planilha financeira para visualizar.
          </div>
        )}
      </div>
    </div>
  );
}
