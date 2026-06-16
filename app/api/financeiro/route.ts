import { NextResponse } from "next/server";
import {
  buildFinanceiroSummary,
  buildFinanceiroSummaryFromDreNovo,
  type ParsedFinanceiroRow,
  type EvolucaoMensal,
} from "@/lib/parsers/parse-financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ available: false, summary: null });
  }

  try {
    const {
      db,
      registros_financeiro,
      financeiro_dre_mensal,
      financeiro_plano_contas,
    } = await import("@/lib/db");

    // Tentar buscar dados da tabela DRE mensal consolidada (nova)
    let dreRows: EvolucaoMensal[] = [];
    let planoContas: { codigo: number; descricao: string; tipo: string; orcado: number; realizado: number; diferenca: number }[] = [];

    try {
      const dreData = await db.select().from(financeiro_dre_mensal).orderBy(
        financeiro_dre_mensal.ano,
        financeiro_dre_mensal.mes
      );

      if (dreData.length > 0) {
        dreRows = dreData.map((r) => ({
          mes: r.mes,
          ano: r.ano,
          receita: Number(r.faturamento ?? 0),
          receita_liquida: Number(r.receita_liquida ?? 0),
          custos: Number(r.cmv ?? 0),
          despesas: Number(r.adm ?? 0),
          resultado: Number(r.resultado_liquido ?? 0),
          ebitda: Number(r.ebitda ?? 0),
          tributos_vendas: Number(r.tributos_vendas ?? 0),
          despesas_vendas: Number(r.despesas_vendas ?? 0),
          resultado_financeiro: Number(r.resultado_financeiro ?? 0),
          aplicacoes: Number(r.aplicacoes ?? 0),
          emprestimos: Number(r.emprestimos ?? 0),
        }));

        // Buscar plano de contas
        const planoData = await db.select().from(financeiro_plano_contas);
        planoContas = planoData.map((p) => ({
          codigo: p.codigo,
          descricao: p.descricao,
          tipo: p.tipo ?? "",
          orcado: Number(p.orcado ?? 0),
          realizado: Number(p.realizado ?? 0),
          diferenca: Number(p.diferenca ?? 0),
        }));

        const summary = buildFinanceiroSummaryFromDreNovo(dreRows, 0, planoContas, []);
        return NextResponse.json({ available: true, summary });
      }
    } catch {
      // tabela nova ainda não existe no banco — fallback para tabela legada
    }

    // Fallback: tabela legada registros_financeiro
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
