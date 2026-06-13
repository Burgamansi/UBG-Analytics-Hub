import * as fs from "fs";
import * as path from "path";
import { parseFinanceiroXLS } from "../lib/parsers/parse-financeiro";

const csvPath = path.join(__dirname, "..", "tmp", "test-fin.csv");

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

async function main() {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, SAMPLE_CSV, "utf8");
  }

  const buffer = fs.readFileSync(csvPath);
  const { rows, summary, errors } = await parseFinanceiroXLS(buffer);

  console.log("Linhas processadas:", rows.length);
  console.log("Erros:", errors);
  console.log("Resumo:", JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("Falha no teste do parser financeiro:", err);
  process.exit(1);
});
