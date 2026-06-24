import type { DRE2026Record, DRE2026Summary } from "@/src/lib/parsers/financeiro/dre2026";
import type { ParsedFinanceiroRow, FinanceiroSummary } from "@/lib/parsers/parse-financeiro";
import { buildFinanceiroSummary } from "@/lib/parsers/parse-financeiro";

const EXCEL_EXTENSIONS = [".xls", ".xlsx", ".xlsm"];

export function isDreParserEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DRE_PARSER === "true";
}

export function isExcelFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return EXCEL_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function isDreFile(fileName: string): boolean {
  return fileName.toLowerCase().includes("dre");
}

export function shouldUseDRE2026Parser(modulo: string, fileName: string): boolean {
  return modulo === "financeiro" && isDreParserEnabled() && isExcelFile(fileName) && isDreFile(fileName);
}

export function toLegacyFinanceiroParseResult(result: {
  records: DRE2026Record[];
  summary?: DRE2026Summary;
  issues: { message: string }[];
}): { rows: ParsedFinanceiroRow[]; summary: FinanceiroSummary; errors: string[] } {
  const rows = result.records.map((record) => ({
    mes: record.mes,
    ano: record.ano,
    categoria: record.categoria,
    tipo: record.tipo,
    valor: record.valor,
    descricao: record.descricao,
  }));

  return {
    rows,
    summary: buildFinanceiroSummary(rows),
    errors: result.issues.map((issue) => issue.message),
  };
}
