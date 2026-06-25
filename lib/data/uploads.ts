import {
  buildSyntheticProcessingLogs,
  getModuleGovernance,
  getVisualStatus,
  inferDocumentType,
  type ImportProcessingLogEvent,
  type ImportVisualStatus,
} from "@/src/lib/data/importacoes-governance";

export type UploadImportacaoStatus = "processando" | "sucesso" | "erro";

interface UploadReadModel {
  id: number;
  nomeArquivo: string;
  modulo: string;
  tipoDocumento?: string | null;
  parser?: string | null;
  parserVersion?: string | null;
  usuarioImportacao?: string | null;
  status: UploadImportacaoStatus;
  dataUpload: Date | string;
  dataImportacao?: Date | string | null;
  registrosProcessados?: number | null;
  quantidadeRegistros?: number | null;
  quantidadeErros?: number | null;
  erroMensagem?: string | null;
}

export interface UploadImportacao {
  id: number;
  nomeArquivo: string;
  modulo: string;
  moduloLabel: string;
  tipoDocumento: string;
  parser: string;
  parserVersion: string;
  usuarioImportacao: string;
  status: UploadImportacaoStatus;
  statusVisual: ImportVisualStatus;
  dataUpload: string;
  dataImportacao: string;
  registrosProcessados: number;
  quantidadeErros: number;
  erros: string[];
  logs: ImportProcessingLogEvent[];
}

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function isMissingGovernanceColumnError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return [
    "tipo_documento",
    "parser_version",
    "usuario_importacao",
    "quantidade_registros",
    "quantidade_erros",
    "data_importacao",
  ].some((column) => message.includes(column));
}

async function selectGovernedUploads(): Promise<UploadReadModel[]> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);

  return await sql`
    select
      id,
      nome_arquivo as "nomeArquivo",
      modulo,
      status,
      created_at as "dataUpload",
      registros_importados as "registrosProcessados",
      erro_mensagem as "erroMensagem"
    from uploads
    order by id desc
    limit 100
  ` as UploadReadModel[];
}

export async function listUploadsReadOnly(): Promise<UploadImportacao[]> {
  if (!process.env.DATABASE_URL) return [];

  const rows = await selectGovernedUploads();

  return rows.map((row) => {
    const governance = getModuleGovernance(row.modulo);
    const errorCount = row.quantidadeErros ?? (row.erroMensagem ? 1 : 0);
    const dataImportacao = toIsoDate(row.dataImportacao) || toIsoDate(row.dataUpload);

    return {
      id: row.id,
      nomeArquivo: row.nomeArquivo,
      modulo: row.modulo,
      moduloLabel: governance.label,
      tipoDocumento: row.tipoDocumento ?? inferDocumentType(row.modulo, row.nomeArquivo),
      parser: row.parser ?? governance.defaultParser,
      parserVersion: row.parserVersion ?? governance.parserVersion,
      usuarioImportacao: row.usuarioImportacao ?? "Sistema",
      status: row.status,
      statusVisual: getVisualStatus(row.status, errorCount),
      dataUpload: toIsoDate(row.dataUpload),
      dataImportacao,
      registrosProcessados: row.quantidadeRegistros ?? row.registrosProcessados ?? 0,
      quantidadeErros: errorCount,
      erros: row.erroMensagem ? [row.erroMensagem] : [],
      logs: buildSyntheticProcessingLogs({
        status: row.status,
        errorMessage: row.erroMensagem,
        createdAt: dataImportacao,
      }),
    };
  });
}

export async function listImportHistoryReadOnly(): Promise<UploadImportacao[]> {
  return listUploadsReadOnly();
}
