import type { uploads } from "@/lib/db/schema";

export type UploadGovernanceModule = "financeiro" | "comercial" | "rh" | "turnover" | "atestados" | "compras" | "qualidade" | "operacoes";
export type UploadGovernanceStatus = "processando" | "sucesso" | "erro";

type UploadInsert = typeof uploads.$inferInsert;

export interface UploadGovernanceMetadata {
  nomeArquivo: string;
  modulo: UploadGovernanceModule;
  tipoDocumento: string;
  parser: string;
  parserVersion: string;
  quantidadeRegistros?: number;
  quantidadeErros?: number;
  status?: UploadGovernanceStatus;
  erroMensagem?: string;
  usuarioImportacao?: string;
}

export interface UploadGovernanceUpdate {
  status: UploadGovernanceStatus;
  quantidadeRegistros: number;
  quantidadeErros: number;
  erroMensagem?: string;
}

function isLegacyMetadataError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return [
    "tipo_documento",
    "parser",
    "parser_version",
    "usuario_importacao",
    "quantidade_registros",
    "quantidade_erros",
    "data_importacao",
    "importacao_logs",
  ].some((column) => message.includes(column));
}

function toLegacyInsert(metadata: UploadGovernanceMetadata): any {
  return {
    nome_arquivo: metadata.nomeArquivo,
    modulo: metadata.modulo,
    status: metadata.status ?? "processando",
    registros_importados: metadata.quantidadeRegistros,
    erro_mensagem: metadata.erroMensagem,
  };
}

function toGovernedInsert(metadata: UploadGovernanceMetadata): any {
  return {
    ...toLegacyInsert(metadata),
    tipo_documento: metadata.tipoDocumento,
    parser: metadata.parser,
    parser_version: metadata.parserVersion,
    usuario_importacao: metadata.usuarioImportacao ?? "Sistema",
    quantidade_registros: metadata.quantidadeRegistros,
    quantidade_erros: metadata.quantidadeErros ?? 0,
    data_importacao: new Date(),
  };
}

function toLegacyUpdate(update: UploadGovernanceUpdate): any {
  return {
    status: update.status,
    registros_importados: update.quantidadeRegistros,
    erro_mensagem: update.erroMensagem,
  };
}

function toGovernedUpdate(update: UploadGovernanceUpdate): any {
  return {
    ...toLegacyUpdate(update),
    quantidade_registros: update.quantidadeRegistros,
    quantidade_erros: update.quantidadeErros,
  };
}

export async function createGovernedUpload(metadata: UploadGovernanceMetadata) {
  const { db, uploads: uploadsRaw } = await import("@/lib/db");
  const uploads = uploadsRaw as any;

  try {
    const [upload] = (await db.insert(uploads).values(toGovernedInsert(metadata) as any).returning()) as any;
    await appendImportacaoLog(upload.id, "iniciada", "Importacao iniciada.");
    return upload;
  } catch (error) {
    if (!isLegacyMetadataError(error)) throw error;
    const [upload] = (await db.insert(uploads).values(toLegacyInsert(metadata) as any).returning()) as any;
    return upload;
  }
}

export async function updateGovernedUpload(uploadId: number, update: UploadGovernanceUpdate) {
  const { db, uploads: uploadsRaw } = await import("@/lib/db");
  const uploads = uploadsRaw as any;
  const { eq } = await import("drizzle-orm");

  try {
    await db.update(uploads).set(toGovernedUpdate(update) as any).where(eq(uploads.id, uploadId));
  } catch (error) {
    if (!isLegacyMetadataError(error)) throw error;
    await db.update(uploads).set(toLegacyUpdate(update)).where(eq(uploads.id, uploadId));
  }

  if (update.status === "sucesso") {
    await appendImportacaoLog(uploadId, "concluida", "Importacao concluida.");
  }

  if (update.status === "erro") {
    await appendImportacaoLog(uploadId, "falhou", "Importacao falhou.", update.erroMensagem);
  }
}

export async function appendImportacaoLog(
  uploadId: number,
  evento: "iniciada" | "concluida" | "falhou",
  mensagem: string,
  motivoFalha?: string
) {
  try {
    const { db, importacao_logs: importacaoLogsRaw } = await import("@/lib/db");
    const importacao_logs = importacaoLogsRaw as any;
    await db.insert(importacao_logs).values({
      upload_id: uploadId,
      evento,
      mensagem,
      motivo_falha: motivoFalha,
    });
  } catch (error) {
    if (!isLegacyMetadataError(error)) {
      console.warn("Importacao log skipped:", error);
    }
  }
}
