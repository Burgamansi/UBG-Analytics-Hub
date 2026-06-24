import { parseComercialXLS, type ParsedComercialRow } from "@/lib/parsers/parse-meses";
import type { ImportValidationIssue, StandardImportResult } from "../core/types";

export interface ComercialImportRecord extends ParsedComercialRow {
  cliente: string;
  produto: string;
}

export interface ComercialImportSummary {
  faturamento: number;
  quantidade: number;
  ticketMedio: number;
  clientes: number;
  vendedores: number;
  produtos: number;
  orcamentos: number;
  conversao: number;
}

function summarize(records: ComercialImportRecord[]): ComercialImportSummary {
  const faturamento = records.reduce((sum, row) => sum + row.valor_total, 0);
  const quantidade = records.reduce((sum, row) => sum + row.quantidade, 0);
  const clientes = new Set(records.map((row) => row.cliente).filter(Boolean)).size;
  const vendedores = new Set(records.map((row) => row.vendedor).filter(Boolean)).size;
  const produtos = new Set(records.map((row) => row.produto).filter(Boolean)).size;
  const orcamentos = records.length;
  const conversao = orcamentos ? (records.filter((row) => row.valor_total > 0).length / orcamentos) * 100 : 0;

  return {
    faturamento,
    quantidade,
    ticketMedio: quantidade ? faturamento / quantidade : 0,
    clientes,
    vendedores,
    produtos,
    orcamentos,
    conversao,
  };
}

export async function parseComercialWorkbook(
  buffer: Buffer,
  fileName?: string
): Promise<StandardImportResult<ComercialImportRecord, ComercialImportSummary>> {
  const parsed = parseComercialXLS(buffer);
  const issues: ImportValidationIssue[] = parsed.errors.map((message) => ({
    level: "error",
    code: "COMERCIAL_PARSE_ERROR",
    message,
  }));

  const records: ComercialImportRecord[] = parsed.rows.map((row) => ({
    ...row,
    cliente: row.empresa,
    produto: row.tipo_produto,
  }));

  if (records.length === 0 && issues.length === 0) {
    issues.push({
      level: "warning",
      code: "EMPTY_COMMERCIAL_WORKBOOK",
      message: "Nenhuma linha comercial foi identificada na planilha.",
    });
  }

  const hasErrors = issues.some((issue) => issue.level === "error");

  return {
    module: "comercial",
    parser: "comercial/indicadores2026",
    fileName,
    status: hasErrors ? "error" : "processed",
    records,
    summary: summarize(records),
    issues,
    meta: {
      sheets: [],
      totalRows: parsed.rows.length,
      processedRows: records.length,
      rejectedRows: Math.max(0, parsed.rows.length - records.length),
    },
  };
}

export async function parseComercial2026(buffer: Buffer, fileName?: string) {
  return parseComercialWorkbook(buffer, fileName);
}
