export type ImportModule = "financeiro" | "comercial" | "rh" | "compras" | "qualidade" | "operacoes";

export type ImportStatus = "pending" | "valid" | "invalid" | "processed" | "error";

export interface ParsedWorksheetRow {
  rowNumber: number;
  sheetName: string;
  raw: Record<string, unknown>;
  normalized: Record<string, unknown>;
}

export interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
  aliases: string[];
}

export interface ImportValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  rowNumber?: number;
  column?: string;
}

export interface StandardImportResult<TRecord, TSummary = unknown> {
  module: ImportModule;
  parser: string;
  fileName?: string;
  status: ImportStatus;
  records: TRecord[];
  summary?: TSummary;
  issues: ImportValidationIssue[];
  meta: {
    sheets: string[];
    totalRows: number;
    processedRows: number;
    rejectedRows: number;
  };
}

export interface DataImportService<TRecord, TSummary = unknown> {
  readExcel(buffer: Buffer, fileName?: string): Promise<ParsedWorksheetRow[]>;
  validateColumns(rows: ParsedWorksheetRow[]): ImportValidationIssue[];
  normalizeData(rows: ParsedWorksheetRow[]): TRecord[];
  parse(buffer: Buffer, fileName?: string): Promise<StandardImportResult<TRecord, TSummary>>;
}