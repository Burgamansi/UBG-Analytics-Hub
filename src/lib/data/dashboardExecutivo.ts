export type ExecutiveStatus = "success" | "warning" | "danger" | "neutral";

export interface EnterpriseScoreMock {
  score: number;
  status: "Excelente" | "Saudável" | "Atenção" | "Crítico";
  criteria: Array<{ area: string; score: number; status: ExecutiveStatus }>;
}

export interface ExecutiveKpiMock {
  area: "Financeiro" | "Comercial" | "Operações" | "RH" | "Qualidade" | "Compras";
  title: string;
  value: string;
  variation: number;
  status: ExecutiveStatus;
  accentColor: string;
}

export interface CorporateAlertMock {
  id: string;
  title: string;
  description: string;
  area: string;
  status: ExecutiveStatus;
  impact: string;
}

export interface ModuleSummaryMock {
  module: string;
  score: number;
  status: ExecutiveStatus;
  mainIndicator: string;
  href?: string;
}

export interface ExecutiveTrendMock {
  label: string;
  receita: number;
  producao: number;
  rncs: number;
  turnover: number;
}

export interface AttentionRankingMock {
  area: string;
  risk: string;
  score: number;
  status: ExecutiveStatus;
  recommendation: string;
}

export const ENTERPRISE_SCORE: EnterpriseScoreMock = {
  score: 92,
  status: "Excelente",
  criteria: [
    { area: "Financeiro", score: 94, status: "success" },
    { area: "Comercial", score: 91, status: "success" },
    { area: "RH", score: 78, status: "warning" },
    { area: "Qualidade", score: 73, status: "warning" },
    { area: "Operações", score: 88, status: "success" },
    { area: "Compras", score: 76, status: "warning" },
  ],
};

export const EXECUTIVE_KPIS: ExecutiveKpiMock[] = [
  { area: "Financeiro", title: "Receita Líquida", value: "R$ 4,26M", variation: 6.0, status: "success", accentColor: "#1B98E0" },
  { area: "Financeiro", title: "EBITDA", value: "R$ 760K", variation: 10.1, status: "success", accentColor: "#10B981" },
  { area: "Financeiro", title: "Resultado Líquido", value: "R$ 588K", variation: 16.0, status: "success", accentColor: "#13233D" },
  { area: "Comercial", title: "Faturamento", value: "R$ 9,10M", variation: 35.8, status: "success", accentColor: "#1B98E0" },
  { area: "Comercial", title: "Conversão", value: "28,4%", variation: 4.2, status: "success", accentColor: "#10B981" },
  { area: "Operações", title: "Produção", value: "192.762 un.", variation: 8.7, status: "success", accentColor: "#13233D" },
  { area: "RH", title: "Colaboradores Ativos", value: "324", variation: 1.9, status: "success", accentColor: "#1B98E0" },
  { area: "RH", title: "Turnover", value: "13,9%", variation: 131, status: "danger", accentColor: "#EF4444" },
  { area: "Qualidade", title: "RNCs", value: "11", variation: -18.0, status: "warning", accentColor: "#F59E0B" },
  { area: "Compras", title: "Fornecedores Críticos", value: "7", variation: 12.0, status: "warning", accentColor: "#F59E0B" },
  { area: "Compras", title: "Estoque", value: "R$ 1,84M", variation: 9.4, status: "warning", accentColor: "#F59E0B" },
];

export const CORPORATE_ALERTS: CorporateAlertMock[] = [
  { id: "receita-meta", title: "Receita acima da meta", description: "Receita líquida supera objetivo mensal e sustenta caixa projetado.", area: "Financeiro", status: "success", impact: "+R$ 80K" },
  { id: "estoque-alta", title: "Estoque aumentando", description: "Compras e produção precisam revisar giro de insumos críticos.", area: "Compras", status: "warning", impact: "+9,4%" },
  { id: "turnover-meta", title: "Turnover acima do objetivo", description: "RH segue como principal ponto de atenção corporativa.", area: "RH", status: "danger", impact: "13,9%" },
  { id: "rnc-critica", title: "RNC crítica aberta", description: "Qualidade tem ocorrência crítica aguardando plano de ação.", area: "Qualidade", status: "danger", impact: "1 crítica" },
];

export const MODULE_SUMMARIES: ModuleSummaryMock[] = [
  { module: "Financeiro", score: 94, status: "success", mainIndicator: "EBITDA 6% acima da meta", href: "/financeiro" },
  { module: "Comercial", score: 91, status: "success", mainIndicator: "Faturamento +35,8% vs Jan", href: "/comercial" },
  { module: "Compras", score: 76, status: "warning", mainIndicator: "Estoque +9,4%" },
  { module: "Operações", score: 88, status: "success", mainIndicator: "Produção dentro da meta" },
  { module: "Qualidade", score: 73, status: "warning", mainIndicator: "11 RNCs no mês" },
  { module: "RH", score: 78, status: "warning", mainIndicator: "Turnover 13,9%", href: "/rh" },
];

export const EXECUTIVE_TREND: ExecutiveTrendMock[] = [
  { label: "Jan", receita: 72, producao: 68, rncs: 34, turnover: 42 },
  { label: "Fev", receita: 76, producao: 71, rncs: 31, turnover: 45 },
  { label: "Mar", receita: 81, producao: 74, rncs: 29, turnover: 58 },
  { label: "Abr", receita: 84, producao: 79, rncs: 24, turnover: 48 },
  { label: "Mai", receita: 91, producao: 86, rncs: 21, turnover: 44 },
  { label: "Jun", receita: 94, producao: 88, rncs: 18, turnover: 41 },
];

export const ATTENTION_RANKING: AttentionRankingMock[] = [
  { area: "Qualidade", risk: "RNC crítica aberta", score: 73, status: "danger", recommendation: "Fechar plano de ação e revisar causa raiz." },
  { area: "Compras", risk: "Estoque e fornecedores críticos", score: 76, status: "warning", recommendation: "Revisar curva ABC e renegociar itens sensíveis." },
  { area: "RH", risk: "Turnover acima da meta", score: 78, status: "danger", recommendation: "Atuar em retenção e liderança das áreas críticas." },
  { area: "Operações", risk: "Capacidade próxima do limite", score: 88, status: "warning", recommendation: "Monitorar produtividade e gargalos semanais." },
];

export const EXECUTIVE_SUMMARY = [
  "Receita em crescimento, com margem operacional acima da meta mensal.",
  "EBITDA evolui com controle de despesas e melhor mix comercial.",
  "RNCs estão em redução, mas ainda existe uma ocorrência crítica aberta.",
  "Turnover segue acima do objetivo e precisa de ação direta de liderança.",
  "Produção permanece dentro da meta, com atenção ao aumento de estoque.",
];

import { formatPercent, formatNumber, formatMillions, calcVariation } from "@/lib/utils";
import type { FinanceiroProviderModel } from "./financeiro-provider";
import type { ComercialProviderModel } from "./comercial-provider";
import type { RhProviderModel } from "./rh-provider";

export interface EnterpriseScoreCriteria {
  area: string;
  score: number;
  status: ExecutiveStatus;
  isReal: boolean;
}

export interface EnterpriseScoreModel {
  score: number;
  status: "Excelente" | "Saudável" | "Atenção" | "Crítico";
  criteria: EnterpriseScoreCriteria[];
}

export interface ExecutiveDashboardData {
  source: "real" | "partial" | "mock";
  sourceLabel: string;
  enterpriseScore: EnterpriseScoreModel;
  kpis: ExecutiveKpiMock[];
  alerts: CorporateAlertMock[];
  summaries: ModuleSummaryMock[];
  trend: ExecutiveTrendMock[];
  ranking: AttentionRankingMock[];
  executiveSummary: string[];
}

export function buildExecutiveDashboardData(
  financeiro: FinanceiroProviderModel,
  comercial: ComercialProviderModel,
  rh: RhProviderModel
): ExecutiveDashboardData {
  const isFinReal = financeiro.source === "real";
  const isComReal = comercial.source === "real";
  const isRhReal = rh.source === "real";

  // Determine source type (real, partial, mock)
  let source: "real" | "partial" | "mock" = "mock";
  let sourceLabel = "Dados demonstrativos";

  const realCount = (isFinReal ? 1 : 0) + (isComReal ? 1 : 0) + (isRhReal ? 1 : 0);
  if (realCount === 3) {
    source = "real";
    sourceLabel = "Dados reais";
  } else if (realCount > 0) {
    source = "partial";
    sourceLabel = "Dados parciais";
  }

  // Calculate Financeiro Score
  let financeiroScore = 94; // fallback
  if (isFinReal) {
    const ebitda = financeiro.summary.ebitda;
    const netRevenue = financeiro.summary.receita_liquida;
    const ebitdaMargin = netRevenue ? (ebitda / netRevenue) * 100 : 0;
    const targetMargin = 20; // 20% target
    financeiroScore = Math.min(100, Math.max(0, Math.round((ebitdaMargin / targetMargin) * 100)));
  }

  // Calculate Comercial Score
  let comercialScore = 91; // fallback
  if (isComReal) {
    const faturamento = comercial.kpis.faturamento;
    const targetFaturamento = comercial.kpis.meta || 9500000;
    comercialScore = Math.min(100, Math.max(0, Math.round((faturamento / targetFaturamento) * 100)));
  }

  // Calculate RH Score
  let rhScore = 78; // fallback
  if (isRhReal) {
    const turnover = rh.kpis.turnoverMedio;
    const absenteismo = rh.kpis.absenteismoMedio;
    const turnoverDeduction = Math.max(0, (turnover - 6) * 5); // penalidade se > 6%
    const absenteismoDeduction = Math.max(0, (absenteismo - 5) * 5); // penalidade se > 5%
    rhScore = Math.max(0, Math.round(100 - turnoverDeduction - absenteismoDeduction));
  }

  // Consolidação de criteria do Score
  const criteria: EnterpriseScoreCriteria[] = [
    { area: "Financeiro", score: financeiroScore, status: financeiroScore >= 90 ? "success" : financeiroScore >= 75 ? "success" : financeiroScore >= 60 ? "warning" : "danger", isReal: isFinReal },
    { area: "Comercial", score: comercialScore, status: comercialScore >= 90 ? "success" : comercialScore >= 75 ? "success" : comercialScore >= 60 ? "warning" : "danger", isReal: isComReal },
    { area: "RH", score: rhScore, status: rhScore >= 90 ? "success" : rhScore >= 75 ? "success" : rhScore >= 60 ? "warning" : "danger", isReal: isRhReal },
    { area: "Qualidade", score: 73, status: "warning", isReal: false },
    { area: "Operações", score: 88, status: "success", isReal: false },
    { area: "Compras", score: 76, status: "warning", isReal: false },
  ];

  const averageScore = Math.round(criteria.reduce((sum, item) => sum + item.score, 0) / criteria.length);

  let enterpriseStatus: EnterpriseScoreModel["status"] = "Saudável";
  if (averageScore >= 90) enterpriseStatus = "Excelente";
  else if (averageScore >= 75) enterpriseStatus = "Saudável";
  else if (averageScore >= 60) enterpriseStatus = "Atenção";
  else enterpriseStatus = "Crítico";

  const enterpriseScore: EnterpriseScoreModel = {
    score: averageScore,
    status: enterpriseStatus,
    criteria,
  };

  // KPIs
  const kpis: ExecutiveKpiMock[] = [];

  // Financeiro KPIs
  if (isFinReal) {
    const netRev = financeiro.summary.receita_liquida;
    const ebitdaVal = financeiro.summary.ebitda;
    const netRes = financeiro.summary.resultado_liquido;

    const netRevKpi = financeiro.kpis.find(k => k.key === "netRevenue");
    const ebitdaKpi = financeiro.kpis.find(k => k.key === "ebitda");
    const netResKpi = financeiro.kpis.find(k => k.key === "netResult");

    const netRevVar = netRevKpi && netRevKpi.previous ? calcVariation(netRevKpi.current, netRevKpi.previous) : 6.0;
    const ebitdaVar = ebitdaKpi && ebitdaKpi.previous ? calcVariation(ebitdaKpi.current, ebitdaKpi.previous) : 10.1;
    const netResVar = netResKpi && netResKpi.previous ? calcVariation(netResKpi.current, netResKpi.previous) : 16.0;

    kpis.push({ area: "Financeiro", title: "Receita Líquida", value: formatMillions(netRev), variation: netRevVar, status: "success", accentColor: "#1B98E0" });
    kpis.push({ area: "Financeiro", title: "EBITDA", value: formatMillions(ebitdaVal), variation: ebitdaVar, status: "success", accentColor: "#10B981" });
    kpis.push({ area: "Financeiro", title: "Resultado Líquido", value: formatMillions(netRes), variation: netResVar, status: "success", accentColor: "#13233D" });
  } else {
    kpis.push(EXECUTIVE_KPIS[0], EXECUTIVE_KPIS[1], EXECUTIVE_KPIS[2]);
  }

  // Comercial KPIs
  if (isComReal) {
    kpis.push({ area: "Comercial", title: "Faturamento", value: formatMillions(comercial.kpis.faturamento), variation: comercial.kpis.crescimento, status: comercial.kpis.faturamento >= comercial.kpis.meta ? "success" : "warning", accentColor: "#1B98E0" });
    kpis.push({ area: "Comercial", title: "Conversão", value: formatPercent(comercial.kpis.conversao), variation: 4.2, status: "success", accentColor: "#10B981" });
  } else {
    kpis.push(EXECUTIVE_KPIS[3], EXECUTIVE_KPIS[4]);
  }

  // Operações (Mock)
  kpis.push(EXECUTIVE_KPIS[5]);

  // RH KPIs
  if (isRhReal) {
    kpis.push({ area: "RH", title: "Colaboradores Ativos", value: String(rh.kpis.colaboradoresAtivos), variation: 1.9, status: "success", accentColor: "#1B98E0" });
    kpis.push({ area: "RH", title: "Turnover", value: formatPercent(rh.kpis.turnoverMedio), variation: rh.kpis.turnoverMedio > 6 ? 131 : -12, status: rh.kpis.turnoverMedio > 6 ? "danger" : "success", accentColor: rh.kpis.turnoverMedio > 6 ? "#EF4444" : "#10B981" });
  } else {
    kpis.push(EXECUTIVE_KPIS[6], EXECUTIVE_KPIS[7]);
  }

  // Qualidade & Compras (Mock)
  kpis.push(EXECUTIVE_KPIS[8], EXECUTIVE_KPIS[9], EXECUTIVE_KPIS[10]);

  // Alertas Corporativos Dinâmicos
  const alerts: CorporateAlertMock[] = [];
  if (isFinReal) {
    const ebitda = financeiro.summary.ebitda;
    const netRevenue = financeiro.summary.receita_liquida;
    const ebitdaMargin = netRevenue ? (ebitda / netRevenue) * 100 : 0;
    if (ebitdaMargin >= 20) {
      alerts.push({ id: "real-ebitda-meta", title: "Margem EBITDA ideal", description: `Operações saudáveis com margem de ${ebitdaMargin.toFixed(1)}%.`, area: "Financeiro", status: "success", impact: `+${ebitdaMargin.toFixed(1)}%` });
    } else {
      alerts.push({ id: "real-ebitda-baixo", title: "Margem EBITDA sob pressão", description: `Margem operacional atual em ${ebitdaMargin.toFixed(1)}% está abaixo da meta recomendada de 20%.`, area: "Financeiro", status: "danger", impact: `${ebitdaMargin.toFixed(1)}%` });
    }
  } else {
    alerts.push(CORPORATE_ALERTS[0]);
  }

  if (isComReal) {
    const fat = comercial.kpis.faturamento;
    if (fat >= 9500000) {
      alerts.push({ id: "real-comercial-meta", title: "Faturamento acima do objetivo", description: "Vendas superaram a meta mensal da companhia.", area: "Comercial", status: "success", impact: `R$ ${(fat/1000000).toFixed(2)}M` });
    } else {
      alerts.push({ id: "real-comercial-baixo", title: "Faturamento abaixo da meta", description: `Vendas acumuladas em R$ ${(fat/1000000).toFixed(2)}M vs meta R$ 9.5M.`, area: "Comercial", status: "warning", impact: `-${((9500000 - fat)/9500000 * 100).toFixed(0)}%` });
    }
  } else {
    alerts.push({ id: "estoque-alta", title: "Estoque aumentando", description: "Compras e produção precisam revisar giro de insumos críticos.", area: "Compras", status: "warning", impact: "+9,4%" });
  }

  if (isRhReal) {
    const turnover = rh.kpis.turnoverMedio;
    const absenteismo = rh.kpis.absenteismoMedio;
    if (turnover > 6) {
      alerts.push({ id: "real-turnover-alto", title: "Turnover acima do objetivo", description: `Rotatividade de pessoal acumula média de ${turnover.toFixed(1)}% (meta 6%).`, area: "RH", status: "danger", impact: `${turnover.toFixed(1)}%` });
    }
    if (absenteismo > 5) {
      alerts.push({ id: "real-absenteismo-alto", title: "Absenteísmo elevado", description: `Índice de faltas e licenças médicas em ${absenteismo.toFixed(1)}% (meta 5%).`, area: "RH", status: "warning", impact: `${absenteismo.toFixed(1)}%` });
    }
  } else {
    alerts.push(CORPORATE_ALERTS[2]);
  }

  if (alerts.length < 4) {
    alerts.push(CORPORATE_ALERTS[3]);
  }

  // Module summaries
  const summaries: ModuleSummaryMock[] = [
    { module: "Financeiro", score: financeiroScore, status: financeiroScore >= 90 ? "success" : financeiroScore >= 75 ? "success" : financeiroScore >= 60 ? "warning" : "danger", mainIndicator: isFinReal ? `Resultado: ${formatMillions(financeiro.summary.resultado_liquido)}` : "EBITDA 6% acima da meta", href: "/financeiro" },
    { module: "Comercial", score: comercialScore, status: comercialScore >= 90 ? "success" : comercialScore >= 75 ? "success" : comercialScore >= 60 ? "warning" : "danger", mainIndicator: isComReal ? `Faturamento: ${formatMillions(comercial.kpis.faturamento)}` : "Faturamento +35,8% vs Jan", href: "/comercial" },
    { module: "Compras", score: 76, status: "warning", mainIndicator: "Estoque +9,4%" },
    { module: "Operações", score: 88, status: "success", mainIndicator: "Produção dentro da meta" },
    { module: "Qualidade", score: 73, status: "warning", mainIndicator: "11 RNCs no mês" },
    { module: "RH", score: rhScore, status: rhScore >= 90 ? "success" : rhScore >= 75 ? "success" : rhScore >= 60 ? "warning" : "danger", mainIndicator: isRhReal ? `Turnover: ${formatPercent(rh.kpis.turnoverMedio)}` : "Turnover 13,9%", href: "/rh" },
  ];

  // Attention ranking (worst areas first)
  const ranking: AttentionRankingMock[] = [
    { area: "Financeiro", score: financeiroScore, status: (financeiroScore < 75 ? "danger" : financeiroScore < 90 ? "warning" : "success") as ExecutiveStatus, risk: financeiroScore < 80 ? "Margem sob pressão" : "Rentabilidade saudável", recommendation: financeiroScore < 80 ? "Controlar custos administrativos." : "Manter eficiência de custos." },
    { area: "Comercial", score: comercialScore, status: (comercialScore < 75 ? "danger" : comercialScore < 90 ? "warning" : "success") as ExecutiveStatus, risk: comercialScore < 80 ? "Faturamento abaixo da meta" : "Vendas aquecidas", recommendation: comercialScore < 80 ? "Estimular conversão e ticket médio." : "Focar em retenção de clientes." },
    { area: "RH", score: rhScore, status: (rhScore < 75 ? "danger" : rhScore < 90 ? "warning" : "success") as ExecutiveStatus, risk: rhScore < 80 ? "Turnover ou absenteísmo elevado" : "Clima e retenção controlados", recommendation: rhScore < 80 ? "Atuar em retenção e liderança das áreas críticas." : "Manter planos de desenvolvimento." },
    { area: "Qualidade", score: 73, status: "warning" as ExecutiveStatus, risk: "Ocorrência de RNCs críticas", recommendation: "Fechar plano de ação e revisar causa raiz." },
    { area: "Compras", score: 76, status: "warning" as ExecutiveStatus, risk: "Giro de estoque elevado", recommendation: "Revisar curva ABC de itens sensíveis." },
    { area: "Operações", score: 88, status: "success" as ExecutiveStatus, risk: "Gargalos de produtividade", recommendation: "Monitorar capacidade produtiva semanal." }
  ].sort((a, b) => a.score - b.score);

  // Executive summary
  const executiveSummary: string[] = [];
  if (isFinReal) {
    const result = financeiro.summary.resultado_liquido;
    executiveSummary.push(result >= 0 ? `Receita de ${formatMillions(financeiro.summary.receita_liquida)} gerou resultado líquido positivo de ${formatMillions(result)}.` : `Prejuízo líquido de ${formatMillions(Math.abs(result))} no período, exigindo contenção de despesas.`);
  } else {
    executiveSummary.push("Receita em crescimento, com margem operacional acima da meta mensal.");
  }

  if (isComReal) {
    const fat = comercial.kpis.faturamento;
    executiveSummary.push(fat >= 9500000 ? `Vendas superaram a meta mensal da companhia, acumulando faturamento de ${formatMillions(fat)}.` : `Faturamento comercial acumulado de ${formatMillions(fat)} está abaixo da meta planejada de R$ 9.5M.`);
  } else {
    executiveSummary.push("EBITDA evolui com controle de despesas e melhor mix comercial.");
  }

  if (isRhReal) {
    const turnover = rh.kpis.turnoverMedio;
    const abs = rh.kpis.absenteismoMedio;
    executiveSummary.push(turnover > 6 ? `Rotatividade média de ${turnover.toFixed(1)}% está acima do limite ideal (6%) e precisa de atenção.` : `Turnover sob controle em ${turnover.toFixed(1)}%, dentro da meta estipulada de 6%.`);
    executiveSummary.push(abs > 5 ? `Absenteísmo de ${abs.toFixed(1)}% ultrapassa limite ideal de 5% e afeta a produtividade.` : `Faltas e licenças médicas (absenteísmo) em ${abs.toFixed(1)}%, dentro do aceitável.`);
  } else {
    executiveSummary.push("Turnover segue acima do objetivo e precisa de ação direta de liderança.");
    executiveSummary.push("Produção permanece dentro da meta, com atenção ao aumento de estoque.");
  }

  if (executiveSummary.length < 5) {
    executiveSummary.push("RNCs estão em redução, mas ainda existe uma ocorrência crítica aberta.");
  }

  // Trend mapping
  const trend: ExecutiveTrendMock[] = [];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  for (let i = 0; i < 12; i++) {
    const monthLabel = months[i];
    const finMonth = financeiro.monthlyTrend.find(t => t.month === monthLabel);
    const comMonth = comercial.faturamentoMeses.find(t => t.label === monthLabel);
    const rhMonth = rh.turnoverMeses.find(t => t.label === monthLabel);

    if (finMonth || comMonth || rhMonth) {
      const receitaVal = finMonth ? Math.min(100, (finMonth.receitaLiquida / 5000000) * 100) : (comMonth ? Math.min(100, (comMonth.value / 5000000) * 100) : 0);
      const turnoverVal = rhMonth ? Math.min(100, (rhMonth.turnover / 20) * 100) : 0;
      
      trend.push({
        label: monthLabel,
        receita: Math.round(receitaVal || 70),
        producao: comMonth ? Math.round(Math.min(100, (comMonth.value / 5000000) * 90)) : 70,
        rncs: 25,
        turnover: Math.round(turnoverVal || 40)
      });
    }
  }

  const finalTrend = trend.length >= 2 ? trend : EXECUTIVE_TREND;

  return {
    source,
    sourceLabel,
    enterpriseScore,
    kpis,
    alerts,
    summaries,
    trend: finalTrend,
    ranking,
    executiveSummary,
  };
}
