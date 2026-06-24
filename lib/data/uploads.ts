import { desc } from "drizzle-orm";
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
  const { db, uploads: uploadsRaw } = await import("@/lib/db");
  const uploads = uploadsRaw as any;

  try {
    return await db
      .select({
        id: uploads.id,
        nomeArquivo: uploads.nome_arquivo,
        modulo: uploads.modulo,
        tipoDocumento: uploads.tipo_documento,
        parser: uploads.parser,
        parserVersion: uploads.parser_version,
        usuarioImportacao: uploads.usuario_importacao,
        status: uploads.status,
        dataUpload: uploads.created_at,
        dataImportacao: uploads.data_importacao,
        registrosProcessados: uploads.registros_importados,
        quantidadeRegistros: uploads.quantidade_registros,
        quantidadeErros: uploads.quantidade_erros,
        erroMensagem: uploads.erro_mensagem,
      })
      .from(uploads)
      .orderBy(desc(uploads.created_at))
      .limit(100);
  } catch (error) {
    if (!isMissingGovernanceColumnError(error)) throw error;

    return db
      .select({
        id: uploads.id,
        nomeArquivo: uploads.nome_arquivo,
        modulo: uploads.modulo,
        status: uploads.status,
        dataUpload: uploads.created_at,
        registrosProcessados: uploads.registros_importados,
        erroMensagem: uploads.erro_mensagem,
      })
      .from(uploads)
      .orderBy(desc(uploads.created_at))
      .limit(100);
  }
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
