export type GovernedModule = "financeiro" | "comercial" | "rh" | "turnover" | "atestados" | "compras" | "qualidade" | "operacoes";

export type ImportDocumentType =
  | "dre"
  | "comercial_indicadores"
  | "rh_indicadores"
  | "atestados"
  | "compras_fornecedores"
  | "qualidade_rnc"
  | "operacoes_producao"
  | "desconhecido";

export type ImportVisualStatus = "processado" | "processado_com_alertas" | "falhou" | "processando";

export interface ImportModuleGovernance {
  module: GovernedModule;
  label: string;
  documentTypes: ImportDocumentType[];
  defaultParser: string;
  parserVersion: string;
}

export interface ImportProcessingLogEvent {
  event: "iniciada" | "concluida" | "falhou";
  message: string;
  errorReason?: string;
  createdAt: string;
}

export const IMPORT_MODULE_GOVERNANCE: ImportModuleGovernance[] = [
  {
    module: "financeiro",
    label: "Financeiro / DRE",
    documentTypes: ["dre"],
    defaultParser: "financeiro/dre2026",
    parserVersion: "2026.1",
  },
  {
    module: "comercial",
    label: "Comercial",
    documentTypes: ["comercial_indicadores"],
    defaultParser: "comercial/indicadores",
    parserVersion: "legacy.1",
  },
  {
    module: "rh",
    label: "RH",
    documentTypes: ["rh_indicadores"],
    defaultParser: "rh/indicadores",
    parserVersion: "legacy.1",
  },
  {
    module: "turnover",
    label: "Turnover",
    documentTypes: ["rh_indicadores"],
    defaultParser: "rh/turnover",
    parserVersion: "legacy.1",
  },
  {
    module: "atestados",
    label: "Atestados",
    documentTypes: ["atestados"],
    defaultParser: "rh/atestados",
    parserVersion: "legacy.1",
  },
  {
    module: "compras",
    label: "Compras",
    documentTypes: ["compras_fornecedores"],
    defaultParser: "compras/placeholder",
    parserVersion: "planned.1",
  },
  {
    module: "qualidade",
    label: "Qualidade",
    documentTypes: ["qualidade_rnc"],
    defaultParser: "qualidade/placeholder",
    parserVersion: "planned.1",
  },
  {
    module: "operacoes",
    label: "Operacoes",
    documentTypes: ["operacoes_producao"],
    defaultParser: "operacoes/placeholder",
    parserVersion: "planned.1",
  },
];

export function getModuleGovernance(module: string): ImportModuleGovernance {
  return (
    IMPORT_MODULE_GOVERNANCE.find((item) => item.module === module) ?? {
      module: module as GovernedModule,
      label: module,
      documentTypes: ["desconhecido"],
      defaultParser: `${module}/desconhecido`,
      parserVersion: "legacy.1",
    }
  );
}

export function inferDocumentType(module: string, fileName: string): ImportDocumentType {
  const lower = fileName.toLowerCase();
  if (module === "financeiro" || lower.includes("dre")) return "dre";
  if (module === "comercial") return "comercial_indicadores";
  if (module === "rh" || module === "turnover") return "rh_indicadores";
  if (module === "atestados") return "atestados";
  if (module === "compras") return "compras_fornecedores";
  if (module === "qualidade") return "qualidade_rnc";
  if (module === "operacoes") return "operacoes_producao";
  return "desconhecido";
}

export function getVisualStatus(status: string, errorCount: number): ImportVisualStatus {
  if (status === "processando") return "processando";
  if (status === "erro") return "falhou";
  if (errorCount > 0) return "processado_com_alertas";
  return "processado";
}

export function buildSyntheticProcessingLogs(input: {
  status: string;
  errorMessage?: string | null;
  createdAt: string;
}): ImportProcessingLogEvent[] {
  const logs: ImportProcessingLogEvent[] = [
    {
      event: "iniciada",
      message: "Importacao iniciada.",
      createdAt: input.createdAt,
    },
  ];

  if (input.status === "erro") {
    logs.push({
      event: "falhou",
      message: "Importacao falhou.",
      errorReason: input.errorMessage ?? "Motivo nao informado.",
      createdAt: input.createdAt,
    });
    return logs;
  }

  if (input.status === "sucesso") {
    logs.push({
      event: "concluida",
      message: "Importacao concluida.",
      createdAt: input.createdAt,
    });
  }

  return logs;
}
