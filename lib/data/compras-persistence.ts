import { createGovernedUpload, updateGovernedUpload, type UploadGovernanceMetadata } from "./importacao-persistence";
import type { ParsedFornecedor, ParsedHomologacao, ParsedAvaliacao, ParsedCompra, ParsedCotacao } from "@/src/lib/parsers/compras";

const CHUNK_SIZE = 500;

function chunkRows<T>(rows: T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

export async function persistComprasWorkflow(
  fileName: string,
  fornecedoresData: ParsedFornecedor[],
  homologacoesData: ParsedHomologacao[],
  avaliacoesData: ParsedAvaliacao[],
  comprasData: ParsedCompra[],
  cotacoesData: ParsedCotacao[],
  errors: string[]
) {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL nao configurada; persistencia de Compras ignorada.");
    return;
  }

  const totalRegistros = fornecedoresData.length + homologacoesData.length + avaliacoesData.length + comprasData.length + cotacoesData.length;
  
  const metadata: UploadGovernanceMetadata = {
    nomeArquivo: fileName,
    modulo: "compras",
    tipoDocumento: "compras_fornecedores",
    parser: "compras/indicadores",
    parserVersion: "planned.1",
    quantidadeRegistros: totalRegistros,
    quantidadeErros: errors.length,
    status: "processando",
  };

  let upload;
  try {
    upload = await createGovernedUpload(metadata);
  } catch (err) {
    console.error("Erro ao criar governanca de upload para Compras:", err);
    return;
  }

  try {
    const { db, fornecedores, homologacoes, avaliacoes_fornecedor, compras, cotacoes } = await import("@/lib/db");
    const { eq } = await import("drizzle-orm");

    const runSafe = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch (err) {
        const msg = String(err).toLowerCase();
        if (msg.includes("relation") && msg.includes("does not exist")) {
          console.warn("Tabela nao encontrada no banco de dados (migracao pendente):", err);
        } else {
          throw err;
        }
      }
    };

    // 1. Clean up
    await runSafe(() => db.delete(homologacoes).where(eq(homologacoes.upload_id, upload.id)));
    await runSafe(() => db.delete(avaliacoes_fornecedor).where(eq(avaliacoes_fornecedor.upload_id, upload.id)));
    await runSafe(() => db.delete(compras).where(eq(compras.upload_id, upload.id)));
    await runSafe(() => db.delete(cotacoes).where(eq(cotacoes.upload_id, upload.id)));
    await runSafe(() => db.delete(fornecedores).where(eq(fornecedores.upload_id, upload.id)));

    // 2. Insert Fornecedores
    const fornecedorMap = new Map<string, number>();
    if (fornecedoresData.length > 0) {
      await runSafe(async () => {
        for (const chunk of chunkRows(fornecedoresData)) {
          const inserted = await db.insert(fornecedores).values(
            chunk.map((f) => ({
              upload_id: upload.id,
              cnpj: f.cnpj || "",
              nome: f.nome,
              status: f.status || "pendente",
            }))
          ).returning();

          for (const fRow of inserted) {
            fornecedorMap.set(fRow.nome.toLowerCase(), fRow.id);
          }
        }
      });
    }

    // 3. Insert Homologacoes
    if (homologacoesData.length > 0) {
      await runSafe(async () => {
        for (const chunk of chunkRows(homologacoesData)) {
          await db.insert(homologacoes).values(
            chunk.map((h) => {
              const fId = fornecedorMap.get(h.fornecedor_nome.toLowerCase());
              return {
                upload_id: upload.id,
                fornecedor_id: fId,
                data_homologacao: h.data_homologacao || "",
                status: h.status || "pendente",
                responsavel: h.responsavel || "Sistema",
              };
            })
          );
        }
      });
    }

    // 4. Insert Avaliacoes
    if (avaliacoesData.length > 0) {
      await runSafe(async () => {
        for (const chunk of chunkRows(avaliacoesData)) {
          await db.insert(avaliacoes_fornecedor).values(
            chunk.map((a) => {
              const fId = fornecedorMap.get(a.fornecedor_nome.toLowerCase());
              return {
                upload_id: upload.id,
                fornecedor_id: fId,
                nota_desempenho: String(a.nota_desempenho),
                data_avaliacao: a.data_avaliacao || "",
                status: a.status || "pendente",
              };
            })
          );
        }
      });
    }

    // 5. Insert Compras
    if (comprasData.length > 0) {
      await runSafe(async () => {
        for (const chunk of chunkRows(comprasData)) {
          await db.insert(compras).values(
            chunk.map((c) => {
              const fId = fornecedorMap.get(c.fornecedor_nome.toLowerCase());
              return {
                upload_id: upload.id,
                numero_pedido: c.numero_pedido,
                fornecedor_id: fId,
                fornecedor_nome: c.fornecedor_nome,
                data_compra: c.data_compra || "",
                mes: c.mes,
                ano: c.ano,
                valor_total: String(c.valor_total),
                economia_obtida: String(c.economia_obtida),
                lead_time_dias: c.lead_time_dias,
              };
            })
          );
        }
      });
    }

    // 6. Insert Cotacoes
    if (cotacoesData.length > 0) {
      await runSafe(async () => {
        for (const chunk of chunkRows(cotacoesData)) {
          await db.insert(cotacoes).values(
            chunk.map((ct) => ({
              upload_id: upload.id,
              numero_cotacao: ct.numero_cotacao,
              data_cotacao: ct.data_cotacao || "",
              item: ct.item,
              quantidade: String(ct.quantidade),
              valor_cotado: String(ct.valor_cotado),
              vencedora: ct.vencedora || "nao",
            }))
          );
        }
      });
    }

    await updateGovernedUpload(upload.id, {
      status: "sucesso",
      quantidadeRegistros: totalRegistros,
      quantidadeErros: errors.length,
    });
  } catch (error) {
    console.error("Erro ao persistir dados de Compras:", error);
    await updateGovernedUpload(upload.id, {
      status: "erro",
      quantidadeRegistros: 0,
      quantidadeErros: Math.max(1, errors.length),
      erroMensagem: String(error),
    });
  }
}
