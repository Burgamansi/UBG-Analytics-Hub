import type { StandardImportResult } from "../core/types";

export interface OperacoesImportRecord {
  mes?: number;
  ano?: number;
  origem?: string;
  payload: Record<string, unknown>;
}

export async function parseOperacoesWorkbook(): Promise<StandardImportResult<OperacoesImportRecord>> {
  return {
    module: "operacoes",
    parser: "operacoes/placeholder",
    status: "pending",
    records: [],
    issues: [
      {
        level: "warning",
        code: "PARSER_PENDING",
        message: "Parser preparado estruturalmente; mapeamento real será definido em sprint futura.",
      },
    ],
    meta: {
      sheets: [],
      totalRows: 0,
      processedRows: 0,
      rejectedRows: 0,
    },
  };
}