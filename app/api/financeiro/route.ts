import { NextResponse } from "next/server";
import {
  buildFinanceiroSummary,
  buildFinanceiroSummaryFromDreNovo,
  type ParsedFinanceiroRow,
  type EvolucaoMensal,
} from "@/lib/parsers/parse-financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DREMensalDbRow = {
  mes: number;
  ano: number;
  faturamento: string | number | null;
  receita_liquida: string | number | null;
  cmv: string | number | null;
  adm: string | number | null;
  resultado_liquido: string | number | null;
  ebitda: string | number | null;
  tributos_vendas: string | number | null;
  despesas_vendas: string | number | null;
  resultado_financeiro: string | number | null;
  aplicacoes: string | number | null;
  emprestimos: string | number | null;
};

type PlanoContaDbRow = {
  codigo: number;
  descricao: string;
  tipo: string | null;
  orcado: string | number | null;
  realizado: string | number | null;
  diferenca: string | number | null;
};

type RegistroFinanceiroDbRow = {
  mes: number;
  ano: number;
  categoria: string;
  tipo: string | null;
  valor: string | number;
  descricao: string | null;
};

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0);
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ available: false, summary: null });
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);

    const latestUploads = await sql`
      select id, nome_arquivo
      from uploads
      where modulo = 'financeiro'
      order by id desc
      limit 1
    `;
    const latestUpload = latestUploads[0] as { id: number; nome_arquivo: string } | undefined;

    if (latestUpload) {
      const dreData = await sql`
        select
          mes,
          ano,
          faturamento,
          receita_liquida,
          cmv,
          adm,
          resultado_liquido,
          ebitda,
          tributos_vendas,
          despesas_vendas,
          resultado_financeiro,
          aplicacoes,
          emprestimos
        from financeiro_dre_mensal
        where upload_id = ${latestUpload.id}
        order by ano, mes
      ` as DREMensalDbRow[];

      if (dreData.length > 0) {
        const dreRows: EvolucaoMensal[] = dreData.map((r) => ({
          mes: r.mes,
          ano: r.ano,
          receita: toNumber(r.faturamento),
          receita_liquida: toNumber(r.receita_liquida),
          custos: toNumber(r.cmv),
          despesas: toNumber(r.adm),
          resultado: toNumber(r.resultado_liquido),
          ebitda: toNumber(r.ebitda),
          tributos_vendas: toNumber(r.tributos_vendas),
          despesas_vendas: toNumber(r.despesas_vendas),
          resultado_financeiro: toNumber(r.resultado_financeiro),
          aplicacoes: toNumber(r.aplicacoes),
          emprestimos: toNumber(r.emprestimos),
        }));

        const planoData = await sql`
          select codigo, descricao, tipo, orcado, realizado, diferenca
          from financeiro_plano_contas
          where upload_id = ${latestUpload.id}
          order by codigo
        ` as PlanoContaDbRow[];

        const planoContas = planoData.map((p) => ({
          codigo: p.codigo,
          descricao: p.descricao,
          tipo: p.tipo ?? "",
          orcado: toNumber(p.orcado),
          realizado: toNumber(p.realizado),
          diferenca: toNumber(p.diferenca),
        }));

        const summary = buildFinanceiroSummaryFromDreNovo(dreRows, 0, planoContas, []);
        return NextResponse.json({ available: true, summary, uploadId: latestUpload.id });
      }

      const registros = await sql`
        select mes, ano, categoria, tipo, valor, descricao
        from registros_financeiro
        where upload_id = ${latestUpload.id}
        order by ano, mes, id
      ` as RegistroFinanceiroDbRow[];

      if (registros.length > 0) {
        const rows: ParsedFinanceiroRow[] = registros.map((r) => ({
          mes: r.mes,
          ano: r.ano,
          categoria: r.categoria,
          tipo: (r.tipo ?? "outro") as ParsedFinanceiroRow["tipo"],
          valor: toNumber(r.valor),
          descricao: r.descricao ?? "",
        }));

        const summary = buildFinanceiroSummary(rows);
        return NextResponse.json({ available: true, summary, uploadId: latestUpload.id });
      }
    }

    return NextResponse.json({ available: false, summary: null });
  } catch (err) {
    console.error("Financeiro GET error:", err);
    return NextResponse.json({ available: false, summary: null });
  }
}
