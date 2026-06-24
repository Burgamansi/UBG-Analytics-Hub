import {
  BANK_BALANCES,
  BUDGET_VS_ACTUAL,
  CASH_FLOW_PROJECTIONS,
  COST_CENTERS,
  DRILL_DOWN_DETAILS,
  EXPENSE_ANALYSIS,
  FINANCIAL_ALERTS,
  FINANCIAL_KPIS,
  FINANCIAL_TARGETS,
  MONTHLY_TREND_2026,
  type BankBalanceMock,
  type BudgetVsActualMock,
  type CashFlowProjectionMock,
  type CostCenterMock,
  type DrillDownDetailMock,
  type ExpenseAnalysisMock,
  type FinancialAlertMock,
  type FinancialKpiMock,
  type FinancialStatus,
  type MonthlyTrendMock,
} from "@/lib/data/financeiro";
import {
  buildFinanceiroSummary,
  type FinanceiroSummary,
  type ParsedFinanceiroRow,
} from "@/lib/parsers/parse-financeiro";

export type {
  DrillDownDetailMock,
  FinancialKpiMock,
  FinancialStatus,
} from "@/lib/data/financeiro";

export interface FinanceiroProviderModel {
  source: "real" | "mock";
  sourceLabel: string;
  technicalAlert?: string;
  upload?: {
    id: number;
    nomeArquivo: string;
    dataUpload: string;
  };
  kpis: FinancialKpiMock[];
  monthlyTrend: MonthlyTrendMock[];
  budgetVsActual: BudgetVsActualMock[];
  expenses: ExpenseAnalysisMock[];
  alerts: FinancialAlertMock[];
  bankBalances: BankBalanceMock[];
  cashFlowProjections: CashFlowProjectionMock[];
  costCenters: CostCenterMock[];
  drillDownDetails: DrillDownDetailMock[];
  summary: FinanceiroSummary;
}

const MOCK_SUMMARY: any = {
  receita_total: 4_780_000,
  receita_bruta: 4_780_000,
  receita_liquida: 4_260_000,
  deducoes: 520_000,
  custos: 2_210_000,
  cmv: 2_210_000,
  despesas: 505_000,
  despesas_administrativas: 505_000,
  resultado_financeiro: -72_000,
  lucro_bruto: 2_050_000,
  ebitda: 760_000,
  resultado_liquido: 588_000,
  margem_pct: 13.8,
  margem_ebitda_pct: 17.8,
  margem_liquida_pct: 13.8,
  despesas_por_categoria: EXPENSE_ANALYSIS.map((item) => ({ category: item.category, value: item.value })),
  evolucao_mensal: MONTHLY_TREND_2026.map((item, index) => ({
    mes: index + 1,
    ano: 2026,
    receita: item.receitaLiquida,
    custos: 0,
    despesas: 0,
    resultado: item.resultadoLiquido,
    ebitda: item.ebitda,
    margem_ebitda_pct: item.receitaLiquida ? (item.ebitda / item.receitaLiquida) * 100 : 0,
    margem_liquida_pct: item.receitaLiquida ? (item.resultadoLiquido / item.receitaLiquida) * 100 : 0,
  })) as any,
};

function pct(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function valueAt(summary: FinanceiroSummary, key: string, fallback = 0) {
  const record = summary as unknown as Record<string, number | undefined>;
  return Number(record[key] ?? fallback);
}

function lastTwoMonths(summary: FinanceiroSummary) {
  const months = [...summary.evolucao_mensal].sort((a, b) => a.ano - b.ano || a.mes - b.mes);
  const current = months[months.length - 1];
  const previous = months[months.length - 2] ?? current;
  return { current, previous, months };
}

function monthLabel(month?: number) {
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return month ? labels[month - 1] ?? "Anterior" : "Anterior";
}

function statusFor(current: number, target: number, positiveDirection: "up" | "down"): FinancialStatus {
  if (!target) return "neutral";
  if (positiveDirection === "down") {
    if (current <= target) return "success";
    if (current <= target * 1.1) return "warning";
    return "danger";
  }
  if (current >= target) return "success";
  if (current >= target * 0.9) return "warning";
  return "danger";
}

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function isDreLikeFile(fileName: string) {
  const lower = fileName.toLowerCase();
  return lower.includes("dre") && (lower.includes("2026") || lower.includes("custo"));
}

function hasValidDre2026Rows(rows: ParsedFinanceiroRow[]) {
  if (rows.length === 0) return false;
  const has2026 = rows.some((row) => row.ano === 2026);
  const hasRevenue = rows.some((row) => row.tipo === "entrada" && row.valor > 0);
  const hasCostsOrExpenses = rows.some((row) => row.tipo === "saida" || row.valor < 0);
  return has2026 && hasRevenue && hasCostsOrExpenses;
}

function hasValidSummary(summary: FinanceiroSummary) {
  return summary.receita_total > 0 && summary.evolucao_mensal.length > 0;
}

function buildRealKpis(summary: FinanceiroSummary): FinancialKpiMock[] {
  const { previous } = lastTwoMonths(summary);
  const receitaBruta = valueAt(summary, "receita_bruta", summary.receita_total);
  const receitaLiquida = valueAt(summary, "receita_liquida", summary.receita_total);
  const cmv = valueAt(summary, "cmv", summary.custos);
  const lucroBruto = valueAt(summary, "lucro_bruto", receitaLiquida - cmv);
  const ebitda = valueAt(summary, "ebitda", lucroBruto - summary.despesas);
  const margemEbitda = valueAt(summary, "margem_ebitda_pct", receitaLiquida ? (ebitda / receitaLiquida) * 100 : 0);
  const despesasAdm = valueAt(summary, "despesas_administrativas", summary.despesas);
  const resultadoFinanceiro = valueAt(summary, "resultado_financeiro", 0);
  const resultadoLiquido = valueAt(summary, "resultado_liquido", summary.resultado_liquido);
  const margemLiquida = valueAt(summary, "margem_liquida_pct", receitaLiquida ? (resultadoLiquido / receitaLiquida) * 100 : 0);

  const prevReceita = previous?.receita ?? receitaLiquida;
  const prevCmv = previous?.custos ?? cmv;
  const prevDespesas = previous?.despesas ?? despesasAdm;
  const prevResultado = previous?.resultado ?? resultadoLiquido;
  const prevLucroBruto = Math.max(0, prevReceita - prevCmv);
  const prevEbitda = Math.max(0, prevReceita - prevCmv - prevDespesas);
  const prevMargemEbitda = prevReceita ? (prevEbitda / prevReceita) * 100 : margemEbitda;
  const prevMargemLiquida = prevReceita ? (prevResultado / prevReceita) * 100 : margemLiquida;
  const previousLabel = monthLabel(previous?.mes);

  return [
    { key: "grossRevenue", title: "Faturamento Bruto", subtitle: "Receita bruta importada", current: receitaBruta, previous: prevReceita, previousLabel, target: FINANCIAL_TARGETS.grossRevenue, valueType: "currency", positiveDirection: "up" },
    { key: "netRevenue", title: "Receita Liquida", subtitle: "Receita liquida DRE", current: receitaLiquida, previous: prevReceita, previousLabel, target: FINANCIAL_TARGETS.netRevenue, valueType: "currency", positiveDirection: "up" },
    { key: "cmv", title: "CMV", subtitle: "Custos e CMV importados", current: cmv, previous: prevCmv, previousLabel, target: FINANCIAL_TARGETS.cmv, valueType: "currency", positiveDirection: "down" },
    { key: "grossProfit", title: "Lucro Bruto", subtitle: "Receita liquida menos CMV", current: lucroBruto, previous: prevLucroBruto, previousLabel, target: FINANCIAL_TARGETS.grossProfit, valueType: "currency", positiveDirection: "up" },
    { key: "ebitda", title: "EBITDA", subtitle: "Resultado operacional DRE", current: ebitda, previous: prevEbitda, previousLabel, target: FINANCIAL_TARGETS.ebitda, valueType: "currency", positiveDirection: "up" },
    { key: "ebitdaMargin", title: "Margem EBITDA", subtitle: "EBITDA sobre receita liquida", current: margemEbitda, previous: prevMargemEbitda, previousLabel, target: FINANCIAL_TARGETS.ebitdaMargin, valueType: "percent", positiveDirection: "up" },
    { key: "administrativeExpenses", title: "Despesas Administrativas", subtitle: "Despesas importadas", current: despesasAdm, previous: prevDespesas, previousLabel, target: FINANCIAL_TARGETS.administrativeExpenses, valueType: "currency", positiveDirection: "down" },
    { key: "financialResult", title: "Resultado Financeiro", subtitle: "Resultado financeiro DRE", current: resultadoFinanceiro, previous: resultadoFinanceiro, previousLabel, target: FINANCIAL_TARGETS.financialResult, valueType: "currency", positiveDirection: "up" },
    { key: "netResult", title: "Resultado Liquido", subtitle: "Lucro final importado", current: resultadoLiquido, previous: prevResultado, previousLabel, target: FINANCIAL_TARGETS.netResult, valueType: "currency", positiveDirection: "up" },
    { key: "netMargin", title: "Margem Liquida", subtitle: "Resultado liquido sobre receita", current: margemLiquida, previous: prevMargemLiquida, previousLabel, target: FINANCIAL_TARGETS.netMargin, valueType: "percent", positiveDirection: "up" },
  ];
}

function buildRealTrend(summary: FinanceiroSummary): MonthlyTrendMock[] {
  return summary.evolucao_mensal.map((month) => ({
    month: monthLabel(month.mes),
    receitaLiquida: month.receita,
    ebitda: Math.max(0, month.receita - month.custos - month.despesas),
    resultadoLiquido: month.resultado,
  }));
}

function buildRealBudget(summary: FinanceiroSummary): BudgetVsActualMock[] {
  const months = [...summary.evolucao_mensal].sort((a, b) => a.ano - b.ano || a.mes - b.mes);
  return months.slice(-5).map((month) => ({
    item: `Receita ${monthLabel(month.mes)}`,
    budget: FINANCIAL_TARGETS.netRevenue,
    actual: month.receita,
  }));
}

function buildRealExpenses(summary: FinanceiroSummary): ExpenseAnalysisMock[] {
  const byCategory = (summary as any).despesas_por_categoria || [];
  if (!byCategory.length) return EXPENSE_ANALYSIS;
  return byCategory.slice(0, 10).map((item) => ({
    category: item.category,
    value: item.value,
    monthlyVariation: 0,
  }));
}

function buildRealAlerts(summary: FinanceiroSummary): FinancialAlertMock[] {
  const receita = valueAt(summary, "receita_liquida", summary.receita_total);
  const ebitda = valueAt(summary, "ebitda", summary.lucro_bruto - summary.despesas);
  const margemEbitda = receita ? (ebitda / receita) * 100 : 0;
  const resultado = summary.resultado_liquido;

  return [
    {
      id: "real-receita-meta",
      title: receita >= FINANCIAL_TARGETS.netRevenue ? "Receita acima da meta" : "Receita abaixo da meta",
      description: "Indicador calculado automaticamente a partir da DRE importada.",
      status: statusFor(receita, FINANCIAL_TARGETS.netRevenue, "up"),
      metric: receita >= FINANCIAL_TARGETS.netRevenue ? "+meta" : "abaixo",
    },
    {
      id: "real-ebitda",
      title: "Margem EBITDA calculada",
      description: "Margem operacional gerada pela camada FinanceiroDataProvider.",
      status: statusFor(margemEbitda, FINANCIAL_TARGETS.ebitdaMargin, "up"),
      metric: `${margemEbitda.toFixed(1)}%`,
    },
    {
      id: "real-resultado",
      title: resultado >= 0 ? "Resultado liquido positivo" : "Resultado liquido negativo",
      description: "Resultado final importado da DRE e validado automaticamente.",
      status: resultado >= 0 ? "success" : "danger",
      metric: resultado >= 0 ? "positivo" : "negativo",
    },
  ];
}

export function buildMockFinanceiroProviderModel(technicalAlert?: string): FinanceiroProviderModel {
  return {
    source: "mock",
    sourceLabel: "Dados demonstrativos",
    technicalAlert,
    kpis: FINANCIAL_KPIS,
    monthlyTrend: MONTHLY_TREND_2026,
    budgetVsActual: BUDGET_VS_ACTUAL,
    expenses: EXPENSE_ANALYSIS,
    alerts: FINANCIAL_ALERTS,
    bankBalances: BANK_BALANCES,
    cashFlowProjections: CASH_FLOW_PROJECTIONS,
    costCenters: COST_CENTERS,
    drillDownDetails: DRILL_DOWN_DETAILS,
    summary: MOCK_SUMMARY,
  };
}

export function buildFinanceiroDataProvider(
  summary: FinanceiroSummary | null,
  available: boolean,
  upload?: FinanceiroProviderModel["upload"],
  technicalAlert?: string
): FinanceiroProviderModel {
  const hasRealData = Boolean(available && summary && hasValidSummary(summary));

  if (!hasRealData || !summary) {
    return buildMockFinanceiroProviderModel(technicalAlert);
  }

  return {
    source: "real",
    sourceLabel: "Dados reais",
    upload,
    kpis: buildRealKpis(summary),
    monthlyTrend: buildRealTrend(summary),
    budgetVsActual: buildRealBudget(summary),
    expenses: buildRealExpenses(summary),
    alerts: buildRealAlerts(summary),
    bankBalances: BANK_BALANCES,
    cashFlowProjections: CASH_FLOW_PROJECTIONS,
    costCenters: COST_CENTERS,
    drillDownDetails: DRILL_DOWN_DETAILS,
    summary,
  };
}

export async function getFinanceiroDashboardData(): Promise<FinanceiroProviderModel> {
  if (!process.env.DATABASE_URL) {
    return buildMockFinanceiroProviderModel("DATABASE_URL nao configurada; usando fallback demonstrativo.");
  }

  try {
    const { db, registros_financeiro, uploads } = await import("@/lib/db");
    const { and, desc, eq } = await import("drizzle-orm");

    const uploadRows = await db
      .select()
      .from(uploads)
      .where(and(eq(uploads.modulo, "financeiro"), eq(uploads.status, "sucesso")))
      .orderBy(desc(uploads.created_at))
      .limit(10);

    const dreUpload = uploadRows.find((upload) => isDreLikeFile(upload.nome_arquivo));

    if (!dreUpload) {
      return buildMockFinanceiroProviderModel();
    }

    const registros = await db
      .select()
      .from(registros_financeiro)
      .where(eq(registros_financeiro.upload_id, dreUpload.id));

    const rows: ParsedFinanceiroRow[] = registros.map((row) => ({
      mes: row.mes,
      ano: row.ano,
      categoria: row.categoria,
      tipo: (row.tipo ?? "outro") as ParsedFinanceiroRow["tipo"],
      valor: Number(row.valor),
      descricao: row.descricao ?? "",
    }));

    if (!hasValidDre2026Rows(rows)) {
      return buildMockFinanceiroProviderModel("Upload financeiro encontrado, mas sem estrutura minima de DRE 2026 valida.");
    }

    const summary = buildFinanceiroSummary(rows);

    if (!hasValidSummary(summary)) {
      return buildMockFinanceiroProviderModel("Resumo financeiro invalido gerado a partir da importacao.");
    }

    return buildFinanceiroDataProvider(summary, true, {
      id: dreUpload.id,
      nomeArquivo: dreUpload.nome_arquivo,
      dataUpload: toIsoDate(dreUpload.created_at),
    });
  } catch (error) {
    console.error("Financeiro provider error:", error);
    return buildMockFinanceiroProviderModel("Erro ao ler dados financeiros importados; usando fallback demonstrativo.");
  }
}

export function calculateKpiVariation(current: number, previous: number) {
  return pct(current, previous);
}
