export type FinancialStatus = "success" | "warning" | "danger" | "neutral";

export interface FinancialKpiMock {
  key: string;
  title: string;
  subtitle: string;
  current: number;
  previous: number;
  previousLabel: string;
  target?: number;
  valueType: "currency" | "percent";
  positiveDirection: "up" | "down";
}

export interface BudgetVsActualMock {
  item: string;
  budget: number;
  actual: number;
}

export interface ExpenseAnalysisMock {
  category: string;
  value: number;
  monthlyVariation: number;
}

export interface MonthlyTrendMock {
  month: string;
  receitaLiquida: number;
  ebitda: number;
  resultadoLiquido: number;
}

export interface CashFlowProjectionMock {
  period: "30 dias" | "60 dias" | "90 dias";
  currentBalance: number;
  expectedInflows: number;
  expectedOutflows: number;
  projectedBalance: number;
}

export interface BankBalanceMock {
  bank: string;
  accountType: string;
  balance: number;
}

export interface CostCenterMock {
  center: string;
  value: number;
}

export interface FinancialAlertMock {
  id: string;
  title: string;
  description: string;
  status: FinancialStatus;
  metric: string;
}

export interface DrillDownDetailMock {
  key: "netRevenue" | "cmv" | "ebitda" | "netResult";
  title: string;
  insight: string;
  drivers: Array<{ label: string; value: number; variation: number }>;
}

export const FINANCIAL_TARGETS = {
  grossRevenue: 4_600_000,
  netRevenue: 4_180_000,
  cmv: 2_250_000,
  grossProfit: 1_930_000,
  ebitda: 720_000,
  ebitdaMargin: 17,
  administrativeExpenses: 520_000,
  financialResult: -80_000,
  netResult: 560_000,
  netMargin: 13,
};

export const FINANCIAL_KPIS: FinancialKpiMock[] = [
  {
    key: "grossRevenue",
    title: "Faturamento Bruto",
    subtitle: "Receita comercial total",
    current: 4_780_000,
    previous: 4_410_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.grossRevenue,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "netRevenue",
    title: "Receita Líquida",
    subtitle: "Receita após deduções",
    current: 4_260_000,
    previous: 4_020_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.netRevenue,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "cmv",
    title: "CMV",
    subtitle: "Custo da mercadoria vendida",
    current: 2_210_000,
    previous: 2_170_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.cmv,
    valueType: "currency",
    positiveDirection: "down",
  },
  {
    key: "grossProfit",
    title: "Lucro Bruto",
    subtitle: "Receita líquida menos CMV",
    current: 2_050_000,
    previous: 1_850_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.grossProfit,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "ebitda",
    title: "EBITDA",
    subtitle: "Resultado operacional",
    current: 760_000,
    previous: 690_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.ebitda,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "ebitdaMargin",
    title: "Margem EBITDA",
    subtitle: "EBITDA sobre receita líquida",
    current: 17.8,
    previous: 17.2,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.ebitdaMargin,
    valueType: "percent",
    positiveDirection: "up",
  },
  {
    key: "administrativeExpenses",
    title: "Despesas Administrativas",
    subtitle: "Estrutura e backoffice",
    current: 505_000,
    previous: 492_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.administrativeExpenses,
    valueType: "currency",
    positiveDirection: "down",
  },
  {
    key: "financialResult",
    title: "Resultado Financeiro",
    subtitle: "Juros, tarifas e receitas financeiras",
    current: -72_000,
    previous: -91_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.financialResult,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "netResult",
    title: "Resultado Líquido",
    subtitle: "Lucro final do período",
    current: 588_000,
    previous: 507_000,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.netResult,
    valueType: "currency",
    positiveDirection: "up",
  },
  {
    key: "netMargin",
    title: "Margem Líquida",
    subtitle: "Resultado líquido sobre receita",
    current: 13.8,
    previous: 12.6,
    previousLabel: "Abril",
    target: FINANCIAL_TARGETS.netMargin,
    valueType: "percent",
    positiveDirection: "up",
  },
];

export const CASH_FLOW_PROJECTIONS: CashFlowProjectionMock[] = [
  { period: "30 dias", currentBalance: 1_420_000, expectedInflows: 2_180_000, expectedOutflows: 1_740_000, projectedBalance: 1_860_000 },
  { period: "60 dias", currentBalance: 1_420_000, expectedInflows: 4_360_000, expectedOutflows: 3_680_000, projectedBalance: 2_100_000 },
  { period: "90 dias", currentBalance: 1_420_000, expectedInflows: 6_720_000, expectedOutflows: 5_950_000, projectedBalance: 2_190_000 },
];

export const BANK_BALANCES: BankBalanceMock[] = [
  { bank: "Banco Itaú", accountType: "Conta operacional", balance: 620_000 },
  { bank: "Banco do Brasil", accountType: "Recebíveis", balance: 410_000 },
  { bank: "Bradesco", accountType: "Folha e encargos", balance: 235_000 },
  { bank: "Caixa Econômica", accountType: "Reserva", balance: 155_000 },
];

export const BUDGET_VS_ACTUAL: BudgetVsActualMock[] = [
  { item: "Receita Jan", budget: 3_850_000, actual: 3_920_000 },
  { item: "Receita Fev", budget: 3_940_000, actual: 3_880_000 },
  { item: "Receita Mar", budget: 4_020_000, actual: 4_120_000 },
  { item: "Receita Abr", budget: 4_080_000, actual: 4_210_000 },
  { item: "Receita Mai", budget: 4_160_000, actual: 4_260_000 },
];

export const EXPENSE_ANALYSIS: ExpenseAnalysisMock[] = [
  { category: "Salários e benefícios", value: 318_000, monthlyVariation: 2.4 },
  { category: "Matéria-prima indireta", value: 112_000, monthlyVariation: 4.8 },
  { category: "Energia elétrica", value: 86_000, monthlyVariation: 9.6 },
  { category: "TI / Software", value: 62_000, monthlyVariation: 6.8 },
  { category: "Fretes e transporte", value: 58_000, monthlyVariation: -1.7 },
  { category: "Outros", value: 52_000, monthlyVariation: 3.3 },
  { category: "Seguros", value: 48_000, monthlyVariation: 0.5 },
  { category: "Despesas bancárias", value: 41_000, monthlyVariation: -4.2 },
  { category: "Manutenção", value: 35_000, monthlyVariation: 8.1 },
  { category: "Consultorias", value: 31_000, monthlyVariation: 1.9 },
];

export const COST_CENTERS: CostCenterMock[] = [
  { center: "Produção", value: 1_420_000 },
  { center: "Comercial", value: 420_000 },
  { center: "Compras", value: 310_000 },
  { center: "RH", value: 285_000 },
  { center: "Qualidade", value: 198_000 },
  { center: "Administrativo", value: 505_000 },
  { center: "Logística", value: 365_000 },
];

export const FINANCIAL_ALERTS: FinancialAlertMock[] = [
  {
    id: "receita-meta",
    title: "Receita acima da meta",
    description: "Receita líquida está 1,9% acima do objetivo do mês.",
    status: "success",
    metric: "+R$ 80 mil",
  },
  {
    id: "despesas-alta",
    title: "Despesas aumentando",
    description: "Energia, TI e manutenção pressionam o mês atual.",
    status: "warning",
    metric: "+5,1%",
  },
  {
    id: "margem-objetivo",
    title: "Margem sob observação",
    description: "Margem EBITDA supera meta, mas CMV subiu no comparativo mensal.",
    status: "warning",
    metric: "17,8%",
  },
  {
    id: "caixa-projetado",
    title: "Caixa projetado confortável",
    description: "Saldo de 90 dias cobre 2,7 meses de despesas operacionais.",
    status: "success",
    metric: "R$ 2,19M",
  },
];

export const DRILL_DOWN_DETAILS: DrillDownDetailMock[] = [
  {
    key: "netRevenue",
    title: "Detalhe de Receita Líquida",
    insight: "Crescimento concentrado em clientes recorrentes e recomposição de preço médio.",
    drivers: [
      { label: "Clientes recorrentes", value: 2_920_000, variation: 11.4 },
      { label: "Novos pedidos", value: 940_000, variation: 8.6 },
      { label: "Deduções", value: -520_000, variation: 3.1 },
    ],
  },
  {
    key: "cmv",
    title: "Detalhe de CMV",
    insight: "CMV segue dentro da meta, porém energia e insumos pedem acompanhamento semanal.",
    drivers: [
      { label: "Matéria-prima", value: 1_580_000, variation: 2.8 },
      { label: "Energia", value: 210_000, variation: 9.6 },
      { label: "Perdas produtivas", value: 118_000, variation: -1.4 },
    ],
  },
  {
    key: "ebitda",
    title: "Detalhe de EBITDA",
    insight: "EBITDA melhora por ganho de receita e controle de despesas administrativas.",
    drivers: [
      { label: "Lucro bruto", value: 2_050_000, variation: 10.8 },
      { label: "Despesas fixas", value: -505_000, variation: 2.6 },
      { label: "Eficiência operacional", value: 186_000, variation: 7.9 },
    ],
  },
  {
    key: "netResult",
    title: "Detalhe de Resultado Líquido",
    insight: "Resultado final saudável, com risco principal em despesas financeiras e manutenção.",
    drivers: [
      { label: "EBITDA", value: 760_000, variation: 10.1 },
      { label: "Resultado financeiro", value: -72_000, variation: -20.9 },
      { label: "Impostos e ajustes", value: -100_000, variation: 1.2 },
    ],
  },
];

export const MONTHLY_TREND_2026: MonthlyTrendMock[] = [
  { month: "Jan", receitaLiquida: 3_920_000, ebitda: 612_000, resultadoLiquido: 410_000 },
  { month: "Fev", receitaLiquida: 3_880_000, ebitda: 598_000, resultadoLiquido: 392_000 },
  { month: "Mar", receitaLiquida: 4_120_000, ebitda: 655_000, resultadoLiquido: 438_000 },
  { month: "Abr", receitaLiquida: 4_210_000, ebitda: 701_000, resultadoLiquido: 486_000 },
  { month: "Mai", receitaLiquida: 4_260_000, ebitda: 760_000, resultadoLiquido: 588_000 },
  { month: "Jun", receitaLiquida: 4_310_000, ebitda: 774_000, resultadoLiquido: 602_000 },
  { month: "Jul", receitaLiquida: 4_380_000, ebitda: 798_000, resultadoLiquido: 621_000 },
  { month: "Ago", receitaLiquida: 4_440_000, ebitda: 812_000, resultadoLiquido: 634_000 },
  { month: "Set", receitaLiquida: 4_520_000, ebitda: 846_000, resultadoLiquido: 662_000 },
  { month: "Out", receitaLiquida: 4_610_000, ebitda: 889_000, resultadoLiquido: 701_000 },
  { month: "Nov", receitaLiquida: 4_730_000, ebitda: 918_000, resultadoLiquido: 724_000 },
  { month: "Dez", receitaLiquida: 4_920_000, ebitda: 980_000, resultadoLiquido: 782_000 },
];
