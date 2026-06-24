import type { ParsedAtestado, ParsedDesligamento, ParsedRHRow } from "@/lib/parsers/parse-rh";

export interface RhTrendPoint {
  label: string;
  turnover: number;
  absenteismo: number;
  meta_t: number;
  meta_a: number;
}

export interface RhBarPoint {
  label: string;
  value: number;
}

export interface RhDonutPoint {
  name: string;
  value: number;
}

export interface RhTerminationRow {
  nome: string;
  empresa: string;
  cargo: string;
  motivo: string;
  mes: string;
}

export interface RhCompanyTurnoverRow {
  empresa: string;
  jan: number;
  fev: number;
  mar: number;
  meta: number;
}

export interface RhAbsenceCard {
  label: string;
  pct: number;
  hj: number;
  hnj: number;
  status: "warning" | "danger";
}

export interface RhProviderModel {
  source: "real" | "mock";
  sourceLabel: string;
  technicalAlert?: string;
  kpis: {
    colaboradoresAtivos: number;
    turnoverMedio: number;
    totalDesligamentos: number;
    absenteismoMedio: number;
    horasAusencia: number;
    horasExtras: number;
    horasTrabalhadas: number;
    produtividade: number;
    recrutamentoSelecao: number;
    efetivacao: number;
    apadrinhamento: number;
  };
  turnoverMeses: RhTrendPoint[];
  desligPorEmpresa: RhBarPoint[];
  motivosDeslig: RhDonutPoint[];
  cids: RhBarPoint[];
  desligamentos: RhTerminationRow[];
  turnoverEmpresaRows: RhCompanyTurnoverRow[];
  absenteismoCards: RhAbsenceCard[];
}

const MONTH_LABELS = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTH_SHORT = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const TURNOVER_TARGET = 6;
const ABSENCE_TARGET = 5;

const MOCK_TERMINATIONS: RhTerminationRow[] = [
  { nome: "Colaborador 01", empresa: "Rafcorte", cargo: "Operador de Producao", motivo: "Melhor salario", mes: "Janeiro" },
  { nome: "Colaborador 02", empresa: "LPL", cargo: "Auxiliar Logistico", motivo: "Nao informado", mes: "Janeiro" },
  { nome: "Colaborador 03", empresa: "Rafcorte", cargo: "Costureira", motivo: "Produtividade", mes: "Fevereiro" },
  { nome: "Colaborador 04", empresa: "Lima", cargo: "Auxiliar Administrativo", motivo: "Nao informado", mes: "Fevereiro" },
  { nome: "Colaborador 05", empresa: "Rafcorte", cargo: "Operador de Maquina", motivo: "Comportamento", mes: "Março" },
  { nome: "Colaborador 06", empresa: "LPL", cargo: "Motorista", motivo: "Melhor salario", mes: "Março" },
  { nome: "Colaborador 07", empresa: "Rafcorte", cargo: "Costureira", motivo: "Nao informado", mes: "Março" },
  { nome: "Colaborador 08", empresa: "OP", cargo: "Auxiliar Geral", motivo: "Nao informado", mes: "Março" },
];

function average(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function sumBy<T>(rows: T[], getKey: (row: T) => string, getValue: (row: T) => number): RhBarPoint[] {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const key = getKey(row) || "Nao informado";
    totals.set(key, (totals.get(key) ?? 0) + getValue(row));
  });
  return Array.from(totals.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function toDonut(rows: RhBarPoint[]): RhDonutPoint[] {
  return rows.map((row) => ({ name: row.label, value: row.value }));
}

function monthName(mes: number): string {
  return MONTH_LABELS[mes] ?? "Periodo";
}

function buildMockRhProviderModel(technicalAlert?: string): RhProviderModel {
  const turnoverMeses: RhTrendPoint[] = [
    { label: "Jan", turnover: 10.4, absenteismo: 7.3, meta_t: TURNOVER_TARGET, meta_a: ABSENCE_TARGET },
    { label: "Fev", turnover: 12.0, absenteismo: 6.1, meta_t: TURNOVER_TARGET, meta_a: ABSENCE_TARGET },
    { label: "Mar", turnover: 19.2, absenteismo: 8.4, meta_t: TURNOVER_TARGET, meta_a: ABSENCE_TARGET },
  ];

  return {
    source: "mock",
    sourceLabel: "Dados demonstrativos",
    technicalAlert,
    kpis: {
      colaboradoresAtivos: 278,
      turnoverMedio: 13.9,
      totalDesligamentos: 45,
      absenteismoMedio: 7.3,
      horasAusencia: 2657,
      horasExtras: 0,
      horasTrabalhadas: 46_271,
      produtividade: 94.6,
      recrutamentoSelecao: 38,
      efetivacao: 82,
      apadrinhamento: 0,
    },
    turnoverMeses,
    desligPorEmpresa: [
      { label: "Rafcorte", value: 20 },
      { label: "LPL", value: 15 },
      { label: "Lima", value: 7 },
      { label: "OP", value: 3 },
    ],
    motivosDeslig: [
      { name: "Nao informado", value: 25 },
      { name: "Melhor salario", value: 10 },
      { name: "Produtividade", value: 5 },
      { name: "Comportamento", value: 3 },
      { name: "Outros", value: 2 },
    ],
    cids: [
      { label: "Falta (n. justif.)", value: 34 },
      { label: "Dores Musculares", value: 26 },
      { label: "Consulta Medica", value: 13 },
      { label: "Gripe/Resfriado", value: 8 },
      { label: "Outros", value: 6 },
    ],
    desligamentos: MOCK_TERMINATIONS,
    turnoverEmpresaRows: [
      { empresa: "Rafcorte", jan: 14.2, fev: 18.5, mar: 28.6, meta: TURNOVER_TARGET },
      { empresa: "LPL", jan: 12.1, fev: 14.8, mar: 22.4, meta: TURNOVER_TARGET },
      { empresa: "Lima", jan: 7.8, fev: 8.2, mar: 11.4, meta: TURNOVER_TARGET },
      { empresa: "OP", jan: 5.2, fev: 6.1, mar: 9.8, meta: TURNOVER_TARGET },
    ],
    absenteismoCards: [
      { label: "Janeiro", pct: 7.3, hj: 768, hnj: 150, status: "warning" },
      { label: "Fevereiro", pct: 6.1, hj: 724, hnj: 180, status: "warning" },
      { label: "Março", pct: 8.4, hj: 655, hnj: 180, status: "danger" },
    ],
  };
}

function hasValidRhData(rows: ParsedRHRow[], desligamentos: ParsedDesligamento[]): boolean {
  return rows.some((row) => row.colaboradores_fim > 0 || row.turnover_pct > 0 || row.absenteismo_pct > 0) || desligamentos.length > 0;
}

function buildTurnoverCompanyRows(rows: ParsedRHRow[]): RhCompanyTurnoverRow[] {
  const companies = Array.from(new Set(rows.map((row) => row.empresa).filter(Boolean)));
  return companies.map((empresa) => {
    const getMonth = (mes: number) => rows.find((row) => row.empresa === empresa && row.mes === mes)?.turnover_pct ?? 0;
    return { empresa, jan: getMonth(1), fev: getMonth(2), mar: getMonth(3), meta: TURNOVER_TARGET };
  });
}

function buildFromRows(rows: ParsedRHRow[], desligamentos: ParsedDesligamento[], atestados: ParsedAtestado[]): RhProviderModel {
  const sorted = [...rows].sort((a, b) => a.ano - b.ano || a.mes - b.mes);
  const latest = sorted.at(-1);
  const totalDesligamentos = rows.reduce((sum, row) => sum + row.desligamentos, 0) || desligamentos.length;
  const horasJustificadas = rows.reduce((sum, row) => sum + row.horas_justificadas, 0);
  const horasNaoJustificadas = rows.reduce((sum, row) => sum + row.horas_nao_justificadas, 0);
  const colaboradoresAtivos = latest?.colaboradores_fim ?? rows.reduce((sum, row) => sum + row.colaboradores_fim, 0);
  const horasPrevistas = colaboradoresAtivos * 176;
  const horasAusencia = horasJustificadas + horasNaoJustificadas;
  const horasTrabalhadas = Math.max(0, horasPrevistas - horasAusencia);
  const admissoes = rows.reduce((sum, row) => sum + row.admissoes, 0);

  const monthGroups = Array.from(new Set(rows.map((row) => row.mes))).sort((a, b) => a - b);
  const turnoverMeses = monthGroups.map((mes) => {
    const monthRows = rows.filter((row) => row.mes === mes);
    return {
      label: MONTH_SHORT[mes] ?? String(mes),
      turnover: average(monthRows.map((row) => row.turnover_pct)),
      absenteismo: average(monthRows.map((row) => row.absenteismo_pct)),
      meta_t: TURNOVER_TARGET,
      meta_a: ABSENCE_TARGET,
    };
  });

  const desligRows: RhTerminationRow[] = desligamentos.map((row) => ({
    nome: row.nome,
    empresa: row.empresa,
    cargo: row.cargo || "Nao informado",
    motivo: row.motivo || "Nao informado",
    mes: monthName(row.mes),
  }));

  return {
    source: "real",
    sourceLabel: "Dados reais",
    kpis: {
      colaboradoresAtivos,
      turnoverMedio: average(rows.map((row) => row.turnover_pct)),
      totalDesligamentos,
      absenteismoMedio: average(rows.map((row) => row.absenteismo_pct)),
      horasAusencia,
      horasExtras: 0,
      horasTrabalhadas,
      produtividade: horasPrevistas ? (horasTrabalhadas / horasPrevistas) * 100 : 0,
      recrutamentoSelecao: admissoes,
      efetivacao: admissoes ? Math.max(0, ((admissoes - totalDesligamentos) / admissoes) * 100) : 0,
      apadrinhamento: 0,
    },
    turnoverMeses: turnoverMeses.length ? turnoverMeses : buildMockRhProviderModel().turnoverMeses,
    desligPorEmpresa: sumBy(desligamentos, (row) => row.empresa, () => 1),
    motivosDeslig: toDonut(sumBy(desligamentos, (row) => row.motivo, () => 1)),
    cids: atestados.length ? sumBy(atestados, (row) => row.cid, (row) => row.dias || 1) : buildMockRhProviderModel().cids,
    desligamentos: desligRows.length ? desligRows : buildMockRhProviderModel().desligamentos,
    turnoverEmpresaRows: buildTurnoverCompanyRows(rows).length ? buildTurnoverCompanyRows(rows) : buildMockRhProviderModel().turnoverEmpresaRows,
    absenteismoCards: monthGroups.map((mes) => {
      const monthRows = rows.filter((row) => row.mes === mes);
      const pct = average(monthRows.map((row) => row.absenteismo_pct));
      return {
        label: monthName(mes),
        pct,
        hj: monthRows.reduce((sum, row) => sum + row.horas_justificadas, 0),
        hnj: monthRows.reduce((sum, row) => sum + row.horas_nao_justificadas, 0),
        status: pct > 8 ? "danger" : "warning",
      };
    }),
  };
}

export { buildMockRhProviderModel };

export async function getRhDashboardData(): Promise<RhProviderModel> {
  if (!process.env.DATABASE_URL) {
    return buildMockRhProviderModel("DATABASE_URL nao configurada; usando fallback demonstrativo.");
  }

  try {
    const { db, registros_rh, desligamentos, atestados, uploads } = await import("@/lib/db");
    const { desc, eq } = await import("drizzle-orm");

    const uploadRows = await db
      .select({ id: uploads.id })
      .from(uploads)
      .where(eq(uploads.modulo, "rh"))
      .orderBy(desc(uploads.created_at))
      .limit(1);

    const latestUploadId = uploadRows[0]?.id;
    const rhRows = latestUploadId
      ? await db.select().from(registros_rh).where(eq(registros_rh.upload_id, latestUploadId))
      : await db.select().from(registros_rh);
    const desligRows = latestUploadId
      ? await db.select().from(desligamentos).where(eq(desligamentos.upload_id, latestUploadId))
      : await db.select().from(desligamentos);
    const atestadoRows = await db.select().from(atestados);

    const parsedRh: ParsedRHRow[] = rhRows.map((row) => ({
      mes: row.mes,
      ano: row.ano,
      empresa: row.empresa,
      colaboradores_inicio: Number(row.colaboradores_inicio ?? 0),
      colaboradores_fim: Number(row.colaboradores_fim ?? 0),
      admissoes: Number(row.admissoes ?? 0),
      desligamentos: Number(row.desligamentos ?? 0),
      turnover_pct: Number(row.turnover_pct ?? 0),
      absenteismo_pct: Number(row.absenteismo_pct ?? 0),
      horas_justificadas: Number(row.horas_justificadas ?? 0),
      horas_nao_justificadas: Number(row.horas_nao_justificadas ?? 0),
    }));

    const parsedDesligamentos: ParsedDesligamento[] = desligRows.map((row) => ({
      mes: row.mes,
      ano: row.ano,
      empresa: row.empresa,
      nome: row.nome,
      cargo: row.cargo ?? "Nao informado",
      motivo: row.motivo ?? "Nao informado",
      data_admissao: row.data_admissao ?? "",
      data_desligamento: row.data_desligamento ?? "",
    }));

    const parsedAtestados: ParsedAtestado[] = atestadoRows.map((row) => ({
      mes: row.mes,
      ano: row.ano,
      empresa: row.empresa,
      colaborador: row.colaborador ?? "Nao informado",
      cid: row.cid ?? "Nao informado",
      dias: Number(row.dias ?? 0),
      tipo: (row.tipo ?? "integral") as ParsedAtestado["tipo"],
    }));

    if (!hasValidRhData(parsedRh, parsedDesligamentos)) {
      return buildMockRhProviderModel("Importacao RH encontrada, mas sem indicadores validos para o dashboard.");
    }

    return buildFromRows(parsedRh, parsedDesligamentos, parsedAtestados);
  } catch (error) {
    console.error("RH provider error:", error);
    return buildMockRhProviderModel("Erro ao ler dados reais de RH; usando fallback demonstrativo.");
  }
}
