import * as XLSX from "xlsx";
import type { ColumnDefinition, ImportValidationIssue, ParsedWorksheetRow } from "./types";

const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .trim();
}

export function normalizeHeader(value: unknown): string {
  return normalizeText(value).replace(/\s+/g, " ");
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  let text = String(value ?? "").trim();
  if (!text) return 0;
  text = text.replace(/r\$\s?/gi, "").replace(/%/g, "").trim();
  if (/,-?\d{1,4}$/.test(text) || /,\d{1,4}$/.test(text)) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else {
    text = text.replace(/,/g, "");
  }
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function detectMonth(value: unknown): number {
  const text = normalizeText(value);
  const monthMap: Record<string, number> = {
    jan: 1, janeiro: 1,
    fev: 2, fevereiro: 2,
    mar: 3, marco: 3,
    abr: 4, abril: 4,
    mai: 5, maio: 5,
    jun: 6, junho: 6,
    jul: 7, julho: 7,
    ago: 8, agosto: 8,
    set: 9, setembro: 9,
    out: 10, outubro: 10,
    nov: 11, novembro: 11,
    dez: 12, dezembro: 12,
  };
  for (const [key, month] of Object.entries(monthMap)) {
    if (text.includes(key)) return month;
  }
  const numeric = Number.parseInt(text, 10);
  return numeric >= 1 && numeric <= 12 ? numeric : 0;
}

export function detectYear(value: unknown, fallback = 2026): number {
  const text = String(value ?? "");
  const match = text.match(/(20\d{2})/);
  if (match) return Number.parseInt(match[1], 10);
  return fallback;
}

export function readWorkbookRows(buffer: Buffer): ParsedWorksheetRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const rows: ParsedWorksheetRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    jsonRows.forEach((raw, index) => {
      const normalized: Record<string, unknown> = {};
      Object.entries(raw).forEach(([key, value]) => {
        normalized[normalizeHeader(key)] = value;
      });
      rows.push({ rowNumber: index + 2, sheetName, raw, normalized });
    });
  }

  return rows;
}

export function findColumn(row: ParsedWorksheetRow, aliases: string[]): unknown {
  const normalizedAliases = aliases.map(normalizeHeader);
  for (const [key, value] of Object.entries(row.normalized)) {
    if (normalizedAliases.some((alias) => key.includes(alias))) return value;
  }
  return "";
}

export function validateRequiredColumns(
  rows: ParsedWorksheetRow[],
  columns: ColumnDefinition[]
): ImportValidationIssue[] {
  const issues: ImportValidationIssue[] = [];
  const firstRow = rows[0];

  if (!firstRow) {
    return [
      {
        level: "error",
        code: "EMPTY_WORKBOOK",
        message: "Planilha vazia ou sem linhas de dados.",
      },
    ];
  }

  columns
    .filter((column) => column.required)
    .forEach((column) => {
      const found = column.aliases.some((alias) =>
        Object.keys(firstRow.normalized).some((header) => header.includes(normalizeHeader(alias)))
      );
      if (!found) {
        issues.push({
          level: "error",
          code: "REQUIRED_COLUMN_MISSING",
          column: column.key,
          message: `Coluna obrigatória não encontrada: ${column.label}.`,
        });
      }
    });

  return issues;
}