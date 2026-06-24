export type ImportStatusView = "sucesso" | "processando" | "erro" | "pendente";

export interface ImportStatusRow {
  id: string;
  arquivo: string;
  modulo: string;
  dataUpload: string;
  status: ImportStatusView;
  registrosProcessados: number;
  observacao: string;
}

export const IMPORT_STATUS_ROWS: ImportStatusRow[] = [
  {
    id: "imp-fin-001",
    arquivo: "Custo-DRE2026.xlsx",
    modulo: "Financeiro / DRE",
    dataUpload: "2026-06-23 16:42",
    status: "sucesso",
    registrosProcessados: 1284,
    observacao: "Parser DRE 2026 preparado para receita, custos, despesas, EBITDA e resultado.",
  },
  {
    id: "imp-com-001",
    arquivo: "IndicadoresComercial2026.xls",
    modulo: "Comercial",
    dataUpload: "2026-06-22 09:15",
    status: "sucesso",
    registrosProcessados: 892,
    observacao: "Fluxo atual preservado em lib/parsers/parse-meses.ts.",
  },
  {
    id: "imp-rh-001",
    arquivo: "IndicadoresRH2026.xlsm",
    modulo: "RH",
    dataUpload: "2026-06-21 11:08",
    status: "sucesso",
    registrosProcessados: 316,
    observacao: "Fluxo atual preservado em lib/parsers/parse-rh.ts.",
  },
  {
    id: "imp-qua-001",
    arquivo: "RNC-Qualidade-2026.xlsx",
    modulo: "Qualidade",
    dataUpload: "Aguardando",
    status: "pendente",
    registrosProcessados: 0,
    observacao: "Estrutura de parser criada para mapeamento futuro.",
  },
  {
    id: "imp-compras-001",
    arquivo: "Compras-Fornecedores-2026.xlsx",
    modulo: "Compras",
    dataUpload: "Aguardando",
    status: "pendente",
    registrosProcessados: 0,
    observacao: "Estrutura de parser criada para mapeamento futuro.",
  },
  {
    id: "imp-ops-001",
    arquivo: "Producao-Operacoes-2026.xlsx",
    modulo: "Operações",
    dataUpload: "Aguardando",
    status: "pendente",
    registrosProcessados: 0,
    observacao: "Estrutura de parser criada para mapeamento futuro.",
  },
];