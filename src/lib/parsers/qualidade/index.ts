import type { StandardImportResult } from "../core/types";

export interface QualidadeImportRecord {
  mes?: number;
  ano?: number;
  origem?: string;
  payload: Record<string, unknown>;
}

export async function parseQualidadeWorkbook(): Promise<StandardImportResult<QualidadeImportRecord>> {
  return {
    module: "qualidade",
    parser: "qualidade/placeholder",
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