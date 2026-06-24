import { parseRHXLS, type ParsedDesligamento, type ParsedRHRow } from "@/lib/parsers/parse-rh";
import type { ImportValidationIssue, StandardImportResult } from "../core/types";

export interface RhImportRecord extends ParsedRHRow {
  tipo: "indicador";
}

export interface RhImportSummary {
  colaboradoresAtivos: number;
  turnoverMedio: number;
  desligamentos: number;
  absenteismoMedio: number;
  horasJustificadas: number;
  horasNaoJustificadas: number;
  horasAusencia: number;
  horasExtras: number;
  horasTrabalhadas: number;
  produtividade: number;
  recrutamentoSelecao: number;
  efetivacao: number;
  apadrinhamento: number;
  desligamentosDetalhe: ParsedDesligamento[];
}

function average(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}

function summarize(records: RhImportRecord[], desligamentos: ParsedDesligamento[]): RhImportSummary {
  const latestMonth = [...records].sort((a, b) => a.ano - b.ano || a.mes - b.mes).at(-1);
  const colaboradoresAtivos = latestMonth?.colaboradores_fim ?? records.reduce((sum, row) => sum + row.colaboradores_fim, 0);
  const horasJustificadas = records.reduce((sum, row) => sum + row.horas_justificadas, 0);
  const horasNaoJustificadas = records.reduce((sum, row) => sum + row.horas_nao_justificadas, 0);
  const admissoes = records.reduce((sum, row) => sum + row.admissoes, 0);
  const desligTotal = records.reduce((sum, row) => sum + row.desligamentos, 0) || desligamentos.length;
  const horasTrabalhadas = Math.max(0, colaboradoresAtivos * 176 - horasJustificadas - horasNaoJustificadas);
  const horasAusencia = horasJustificadas + horasNaoJustificadas;

  return {
    colaboradoresAtivos,
    turnoverMedio: average(records.map((row) => row.turnover_pct)),
    desligamentos: desligTotal,
    absenteismoMedio: average(records.map((row) => row.absenteismo_pct)),
    horasJustificadas,
    horasNaoJustificadas,
    horasAusencia,
    horasExtras: 0,
    horasTrabalhadas,
    produtividade: horasTrabalhadas ? (horasTrabalhadas / Math.max(1, colaboradoresAtivos * 176)) * 100 : 0,
    recrutamentoSelecao: admissoes,
    efetivacao: admissoes ? Math.max(0, ((admissoes - desligTotal) / admissoes) * 100) : 0,
    apadrinhamento: 0,
    desligamentosDetalhe: desligamentos,
  };
}

export async function parseRhWorkbook(
  buffer: Buffer,
  fileName?: string
): Promise<StandardImportResult<RhImportRecord, RhImportSummary>> {
  const parsed = parseRHXLS(buffer);
  const issues: ImportValidationIssue[] = parsed.errors.map((message) => ({
    level: "error",
    code: "RH_PARSE_ERROR",
    message,
  }));

  const records: RhImportRecord[] = parsed.rh.map((row) => ({ ...row, tipo: "indicador" }));

  if (records.length === 0 && parsed.desligamentos.length === 0 && issues.length === 0) {
    issues.push({
      level: "warning",
      code: "EMPTY_RH_WORKBOOK",
      message: "Nenhum indicador ou desligamento de RH foi identificado na planilha.",
    });
  }

  const hasErrors = issues.some((issue) => issue.level === "error");

  return {
    module: "rh",
    parser: "rh/indicadores2026",
    fileName,
    status: hasErrors ? "error" : "processed",
    records,
    summary: summarize(records, parsed.desligamentos),
    issues,
    meta: {
      sheets: [],
      totalRows: parsed.rh.length + parsed.desligamentos.length,
      processedRows: records.length + parsed.desligamentos.length,
      rejectedRows: 0,
    },
  };
}

export async function parseRh2026(buffer: Buffer, fileName?: string) {
  return parseRhWorkbook(buffer, fileName);
}
