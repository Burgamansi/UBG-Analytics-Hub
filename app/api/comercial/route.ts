import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MES_LABELS: Record<number, string> = {
  1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
};

type MesDado = {
  faturamento: number;
  quantidade: number;
  ticket: number;
  variacao: number;
  vendedores: Array<{ name: string; value: number }>;
  empresas: Array<{ name: string; value: number }>;
};

type ComercialSummary = {
  dadosMes: Record<number, MesDado>;
  faturamentoMeses: Array<{ label: string; value: number }>;
  tiposProduto: Array<{ name: string; value: number }>;
  fornecedores: Array<{ label: string; value: number }>;
};

// ─── Demo fallback — dados reais da planilha Jan–Mai 2026 ────────────────────
const DEMO_SUMMARY: ComercialSummary = {
  dadosMes: {
    0: {
      faturamento: 9100000, quantidade: 192762, ticket: 47.21, variacao: 35.8,
      vendedores: [
        { name: "Thiers", value: 6770000 }, { name: "Laercio", value: 1200000 },
        { name: "Fabio", value: 960000 },   { name: "Outros",  value: 170000  },
      ],
      empresas: [
        { name: "Lima", value: 4200000 }, { name: "LPL",      value: 2800000 },
        { name: "Rafcorte", value: 1900000 }, { name: "OP", value: 200000 },
      ],
    },
    1: {
      faturamento: 1510000, quantidade: 42247, ticket: 35.74, variacao: 0,
      vendedores: [{ name: "Thiers", value: 1100000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 160000 }],
      empresas:   [{ name: "Lima", value: 700000 }, { name: "LPL", value: 500000 }, { name: "Rafcorte", value: 235000 }, { name: "OP", value: 75000 }],
    },
    2: {
      faturamento: 1750000, quantidade: 58813, ticket: 29.75, variacao: 15.9,
      vendedores: [{ name: "Thiers", value: 1350000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 150000 }],
      empresas:   [{ name: "Lima", value: 850000 }, { name: "LPL", value: 600000 }, { name: "Rafcorte", value: 270000 }, { name: "OP", value: 30000 }],
    },
    3: {
      faturamento: 1920000, quantidade: 32853, ticket: 58.45, variacao: 9.7,
      vendedores: [{ name: "Thiers", value: 1500000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 170000 }],
      empresas:   [{ name: "Lima", value: 900000 }, { name: "LPL", value: 700000 }, { name: "Rafcorte", value: 310000 }, { name: "OP", value: 10000 }],
    },
    4: {
      faturamento: 1870000, quantidade: 28477, ticket: 65.67, variacao: -2.6,
      vendedores: [{ name: "Thiers", value: 1400000 }, { name: "Laercio", value: 250000 }, { name: "Fabio", value: 220000 }],
      empresas:   [{ name: "Lima", value: 900000 }, { name: "LPL", value: 550000 }, { name: "Rafcorte", value: 415000 }, { name: "OP", value: 5000 }],
    },
    5: {
      faturamento: 2050000, quantidade: 30372, ticket: 67.50, variacao: 9.6,
      vendedores: [{ name: "Thiers", value: 1420000 }, { name: "Laercio", value: 200000 }, { name: "Fabio", value: 430000 }],
      empresas:   [{ name: "Lima", value: 850000 }, { name: "LPL", value: 450000 }, { name: "Rafcorte", value: 747500 }, { name: "OP", value: 2500 }],
    },
  },
  faturamentoMeses: [
    { label: "Jan", value: 1510000 }, { label: "Fev", value: 1750000 },
    { label: "Mar", value: 1920000 }, { label: "Abr", value: 1870000 },
    { label: "Mai", value: 2050000 },
  ],
  tiposProduto: [
    { name: "Normal", value: 5200000 }, { name: "Liner", value: 1800000 },
    { name: "Gardelon", value: 1400000 }, { name: "Travados", value: 700000 },
  ],
  fornecedores: [
    { label: "Fornecedor A", value: 1850000 }, { label: "Fornecedor B", value: 1420000 },
    { label: "Fornecedor C", value: 980000 },  { label: "Fornecedor D", value: 760000  },
    { label: "Fornecedor E", value: 620000 },  { label: "Fornecedor F", value: 480000  },
    { label: "Fornecedor G", value: 390000 },  { label: "Fornecedor H", value: 310000  },
  ],
};

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ available: false, summary: DEMO_SUMMARY });
  }

  try {
    const { db, registros_comercial } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    const [countRow] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(registros_comercial);

    if (Number(countRow.total) === 0) {
      return NextResponse.json({ available: false, summary: DEMO_SUMMARY });
    }

    // Todas as agregações em paralelo
    const [byMes, byMesVendedor, byMesEmpresa, byTipo, byFornecedor] = await Promise.all([
      db
        .select({
          mes: registros_comercial.mes,
          faturamento: sql<string>`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC))`,
          quantidade: sql<string>`SUM(CAST(${registros_comercial.quantidade} AS NUMERIC))`,
        })
        .from(registros_comercial)
        .groupBy(registros_comercial.mes)
        .orderBy(registros_comercial.mes),

      db
        .select({
          mes: registros_comercial.mes,
          vendedor: registros_comercial.vendedor,
          faturamento: sql<string>`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC))`,
        })
        .from(registros_comercial)
        .groupBy(registros_comercial.mes, registros_comercial.vendedor),

      db
        .select({
          mes: registros_comercial.mes,
          empresa: registros_comercial.empresa,
          faturamento: sql<string>`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC))`,
        })
        .from(registros_comercial)
        .groupBy(registros_comercial.mes, registros_comercial.empresa),

      db
        .select({
          tipo_produto: registros_comercial.tipo_produto,
          faturamento: sql<string>`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC))`,
        })
        .from(registros_comercial)
        .groupBy(registros_comercial.tipo_produto)
        .orderBy(sql`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC)) DESC`),

      db
        .select({
          fornecedor: registros_comercial.fornecedor,
          faturamento: sql<string>`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC))`,
        })
        .from(registros_comercial)
        .where(
          sql`${registros_comercial.fornecedor} IS NOT NULL
            AND ${registros_comercial.fornecedor} != ''
            AND ${registros_comercial.fornecedor} != 'Não informado'`
        )
        .groupBy(registros_comercial.fornecedor)
        .orderBy(sql`SUM(CAST(${registros_comercial.valor_total} AS NUMERIC)) DESC`)
        .limit(8),
    ]);

    // Mapas por mês
    const vendPorMes = new Map<number, Array<{ name: string; value: number }>>();
    const empPorMes  = new Map<number, Array<{ name: string; value: number }>>();

    for (const r of byMesVendedor) {
      const mes = Number(r.mes);
      if (!vendPorMes.has(mes)) vendPorMes.set(mes, []);
      vendPorMes.get(mes)!.push({ name: r.vendedor, value: Number(r.faturamento) });
    }
    for (const r of byMesEmpresa) {
      const mes = Number(r.mes);
      if (!empPorMes.has(mes)) empPorMes.set(mes, []);
      empPorMes.get(mes)!.push({ name: r.empresa, value: Number(r.faturamento) });
    }
    for (const v of vendPorMes.values()) v.sort((a, b) => b.value - a.value);
    for (const v of empPorMes.values())  v.sort((a, b) => b.value - a.value);

    // Totais acumulados
    const allVend = byMesVendedor.reduce<Array<{ name: string; value: number }>>((acc, r) => {
      const ex = acc.find(x => x.name === r.vendedor);
      if (ex) ex.value += Number(r.faturamento);
      else acc.push({ name: r.vendedor, value: Number(r.faturamento) });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    const allEmp = byMesEmpresa.reduce<Array<{ name: string; value: number }>>((acc, r) => {
      const ex = acc.find(x => x.name === r.empresa);
      if (ex) ex.value += Number(r.faturamento);
      else acc.push({ name: r.empresa, value: Number(r.faturamento) });
      return acc;
    }, []).sort((a, b) => b.value - a.value);

    const totalFat = byMes.reduce((a, r) => a + Number(r.faturamento), 0);
    const totalQtd = byMes.reduce((a, r) => a + Number(r.quantidade), 0);

    // Monta dadosMes (0 = acumulado, 1–12 = mensal)
    const dadosMes: Record<number, MesDado> = {
      0: {
        faturamento: totalFat,
        quantidade: totalQtd,
        ticket: totalQtd > 0 ? totalFat / totalQtd : 0,
        variacao: byMes.length >= 2
          ? ((Number(byMes.at(-1)!.faturamento) - Number(byMes[0].faturamento)) / Number(byMes[0].faturamento)) * 100
          : 0,
        vendedores: allVend,
        empresas: allEmp,
      },
    };

    for (let i = 0; i < byMes.length; i++) {
      const r   = byMes[i];
      const mes = Number(r.mes);
      const fat = Number(r.faturamento);
      const qtd = Number(r.quantidade);
      const prev = i > 0 ? Number(byMes[i - 1].faturamento) : fat;
      dadosMes[mes] = {
        faturamento: fat,
        quantidade: qtd,
        ticket: qtd > 0 ? fat / qtd : 0,
        variacao: prev > 0 ? ((fat - prev) / prev) * 100 : 0,
        vendedores: vendPorMes.get(mes) ?? [],
        empresas:   empPorMes.get(mes)  ?? [],
      };
    }

    const summary: ComercialSummary = {
      dadosMes,
      faturamentoMeses: byMes.map(r => ({
        label: MES_LABELS[Number(r.mes)] ?? `M${r.mes}`,
        value: Number(r.faturamento),
      })),
      tiposProduto: byTipo
        .filter(r => r.tipo_produto)
        .map(r => ({ name: r.tipo_produto!, value: Number(r.faturamento) })),
      fornecedores: byFornecedor
        .filter(r => r.fornecedor)
        .map(r => ({ label: r.fornecedor!, value: Number(r.faturamento) })),
    };

    return NextResponse.json({ available: true, summary });
  } catch (err) {
    console.error("[comercial] GET error:", err);
    return NextResponse.json({ available: false, summary: DEMO_SUMMARY });
  }
}
