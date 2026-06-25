import { NextRequest, NextResponse } from "next/server";
import { parseComercialXLS } from "@/lib/parsers/parse-meses";
import { parseRHXLS, parseAtestadosXLS } from "@/lib/parsers/parse-rh";
import { parseFinanceiroXLS } from "@/lib/parsers/parse-financeiro";

export const runtime = "nodejs";
export const maxDuration = 60;


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const modulo = formData.get("modulo") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!modulo) {
      return NextResponse.json({ error: "Módulo não especificado." }, { status: 400 });
    }

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/octet-stream",
    ];

    const fileName = file.name.toLowerCase();
    const isAllowed =
      allowedTypes.includes(file.type) ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xlsm") ||
      fileName.endsWith(".csv");

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Formato inválido. Use XLS, XLSX, XLSM ou CSV." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result: {
      modulo: string;
      registros: number;
      erros: string[];
      preview?: unknown[];
      persistencia?: { saved: boolean; uploadId?: number; error?: string };
    };

    if (modulo === "comercial") {
      const { rows, errors } = parseComercialXLS(buffer);
      result = {
        modulo: "comercial",
        registros: rows.length,
        erros: errors,
        preview: rows.slice(0, 5),
      };

      if (process.env.DATABASE_URL && rows.length > 0) {
        try {
          const { db, uploads: uploadsRaw, registros_comercial } = await import("@/lib/db");
          const uploads = uploadsRaw as any;
          const [upload] = (await db
            .insert(uploads)
            .values({
              nome_arquivo: file.name,
              modulo: "comercial",
              status: "processando",
            })
            .returning()) as any;

          const chunks = [];
          for (let i = 0; i < rows.length; i += 500) {
            chunks.push(rows.slice(i, i + 500));
          }

          for (const chunk of chunks) {
            await db.insert(registros_comercial).values(
              chunk.map((r) => ({
                upload_id: upload.id,
                mes: r.mes,
                ano: r.ano,
                empresa: r.empresa,
                vendedor: r.vendedor,
                fornecedor: r.fornecedor,
                tipo_produto: r.tipo_produto,
                quantidade: String(r.quantidade),
                valor_unitario: String(r.valor_unitario),
                valor_total: String(r.valor_total),
              }))
            );
          }

          await db
            .update(uploads)
            .set({ status: "sucesso", registros_importados: rows.length })
            .where(
              (await import("drizzle-orm")).eq(uploads.id, upload.id)
            );
        } catch (dbErr) {
          console.error("DB error:", dbErr);
        }
      }
    } else if (modulo === "rh" || modulo === "turnover") {
      const { rh: rhRows, desligamentos: desligRows, errors } = parseRHXLS(buffer);
      result = {
        modulo,
        registros: rhRows.length + desligRows.length,
        erros: errors,
        preview: [...rhRows.slice(0, 3), ...desligRows.slice(0, 3)],
      };

      if (process.env.DATABASE_URL && (rhRows.length > 0 || desligRows.length > 0)) {
        try {
          const {
            db,
            uploads: uploadsRaw,
            registros_rh,
            desligamentos: desligamentos_table,
          } = await import("@/lib/db");
          const uploads = uploadsRaw as any;
          const { eq } = await import("drizzle-orm");

          const [upload] = (await db
            .insert(uploads)
            .values({
              nome_arquivo: file.name,
              modulo: modulo === "turnover" ? "turnover" : "rh",
              status: "processando",
            })
            .returning()) as any;

          if (rhRows.length > 0) {
            const chunks = [];
            for (let i = 0; i < rhRows.length; i += 500) chunks.push(rhRows.slice(i, i + 500));
            for (const chunk of chunks) {
              await db.insert(registros_rh).values(
                chunk.map((r) => ({
                  upload_id: upload.id,
                  mes: r.mes,
                  ano: r.ano,
                  empresa: r.empresa,
                  colaboradores_inicio: r.colaboradores_inicio,
                  colaboradores_fim: r.colaboradores_fim,
                  admissoes: r.admissoes,
                  desligamentos: r.desligamentos,
                  turnover_pct: String(r.turnover_pct),
                  absenteismo_pct: String(r.absenteismo_pct),
                  horas_justificadas: String(r.horas_justificadas),
                  horas_nao_justificadas: String(r.horas_nao_justificadas),
                }))
              );
            }
          }

          if (desligRows.length > 0) {
            const chunks = [];
            for (let i = 0; i < desligRows.length; i += 500) chunks.push(desligRows.slice(i, i + 500));
            for (const chunk of chunks) {
              await db.insert(desligamentos_table).values(
                chunk.map((d) => ({
                  upload_id: upload.id,
                  mes: d.mes,
                  ano: d.ano,
                  empresa: d.empresa,
                  nome: d.nome,
                  cargo: d.cargo,
                  motivo: d.motivo,
                  data_admissao: d.data_admissao,
                  data_desligamento: d.data_desligamento,
                }))
              );
            }
          }

          await db
            .update(uploads)
            .set({
              status: "sucesso",
              registros_importados: rhRows.length + desligRows.length,
            })
            .where(eq(uploads.id, upload.id));
        } catch (dbErr) {
          console.error("DB error:", dbErr);
        }
      }
    } else if (modulo === "atestados") {
      const { atestados, errors } = parseAtestadosXLS(buffer);
      result = {
        modulo: "atestados",
        registros: atestados.length,
        erros: errors,
        preview: atestados.slice(0, 5),
      };
    } else if (modulo === "financeiro") {
      let parsed;
      try {
        parsed = await parseFinanceiroXLS(buffer);
      } catch (err) {
        const msg = String(err);
        return NextResponse.json(
          { error: `Erro ao processar planilha financeira: ${msg}` },
          { status: 400 }
        );
      }

      const { rows, summary, errors } = parsed;

      if (rows.length === 0 && summary.meses_com_dados === 0) {
        return NextResponse.json({
          success: false,
          arquivo: file.name,
          tamanho_kb: Math.round(file.size / 1024),
          modulo: "financeiro",
          registros: 0,
          erros: errors,
          error:
            errors[0] ||
            "Nenhum registro foi importado. Verifique se a planilha possui a aba 'DRE novo'.",
        });
      }

      result = {
        modulo: "financeiro",
        registros: rows.length,
        erros: errors,
        preview: [summary],
      };

      if (!process.env.DATABASE_URL) {
        result.persistencia = { saved: false, error: "DATABASE_URL nao configurada." };
        result.erros.push("Arquivo processado, mas DATABASE_URL nao esta configurada para persistencia.");
      } else {
        try {
          const { neon } = await import("@neondatabase/serverless");
          const sql = neon(process.env.DATABASE_URL);

          const uploadsInserted = await sql`
            insert into uploads (nome_arquivo, modulo, status, ano_referencia)
            values (${file.name}, 'financeiro', 'processando', ${summary.ano_referencia})
            returning id
          `;
          const upload = uploadsInserted[0] as { id: number };

          for (const row of rows) {
            await sql`
              insert into registros_financeiro (upload_id, mes, ano, categoria, tipo, valor, descricao)
              values (
                ${upload.id},
                ${row.mes},
                ${row.ano},
                ${row.categoria},
                ${row.tipo},
                ${String(row.valor)},
                ${row.descricao}
              )
            `;
          }

          await sql`delete from financeiro_dre_mensal where ano = ${summary.ano_referencia}`;

          for (const ev of summary.evolucao_mensal) {
            await sql`
              insert into financeiro_dre_mensal (
                upload_id,
                mes,
                ano,
                faturamento,
                despesas_vendas,
                tributos_vendas,
                receita_liquida,
                cmv,
                adm,
                tributos,
                ebitda,
                resultado_financeiro,
                aplicacoes,
                emprestimos,
                resultado_liquido,
                retirada_socios
              )
              values (
                ${upload.id},
                ${ev.mes},
                ${ev.ano},
                ${String(ev.receita)},
                ${String(ev.despesas_vendas)},
                ${String(ev.tributos_vendas)},
                ${String(ev.receita_liquida)},
                ${String(ev.custos)},
                ${String(ev.despesas)},
                '0',
                ${String(ev.ebitda)},
                ${String(ev.resultado_financeiro)},
                ${String(ev.aplicacoes)},
                ${String(ev.emprestimos)},
                ${String(ev.resultado)},
                ${String(summary.retirada_socios)}
              )
            `;
          }

          await sql`delete from financeiro_plano_contas where ano = ${summary.ano_referencia}`;

          for (const account of summary.plano_contas) {
            await sql`
              insert into financeiro_plano_contas (
                upload_id,
                ano,
                codigo,
                descricao,
                tipo,
                orcado,
                realizado,
                diferenca
              )
              values (
                ${upload.id},
                ${summary.ano_referencia},
                ${account.codigo},
                ${account.descricao},
                ${account.tipo},
                ${String(account.orcado)},
                ${String(account.realizado)},
                ${String(account.diferenca)}
              )
            `;
          }

          await sql`
            update uploads
            set status = 'sucesso', registros_importados = ${rows.length + summary.evolucao_mensal.length}
            where id = ${upload.id}
          `;

          result.persistencia = { saved: true, uploadId: upload.id };
          console.log("[financeiro] Persistencia concluida", { uploadId: upload.id, registros: rows.length });
        } catch (dbErr) {
          const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
          console.error("DB error:", dbErr);
          result.persistencia = { saved: false, error: message };
          result.erros.push("Arquivo processado, mas nao foi possivel persistir os dados financeiros no banco.");
          return NextResponse.json({
            success: false,
            arquivo: file.name,
            tamanho_kb: Math.round(file.size / 1024),
            ...result,
          }, { status: 500 });
        }
      }
    } else if (modulo === "compras") {
      const { parseComprasWorkbook } = await import("@/src/lib/parsers/compras");
      const { persistComprasWorkflow } = await import("@/lib/data/compras-persistence");

      const parsed = await parseComprasWorkbook(buffer, file.name);
      const errors = parsed.issues.map((issue) => issue.message);

      const fornCount = parsed.records.fornecedores.length;
      const homCount = parsed.records.homologacoes.length;
      const evalCount = parsed.records.avaliacoes.length;
      const compCount = parsed.records.compras.length;
      const cotaCount = parsed.records.cotacoes.length;
      const totalCount = fornCount + homCount + evalCount + compCount + cotaCount;

      result = {
        modulo: "compras",
        registros: totalCount,
        erros: errors,
        preview: parsed.records.compras.slice(0, 5),
      };

      try {
        await persistComprasWorkflow(
          file.name,
          parsed.records.fornecedores,
          parsed.records.homologacoes,
          parsed.records.avaliacoes,
          parsed.records.compras,
          parsed.records.cotacoes,
          errors
        );
      } catch (dbErr) {
        console.error("DB error:", dbErr);
        result.erros.push("Arquivo processado, mas nao foi possivel persistir os dados de compras no banco.");
      }
    } else {
      return NextResponse.json(
        { error: `Módulo '${modulo}' não suportado.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      arquivo: file.name,
      tamanho_kb: Math.round(file.size / 1024),
      ...result,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: `Erro interno: ${String(err)}` },
      { status: 500 }
    );
  }
}

