"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/ui/kpi-card";
import { UBGLineChart } from "@/components/charts/line-chart";
import { UBGBarChart, UBGHorizontalBar } from "@/components/charts/bar-chart";
import { UBGDonutChart } from "@/components/charts/donut-chart";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Percent,
  Info,
  BarChart3,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  formatMillions,
  formatPercent,
  formatCurrency,
  getMonthShort,
} from "@/lib/utils";
import type { FinanceiroSummary } from "@/lib/parsers/parse-financeiro";

export const dynamic = "force-dynamic";

const DEMO_SUMMARY: FinanceiroSummary = {
  receita_total: 0,
  receita_liquida: 0,
  custos: 0,
  despesas: 0,
  lucro_bruto: 0,
  resultado_liquido: 0,
  ebitda: 0,
  margem_pct: 0,
  margem_ebitda_pct: 0,
  tributos_vendas: 0,
  despesas_vendas: 0,
  resultado_financeiro: 0,
  aplicacoes: 0,
  emprestimos: 0,
  retirada_socios: 0,
  evolucao_mensal: [],
  custo_rh: [],
  plano_contas: [],
  meses_com_dados: 0,
  ano_referencia: new Date().getFullYear(),
};

// ── Section Card — Light Executive ───────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  accentColor = "#1b98e0",
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #E5E7EB",
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "18px 24px 14px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 3px 0",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: 12,
                fontFamily: "'Inter', sans-serif",
                color: "#9CA3AF",
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              color: accentColor,
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              borderRadius: 20,
              padding: "3px 10px",
              flexShrink: 0,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        height: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#9CA3AF",
      }}
    >
      <BarChart3 style={{ width: 28, height: 28, opacity: 0.4 }} />
      <p
        style={{
          fontSize: 13,
          fontFamily: "'Space Grotesk', sans-serif",
          margin: 0,
        }}
      >
        Sem dados disponíveis
      </p>
    </div>
  );
}

// ── Metric Row — Light ────────────────────────────────────────────────────────
function MetricRow({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 0",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 13,
            fontFamily: "'Inter', sans-serif",
            color: "#374151",
            margin: 0,
          }}
        >
          {label}
        </p>
        {sub && (
          <p
            style={{
              fontSize: 11,
              fontFamily: "'Inter', sans-serif",
              color: "#9CA3AF",
              margin: "2px 0 0 0",
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <span
        style={{
          fontSize: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Derived Metric Card — Light ───────────────────────────────────────────────
function DerivedCard({
  title,
  subtitle,
  value,
  isPositive,
  accentColor,
  details,
}: {
  title: string;
  subtitle: string;
  value: string;
  isPositive: boolean;
  accentColor: string;
  details?: { label: string; value: string; color: string }[];
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #E5E7EB",
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9CA3AF",
          margin: "0 0 4px 0",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          color: "#6B7280",
          margin: "0 0 12px 0",
        }}
      >
        {subtitle}
      </p>
      <p
        style={{
          fontSize: 34,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          color: isPositive ? "#111827" : "#DC2626",
          margin: "0 0 10px 0",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {details && details.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {details.map((d, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                color: "#6B7280",
              }}
            >
              {d.label}:{" "}
              <strong style={{ color: d.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {d.value}
              </strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinanceiroSummary | null>(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"dre" | "custos" | "plano">("dre");

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

  const d = summary ?? DEMO_SUMMARY;

  const mesesComDados = d.evolucao_mensal.filter(
    (m) => m.receita !== 0 || m.custos !== 0 || m.ebitda !== 0
  );

  const evolucaoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    receita: m.receita,
    receita_liquida: m.receita_liquida,
    custos: m.custos,
    despesas: m.despesas,
    resultado: m.resultado,
    ebitda: m.ebitda,
  }));

  const ebitdaData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.ebitda,
  }));

  const resultadoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.resultado,
  }));

  const faturamentoData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.receita,
  }));

  const distribuicaoCustos = [
    { name: "CMV", value: d.custos, color: "#F59E0B" },
    { name: "ADM", value: d.despesas, color: "#EF4444" },
    { name: "Tributos Vendas", value: d.tributos_vendas, color: "#8B5CF6" },
    { name: "Desp. Vendas", value: d.despesas_vendas, color: "#EC4899" },
  ].filter((i) => i.value > 0);

  const topContas = [...d.plano_contas]
    .filter((p) => p.realizado > 0)
    .sort((a, b) => b.realizado - a.realizado)
    .slice(0, 10)
    .map((p) => ({ label: p.descricao, value: p.realizado }));

  const custoRHData = d.custo_rh.map((r) => ({
    label: r.unidade,
    value: r.valor,
  }));

  const resultFinData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    aplicacoes: m.aplicacoes,
    emprestimos: m.emprestimos,
    resultado_financeiro: m.resultado_financeiro,
  }));

  const margemData = mesesComDados.map((m) => ({
    label: getMonthShort(m.mes),
    value: m.receita > 0 ? (m.ebitda / m.receita) * 100 : 0,
  }));

  const hasData = mesesComDados.length > 0;

  const tabs = [
    { key: "dre" as const, label: "DRE — Evolução Mensal" },
    { key: "custos" as const, label: "Análise de Custos" },
    { key: "plano" as const, label: "Plano de Contas" },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1400 }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#1b98e0",
              margin: "0 0 6px 0",
            }}
          >
            Módulo Financeiro
          </p>
          <h1
            style={{
              fontSize: 32,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 6px 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Dashboard Financeiro / DRE
          </h1>
          <p
            style={{
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              color: "#6B7280",
              margin: 0,
            }}
          >
            Receitas, custos, despesas e resultado · Ano {d.ano_referencia}
            {hasData &&
              ` · ${d.meses_com_dados} ${d.meses_com_dados === 1 ? "mês" : "meses"} com dados`}
          </p>
        </div>

        {hasData && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <div
              style={{
                background: d.ebitda >= 0 ? "#ECFDF5" : "#FEF2F2",
                border: `1px solid ${d.ebitda >= 0 ? "#A7F3D0" : "#FECACA"}`,
                borderRadius: 10,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {d.ebitda >= 0 ? (
                <TrendingUp style={{ width: 15, height: 15, color: "#059669" }} />
              ) : (
                <AlertTriangle style={{ width: 15, height: 15, color: "#DC2626" }} />
              )}
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  color: d.ebitda >= 0 ? "#059669" : "#DC2626",
                }}
              >
                EBITDA {formatMillions(d.ebitda)}
              </span>
            </div>
            <div
              style={{
                background: d.resultado_liquido >= 0 ? "#EFF6FF" : "#FEF2F2",
                border: `1px solid ${d.resultado_liquido >= 0 ? "#BFDBFE" : "#FECACA"}`,
                borderRadius: 10,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Activity
                style={{
                  width: 15,
                  height: 15,
                  color: d.resultado_liquido >= 0 ? "#1b98e0" : "#DC2626",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  color: d.resultado_liquido >= 0 ? "#1b98e0" : "#DC2626",
                }}
              >
                Líquido {formatMillions(d.resultado_liquido)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Banner sem dados ─────────────────────────────────────────────── */}
      {!loading && !available && (
        <div
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Info style={{ width: 18, height: 18, color: "#1b98e0", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, fontFamily: "'Inter', sans-serif", color: "#374151", margin: 0 }}>
            <strong style={{ color: "#111827" }}>Nenhum dado importado ainda.</strong>{" "}
            Vá em{" "}
            <strong style={{ color: "#1b98e0" }}>Upload de Dados</strong>,
            selecione o módulo{" "}
            <strong style={{ color: "#1b98e0" }}>Financeiro / DRE</strong> e
            envie a planilha{" "}
            <strong style={{ color: "#111827" }}>Custo - DRE 2026.xlsx</strong>{" "}
            para alimentar este painel.
          </p>
        </div>
      )}

      {/* ── KPIs Linha 1: Receita ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <KPICard
          title="Faturamento Bruto"
          value={formatMillions(d.receita_total)}
          subtitle="Receita bruta acumulada"
          icon={DollarSign}
          accentColor="#059669"
        />
        <KPICard
          title="Receita Líquida"
          value={formatMillions(d.receita_liquida)}
          subtitle="Após deduções e tributos"
          icon={TrendingUp}
          accentColor="#1b98e0"
        />
        <KPICard
          title="EBITDA"
          value={formatMillions(d.ebitda)}
          subtitle="Resultado operacional"
          icon={BarChart3}
          accentColor={d.ebitda >= 0 ? "#1b98e0" : "#DC2626"}
        />
        <KPICard
          title="Margem EBITDA"
          value={formatPercent(d.margem_ebitda_pct)}
          subtitle="EBITDA / Faturamento"
          icon={Percent}
          accentColor={d.margem_ebitda_pct >= 0 ? "#059669" : "#DC2626"}
        />
      </div>

      {/* ── KPIs Linha 2: Custos e Resultado ─────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KPICard
          title="CMV"
          value={formatMillions(d.custos)}
          subtitle="Custo de Mercadoria Vendida"
          icon={TrendingDown}
          accentColor="#F59E0B"
        />
        <KPICard
          title="Despesas ADM"
          value={formatMillions(d.despesas)}
          subtitle="Despesas administrativas"
          icon={Wallet}
          accentColor="#EF4444"
        />
        <KPICard
          title="Resultado Líquido"
          value={formatMillions(d.resultado_liquido)}
          subtitle="Após resultado financeiro"
          icon={Activity}
          accentColor={d.resultado_liquido >= 0 ? "#059669" : "#DC2626"}
        />
        <KPICard
          title="Margem Líquida"
          value={formatPercent(d.margem_pct)}
          subtitle="Resultado líquido / Faturamento"
          icon={Percent}
          accentColor={d.margem_pct >= 0 ? "#1b98e0" : "#DC2626"}
        />
      </div>

      {/* ── Linha 3: Métricas Derivadas ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <DerivedCard
          title="Lucro Bruto"
          subtitle="Receita Líquida − CMV"
          value={formatMillions(d.lucro_bruto)}
          isPositive={d.lucro_bruto >= 0}
          accentColor="#1b98e0"
        />
        <DerivedCard
          title="Resultado Financeiro"
          subtitle="Aplicações − Empréstimos"
          value={formatMillions(d.resultado_financeiro)}
          isPositive={d.resultado_financeiro >= 0}
          accentColor="#0EA5E9"
          details={[
            { label: "Aplicações", value: formatMillions(d.aplicacoes), color: "#059669" },
            { label: "Empréstimos", value: formatMillions(d.emprestimos), color: "#DC2626" },
          ]}
        />
        <DerivedCard
          title="Deduções da Receita"
          subtitle="Tributos + Despesas de Vendas"
          value={formatMillions(d.tributos_vendas + d.despesas_vendas)}
          isPositive={false}
          accentColor="#8B5CF6"
          details={[
            { label: "Tributos", value: formatMillions(d.tributos_vendas), color: "#8B5CF6" },
            { label: "Desp. Vendas", value: formatMillions(d.despesas_vendas), color: "#EC4899" },
          ]}
        />
      </div>

      {/* ── Abas de Análise ──────────────────────────────────────────────── */}
      <div>
        {/* Tab Nav */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#F3F4F6",
            padding: 4,
            borderRadius: 12,
            width: "fit-content",
            marginBottom: 20,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAbaAtiva(tab.key)}
              style={{
                padding: "8px 20px",
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                border: "none",
                borderRadius: 9,
                cursor: "pointer",
                transition: "all 0.15s ease",
                background: abaAtiva === tab.key ? "#ffffff" : "transparent",
                color: abaAtiva === tab.key ? "#13233d" : "#6B7280",
                boxShadow: abaAtiva === tab.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                letterSpacing: "0.01em",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABA: DRE — Evolução Mensal */}
        {abaAtiva === "dre" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionCard
              title="Evolução Mensal — Receita vs Custos vs Resultado"
              subtitle="Faturamento, CMV, despesas e resultado líquido por mês"
              accentColor="#1b98e0"
              badge={`${mesesComDados.length} meses`}
            >
              {hasData ? (
                <UBGLineChart
                  data={evolucaoData}
                  lines={[
                    { key: "receita", label: "Faturamento", color: "#059669" },
                    { key: "receita_liquida", label: "Rec. Líquida", color: "#1b98e0" },
                    { key: "custos", label: "CMV", color: "#F59E0B" },
                    { key: "despesas", label: "ADM", color: "#EF4444" },
                    { key: "resultado", label: "Resultado", color: "#8B5CF6", dashed: true },
                  ]}
                  formatValue={formatMillions}
                  height={300}
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SectionCard
                title="EBITDA por Mês"
                subtitle="Resultado operacional antes de juros e impostos"
                accentColor="#1b98e0"
              >
                {hasData ? (
                  <UBGBarChart
                    data={ebitdaData}
                    formatValue={formatMillions}
                    color="#1b98e0"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Margem EBITDA (%)"
                subtitle="EBITDA como % do faturamento por mês"
                accentColor="#059669"
              >
                {hasData ? (
                  <UBGBarChart
                    data={margemData}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                    color="#059669"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SectionCard
                title="Faturamento por Mês"
                subtitle="Receita bruta mensal"
                accentColor="#13233d"
              >
                {hasData ? (
                  <UBGBarChart
                    data={faturamentoData}
                    formatValue={formatMillions}
                    color="#13233d"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Resultado Líquido por Mês"
                subtitle="Lucro ou prejuízo mensal"
                accentColor="#8B5CF6"
              >
                {hasData ? (
                  <UBGBarChart
                    data={resultadoData}
                    formatValue={formatMillions}
                    color="#8B5CF6"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            {/* Tabela DRE Light */}
            <SectionCard
              title="Tabela DRE — Resumo Mensal"
              subtitle="Valores consolidados por mês"
              accentColor="#1b98e0"
            >
              {hasData ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB" }}>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "10px 14px",
                            fontSize: 11,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "#6B7280",
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          Indicador
                        </th>
                        {mesesComDados.map((m) => (
                          <th
                            key={m.mes}
                            style={{
                              textAlign: "right",
                              padding: "10px 10px",
                              fontSize: 11,
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              color: "#6B7280",
                              borderBottom: "1px solid #E5E7EB",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {getMonthShort(m.mes)}
                          </th>
                        ))}
                        <th
                          style={{
                            textAlign: "right",
                            padding: "10px 0 10px 14px",
                            fontSize: 11,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: "#1b98e0",
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "receita" as const,            label: "Faturamento",          bold: false, color: "#374151" },
                        { key: "despesas_vendas" as const,    label: "(-) Desp. Vendas",     bold: false, color: "#EC4899" },
                        { key: "tributos_vendas" as const,    label: "(-) Tributos Vendas",  bold: false, color: "#8B5CF6" },
                        { key: "receita_liquida" as const,    label: "Receita Líquida",      bold: true,  color: "#1b98e0" },
                        { key: "custos" as const,             label: "(-) CMV",              bold: false, color: "#F59E0B" },
                        { key: "despesas" as const,           label: "(-) ADM",              bold: false, color: "#EF4444" },
                        { key: "ebitda" as const,             label: "EBITDA",               bold: true,  color: "#1b98e0" },
                        { key: "resultado_financeiro" as const, label: "Resultado Financeiro", bold: false, color: "#374151" },
                        { key: "resultado" as const,          label: "Resultado Líquido",    bold: true,  color: "#059669" },
                      ].map((row) => {
                        const total = mesesComDados.reduce(
                          (acc, m) => acc + (m[row.key] as number),
                          0
                        );
                        return (
                          <tr
                            key={row.key}
                            style={{
                              borderBottom: "1px solid #F3F4F6",
                              background: row.bold ? "#F8FAFC" : "transparent",
                            }}
                          >
                            <td
                              style={{
                                padding: "10px 14px",
                                fontSize: 13,
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: row.bold ? 700 : 400,
                                color: row.bold ? "#111827" : "#374151",
                              }}
                            >
                              {row.label}
                            </td>
                            {mesesComDados.map((m) => {
                              const v = m[row.key] as number;
                              return (
                                <td
                                  key={m.mes}
                                  style={{
                                    textAlign: "right",
                                    padding: "10px 10px",
                                    fontSize: 13,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: row.bold ? 700 : 600,
                                    color: v < 0 ? "#DC2626" : row.bold ? row.color : "#6B7280",
                                  }}
                                >
                                  {formatMillions(v)}
                                </td>
                              );
                            })}
                            <td
                              style={{
                                textAlign: "right",
                                padding: "10px 0 10px 14px",
                                fontSize: 13,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontWeight: 700,
                                color: total < 0 ? "#DC2626" : row.color,
                              }}
                            >
                              {formatMillions(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState />
              )}
            </SectionCard>
          </div>
        )}

        {/* ABA: Análise de Custos */}
        {abaAtiva === "custos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SectionCard
                title="Distribuição de Custos e Despesas"
                subtitle="Composição percentual do total de custos"
                accentColor="#F59E0B"
              >
                {distribuicaoCustos.length > 0 ? (
                  <UBGDonutChart
                    data={distribuicaoCustos}
                    height={260}
                    formatValue={formatMillions}
                    showLegend
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>

              <SectionCard
                title="Custo de RH por Unidade"
                subtitle="Média mensal de custos de pessoal"
                accentColor="#EF4444"
              >
                {custoRHData.length > 0 ? (
                  <UBGHorizontalBar
                    data={custoRHData}
                    formatValue={formatMillions}
                    color="#EF4444"
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Resultado Financeiro — Aplicações vs Empréstimos"
              subtitle="Evolução mensal das receitas e despesas financeiras"
              accentColor="#0EA5E9"
            >
              {hasData &&
              resultFinData.some(
                (m) => m.aplicacoes !== 0 || m.emprestimos !== 0
              ) ? (
                <UBGLineChart
                  data={resultFinData}
                  lines={[
                    { key: "aplicacoes", label: "Aplicações", color: "#059669" },
                    { key: "emprestimos", label: "Empréstimos", color: "#EF4444" },
                    { key: "resultado_financeiro", label: "Resultado Fin.", color: "#1b98e0", dashed: true },
                  ]}
                  formatValue={formatMillions}
                  height={240}
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            <SectionCard
              title="Resumo de Custos — Acumulado"
              subtitle="Totais acumulados no período"
              accentColor="#F59E0B"
            >
              <MetricRow label="CMV (Custo Mercadoria Vendida)" value={formatMillions(d.custos)} color="#F59E0B" />
              <MetricRow label="Despesas Administrativas" value={formatMillions(d.despesas)} color="#EF4444" />
              <MetricRow label="Tributos sobre Vendas" value={formatMillions(d.tributos_vendas)} color="#8B5CF6" />
              <MetricRow label="Despesas de Vendas" value={formatMillions(d.despesas_vendas)} color="#EC4899" />
              <MetricRow label="Empréstimos / Financiamentos" value={formatMillions(d.emprestimos)} color="#EF4444" />
              <MetricRow
                label="Total de Custos e Despesas"
                value={formatMillions(
                  d.custos + d.despesas + d.tributos_vendas + d.despesas_vendas + d.emprestimos
                )}
                color="#111827"
              />
            </SectionCard>
          </div>
        )}

        {/* ABA: Plano de Contas */}
        {abaAtiva === "plano" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionCard
              title="Top 10 Contas por Realizado"
              subtitle="Maiores despesas e custos realizados no período"
              accentColor="#1b98e0"
              badge={`${d.plano_contas.length} contas`}
            >
              {topContas.length > 0 ? (
                <UBGHorizontalBar
                  data={topContas}
                  formatValue={formatMillions}
                  color="#1b98e0"
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            <SectionCard
              title="Plano de Contas — Orçado vs Realizado"
              subtitle="Comparativo de todas as contas do período"
              accentColor="#059669"
            >
              {d.plano_contas.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB" }}>
                        {["Conta", "Orçado", "Realizado", "Variação", "%"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: h === "Conta" ? "left" : "right",
                              padding: "10px 12px",
                              fontSize: 11,
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              color: "#6B7280",
                              borderBottom: "1px solid #E5E7EB",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {d.plano_contas
                        .filter((p) => p.realizado > 0 || p.orcado > 0)
                        .sort((a, b) => b.realizado - a.realizado)
                        .slice(0, 25)
                        .map((p, i) => {
                          const variacao = p.realizado - p.orcado;
                          const pct =
                            p.orcado !== 0
                              ? ((p.realizado - p.orcado) / Math.abs(p.orcado)) * 100
                              : 0;
                          return (
                            <tr
                              key={i}
                              style={{
                                borderBottom: "1px solid #F3F4F6",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLTableRowElement).style.background = "#F9FAFB";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "'Inter', sans-serif",
                                  color: "#374151",
                                  maxWidth: 220,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.descricao}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 600,
                                  color: "#9CA3AF",
                                }}
                              >
                                {formatMillions(p.orcado)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  color: "#111827",
                                }}
                              >
                                {formatMillions(p.realizado)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  color: variacao > 0 ? "#DC2626" : "#059669",
                                }}
                              >
                                {variacao > 0 ? "+" : ""}
                                {formatMillions(variacao)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  color: pct > 0 ? "#DC2626" : "#059669",
                                }}
                              >
                                {pct > 0 ? "+" : ""}
                                {pct.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState />
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
