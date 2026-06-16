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
          const { db, uploads, registros_comercial } = await import("@/lib/db");
          const [upload] = await db
            .insert(uploads)
            .values({
              nome_arquivo: file.name,
              modulo: "comercial",
              status: "processando",
            })
            .returning();

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
      const { rh, desligamentos, errors } = parseRHXLS(buffer);
      result = {
        modulo,
        registros: rh.length + desligamentos.length,
        erros: errors,
        preview: [...rh.slice(0, 3), ...desligamentos.slice(0, 3)],
      };
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

      if (process.env.DATABASE_URL) {
        try {
          const {
            db,
            uploads,
            registros_financeiro,
            financeiro_dre_mensal,
            financeiro_plano_contas,
          } = await import("@/lib/db");

          const { eq } = await import("drizzle-orm");

          const [upload] = await db
            .insert(uploads)
            .values({
              nome_arquivo: file.name,
              modulo: "financeiro",
              status: "processando",
              ano_referencia: summary.ano_referencia,
            })
            .returning();

          // Salvar registros legados (compatibilidade)
          if (rows.length > 0) {
            const chunks = [];
            for (let i = 0; i < rows.length; i += 500) {
              chunks.push(rows.slice(i, i + 500));
            }
            for (const chunk of chunks) {
              await db.insert(registros_financeiro).values(
                chunk.map((r) => ({
                  upload_id: upload.id,
                  mes: r.mes,
                  ano: r.ano,
                  categoria: r.categoria,
                  tipo: r.tipo,
                  valor: String(r.valor),
                  descricao: r.descricao,
                }))
              );
            }
          }

          // Salvar DRE mensal consolidado (nova tabela)
          if (summary.evolucao_mensal.length > 0) {
            // Limpar dados anteriores do mesmo ano
            await db
              .delete(financeiro_dre_mensal)
              .where(eq(financeiro_dre_mensal.ano, summary.ano_referencia));

            await db.insert(financeiro_dre_mensal).values(
              summary.evolucao_mensal.map((ev) => ({
                upload_id: upload.id,
                mes: ev.mes,
                ano: ev.ano,
                faturamento: String(ev.receita),
                despesas_vendas: String(ev.despesas_vendas),
                tributos_vendas: String(ev.tributos_vendas),
                receita_liquida: String(ev.receita_liquida),
                cmv: String(ev.custos),
                adm: String(ev.despesas),
                tributos: "0",
                ebitda: String(ev.ebitda),
                resultado_financeiro: String(ev.resultado_financeiro),
                aplicacoes: String(ev.aplicacoes),
                emprestimos: String(ev.emprestimos),
                resultado_liquido: String(ev.resultado),
                retirada_socios: "0",
              }))
            );
          }

          // Salvar plano de contas
          if (summary.plano_contas.length > 0) {
            await db
              .delete(financeiro_plano_contas)
              .where(eq(financeiro_plano_contas.ano, summary.ano_referencia));

            const pcChunks = [];
            for (let i = 0; i < summary.plano_contas.length; i += 200) {
              pcChunks.push(summary.plano_contas.slice(i, i + 200));
            }
            for (const chunk of pcChunks) {
              await db.insert(financeiro_plano_contas).values(
                chunk.map((p) => ({
                  upload_id: upload.id,
                  ano: summary.ano_referencia,
                  codigo: p.codigo,
                  descricao: p.descricao,
                  tipo: p.tipo,
                  orcado: String(p.orcado),
                  realizado: String(p.realizado),
                  diferenca: String(p.diferenca),
                }))
              );
            }
          }

          await db
            .update(uploads)
            .set({
              status: "sucesso",
              registros_importados: rows.length + summary.evolucao_mensal.length,
            })
            .where(eq(uploads.id, upload.id));
        } catch (dbErr) {
          console.error("DB error:", dbErr);
        }
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
