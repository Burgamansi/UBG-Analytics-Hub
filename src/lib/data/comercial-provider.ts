import type { ParsedComercialRow } from "@/lib/parsers/parse-meses";

export interface ComercialChartPoint {
  name: string;
  value: number;
}

export interface ComercialBarPoint {
  label: string;
  value: number;
}

export interface ComercialMonthData {
  faturamento: number;
  quantidade: number;
  ticket: number;
  variacao: number;
  clientes: number;
  orcamentos: number;
  conversao: number;
  meta: number;
  topCliente: string;
  vendedores: ComercialChartPoint[];
  empresas: ComercialChartPoint[];
  produtos: ComercialChartPoint[];
  fornecedores: ComercialBarPoint[];
}

export interface ComercialProviderModel {
  source: "real" | "mock";
  sourceLabel: string;
  technicalAlert?: string;
  months: Array<{ mes: number; label: string }>;
  dadosMes: Record<number, ComercialMonthData>;
  faturamentoMeses: ComercialBarPoint[];
  tiposProduto: ComercialChartPoint[];
  fornecedores: ComercialBarPoint[];
  kpis: {
    faturamento: number;
    crescimento: number;
    ticketMedio: number;
    conversao: number;
    topCliente: string;
    meta: number;
  };
}

const MONTH_LABELS = [
  "Todos",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_SHORT = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const COMMERCIAL_TARGET = 9_500_000;
const MOCK_PRODUCTS: ComercialChartPoint[] = [
  { name: "Normal", value: 5_200_000 },
  { name: "Liner", value: 1_800_000 },
  { name: "Gardelon", value: 1_400_000 },
  { name: "Travados", value: 700_000 },
];

const MOCK_SUPPLIERS: ComercialBarPoint[] = [
  { label: "Fornecedor A", value: 1_850_000 },
  { label: "Fornecedor B", value: 1_420_000 },
  { label: "Fornecedor C", value: 980_000 },
  { label: "Fornecedor D", value: 760_000 },
  { label: "Fornecedor E", value: 620_000 },
  { label: "Fornecedor F", value: 480_000 },
  { label: "Fornecedor G", value: 390_000 },
  { label: "Fornecedor H", value: 310_000 },
];

const MOCK_DADOS_MES: Record<number, ComercialMonthData> = {
  0: {
    faturamento: 9_100_000,
    quantidade: 192_762,
    ticket: 47.21,
    variacao: 35.8,
    clientes: 4,
    orcamentos: 312,
    conversao: 36.5,
    meta: COMMERCIAL_TARGET,
    topCliente: "Lima",
    vendedores: [
      { name: "Thiers", value: 6_770_000 },
      { name: "Laercio", value: 1_200_000 },
      { name: "Fabio", value: 960_000 },
      { name: "Outros", value: 170_000 },
    ],
    empresas: [
      { name: "Lima", value: 4_200_000 },
      { name: "LPL", value: 2_800_000 },
      { name: "Rafcorte", value: 1_900_000 },
      { name: "OP", value: 200_000 },
    ],
    produtos: MOCK_PRODUCTS,
    fornecedores: MOCK_SUPPLIERS,
  },
  1: createMockMonth(1, 1_510_000, 42_247, 0, "Lima"),
  2: createMockMonth(2, 1_750_000, 58_813, 15.9, "Lima"),
  3: createMockMonth(3, 1_920_000, 32_853, 9.7, "Lima"),
  4: createMockMonth(4, 1_870_000, 28_477, -2.6, "Lima"),
  5: createMockMonth(5, 2_050_000, 30_372, 9.6, "Rafcorte"),
};

function createMockMonth(
  mes: number,
  faturamento: number,
  quantidade: number,
  variacao: number,
  topCliente: string
): ComercialMonthData {
  const ticket = quantidade ? faturamento / quantidade : 0;
  return {
    faturamento,
    quantidade,
    ticket,
    variacao,
    clientes: 4,
    orcamentos: 54 + mes * 8,
    conversao: 32 + mes * 1.8,
    meta: COMMERCIAL_TARGET / 5,
    topCliente,
    vendedores: [
      { name: "Thiers", value: faturamento * 0.72 },
      { name: "Laercio", value: faturamento * 0.13 },
      { name: "Fabio", value: faturamento * 0.12 },
    ],
    empresas: [
      { name: "Lima", value: faturamento * 0.43 },
      { name: "LPL", value: faturamento * 0.31 },
      { name: "Rafcorte", value: faturamento * 0.22 },
      { name: "OP", value: faturamento * 0.04 },
    ],
    produtos: MOCK_PRODUCTS,
    fornecedores: MOCK_SUPPLIERS,
  };
}

function sumBy<T>(rows: T[], getKey: (row: T) => string, getValue: (row: T) => number): ComercialChartPoint[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const key = getKey(row) || "Nao informado";
    totals.set(key, (totals.get(key) ?? 0) + getValue(row));
  });
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function toBars(points: ComercialChartPoint[]): ComercialBarPoint[] {
  return points.map((point) => ({ label: point.name, value: point.value }));
}

function buildMonthData(mes: number, rows: ParsedComercialRow[], previousRevenue = 0): ComercialMonthData {
  const faturamento = rows.reduce((sum, row) => sum + row.valor_total, 0);
  const quantidade = rows.reduce((sum, row) => sum + row.quantidade, 0);
  const ticket = quantidade ? faturamento / quantidade : 0;
  const empresas = sumBy(rows, (row) => row.empresa, (row) => row.valor_total);
  const vendedores = sumBy(rows, (row) => row.vendedor, (row) => row.valor_total);
  const produtos = sumBy(rows, (row) => row.tipo_produto, (row) => row.valor_total);
  const fornecedores = toBars(sumBy(rows, (row) => row.fornecedor, (row) => row.valor_total)).slice(0, 8);
  const topCliente = empresas[0]?.name ?? "Nao informado";
  const variacao = previousRevenue ? ((faturamento - previousRevenue) / Math.abs(previousRevenue)) * 100 : 0;
  const clientes = new Set(rows.map((row) => row.empresa).filter(Boolean)).size;
  const orcamentos = Math.max(rows.length, clientes);
  const conversao = orcamentos ? Math.min(100, (rows.filter((row) => row.valor_total > 0).length / orcamentos) * 100) : 0;

  return {
    faturamento,
    quantidade,
    ticket,
    variacao,
    clientes,
    orcamentos,
    conversao,
    meta: mes === 0 ? COMMERCIAL_TARGET : COMMERCIAL_TARGET / 12,
    topCliente,
    vendedores,
    empresas,
    produtos,
    fornecedores,
  };
}

function hasValidCommercialRows(rows: ParsedComercialRow[]): boolean {
  return rows.some((row) => row.ano >= 2026 && row.valor_total > 0 && row.quantidade >= 0);
}

function buildFromRows(rows: ParsedComercialRow[]): ComercialProviderModel {
  const validRows = rows.filter((row) => row.valor_total > 0 || row.quantidade > 0);
  const months = Array.from(new Set(validRows.map((row) => row.mes))).filter((mes) => mes >= 1 && mes <= 12).sort((a, b) => a - b);
  const dadosMes: Record<number, ComercialMonthData> = {};
  let previousRevenue = 0;

  months.forEach((mes) => {
    const monthRows = validRows.filter((row) => row.mes === mes);
    dadosMes[mes] = buildMonthData(mes, monthRows, previousRevenue);
    previousRevenue = dadosMes[mes].faturamento;
  });

  dadosMes[0] = buildMonthData(0, validRows, 0);
  const faturamentoMeses = months.map((mes) => ({ label: MONTH_SHORT[mes], value: dadosMes[mes].faturamento }));
  const tiposProduto = dadosMes[0].produtos;
  const fornecedores = dadosMes[0].fornecedores;
  const crescimento = months.length >= 2 ? dadosMes[months[months.length - 1]].variacao : dadosMes[0].variacao;

  return {
    source: "real",
    sourceLabel: "Dados reais",
    months: [{ mes: 0, label: "Todos" }, ...months.map((mes) => ({ mes, label: MONTH_LABELS[mes] }))],
    dadosMes,
    faturamentoMeses,
    tiposProduto,
    fornecedores,
    kpis: {
      faturamento: dadosMes[0].faturamento,
      crescimento,
      ticketMedio: dadosMes[0].ticket,
      conversao: dadosMes[0].conversao,
      topCliente: dadosMes[0].topCliente,
      meta: COMMERCIAL_TARGET,
    },
  };
}

export function buildMockComercialProviderModel(technicalAlert?: string): ComercialProviderModel {
  const faturamentoMeses = [1, 2, 3, 4, 5].map((mes) => ({ label: MONTH_SHORT[mes], value: MOCK_DADOS_MES[mes].faturamento }));
  return {
    source: "mock",
    sourceLabel: "Dados demonstrativos",
    technicalAlert,
    months: [0, 1, 2, 3, 4, 5].map((mes) => ({ mes, label: MONTH_LABELS[mes] })),
    dadosMes: MOCK_DADOS_MES,
    faturamentoMeses,
    tiposProduto: MOCK_DADOS_MES[0].produtos,
    fornecedores: MOCK_DADOS_MES[0].fornecedores,
    kpis: {
      faturamento: MOCK_DADOS_MES[0].faturamento,
      crescimento: MOCK_DADOS_MES[0].variacao,
      ticketMedio: MOCK_DADOS_MES[0].ticket,
      conversao: MOCK_DADOS_MES[0].conversao,
      topCliente: MOCK_DADOS_MES[0].topCliente,
      meta: MOCK_DADOS_MES[0].meta,
    },
  };
}

export async function getComercialDashboardData(): Promise<ComercialProviderModel> {
  if (!process.env.DATABASE_URL) {
    return buildMockComercialProviderModel("DATABASE_URL nao configurada; usando fallback demonstrativo.");
  }

  try {
    const { db, registros_comercial, uploads } = await import("@/lib/db");
    const { desc, eq } = await import("drizzle-orm");

    const uploadRows = await db
      .select({ id: uploads.id })
      .from(uploads)
      .where(eq(uploads.modulo, "comercial"))
      .orderBy(desc(uploads.created_at))
      .limit(1);

    const latestUploadId = uploadRows[0]?.id;
    const registros = latestUploadId
      ? await db.select().from(registros_comercial).where(eq(registros_comercial.upload_id, latestUploadId))
      : await db.select().from(registros_comercial);

    const rows: ParsedComercialRow[] = registros.map((row) => ({
      mes: row.mes,
      ano: row.ano,
      empresa: row.empresa,
      vendedor: row.vendedor,
      fornecedor: row.fornecedor ?? "Nao informado",
      tipo_produto: row.tipo_produto ?? "Normal",
      quantidade: Number(row.quantidade),
      valor_unitario: Number(row.valor_unitario ?? 0),
      valor_total: Number(row.valor_total),
    }));

    if (!hasValidCommercialRows(rows)) {
      return buildMockComercialProviderModel("Importacao comercial encontrada, mas sem dados validos para o dashboard.");
    }

    return buildFromRows(rows);
  } catch (error) {
    console.error("Comercial provider error:", error);
    return buildMockComercialProviderModel("Erro ao ler dados comerciais importados; usando fallback demonstrativo.");
  }
}
