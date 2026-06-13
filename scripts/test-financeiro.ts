import * as fs from "fs";
import * as path from "path";
import { parseFinanceiroXLS } from "../lib/parsers/parse-financeiro";

const tmpDir = path.join(__dirname, "..", "tmp");
const csvPath = path.join(tmpDir, "test-fin.csv");
const csvOffsetPath = path.join(tmpDir, "test-fin-offset.csv");
const csvNoMatchPath = path.join(tmpDir, "test-fin-nomatch.csv");

const SAMPLE_CSV = [
  "DRE;Tipo Lancamento;Mes Lanc;Ano Lanc;Valor;Fornecedor",
  "Faturamento;Entrada;Jan;2026;R$100.000,00;Cliente A",
  "CMV;Saida;Jan;2026;R$40.000,00;Fornecedor B",
  "Despesas Administrativas;Saida;Jan;2026;R$15.000,00;Fornecedor C",
  "Faturamento;Entrada;Fev;2026;R$120.000,00;Cliente A",
  "CMV;Saida;Fev;2026;R$45.000,00;Fornecedor B",
  "Despesas Administrativas;Saida;Fev;2026;R$18.000,00;Fornecedor C",
  "Nao Usar;Saida;Fev;2026;R$5.000,00;Fornecedor D",
].join("\n");

// Simula planilha real onde o cabeçalho não está na primeira linha e usa
// nomes de coluna alternativos (Classificação / Valor Pago / Mês/Ano).
const SAMPLE_CSV_OFFSET = [
  "Relatorio DRE 2026;;;;",
  "Custo - DRE 2026 - copia;;;;",
  ";;;;",
  "Classificacao;Natureza;Mes/Ano;Valor Pago;Fornecedor",
  "Faturamento;Entrada;01/2026;R$200.000,00;Cliente X",
  "Custo do Produto;Saida;01/2026;R$80.000,00;Fornecedor Y",
  "Despesas Operacionais;Saida;01/2026;R$30.000,00;Fornecedor Z",
].join("\n");

// Planilha sem nenhuma coluna compatível -> deve gerar erro detalhado.
const SAMPLE_CSV_NOMATCH = [
  "Coluna A;Coluna B;Coluna C",
  "x;y;z",
].join("\n");

async function run(label: string, filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
  }

  console.log(`\n=== ${label} ===`);
  const buffer = fs.readFileSync(filePath);
  const { rows, summary, errors } = await parseFinanceiroXLS(buffer);

  console.log("Linhas processadas:", rows.length);
  console.log("Erros:", errors);
  console.log("Resumo:", JSON.stringify(summary, null, 2));
}

async function main() {
  await run("Cabecalho na linha 1", csvPath, SAMPLE_CSV);
  await run("Cabecalho fora da linha 1 (offset)", csvOffsetPath, SAMPLE_CSV_OFFSET);
  await run("Sem colunas compativeis", csvNoMatchPath, SAMPLE_CSV_NOMATCH);
}

main().catch((err) => {
  console.error("Falha no teste do parser financeiro:", err);
  process.exit(1);
});
