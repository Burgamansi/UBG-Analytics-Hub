import { createGovernedUpload, updateGovernedUpload, type UploadGovernanceMetadata } from "./importacao-persistence";
import type { ParsedRHRow, ParsedDesligamento, ParsedAtestado } from "@/lib/parsers/parse-rh";

const CHUNK_SIZE = 500;

function chunkRows<T>(rows: T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export async function persistRhImport(uploadId: number, rows: ParsedRHRow[]) {
  if (rows.length === 0) return;

  const { db, registros_rh } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");

  // Evitar duplicidade limpando registros anteriores com o mesmo uploadId
  await db.delete(registros_rh).where(eq(registros_rh.upload_id, uploadId));

  for (const chunk of chunkRows(rows)) {
    await db.insert(registros_rh).values(
      chunk.map((row) => ({
        upload_id: uploadId,
        mes: row.mes,
        ano: row.ano,
        empresa: row.empresa,
        colaboradores_inicio: row.colaboradores_inicio,
        colaboradores_fim: row.colaboradores_fim,
        admissoes: row.admissoes,
        desligamentos: row.desligamentos,
        turnover_pct: String(row.turnover_pct),
        absenteismo_pct: String(row.absenteismo_pct),
        horas_justificadas: String(row.horas_justificadas),
        horas_nao_justificadas: String(row.horas_nao_justificadas),
      }))
    );
  }
}

export async function persistTurnoverImport(uploadId: number, rows: ParsedDesligamento[]) {
  if (rows.length === 0) return;

  const { db, desligamentos } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");

  // Evitar duplicidade limpando registros anteriores com o mesmo uploadId
  await db.delete(desligamentos).where(eq(desligamentos.upload_id, uploadId));

  for (const chunk of chunkRows(rows)) {
    await db.insert(desligamentos).values(
      chunk.map((row) => ({
        upload_id: uploadId,
        mes: row.mes,
        ano: row.ano,
        empresa: row.empresa,
        nome: row.nome,
        cargo: row.cargo || "Nao informado",
        motivo: row.motivo || "Nao informado",
        data_admissao: row.data_admissao || "",
        data_desligamento: row.data_desligamento || "",
      }))
    );
  }
}

export async function persistRhAndTurnoverWorkflow(
  fileName: string,
  modulo: "rh" | "turnover",
  rhRows: ParsedRHRow[],
  desligRows: ParsedDesligamento[],
  errors: string[]
) {
  if (!process.env.DATABASE_URL) return;
  if (rhRows.length === 0 && desligRows.length === 0) return;

  const totalRegistros = rhRows.length + desligRows.length;
  const metadata: UploadGovernanceMetadata = {
    nomeArquivo: fileName,
    modulo: modulo,
    tipoDocumento: modulo === "rh" ? "rh_indicadores" : "rh_turnover",
    parser: modulo === "rh" ? "rh/indicadores" : "rh/turnover",
    parserVersion: "legacy.1",
    quantidadeRegistros: totalRegistros,
    quantidadeErros: errors.length,
    status: "processando",
  };

  const upload = await createGovernedUpload(metadata);

  try {
    // Persiste indicadores gerais de RH
    await persistRhImport(upload.id, rhRows);

    // Persiste detalhes de desligamentos (turnover)
    await persistTurnoverImport(upload.id, desligRows);

    await updateGovernedUpload(upload.id, {
      status: "sucesso",
      quantidadeRegistros: totalRegistros,
      quantidadeErros: errors.length,
    });
  } catch (error) {
    await updateGovernedUpload(upload.id, {
      status: "erro",
      quantidadeRegistros: 0,
      quantidadeErros: Math.max(1, errors.length),
      erroMensagem: String(error),
    });
    throw error;
  }
}

export async function persistAtestadosImport(
  fileName: string,
  rows: ParsedAtestado[],
  errors: string[]
) {
  if (!process.env.DATABASE_URL || rows.length === 0) return;

  const { db, atestados } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");

  const metadata: UploadGovernanceMetadata = {
    nomeArquivo: fileName,
    modulo: "atestados",
    tipoDocumento: "atestados",
    parser: "rh/atestados",
    parserVersion: "legacy.1",
    quantidadeRegistros: rows.length,
    quantidadeErros: errors.length,
    status: "processando",
  };

  const upload = await createGovernedUpload(metadata);

  try {
    // Evitar duplicidade limpando registros anteriores com o mesmo uploadId
    await db.delete(atestados).where(eq(atestados.upload_id, upload.id));

    for (const chunk of chunkRows(rows)) {
      await db.insert(atestados).values(
        chunk.map((row) => ({
          upload_id: upload.id,
          mes: row.mes,
          ano: row.ano,
          empresa: row.empresa,
          colaborador: row.colaborador || "Nao informado",
          cid: row.cid || "Nao informado",
          dias: row.dias || 0,
          tipo: row.tipo || "integral",
        }))
      );
    }

    await updateGovernedUpload(upload.id, {
      status: "sucesso",
      quantidadeRegistros: rows.length,
      quantidadeErros: errors.length,
    });
  } catch (error) {
    await updateGovernedUpload(upload.id, {
      status: "erro",
      quantidadeRegistros: 0,
      quantidadeErros: Math.max(1, errors.length),
      erroMensagem: String(error),
    });
    throw error;
  }
}
