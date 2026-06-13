import * as XLSX from "xlsx";
import * as officeCrypto from "officecrypto-tool";

export interface ParsedFinanceiroRow {
  mes: number;
  ano: number;
  categoria: string;
  tipo: "entrada" | "saida" | "outro";
  valor: number;
  descricao: string;
}

export interface EvolucaoMensal {
  mes: number;
  ano: number;
  receita: number;
  custos: number;
  despesas: number;
  resultado: number;
}

export interface FinanceiroSummary {
  receita_total: number;
  custos: number;
  despesas: number;
  lucro_bruto: number;
  resultado_liquido: number;
  margem_pct: number;
  evolucao_mensal: EvolucaoMensal[];
}

const RECEITA_KEYS = ["faturamento", "receita"];
const CUSTO_KEYS = ["cmv", "custo produto", "custo do produto"];
const EXCLUDE_KEYS = ["nao usar"];

// Cabeçalhos aceitos (normalizados: sem acento, minúsculo) para identificar
// a coluna de categoria/classificação DRE.
const CATEGORIA_HEADER_KEYS = [
  "dre",
  "categoria",
  "classificacao",
  "classific",
  "conta",
  "grupo",
];

// Cabeçalhos aceitos para identificar a coluna de valor.
const VALOR_HEADER_KEYS = [
  "valor real",
  "valor pago",
  "valor liquidado",
  "valor",
  "total",
  "receita",
  "despesa",
];

// Cabeçalhos aceitos para colunas de data/mês/ano.
const DATA_HEADER_KEYS = [
  "mes/ano",
  "mes lanc",
  "data lancamento",
  "data real",
  "data vencimento",
  "data competencia",
  "competencia",
  "data",
  "mes",
  "ano",
];

const MESES_MAP: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");
const MOJIBAKE_REGEX = new RegExp("[\\u00c3\\u00c2][\\u0080-\\u00bf]");

// Quantas linhas iniciais de cada aba são inspecionadas para localizar o
// cabeçalho real (que pode não estar na primeira linha).
const MAX_HEADER_SCAN_ROWS = 20;

/**
 * Repairs UTF-8 text that was mistakenly decoded as Latin-1 (common in
 * CSV exports), e.g. "MÃªs" -> "Mês", "NÃ£o Usar" -> "Não Usar".
 */
function fixMojibake(s: string): string {
  if (!MOJIBAKE_REGEX.test(s)) return s;
  try {
    const fixed = Buffer.from(s, "latin1").toString("utf8");
    if (!fixed.includes("�")) return fixed;
  } catch {
    // fall through
  }
  return s;
}

function cleanStr(val: unknown): string {
  return fixMojibake(String(val ?? ""));
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(DIACRITICS_REGEX, "");
}

function normalizeHeader(h: unknown): string {
  return stripAccents(fixMojibake(String(h ?? ""))).toLowerCase().trim();
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  let str = String(val).trim();
  str = str.replace(/r\$\s?/gi, "").trim();
  if (!str) return 0;
  if (/,\d{1,2}$/.test(str)) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else {
    str = str.replace(/,/g, "");
  }
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function detectMes(raw: unknown): number {
  const lower = stripAccents(cleanStr(raw)).toLowerCase().trim();
  for (const [key, val] of Object.entries(MESES_MAP)) {
    if (lower.includes(key)) return val;
  }
  if (/^\d{1,2}$/.test(lower)) {
    const n = parseInt(lower, 10);
    if (n >= 1 && n <= 12) return n;
  }
  // "mm/yyyy" ou "mm/yy" (coluna "Mês/Ano")
  const mmYyyy = lower.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (mmYyyy) {
    const month = parseInt(mmYyyy[1], 10);
    if (month >= 1 && month <= 12) return month;
  }
  // "dd/mm/yyyy"
  const m = lower.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const month = parseInt(m[2], 10);
    if (month >= 1 && month <= 12) return month;
  }
  return 0;
}

function detectAno(raw: unknown): number {
  const str = cleanStr(raw).trim();
  const m4 = str.match(/(20\d{2})/);
  if (m4) return parseInt(m4[1], 10);
  // "mm/yy" (coluna "Mês/Ano")
  const mmYy = str.match(/^\d{1,2}\/(\d{2})$/);
  if (mmYy) return 2000 + parseInt(mmYy[1], 10);
  const n = parseInt(str, 10);
  if (!isNaN(n) && n > 2000) return n;
  const m = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    return y;
  }
  return 0;
}

/**
 * Decrypts an Office file (xls/xlsx) if it is password-protected.
 * Returns the buffer unchanged if it is not an encrypted CFB container.
 * Throws "SENHA_INVALIDA" if the password does not match.
 */
export async function decryptWorkbookBuffer(
  buffer: Buffer,
  password = "DRE2025"
): Promise<Buffer> {
  let encrypted = false;
  try {
    encrypted = officeCrypto.isEncrypted(buffer);
  } catch {
    // Not a CFB container (plain xlsx/csv) -> not encrypted
    encrypted = false;
  }

  if (!encrypted) return buffer;

  try {
    return await officeCrypto.decrypt(buffer, { password });
  } catch (err) {
    throw new Error(`SENHA_INVALIDA: ${String(err)}`);
  }
}

export function buildFinanceiroSummary(rows: ParsedFinanceiroRow[]): FinanceiroSummary {
  let receita_total = 0;
  let custos = 0;
  let despesas = 0;

  const monthly = new Map<string, EvolucaoMensal>();

  for (const r of rows) {
    const cat = stripAccents(r.categoria).toLowerCase();
    const valorAbs = Math.abs(r.valor);
    const key = `${r.ano}-${r.mes}`;

    if (!monthly.has(key)) {
      monthly.set(key, { mes: r.mes, ano: r.ano, receita: 0, custos: 0, despesas: 0, resultado: 0 });
    }
    const m = monthly.get(key)!;

    if (RECEITA_KEYS.some((k) => cat.includes(k))) {
      receita_total += valorAbs;
      m.receita += valorAbs;
    } else if (CUSTO_KEYS.some((k) => cat.includes(k))) {
      custos += valorAbs;
      m.custos += valorAbs;
    } else {
      despesas += valorAbs;
      m.despesas += valorAbs;
    }
  }

  const lucro_bruto = receita_total - custos;
  const resultado_liquido = lucro_bruto - despesas;
  const margem_pct = receita_total !== 0 ? (resultado_liquido / receita_total) * 100 : 0;

  const evolucao_mensal = Array.from(monthly.values())
    .sort((a, b) => a.ano - b.ano || a.mes - b.mes)
    .map((m) => ({ ...m, resultado: m.receita - m.custos - m.despesas }));

  return { receita_total, custos, despesas, lucro_bruto, resultado_liquido, margem_pct, evolucao_mensal };
}

/**
 * Procura, dentro das primeiras `MAX_HEADER_SCAN_ROWS` linhas da planilha, a
 * linha que funciona como cabeçalho real: precisa conter pelo menos uma
 * coluna de categoria/DRE E uma coluna de valor.
 */
function findHeaderRow(matrix: unknown[][]): { index: number; headers: string[] } | null {
  const limit = Math.min(matrix.length, MAX_HEADER_SCAN_ROWS);
  for (let i = 0; i < limit; i++) {
    const headers = (matrix[i] || []).map(normalizeHeader);
    const hasCategoria = headers.some((h) => CATEGORIA_HEADER_KEYS.some((k) => h.includes(k)));
    const hasValor = headers.some((h) => VALOR_HEADER_KEYS.some((k) => h.includes(k)));
    if (hasCategoria && hasValor) {
      return { index: i, headers };
    }
  }
  return null;
}

export async function parseFinanceiroXLS(
  buffer: Buffer,
  password = "DRE2025"
): Promise<{
  rows: ParsedFinanceiroRow[];
  summary: FinanceiroSummary;
  errors: string[];
}> {
  const errors: string[] = [];
  const rows: ParsedFinanceiroRow[] = [];
  const sheetsInspected: { sheet: string; headers: string[] }[] = [];

  const decrypted = await decryptWorkbookBuffer(buffer, password);
  const workbook = XLSX.read(decrypted, { type: "buffer" });

  console.log("[financeiro] Abas encontradas:", workbook.SheetNames);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    console.log(`[financeiro] Aba "${sheetName}" - primeiras 10 linhas:`, matrix.slice(0, 10));

    if (matrix.length === 0) continue;

    const headerInfo = findHeaderRow(matrix);
    if (!headerInfo) {
      sheetsInspected.push({ sheet: sheetName, headers: (matrix[0] || []).map(normalizeHeader) });
      console.log(`[financeiro] Aba "${sheetName}" - nenhum cabeçalho compatível encontrado.`);
      continue;
    }

    const { index: headerRowIndex, headers } = headerInfo;
    console.log(`[financeiro] Aba "${sheetName}" - cabeçalho na linha ${headerRowIndex + 1}:`, headers);
    sheetsInspected.push({ sheet: sheetName, headers });

    for (let r = headerRowIndex + 1; r < matrix.length; r++) {
      const rawRow = matrix[r] || [];
      if (rawRow.every((c) => cleanStr(c).trim() === "")) continue;

      const row: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        if (h) row[h] = rawRow[idx];
      });

      const normKeys = Object.keys(row);

      const getCol = (patterns: string[]): unknown => {
        for (const p of patterns) {
          const idx = normKeys.findIndex((k) => k.includes(p));
          if (idx >= 0) return row[normKeys[idx]];
        }
        return "";
      };

      const categoria = cleanStr(getCol(CATEGORIA_HEADER_KEYS)).trim();
      if (!categoria) continue;

      const categoriaLower = stripAccents(categoria).toLowerCase();
      if (EXCLUDE_KEYS.some((k) => categoriaLower.includes(k))) continue;

      const valorReal = toNumber(getCol(["valor real", "valor pago", "valor liquidado"]));
      const valor = valorReal !== 0 ? valorReal : toNumber(getCol(VALOR_HEADER_KEYS));
      if (valor === 0) continue;

      const tipoRaw = stripAccents(cleanStr(getCol(["tipo lancamento", "tipo", "natureza"]))).toLowerCase();
      const tipo: "entrada" | "saida" | "outro" = tipoRaw.includes("entrada")
        ? "entrada"
        : tipoRaw.includes("saida")
        ? "saida"
        : "outro";

      let mes = detectMes(getCol(["mes/ano", "mes lanc", "mes"]));
      let ano = detectAno(getCol(["mes/ano", "ano lanc", "ano"]));
      if (!mes || !ano) {
        const dataRef = getCol(DATA_HEADER_KEYS);
        if (!mes) mes = detectMes(dataRef);
        if (!ano) ano = detectAno(dataRef);
      }
      if (!ano) ano = 2026;
      if (!mes) mes = 1;

      const descricao = cleanStr(getCol(["fornecedor", "cliente", "observ", "descricao", "historico"])).trim();

      rows.push({ mes, ano, categoria, tipo, valor, descricao });
    }
  }

  if (rows.length === 0) {
    if (sheetsInspected.length === 0) {
      errors.push("A planilha está vazia ou não possui abas com dados.");
    } else {
      const detalhe = sheetsInspected
        .map((s) => `Aba "${s.sheet}": colunas encontradas [${s.headers.filter(Boolean).join(", ")}]`)
        .join(" | ");
      errors.push(
        `Nenhuma linha de DRE foi identificada na planilha. Verifique se há uma aba com uma coluna de categoria (DRE/Categoria/Classificação/Conta/Grupo) e uma coluna de valor (Valor/Valor Real/Total/Receita/Despesa). ${detalhe}`
      );
    }
  }

  const summary = buildFinanceiroSummary(rows);
  return { rows, summary, errors };
}
