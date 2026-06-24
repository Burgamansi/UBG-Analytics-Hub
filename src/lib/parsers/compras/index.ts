import * as XLSX from "xlsx";
import type { StandardImportResult, ImportValidationIssue } from "../core/types";

export interface ParsedFornecedor {
  cnpj?: string;
  nome: string;
  status: string; // "homologado", "pendente", "bloqueado"
}

export interface ParsedHomologacao {
  fornecedor_nome: string;
  data_homologacao?: string;
  status: string; // "aprovado", "reprovado", "pendente"
  responsavel?: string;
}

export interface ParsedAvaliacao {
  fornecedor_nome: string;
  nota_desempenho: number; // 0 a 100
  data_avaliacao?: string;
  status: string; // "pendente", "concluida"
}

export interface ParsedCompra {
  numero_pedido: string;
  fornecedor_nome: string;
  data_compra?: string;
  mes: number;
  ano: number;
  valor_total: number;
  economia_obtida: number;
  lead_time_dias: number;
}

export interface ParsedCotacao {
  numero_cotacao: string;
  data_cotacao?: string;
  item: string;
  quantidade: number;
  valor_cotado: number;
  vencedora: string; // "sim" | "nao"
}

export interface ComprasParsedData {
  fornecedores: ParsedFornecedor[];
  homologacoes: ParsedHomologacao[];
  avaliacoes: ParsedAvaliacao[];
  compras: ParsedCompra[];
  cotacoes: ParsedCotacao[];
}

export interface ComprasImportSummary {
  totalFornecedores: number;
  totalHomologados: number;
  totalPendentes: number;
  totalBloqueados: number;
  valorComprado: number;
  economiaObtida: number;
  leadTimeMedio: number;
  avaliacoesPendentes: number;
  fornecedoresCriticos: number;
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(String(val).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function detectMes(val: unknown): number {
  const meses: Record<string, number> = {
    jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
    jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
    janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  };
  const lower = String(val || "").toLowerCase();
  for (const [key, valNum] of Object.entries(meses)) {
    if (lower.includes(key)) return valNum;
  }
  const n = parseInt(String(val), 10);
  return isNaN(n) || n < 1 || n > 12 ? 1 : n;
}

function getRowValue(row: Record<string, unknown>, patterns: string[]): unknown {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const matchedKey = keys.find((k) => k.toLowerCase().includes(pattern.toLowerCase()));
    if (matchedKey !== undefined) return row[matchedKey];
  }
  return "";
}

export async function parseComprasWorkbook(
  buffer: Buffer,
  fileName?: string
): Promise<Omit<StandardImportResult<any, ComprasImportSummary>, "records"> & { records: ComprasParsedData }> {
  const fornecedores: ParsedFornecedor[] = [];
  const homologacoes: ParsedHomologacao[] = [];
  const avaliacoes: ParsedAvaliacao[] = [];
  const compras: ParsedCompra[] = [];
  const cotacoes: ParsedCotacao[] = [];
  const issues: ImportValidationIssue[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    for (const name of workbook.SheetNames) {
      const sheetLower = name.toLowerCase();
      const sheet = workbook.Sheets[name];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      if (data.length === 0) continue;

      if (sheetLower.includes("fornecedor") || sheetLower.includes("supplier")) {
        for (const r of data) {
          const nome = String(getRowValue(r, ["nome", "fornecedor", "razao", "supplier", "company"]) || "").trim();
          if (!nome) continue;
          const cnpj = String(getRowValue(r, ["cnpj", "documento", "doc"]) || "").trim();
          const status = String(getRowValue(r, ["status", "situacao", "homologado"]) || "pendente").trim().toLowerCase();

          let normalizedStatus = "pendente";
          if (status.includes("homol") || status.includes("aprov") || status.includes("sim") || status.includes("ativo")) {
            normalizedStatus = "homologado";
          } else if (status.includes("bloq") || status.includes("susp") || status.includes("inativo")) {
            normalizedStatus = "bloqueado";
          }

          fornecedores.push({ cnpj, nome, status: normalizedStatus });
        }
      } else if (sheetLower.includes("homologa")) {
        for (const r of data) {
          const fornecedor_nome = String(getRowValue(r, ["fornecedor", "nome", "empresa"]) || "").trim();
          if (!fornecedor_nome) continue;
          const data_homologacao = String(getRowValue(r, ["data", "homologacao", "date"]) || "").trim();
          const status = String(getRowValue(r, ["status", "situacao", "resultado"]) || "pendente").trim().toLowerCase();
          const responsavel = String(getRowValue(r, ["responsavel", "user", "analista"]) || "Sistema").trim();

          let normalizedStatus = "pendente";
          if (status.includes("aprov") || status.includes("conclu") || status.includes("homol") || status.includes("sim")) {
            normalizedStatus = "aprovado";
          } else if (status.includes("reprov") || status.includes("negad") || status.includes("recus")) {
            normalizedStatus = "reprovado";
          }

          homologacoes.push({ fornecedor_nome, data_homologacao, status: normalizedStatus, responsavel });
        }
      } else if (sheetLower.includes("avalia")) {
        for (const r of data) {
          const fornecedor_nome = String(getRowValue(r, ["fornecedor", "nome", "empresa"]) || "").trim();
          if (!fornecedor_nome) continue;
          const nota_desempenho = toNumber(getRowValue(r, ["nota", "desempenho", "score", "avaliacao", "pontos"]));
          const data_avaliacao = String(getRowValue(r, ["data", "avaliacao", "date"]) || "").trim();
          const status = String(getRowValue(r, ["status", "situacao"]) || "pendente").trim().toLowerCase();

          let normalizedStatus = "pendente";
          if (status.includes("conclu") || status.includes("finaliz") || status.includes("sim") || status.includes("feito")) {
            normalizedStatus = "concluida";
          }

          avaliacoes.push({ fornecedor_nome, nota_desempenho, data_avaliacao, status: normalizedStatus });
        }
      } else if (sheetLower.includes("compra") || sheetLower.includes("pedido") || sheetLower.includes("ordem")) {
        for (const r of data) {
          const numero_pedido = String(getRowValue(r, ["pedido", "numero", "id", "ordem", "code"]) || "").trim();
          const fornecedor_nome = String(getRowValue(r, ["fornecedor", "nome", "empresa", "supplier"]) || "").trim();
          if (!numero_pedido && !fornecedor_nome) continue;

          const data_compra = String(getRowValue(r, ["data", "compra", "date"]) || "").trim();
          const valor_total = toNumber(getRowValue(r, ["valor", "total", "valor_total", "price", "amount"]));
          const economia_obtida = toNumber(getRowValue(r, ["economia", "saving", "desconto"]));
          const lead_time_dias = Math.round(toNumber(getRowValue(r, ["lead time", "lead_time", "dias", "prazo"]))) || 0;

          const mesRaw = getRowValue(r, ["mes", "month", "mês"]);
          const anoRaw = getRowValue(r, ["ano", "year"]);
          const mes = mesRaw ? detectMes(mesRaw) : 1;
          const ano = toNumber(anoRaw) || 2026;

          compras.push({
            numero_pedido: numero_pedido || `PED-${Math.floor(Math.random() * 100000)}`,
            fornecedor_nome: fornecedor_nome || "Não informado",
            data_compra,
            mes,
            ano,
            valor_total,
            economia_obtida,
            lead_time_dias,
          });
        }
      } else if (sheetLower.includes("cota") || sheetLower.includes("orcamento") || sheetLower.includes("rfq")) {
        for (const r of data) {
          const numero_cotacao = String(getRowValue(r, ["cotacao", "numero", "id", "rfq", "code"]) || "").trim();
          if (!numero_cotacao) continue;
          const data_cotacao = String(getRowValue(r, ["data", "cotacao", "date"]) || "").trim();
          const item = String(getRowValue(r, ["item", "produto", "insumo", "material"]) || "").trim();
          const quantidade = toNumber(getRowValue(r, ["qtd", "quantidade", "qty"]));
          const valor_cotado = toNumber(getRowValue(r, ["valor", "cotado", "preco"]));
          const venc = String(getRowValue(r, ["vencedor", "vencedora", "status", "ganhou"]) || "nao").trim().toLowerCase();

          let vencedora = "nao";
          if (venc.includes("sim") || venc.includes("vence") || venc.includes("ganh") || venc.includes("ok")) {
            vencedora = "sim";
          }

          cotacoes.push({
            numero_cotacao,
            data_cotacao,
            item: item || "Insumo genérico",
            quantidade,
            valor_cotado,
            vencedora,
          });
        }
      }
    }

    // Se todos os arrays continuam vazios depois de iterar as abas, tenta fazer um parse inteligente da primeira aba
    if (fornecedores.length === 0 && homologacoes.length === 0 && avaliacoes.length === 0 && compras.length === 0 && cotacoes.length === 0) {
      const firstName = workbook.SheetNames[0];
      if (firstName) {
        const sheet = workbook.Sheets[firstName];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
        if (data.length > 0) {
          const sample = data[0];
          const keys = Object.keys(sample).map(k => k.toLowerCase());

          // Se tiver colunas de compras/pedidos
          if (keys.some(k => k.includes("pedido") || k.includes("total") || k.includes("economia") || k.includes("valor"))) {
            for (const r of data) {
              const numero_pedido = String(getRowValue(r, ["pedido", "numero", "id"]) || "").trim();
              const fornecedor_nome = String(getRowValue(r, ["fornecedor", "nome", "empresa"]) || "").trim();
              if (!numero_pedido && !fornecedor_nome) continue;

              const data_compra = String(getRowValue(r, ["data", "compra", "date"]) || "").trim();
              const valor_total = toNumber(getRowValue(r, ["valor", "total", "valor_total"]));
              const economia_obtida = toNumber(getRowValue(r, ["economia", "saving", "desconto"]));
              const lead_time_dias = Math.round(toNumber(getRowValue(r, ["lead time", "lead_time", "dias"]))) || 0;

              const mesRaw = getRowValue(r, ["mes", "month"]);
              const anoRaw = getRowValue(r, ["ano", "year"]);
              const mes = mesRaw ? detectMes(mesRaw) : 1;
              const ano = toNumber(anoRaw) || 2026;

              compras.push({
                numero_pedido: numero_pedido || `PED-${Math.floor(Math.random() * 100000)}`,
                fornecedor_nome: fornecedor_nome || "Não informado",
                data_compra,
                mes,
                ano,
                valor_total,
                economia_obtida,
                lead_time_dias,
              });

              // Adiciona fornecedor implicitamente
              if (fornecedor_nome && !fornecedores.some(f => f.nome.toLowerCase() === fornecedor_nome.toLowerCase())) {
                fornecedores.push({ nome: fornecedor_nome, status: "homologado" });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    issues.push({
      level: "error",
      code: "COMPRAS_PARSE_ERROR",
      message: `Erro ao processar arquivo: ${String(err)}`,
    });
  }

  const hasErrors = issues.some((issue) => issue.level === "error");

  const totalFornecedores = fornecedores.length;
  const totalHomologados = fornecedores.filter((f) => f.status === "homologado").length;
  const totalPendentes = fornecedores.filter((f) => f.status === "pendente").length;
  const totalBloqueados = fornecedores.filter((f) => f.status === "bloqueado").length;

  const valorComprado = compras.reduce((sum, c) => sum + c.valor_total, 0);
  const economiaObtida = compras.reduce((sum, c) => sum + c.economia_obtida, 0);
  const leadTimeSum = compras.reduce((sum, c) => sum + c.lead_time_dias, 0);
  const leadTimeMedio = compras.length ? leadTimeSum / compras.length : 0;

  const avaliacoesPendentes = avaliacoes.filter((a) => a.status === "pendente").length;
  const fornecedoresCriticos = avaliacoes.filter((a) => a.nota_desempenho < 70).length;

  const summary: ComprasImportSummary = {
    totalFornecedores,
    totalHomologados,
    totalPendentes,
    totalBloqueados,
    valorComprado,
    economiaObtida,
    leadTimeMedio,
    avaliacoesPendentes,
    fornecedoresCriticos,
  };

  const records: ComprasParsedData = {
    fornecedores,
    homologacoes,
    avaliacoes,
    compras,
    cotacoes,
  };

  if (totalFornecedores === 0 && compras.length === 0 && !hasErrors) {
    issues.push({
      level: "warning",
      code: "EMPTY_COMPRAS_WORKBOOK",
      message: "Nenhum fornecedor ou pedido de compras foi identificado na planilha.",
    });
  }

  return {
    module: "compras",
    parser: "compras/indicadores",
    fileName,
    status: hasErrors ? "error" : "processed",
    records,
    summary,
    issues,
    meta: {
      sheets: [],
      totalRows: totalFornecedores + homologacoes.length + avaliacoes.length + compras.length + cotacoes.length,
      processedRows: totalFornecedores + homologacoes.length + avaliacoes.length + compras.length + cotacoes.length,
      rejectedRows: 0,
    },
  };
}