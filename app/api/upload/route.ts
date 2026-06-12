import { NextRequest, NextResponse } from "next/server";
import { parseComercialXLS } from "@/lib/parsers/parse-meses";
import { parseRHXLS, parseAtestadosXLS } from "@/lib/parsers/parse-rh";

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

      // Se tiver banco configurado, salvar
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
          // Continua sem banco
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
