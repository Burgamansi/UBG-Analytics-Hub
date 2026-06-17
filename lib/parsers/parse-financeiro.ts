import * as XLSX from "xlsx";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

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
  ebitda: number;
  receita_liquida: number;
  tributos_vendas: number;
  despesas_vendas: number;
  resultado_financeiro: number;
  aplicacoes: number;
  emprestimos: number;
}

export interface CustoRH {
  unidade: string;
  valor: number;
}

export interface FinanceiroSummary {
  // KPIs principais
  receita_total: number;
  receita_liquida: number;
  custos: number;
  despesas: number;
  lucro_bruto: number;
  resultado_liquido: number;
  ebitda: number;
  margem_pct: number;
  margem_ebitda_pct: number;
  // Detalhamento
  tributos_vendas: number;
  despesas_vendas: number;
  resultado_financeiro: number;
  aplicacoes: number;
  emprestimos: number;
  retirada_socios: number;
  // Evolução mensal
  evolucao_mensal: EvolucaoMensal[];
  // Custo RH
  custo_rh: CustoRH[];
  // Plano de contas
  plano_contas: PlanoContaItem[];
  // Metadados
  meses_com_dados: number;
  ano_referencia: number;
}

export interface PlanoContaItem {
  codigo: number;
  descricao: string;
  tipo: string;
  orcado: number;
  realizado: number;
  diferenca: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9,
  outubro: 10, novembro: 11, dezembro: 12,
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
};

const DRE_NOVO_ROWS: Record<string, keyof EvolucaoMensal | "skip"> = {
  "faturamento": "receita",
  "despesas vendas": "despesas_vendas",
  "tributos vendas": "tributos_vendas",
  "receita liquida": "receita_liquida",
  "cmv": "custos",
  "adm": "despesas",
  "tributos": "skip", // tributos operacionais — incluídos em despesas
  "resultado operacional (ebitda)": "ebitda",
  "resultado financeiro": "resultado_financeiro",
  "aplicacoes": "aplicacoes",
  "aplicações": "aplicacoes",
  "emprestimos": "emprestimos",
  "empréstimos": "emprestimos",
  "resultado liquido": "resultado",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function norm(v: unknown): string {
  return stripAccents(String(v ?? "").trim()).toLowerCase();
}

function toNum(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const s = String(v).replace(/r\$\s?/gi, "").replace(/\./g, "").replace(",", ".").trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function emptyEvolucao(mes: number, ano: number): EvolucaoMensal {
  return {
    mes, ano,
    receita: 0, receita_liquida: 0, custos: 0, despesas: 0,
    resultado: 0, ebitda: 0, tributos_vendas: 0, despesas_vendas: 0,
    resultado_financeiro: 0, aplicacoes: 0, emprestimos: 0,
  };
}

// ─── Parser principal: aba "DRE novo" ─────────────────────────────────────────
// Estrutura real da planilha:
//   Linha 1 (índice 0): ["Mês em numeral", 1, 2, 3, 4, ...12]
//   Linha 2 (índice 1): ["Descrição", "Janeiro", "Fevereiro", ..."Dezembro", "Total", ...]
//   Linha 3+ (índice 2+): dados — ["FATURAMENTO", val_jan, val_fev, ...]

function parseDreNovo(
  ws: XLSX.WorkSheet,
  ano: number
): { evolucao: EvolucaoMensal[]; retirada_socios: number } {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Linha 1 (índice 0): numerais dos meses (1-12)
  // Linha 2 (índice 1): nomes dos meses
  // Usar linha 1 para mapear coluna → mês (mais confiável)
  const numeralRow = (matrix[0] ?? []) as unknown[];
  const nameRow = (matrix[1] ?? []) as unknown[];

  // Mapear coluna → índice de mês (1-12)
  // Usar apenas a PRIMEIRA ocorrência de cada mês para evitar dupla contagem
  // com o bloco secundário de colunas (% comparativas) presente na aba "DRE novo".
  const colMes: Record<number, number> = {};

  // Primeiro tentar pela linha de numerais (linha 1)
  const seenMonths = new Set<number>();
  for (let c = 1; c < numeralRow.length; c++) {
    const v = numeralRow[c];
    if (typeof v === "number" && v >= 1 && v <= 12 && !seenMonths.has(v)) {
      colMes[c] = v;
      seenMonths.add(v);
    }
  }

  // Fallback: usar nomes dos meses (linha 2) — mesma proteção contra duplicatas
  if (Object.keys(colMes).length === 0) {
    const seenFallback = new Set<number>();
    for (let c = 1; c < nameRow.length; c++) {
      const mesIdx = MESES[norm(nameRow[c])];
      if (mesIdx && !seenFallback.has(mesIdx)) {
        colMes[c] = mesIdx;
        seenFallback.add(mesIdx);
      }
    }
  }

  const evolucaoMap = new Map<number, EvolucaoMensal>();
  for (const mes of Object.values(colMes)) {
    if (!evolucaoMap.has(mes)) evolucaoMap.set(mes, emptyEvolucao(mes, ano));
  }

  let retirada_socios = 0;

  // Linhas de dados a partir da linha 3 (índice 2)
  for (let r = 2; r < matrix.length; r++) {
    const row = (matrix[r] ?? []) as unknown[];
    const descNorm = norm(row[0]);
    if (!descNorm) continue;

    // Retirada de sócios
    if (descNorm.includes("retirada") && descNorm.includes("socios")) {
      for (const [c, mes] of Object.entries(colMes)) {
        retirada_socios += toNum(row[Number(c)]);
      }
      continue;
    }

    // Encontrar mapeamento
    let fieldKey: keyof EvolucaoMensal | "skip" | null = null;
    for (const [key, field] of Object.entries(DRE_NOVO_ROWS)) {
      if (descNorm.includes(key)) {
        fieldKey = field;
        break;
      }
    }
    if (!fieldKey || fieldKey === "skip") continue;

    for (const [cStr, mes] of Object.entries(colMes)) {
      const c = Number(cStr);
      const val = toNum(row[c]);
      const ev = evolucaoMap.get(mes)!;
      (ev[fieldKey] as number) += val;
    }
  }

  const evolucao = Array.from(evolucaoMap.values())
    .sort((a, b) => a.mes - b.mes);

  return { evolucao, retirada_socios };
}

// ─── Parser: aba "Plano de contas" ────────────────────────────────────────────

function parsePlanoContas(ws: XLSX.WorkSheet): PlanoContaItem[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  const items: PlanoContaItem[] = [];

  // Cabeçalho na linha 2 (índice 1): Código | Descrição | Tipo | Orçado | Realizado | Diferença
  for (let r = 2; r < matrix.length; r++) {
    const row = (matrix[r] ?? []) as unknown[];
    const codigo = toNum(row[0]);
    const descricao = String(row[1] ?? "").trim();
    const tipo = String(row[2] ?? "").trim();
    const orcado = toNum(row[3]);
    const realizado = toNum(row[4]);
    const diferenca = toNum(row[5]);

    if (!codigo || !descricao) continue;
    // Apenas contas folha (código com 4 dígitos)
    if (codigo < 1000 || codigo > 9999) continue;

    items.push({ codigo, descricao, tipo, orcado, realizado, diferenca });
  }

  return items;
}

// ─── Parser: aba "Custo Orçamento" ────────────────────────────────────────────

function parseCustoOrcamento(ws: XLSX.WorkSheet): CustoRH[] {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  const rhItems: CustoRH[] = [];
  const rhLabels = ["socios", "rh lpl", "rh rafcorte", "rh lima"];

  for (let r = 0; r < matrix.length; r++) {
    const row = (matrix[r] ?? []) as unknown[];
    const label = norm(row[1]);
    if (rhLabels.some((l) => label.includes(l.replace(" ", "")) || label === l)) {
      // Somar todos os meses disponíveis (colunas 2-13)
      let total = 0;
      let count = 0;
      for (let c = 2; c <= 13; c++) {
        const v = toNum(row[c]);
        if (v > 0) { total += v; count++; }
      }
      const media = count > 0 ? total / count : 0;
      rhItems.push({ unidade: String(row[1] ?? "").trim(), valor: media });
    }
  }

  return rhItems;
}

// ─── Construção do FinanceiroSummary ──────────────────────────────────────────

export function buildFinanceiroSummaryFromDreNovo(
  evolucao: EvolucaoMensal[],
  retirada_socios: number,
  plano_contas: PlanoContaItem[],
  custo_rh: CustoRH[]
): FinanceiroSummary {
  // Filtrar apenas meses com dados reais (receita > 0 ou custos > 0)
  const mesesComDados = evolucao.filter(
    (m) => m.receita !== 0 || m.custos !== 0 || m.despesas !== 0 || m.ebitda !== 0
  );

  const sum = (field: keyof EvolucaoMensal) =>
    mesesComDados.reduce((acc, m) => acc + (m[field] as number), 0);

  const receita_total = sum("receita");
  const receita_liquida = sum("receita_liquida");
  const custos = sum("custos");
  const despesas = sum("despesas");
  const tributos_vendas = sum("tributos_vendas");
  const despesas_vendas = sum("despesas_vendas");
  const ebitda = sum("ebitda");
  const resultado_financeiro = sum("resultado_financeiro");
  const aplicacoes = sum("aplicacoes");
  const emprestimos = sum("emprestimos");
  const resultado_liquido = sum("resultado");

  const lucro_bruto = receita_liquida - custos;
  const margem_pct = receita_total !== 0 ? (resultado_liquido / receita_total) * 100 : 0;
  const margem_ebitda_pct = receita_total !== 0 ? (ebitda / receita_total) * 100 : 0;

  const ano_referencia =
    mesesComDados.length > 0 ? mesesComDados[0].ano : new Date().getFullYear();

  return {
    receita_total,
    receita_liquida,
    custos,
    despesas,
    lucro_bruto,
    resultado_liquido,
    ebitda,
    margem_pct,
    margem_ebitda_pct,
    tributos_vendas,
    despesas_vendas,
    resultado_financeiro,
    aplicacoes,
    emprestimos,
    retirada_socios,
    evolucao_mensal: evolucao,
    custo_rh,
    plano_contas,
    meses_com_dados: mesesComDados.length,
    ano_referencia,
  };
}

// ─── Compatibilidade retroativa: buildFinanceiroSummary ───────────────────────
// Mantida para não quebrar a API route existente enquanto não é migrada.

export function buildFinanceiroSummary(rows: ParsedFinanceiroRow[]) {
  const RECEITA_KEYS = ["faturamento", "receita"];
  const CUSTO_KEYS = ["cmv", "custo produto", "custo do produto"];

  let receita_total = 0;
  let custos = 0;
  let despesas = 0;

  const monthly = new Map<string, EvolucaoMensal>();

  for (const r of rows) {
    const cat = stripAccents(r.categoria).toLowerCase();
    const valorAbs = Math.abs(r.valor);
    const key = `${r.ano}-${r.mes}`;

    if (!monthly.has(key)) {
      monthly.set(key, emptyEvolucao(r.mes, r.ano));
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

  return {
    receita_total,
    receita_liquida: receita_total,
    custos,
    despesas,
    lucro_bruto,
    resultado_liquido,
    ebitda: resultado_liquido,
    margem_pct,
    margem_ebitda_pct: margem_pct,
    tributos_vendas: 0,
    despesas_vendas: 0,
    resultado_financeiro: 0,
    aplicacoes: 0,
    emprestimos: 0,
    retirada_socios: 0,
    evolucao_mensal,
    custo_rh: [],
    plano_contas: [],
    meses_com_dados: evolucao_mensal.length,
    ano_referencia: new Date().getFullYear(),
  } as FinanceiroSummary;
}

// ─── Função principal de parse do arquivo ─────────────────────────────────────

export async function parseFinanceiroXLS(
  buffer: Buffer,
  _password = "DRE2025"
): Promise<{
  rows: ParsedFinanceiroRow[];
  summary: FinanceiroSummary;
  errors: string[];
}> {
  const errors: string[] = [];
  const rows: ParsedFinanceiroRow[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch (err) {
    errors.push(`Erro ao abrir o arquivo: ${String(err)}`);
    return { rows, summary: buildFinanceiroSummary([]), errors };
  }

  const sheetNames = workbook.SheetNames;
  console.log("[financeiro] Abas encontradas:", sheetNames);

  // ── 1. Aba "DRE novo" ─────────────────────────────────────────────────────
  const dreNovoCandidates = sheetNames.filter((n) =>
    norm(n).includes("dre") && norm(n).includes("nov")
  );
  const dreNovoName = dreNovoCandidates[0] ?? sheetNames.find((n) => norm(n) === "dre novo");

  let evolucao: EvolucaoMensal[] = [];
  let retirada_socios = 0;
  const ANO = 2026;

  if (dreNovoName) {
    console.log(`[financeiro] Usando aba DRE: "${dreNovoName}"`);
    const result = parseDreNovo(workbook.Sheets[dreNovoName], ANO);
    evolucao = result.evolucao;
    retirada_socios = result.retirada_socios;

    // Converter para ParsedFinanceiroRow[] (compatibilidade com tabela existente)
    for (const ev of evolucao) {
      const addRow = (cat: string, tipo: "entrada" | "saida", val: number) => {
        if (val !== 0) rows.push({ mes: ev.mes, ano: ev.ano, categoria: cat, tipo, valor: val, descricao: "" });
      };
      addRow("FATURAMENTO", "entrada", ev.receita);
      addRow("DESPESAS VENDAS", "saida", ev.despesas_vendas);
      addRow("TRIBUTOS VENDAS", "saida", ev.tributos_vendas);
      addRow("CMV", "saida", ev.custos);
      addRow("ADM", "saida", ev.despesas);
      addRow("APLICAÇÕES", "entrada", ev.aplicacoes);
      addRow("EMPRESTIMOS", "saida", ev.emprestimos);
    }
  } else {
    errors.push('Aba "DRE novo" não encontrada. Verifique se o arquivo é o "Custo - DRE 2026.xlsx".');
  }

  // ── 2. Aba "Plano de contas" ───────────────────────────────────────────────
  const planoName = sheetNames.find((n) => norm(n).includes("plano") && norm(n).includes("conta"));
  let plano_contas: PlanoContaItem[] = [];
  if (planoName) {
    plano_contas = parsePlanoContas(workbook.Sheets[planoName]);
    console.log(`[financeiro] Plano de contas: ${plano_contas.length} itens`);
  }

  // ── 3. Aba "Custo Orçamento" ───────────────────────────────────────────────
  const custoOrcName = sheetNames.find((n) => norm(n).includes("custo") && norm(n).includes("orc"));
  let custo_rh: CustoRH[] = [];
  if (custoOrcName) {
    custo_rh = parseCustoOrcamento(workbook.Sheets[custoOrcName]);
    console.log(`[financeiro] Custo RH: ${custo_rh.length} unidades`);
  }

  if (rows.length === 0 && evolucao.length === 0) {
    errors.push("Nenhum dado financeiro foi encontrado na planilha.");
  }

  const summary = buildFinanceiroSummaryFromDreNovo(evolucao, retirada_socios, plano_contas, custo_rh);
  return { rows, summary, errors };
}
