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

// ── Section Card dark glassmorphism ──────────────────────────────────────────
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
        background: "rgba(13,24,38,0.7)",
        border: "1px solid rgba(27,152,224,0.12)",
        borderTop: `2px solid ${accentColor}`,
        borderRadius: 14,
        padding: "20px 22px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: accentColor,
              margin: "0 0 4px 0",
            }}
          >
            {title}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: 12,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#5a7a99",
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
              fontSize: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              color: accentColor,
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
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
        color: "#2d4a62",
      }}
    >
      <BarChart3 style={{ width: 28, height: 28, opacity: 0.4 }} />
      <p
        style={{
          fontSize: 12,
          fontFamily: "'Space Grotesk', sans-serif",
          margin: 0,
        }}
      >
        Sem dados disponíveis
      </p>
    </div>
  );
}

// ── Metric Row Card ───────────────────────────────────────────────────────────
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
        padding: "10px 0",
        borderBottom: "1px solid rgba(27,152,224,0.07)",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 12,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "#5a7a99",
            margin: 0,
          }}
        >
          {label}
        </p>
        {sub && (
          <p
            style={{
              fontSize: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#2d4a62",
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
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>
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
    { name: "CMV", value: d.custos, color: "#ffb300" },
    { name: "ADM", value: d.despesas, color: "#ff4d6d" },
    { name: "Tributos Vendas", value: d.tributos_vendas, color: "#b388ff" },
    { name: "Desp. Vendas", value: d.despesas_vendas, color: "#ff80ab" },
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
    <div style={{ padding: "24px 28px", maxWidth: 1400 }}>

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
              fontSize: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#1b98e0",
              margin: "0 0 6px 0",
            }}
          >
            Módulo Financeiro
          </p>
          <h1
            style={{
              fontSize: 26,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              color: "#e0ecf8",
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard Financeiro / DRE
          </h1>
          <p
            style={{
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#4d6680",
              margin: 0,
            }}
          >
            Receitas, custos, despesas e resultado · Ano {d.ano_referencia}
            {hasData &&
              ` · ${d.meses_com_dados} ${d.meses_com_dados === 1 ? "mês" : "meses"} com dados`}
          </p>
        </div>

        {hasData && (
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                background:
                  d.ebitda >= 0
                    ? "rgba(0,230,118,0.1)"
                    : "rgba(255,77,109,0.1)",
                border: `1px solid ${d.ebitda >= 0 ? "rgba(0,230,118,0.3)" : "rgba(255,77,109,0.3)"}`,
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {d.ebitda >= 0 ? (
                <TrendingUp
                  style={{ width: 14, height: 14, color: "#00e676" }}
                />
              ) : (
                <AlertTriangle
                  style={{ width: 14, height: 14, color: "#ff4d6d" }}
                />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  color: d.ebitda >= 0 ? "#00e676" : "#ff4d6d",
                }}
              >
                EBITDA {formatMillions(d.ebitda)}
              </span>
            </div>
            <div
              style={{
                background:
                  d.resultado_liquido >= 0
                    ? "rgba(27,152,224,0.1)"
                    : "rgba(255,77,109,0.1)",
                border: `1px solid ${d.resultado_liquido >= 0 ? "rgba(27,152,224,0.3)" : "rgba(255,77,109,0.3)"}`,
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Activity
                style={{
                  width: 14,
                  height: 14,
                  color:
                    d.resultado_liquido >= 0 ? "#1b98e0" : "#ff4d6d",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  color:
                    d.resultado_liquido >= 0 ? "#1b98e0" : "#ff4d6d",
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
            background: "rgba(27,152,224,0.06)",
            border: "1px solid rgba(27,152,224,0.2)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Info
            style={{
              width: 18,
              height: 18,
              color: "#1b98e0",
              flexShrink: 0,
              marginTop: 1,
            }}
          />
          <p
            style={{
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#8fa3bc",
              margin: 0,
            }}
          >
            <strong style={{ color: "#c8d8e8" }}>Nenhum dado importado ainda.</strong>{" "}
            Vá em{" "}
            <strong style={{ color: "#1b98e0" }}>Upload de Dados</strong>,
            selecione o módulo{" "}
            <strong style={{ color: "#1b98e0" }}>Financeiro / DRE</strong> e
            envie a planilha{" "}
            <strong style={{ color: "#c8d8e8" }}>Custo - DRE 2026.xlsx</strong>{" "}
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
          accentColor="#00e676"
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
          accentColor={d.ebitda >= 0 ? "#00e5ff" : "#ff4d6d"}
        />
        <KPICard
          title="Margem EBITDA"
          value={formatPercent(d.margem_ebitda_pct)}
          subtitle="EBITDA / Faturamento"
          icon={Percent}
          accentColor={d.margem_ebitda_pct >= 0 ? "#00e676" : "#ff4d6d"}
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
          accentColor="#ffb300"
        />
        <KPICard
          title="Despesas ADM"
          value={formatMillions(d.despesas)}
          subtitle="Despesas administrativas"
          icon={Wallet}
          accentColor="#ff4d6d"
        />
        <KPICard
          title="Resultado Líquido"
          value={formatMillions(d.resultado_liquido)}
          subtitle="Após resultado financeiro"
          icon={Activity}
          accentColor={d.resultado_liquido >= 0 ? "#00e676" : "#ff4d6d"}
        />
        <KPICard
          title="Margem Líquida"
          value={formatPercent(d.margem_pct)}
          subtitle="Resultado líquido / Faturamento"
          icon={Percent}
          accentColor={d.margem_pct >= 0 ? "#1b98e0" : "#ff4d6d"}
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
        <SectionCard title="Lucro Bruto" subtitle="Receita Líquida − CMV" accentColor="#1b98e0">
          <p
            style={{
              fontSize: 32,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              color: d.lucro_bruto >= 0 ? "#e0ecf8" : "#ff4d6d",
              margin: 0,
              textShadow: `0 0 20px ${d.lucro_bruto >= 0 ? "rgba(27,152,224,0.3)" : "rgba(255,77,109,0.3)"}`,
            }}
          >
            {formatMillions(d.lucro_bruto)}
          </p>
        </SectionCard>

        <SectionCard
          title="Resultado Financeiro"
          subtitle="Aplicações − Empréstimos"
          accentColor="#00e5ff"
        >
          <p
            style={{
              fontSize: 32,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              color: d.resultado_financeiro >= 0 ? "#e0ecf8" : "#ff4d6d",
              margin: "0 0 10px 0",
            }}
          >
            {formatMillions(d.resultado_financeiro)}
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a99" }}>
              Aplicações:{" "}
              <strong style={{ color: "#00e676" }}>
                {formatMillions(d.aplicacoes)}
              </strong>
            </span>
            <span style={{ fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a99" }}>
              Empréstimos:{" "}
              <strong style={{ color: "#ff4d6d" }}>
                {formatMillions(d.emprestimos)}
              </strong>
            </span>
          </div>
        </SectionCard>

        <SectionCard
          title="Deduções da Receita"
          subtitle="Tributos + Despesas de Vendas"
          accentColor="#b388ff"
        >
          <p
            style={{
              fontSize: 32,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 700,
              color: "#e0ecf8",
              margin: "0 0 10px 0",
            }}
          >
            {formatMillions(d.tributos_vendas + d.despesas_vendas)}
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a99" }}>
              Tributos:{" "}
              <strong style={{ color: "#b388ff" }}>
                {formatMillions(d.tributos_vendas)}
              </strong>
            </span>
            <span style={{ fontSize: 11, fontFamily: "'Space Grotesk', sans-serif", color: "#5a7a99" }}>
              Desp. Vendas:{" "}
              <strong style={{ color: "#ff80ab" }}>
                {formatMillions(d.despesas_vendas)}
              </strong>
            </span>
          </div>
        </SectionCard>
      </div>

      {/* ── Abas de Análise ──────────────────────────────────────────────── */}
      <div>
        {/* Tab Nav */}
        <div
          style={{
            display: "flex",
            gap: 4,
            borderBottom: "1px solid rgba(27,152,224,0.12)",
            marginBottom: 20,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setAbaAtiva(tab.key)}
              style={{
                padding: "10px 18px",
                fontSize: 12,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom: `2px solid ${abaAtiva === tab.key ? "#1b98e0" : "transparent"}`,
                color: abaAtiva === tab.key ? "#1b98e0" : "#3d5570",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
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
                    { key: "receita", label: "Faturamento", color: "#00e676" },
                    { key: "receita_liquida", label: "Rec. Líquida", color: "#1b98e0" },
                    { key: "custos", label: "CMV", color: "#ffb300" },
                    { key: "despesas", label: "ADM", color: "#ff4d6d" },
                    { key: "resultado", label: "Resultado", color: "#00e5ff", dashed: true },
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
                accentColor="#00e5ff"
              >
                {hasData ? (
                  <UBGBarChart
                    data={ebitdaData}
                    formatValue={formatMillions}
                    color="#00e5ff"
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
                accentColor="#00e676"
              >
                {hasData ? (
                  <UBGBarChart
                    data={margemData}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                    color="#00e676"
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
                accentColor="#1b98e0"
              >
                {hasData ? (
                  <UBGBarChart
                    data={faturamentoData}
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
                title="Resultado Líquido por Mês"
                subtitle="Lucro ou prejuízo mensal"
                accentColor="#b388ff"
              >
                {hasData ? (
                  <UBGBarChart
                    data={resultadoData}
                    formatValue={formatMillions}
                    color="#b388ff"
                    height={220}
                    showLabels={false}
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            {/* Tabela DRE dark */}
            <SectionCard
              title="Tabela DRE — Resumo Mensal"
              subtitle="Valores consolidados por mês"
              accentColor="#1b98e0"
            >
              {hasData ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "8px 12px 8px 0",
                            fontSize: 10,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#3d5570",
                            borderBottom: "1px solid rgba(27,152,224,0.12)",
                          }}
                        >
                          Indicador
                        </th>
                        {mesesComDados.map((m) => (
                          <th
                            key={m.mes}
                            style={{
                              textAlign: "right",
                              padding: "8px 8px",
                              fontSize: 10,
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "#3d5570",
                              borderBottom: "1px solid rgba(27,152,224,0.12)",
                            }}
                          >
                            {getMonthShort(m.mes)}
                          </th>
                        ))}
                        <th
                          style={{
                            textAlign: "right",
                            padding: "8px 0 8px 12px",
                            fontSize: 10,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#1b98e0",
                            borderBottom: "1px solid rgba(27,152,224,0.12)",
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: "receita" as const, label: "Faturamento", bold: false, color: "#8fa3bc" },
                        { key: "despesas_vendas" as const, label: "(-) Desp. Vendas", bold: false, color: "#ff80ab" },
                        { key: "tributos_vendas" as const, label: "(-) Tributos Vendas", bold: false, color: "#b388ff" },
                        { key: "receita_liquida" as const, label: "Receita Líquida", bold: true, color: "#1b98e0" },
                        { key: "custos" as const, label: "(-) CMV", bold: false, color: "#ffb300" },
                        { key: "despesas" as const, label: "(-) ADM", bold: false, color: "#ff4d6d" },
                        { key: "ebitda" as const, label: "EBITDA", bold: true, color: "#00e5ff" },
                        { key: "resultado_financeiro" as const, label: "Resultado Financeiro", bold: false, color: "#8fa3bc" },
                        { key: "resultado" as const, label: "Resultado Líquido", bold: true, color: "#00e676" },
                      ].map((row) => {
                        const total = mesesComDados.reduce(
                          (acc, m) => acc + (m[row.key] as number),
                          0
                        );
                        return (
                          <tr
                            key={row.key}
                            style={{
                              borderBottom: "1px solid rgba(27,152,224,0.06)",
                              background: row.bold
                                ? "rgba(27,152,224,0.04)"
                                : "transparent",
                            }}
                          >
                            <td
                              style={{
                                padding: "9px 12px 9px 0",
                                fontSize: 12,
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: row.bold ? 700 : 400,
                                color: row.bold ? "#c8d8e8" : "#5a7a99",
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
                                    padding: "9px 8px",
                                    fontSize: 12,
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: row.bold ? 700 : 600,
                                    color:
                                      v < 0
                                        ? "#ff4d6d"
                                        : row.bold
                                        ? row.color
                                        : "#8fa3bc",
                                  }}
                                >
                                  {formatMillions(v)}
                                </td>
                              );
                            })}
                            <td
                              style={{
                                textAlign: "right",
                                padding: "9px 0 9px 12px",
                                fontSize: 13,
                                fontFamily: "'Rajdhani', sans-serif",
                                fontWeight: 700,
                                color: total < 0 ? "#ff4d6d" : row.color,
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
                accentColor="#ffb300"
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
                accentColor="#ff4d6d"
              >
                {custoRHData.length > 0 ? (
                  <UBGHorizontalBar
                    data={custoRHData}
                    formatValue={formatMillions}
                    color="#ff4d6d"
                  />
                ) : (
                  <EmptyState />
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Resultado Financeiro — Aplicações vs Empréstimos"
              subtitle="Evolução mensal das receitas e despesas financeiras"
              accentColor="#00e5ff"
            >
              {hasData &&
              resultFinData.some(
                (m) => m.aplicacoes !== 0 || m.emprestimos !== 0
              ) ? (
                <UBGLineChart
                  data={resultFinData}
                  lines={[
                    { key: "aplicacoes", label: "Aplicações", color: "#00e676" },
                    { key: "emprestimos", label: "Empréstimos", color: "#ff4d6d" },
                    { key: "resultado_financeiro", label: "Resultado Fin.", color: "#00e5ff", dashed: true },
                  ]}
                  formatValue={formatMillions}
                  height={240}
                />
              ) : (
                <EmptyState />
              )}
            </SectionCard>

            {/* Resumo de custos */}
            <SectionCard
              title="Resumo de Custos — Acumulado"
              subtitle="Totais acumulados no período"
              accentColor="#ffb300"
            >
              <MetricRow label="CMV (Custo Mercadoria Vendida)" value={formatMillions(d.custos)} color="#ffb300" />
              <MetricRow label="Despesas Administrativas" value={formatMillions(d.despesas)} color="#ff4d6d" />
              <MetricRow label="Tributos sobre Vendas" value={formatMillions(d.tributos_vendas)} color="#b388ff" />
              <MetricRow label="Despesas de Vendas" value={formatMillions(d.despesas_vendas)} color="#ff80ab" />
              <MetricRow label="Empréstimos / Financiamentos" value={formatMillions(d.emprestimos)} color="#ff4d6d" />
              <MetricRow
                label="Total de Custos e Despesas"
                value={formatMillions(
                  d.custos + d.despesas + d.tributos_vendas + d.despesas_vendas + d.emprestimos
                )}
                color="#e0ecf8"
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
              accentColor="#00e676"
            >
              {d.plano_contas.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Conta", "Orçado", "Realizado", "Variação", "%"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: h === "Conta" ? "left" : "right",
                                padding: "8px 10px",
                                fontSize: 10,
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "#3d5570",
                                borderBottom: "1px solid rgba(27,152,224,0.12)",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
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
                              ? ((p.realizado - p.orcado) / Math.abs(p.orcado)) *
                                100
                              : 0;
                          return (
                            <tr
                              key={i}
                              style={{
                                borderBottom: "1px solid rgba(27,152,224,0.05)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "8px 10px",
                                  fontSize: 12,
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  color: "#8fa3bc",
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
                                  padding: "8px 10px",
                                  fontSize: 12,
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 600,
                                  color: "#5a7a99",
                                }}
                              >
                                {formatMillions(p.orcado)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "8px 10px",
                                  fontSize: 12,
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 700,
                                  color: "#c8d8e8",
                                }}
                              >
                                {formatMillions(p.realizado)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "8px 10px",
                                  fontSize: 12,
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 700,
                                  color: variacao > 0 ? "#ff4d6d" : "#00e676",
                                }}
                              >
                                {variacao > 0 ? "+" : ""}
                                {formatMillions(variacao)}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  padding: "8px 10px",
                                  fontSize: 12,
                                  fontFamily: "'Rajdhani', sans-serif",
                                  fontWeight: 700,
                                  color: pct > 0 ? "#ff4d6d" : "#00e676",
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
