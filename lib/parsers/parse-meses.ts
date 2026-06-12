import * as XLSX from "xlsx";

export interface ParsedComercialRow {
  mes: number;
  ano: number;
  empresa: string;
  vendedor: string;
  fornecedor: string;
  tipo_produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

const EMPRESA_MAP: Record<string, string> = {
  lima: "Lima",
  lpl: "LPL",
  rafcorte: "Rafcorte",
  op: "OP",
};

function normalizeEmpresa(raw: string): string {
  const lower = String(raw || "").toLowerCase().trim();
  for (const [key, val] of Object.entries(EMPRESA_MAP)) {
    if (lower.includes(key)) return val;
  }
  return String(raw || "").trim() || "Desconhecida";
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function detectMes(sheetName: string): number {
  const meses: Record<string, number> = {
    jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
    jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
    janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  };
  const lower = sheetName.toLowerCase();
  for (const [key, val] of Object.entries(meses)) {
    if (lower.includes(key)) return val;
  }
  return 0;
}

export function parseComercialXLS(buffer: Buffer): {
  rows: ParsedComercialRow[];
  errors: string[];
} {
  const rows: ParsedComercialRow[] = [];
  const errors: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    // Tentar aba MESES primeiro, depois qualquer aba com dados
    const targetSheets = workbook.SheetNames.filter(
      (n) =>
        n.toUpperCase().includes("MESES") ||
        n.toUpperCase().includes("DADOS") ||
        n.toUpperCase().includes("BASE")
    );

    const sheetsToProcess =
      targetSheets.length > 0 ? targetSheets : workbook.SheetNames;

    for (const sheetName of sheetsToProcess) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      if (data.length === 0) continue;

      // Detectar mês pelo nome da aba
      const mesBySheet = detectMes(sheetName);

      for (const row of data) {
        const keys = Object.keys(row).map((k) => k.toLowerCase());

        // Detectar colunas dinamicamente
        const getCol = (patterns: string[]): unknown => {
          for (const pattern of patterns) {
            const key = keys.find((k) => k.includes(pattern));
            if (key) return row[Object.keys(row)[keys.indexOf(key)]];
          }
          return "";
        };

        const empresa = normalizeEmpresa(String(getCol(["empresa", "company"]) || ""));
        const vendedor = String(getCol(["vendedor", "vend", "representante", "rep"]) || "").trim();
        const fornecedor = String(getCol(["fornecedor", "forn", "supplier"]) || "").trim();
        const tipo = String(getCol(["tipo", "produto", "type", "categoria"]) || "").trim();
        const qtd = toNumber(getCol(["qtd", "quantidade", "qty", "quant"]));
        const vunit = toNumber(getCol(["unit", "unitario", "preco", "price", "valor_unit"]));
        const vtotal = toNumber(getCol(["total", "valor_total", "faturamento", "receita", "vl_total"]));

        // Detectar mês da linha
        const mesRaw = getCol(["mes", "month", "mês"]);
        let mes = mesBySheet;
        if (mesRaw && mes === 0) {
          mes = detectMes(String(mesRaw)) || toNumber(mesRaw) || 1;
        }

        if (!vendedor && !fornecedor && vtotal === 0) continue;

        rows.push({
          mes: mes || 1,
          ano: 2026,
          empresa: empresa || "Desconhecida",
          vendedor: vendedor || "Não informado",
          fornecedor: fornecedor || "Não informado",
          tipo_produto: tipo || "Normal",
          quantidade: qtd,
          valor_unitario: vunit,
          valor_total: vtotal,
        });
      }
    }
  } catch (err) {
    errors.push(`Erro ao processar arquivo: ${String(err)}`);
  }

  return { rows, errors };
}
