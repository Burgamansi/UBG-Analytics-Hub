import { NextResponse } from "next/server";
import { buildFinanceiroSummary, type ParsedFinanceiroRow } from "@/lib/parsers/parse-financeiro";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ available: false, summary: null });
  }

  try {
    const { db, registros_financeiro } = await import("@/lib/db");
    const registros = await db.select().from(registros_financeiro);

    if (registros.length === 0) {
      return NextResponse.json({ available: false, summary: null });
    }

    const rows: ParsedFinanceiroRow[] = registros.map((r) => ({
      mes: r.mes,
      ano: r.ano,
      categoria: r.categoria,
      tipo: (r.tipo ?? "outro") as ParsedFinanceiroRow["tipo"],
      valor: Number(r.valor),
      descricao: r.descricao ?? "",
    }));

    const summary = buildFinanceiroSummary(rows);
    return NextResponse.json({ available: true, summary });
  } catch (err) {
    console.error("Financeiro GET error:", err);
    return NextResponse.json({ available: false, summary: null });
  }
}
