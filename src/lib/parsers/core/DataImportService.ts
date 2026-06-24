import type { ColumnDefinition, DataImportService, ImportModule, ImportValidationIssue, ParsedWorksheetRow, StandardImportResult } from "./types";
import { readWorkbookRows, validateRequiredColumns } from "./excel";

export abstract class ExcelDataImportService<TRecord, TSummary = unknown>
  implements DataImportService<TRecord, TSummary>
{
  protected abstract module: ImportModule;
  protected abstract parser: string;
  protected abstract columns: ColumnDefinition[];

  async readExcel(buffer: Buffer): Promise<ParsedWorksheetRow[]> {
    return readWorkbookRows(buffer);
  }

  validateColumns(rows: ParsedWorksheetRow[]): ImportValidationIssue[] {
    return validateRequiredColumns(rows, this.columns);
  }

  abstract normalizeData(rows: ParsedWorksheetRow[]): TRecord[];

  protected buildSummary(_records: TRecord[]): TSummary | undefined {
    return undefined;
  }

  async parse(buffer: Buffer, fileName?: string): Promise<StandardImportResult<TRecord, TSummary>> {
    const rows = await this.readExcel(buffer);
    const issues = this.validateColumns(rows);
    const hasBlockingError = issues.some((issue) => issue.level === "error");
    const records = hasBlockingError ? [] : this.normalizeData(rows);

    return {
      module: this.module,
      parser: this.parser,
      fileName,
      status: hasBlockingError ? "invalid" : "processed",
      records,
      summary: hasBlockingError ? undefined : this.buildSummary(records),
      issues,
      meta: {
        sheets: Array.from(new Set(rows.map((row) => row.sheetName))),
        totalRows: rows.length,
        processedRows: records.length,
        rejectedRows: Math.max(0, rows.length - records.length),
      },
    };
  }
}

export type { DataImportService } from "./types";