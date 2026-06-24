import { ExcelDataImportService } from "../core/DataImportService";
import type { ColumnDefinition, ParsedWorksheetRow } from "../core/types";
import { detectMonth, detectYear, findColumn, normalizeText, toNumber } from "../core/excel";

export interface DRE2026Record {
  mes: number;
  ano: number;
  categoria: string;
  grupo: "receita" | "custo" | "despesa" | "resultado" | "outro";
  tipo: "entrada" | "saida" | "outro";
  valor: number;
  descricao: string;
}

export interface DRE2026Summary {
  receita: number;
  custos: number;
  despesas: number;
  ebitda: number;
  resultado: number;
}

const DRE_COLUMNS: ColumnDefinition[] = [
  { key: "categoria", label: "Categoria/DRE", required: true, aliases: ["dre", "categoria", "classificacao", "conta", "grupo"] },
  { key: "valor", label: "Valor", required: true, aliases: ["valor real", "valor pago", "valor liquidado", "valor", "total", "receita", "despesa"] },
  { key: "data", label: "Mês/Ano", aliases: ["mes/ano", "competencia", "data", "mes", "ano"] },
  { key: "descricao", label: "Descrição", aliases: ["descricao", "historico", "fornecedor", "cliente", "observacao"] },
];

function classifyDRE(categoria: string): DRE2026Record["grupo"] {
  const text = normalizeText(categoria);
  if (["receita", "faturamento", "vendas"].some((key) => text.includes(key))) return "receita";
  if (["cmv", "custo", "mercadoria", "produto vendido"].some((key) => text.includes(key))) return "custo";
  if (["despesa", "administrativa", "comercial", "financeira", "folha"].some((key) => text.includes(key))) return "despesa";
  if (["resultado", "lucro", "ebitda"].some((key) => text.includes(key))) return "resultado";
  return "outro";
}

function classifyTipo(grupo: DRE2026Record["grupo"], valor: number): DRE2026Record["tipo"] {
  if (grupo === "receita" || valor > 0) return "entrada";
  if (grupo === "custo" || grupo === "despesa" || valor < 0) return "saida";
  return "outro";
}

export class DRE2026ImportService extends ExcelDataImportService<DRE2026Record, DRE2026Summary> {
  protected module = "financeiro" as const;
  protected parser = "financeiro/dre2026";
  protected columns = DRE_COLUMNS;

  normalizeData(rows: ParsedWorksheetRow[]): DRE2026Record[] {
    return rows
      .map((row) => {
        const categoria = String(findColumn(row, ["dre", "categoria", "classificacao", "conta", "grupo"]) ?? "").trim();
        const valor = toNumber(findColumn(row, ["valor real", "valor pago", "valor liquidado", "valor", "total", "receita", "despesa"]));
        const data = findColumn(row, ["mes/ano", "competencia", "data", "mes"]);
        const ano = detectYear(findColumn(row, ["ano", "mes/ano", "competencia", "data"]));
        const mes = detectMonth(data) || detectMonth(row.sheetName) || 1;
        const descricao = String(findColumn(row, ["descricao", "historico", "fornecedor", "cliente", "observacao"]) ?? "").trim();
        const grupo = classifyDRE(categoria);

        if (!categoria || valor === 0) return null;

        return {
          mes,
          ano,
          categoria,
          grupo,
          tipo: classifyTipo(grupo, valor),
          valor,
          descricao,
        };
      })
      .filter((record): record is DRE2026Record => Boolean(record));
  }

  protected buildSummary(records: DRE2026Record[]): DRE2026Summary {
    const receita = records.filter((row) => row.grupo === "receita").reduce((sum, row) => sum + Math.abs(row.valor), 0);
    const custos = records.filter((row) => row.grupo === "custo").reduce((sum, row) => sum + Math.abs(row.valor), 0);
    const despesas = records.filter((row) => row.grupo === "despesa").reduce((sum, row) => sum + Math.abs(row.valor), 0);
    const ebitda = receita - custos - despesas;
    return { receita, custos, despesas, ebitda, resultado: ebitda };
  }
}

export async function parseDRE2026(buffer: Buffer, fileName?: string) {
  return new DRE2026ImportService().parse(buffer, fileName);
}