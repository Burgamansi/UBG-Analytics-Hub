import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MES_LABELS: Record<number, string> = {
  1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
  7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez",
};

const MES_NOMES: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
  7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

export type RHSummary = {
  kpis: {
    turnoverMedio: number;
    totalDesligamentos: number;
    absenteismoMedio: number;
    horasAusencia: number;
    periodo: string;
  };
  turnoverMeses: Array<{
    mes: number;
    label: string;
    turnover: number;
    absenteismo: number;
    meta_t: number;
    meta_a: number;
    hj: number;
    hnj: number;
  }>;
  desligPorEmpresa: Array<{ label: string; value: number }>;
  motivosDeslig: Array<{ name: string; value: number }>;
  cids: Array<{ label: string; value: number }>;
  desligamentos: Array<{ nome: string; empresa: string; cargo: string; motivo: string; mes: string }>;
  empresas: string[];
  turnoversEmpresa: Array<{
    empresa: string;
    porMes: Record<number, number>;
    media: number;
    meta: number;
  }>;
  mesesDisponiveis: Array<{ mes: number; label: string }>;
};

const DEMO: RHSummary = {
  kpis: {
    turnoverMedio: 13.9,
    totalDesligamentos: 45,
    absenteismoMedio: 7.3,
    horasAusencia: 2657,
    periodo: "Jan–Mar 2026",
  },
  turnoverMeses: [
    { mes: 1, label: "Jan", turnover: 10.4, absenteismo: 7.3, meta_t: 6, meta_a: 5, hj: 768, hnj: 150 },
    { mes: 2, label: "Fev", turnover: 12.0, absenteismo: 6.1, meta_t: 6, meta_a: 5, hj: 724, hnj: 180 },
    { mes: 3, label: "Mar", turnover: 19.2, absenteismo: 8.4, meta_t: 6, meta_a: 5, hj: 655, hnj: 180 },
  ],
  desligPorEmpresa: [
    { label: "Rafcorte", value: 20 },
    { label: "LPL", value: 15 },
    { label: "Lima", value: 7 },
    { label: "OP", value: 3 },
  ],
  motivosDeslig: [
    { name: "Não informado", value: 25 },
    { name: "Melhor salário", value: 10 },
    { name: "Produtividade", value: 5 },
    { name: "Comportamento", value: 3 },
    { name: "Outros", value: 2 },
  ],
  cids: [
    { label: "Falta (n. justif.)", value: 34 },
    { label: "Dores Musculares", value: 26 },
    { label: "Consulta Médica", value: 13 },
    { label: "Gripe/Resfriado", value: 8 },
    { label: "Outros", value: 6 },
  ],
  desligamentos: [
    { nome: "Colaborador 01", empresa: "Rafcorte", cargo: "Operador de Produção", motivo: "Melhor salário", mes: "Janeiro" },
    { nome: "Colaborador 02", empresa: "LPL", cargo: "Auxiliar Logístico", motivo: "Não informado", mes: "Janeiro" },
    { nome: "Colaborador 03", empresa: "Rafcorte", cargo: "Costureira", motivo: "Produtividade", mes: "Fevereiro" },
    { nome: "Colaborador 04", empresa: "Lima", cargo: "Auxiliar Administrativo", motivo: "Não informado", mes: "Fevereiro" },
    { nome: "Colaborador 05", empresa: "Rafcorte", cargo: "Operador de Máquina", motivo: "Comportamento", mes: "Março" },
    { nome: "Colaborador 06", empresa: "LPL", cargo: "Motorista", motivo: "Melhor salário", mes: "Março" },
    { nome: "Colaborador 07", empresa: "Rafcorte", cargo: "Costureira", motivo: "Não informado", mes: "Março" },
    { nome: "Colaborador 08", empresa: "OP", cargo: "Auxiliar Geral", motivo: "Não informado", mes: "Março" },
  ],
  empresas: ["Rafcorte", "LPL", "Lima", "OP"],
  turnoversEmpresa: [
    { empresa: "Rafcorte", porMes: { 1: 14.2, 2: 18.5, 3: 28.6 }, media: 20.4, meta: 6 },
    { empresa: "LPL",      porMes: { 1: 12.1, 2: 14.8, 3: 22.4 }, media: 16.4, meta: 6 },
    { empresa: "Lima",     porMes: { 1: 7.8,  2: 8.2,  3: 11.4 }, media: 9.1,  meta: 6 },
    { empresa: "OP",       porMes: { 1: 5.2,  2: 6.1,  3: 9.8  }, media: 7.0,  meta: 6 },
  ],
  mesesDisponiveis: [
    { mes: 1, label: "Janeiro" },
    { mes: 2, label: "Fevereiro" },
    { mes: 3, label: "Março" },
  ],
};

const avg = (arr: number[]) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ available: false, summary: DEMO });
  }

  try {
    const { db, registros_rh, desligamentos } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    const [countRow] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(registros_rh);

    if (Number(countRow.total) === 0) {
      return NextResponse.json({ available: false, summary: DEMO });
    }

    const [rhRows, desligRows] = await Promise.all([
      db.select().from(registros_rh).orderBy(registros_rh.mes),
      db.select().from(desligamentos).orderBy(desligamentos.mes),
    ]);

    // Aggregate per month across all companies
    const mesMapa = new Map<number, { turnover: number[]; absenteismo: number[]; hj: number; hnj: number }>();
    for (const r of rhRows) {
      const mes = Number(r.mes);
      if (!mesMapa.has(mes)) mesMapa.set(mes, { turnover: [], absenteismo: [], hj: 0, hnj: 0 });
      const m = mesMapa.get(mes)!;
      m.turnover.push(Number(r.turnover_pct ?? 0));
      m.absenteismo.push(Number(r.absenteismo_pct ?? 0));
      m.hj += Number(r.horas_justificadas ?? 0);
      m.hnj += Number(r.horas_nao_justificadas ?? 0);
    }

    const mesesOrdenados = [...mesMapa.keys()].sort((a, b) => a - b);

    const turnoverMeses = mesesOrdenados.map((mes) => {
      const m = mesMapa.get(mes)!;
      return {
        mes,
        label: MES_LABELS[mes] ?? `M${mes}`,
        turnover: parseFloat(avg(m.turnover).toFixed(1)),
        absenteismo: parseFloat(avg(m.absenteismo).toFixed(1)),
        meta_t: 6,
        meta_a: 5,
        hj: Math.round(m.hj),
        hnj: Math.round(m.hnj),
      };
    });

    const totalHoras = [...mesMapa.values()].reduce((a, m) => a + m.hj + m.hnj, 0);
    const turnoverMedio = parseFloat(avg(turnoverMeses.map((m) => m.turnover)).toFixed(1));
    const absenteismoMedio = parseFloat(avg(turnoverMeses.map((m) => m.absenteismo)).toFixed(1));

    const primeiroMes = mesesOrdenados[0];
    const ultimoMes = mesesOrdenados[mesesOrdenados.length - 1];
    const periodoLabel =
      primeiroMes === ultimoMes
        ? `${MES_LABELS[primeiroMes]} 2026`
        : `${MES_LABELS[primeiroMes]}–${MES_LABELS[ultimoMes]} 2026`;

    // Desligamentos por empresa
    const desligEmpresaMap = new Map<string, number>();
    for (const d of desligRows) {
      const emp = d.empresa ?? "Não informada";
      desligEmpresaMap.set(emp, (desligEmpresaMap.get(emp) ?? 0) + 1);
    }
    const desligPorEmpresa = [...desligEmpresaMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    // Motivos de desligamento
    const motivoMap = new Map<string, number>();
    for (const d of desligRows) {
      const mot = d.motivo ?? "Não informado";
      motivoMap.set(mot, (motivoMap.get(mot) ?? 0) + 1);
    }
    const motivosDeslig = [...motivoMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Lista de desligamentos
    const desligamentos_list = desligRows.map((d) => ({
      nome: d.nome,
      empresa: d.empresa ?? "",
      cargo: d.cargo ?? "",
      motivo: d.motivo ?? "Não informado",
      mes: MES_NOMES[Number(d.mes)] ?? `Mês ${d.mes}`,
    }));

    // Turnover por empresa por mês
    const empMesMap = new Map<string, Map<number, number[]>>();
    for (const r of rhRows) {
      const emp = r.empresa;
      const mes = Number(r.mes);
      if (!empMesMap.has(emp)) empMesMap.set(emp, new Map());
      const m = empMesMap.get(emp)!;
      if (!m.has(mes)) m.set(mes, []);
      m.get(mes)!.push(Number(r.turnover_pct ?? 0));
    }

    const empresas = [...empMesMap.keys()].sort();
    const turnoversEmpresa = empresas.map((empresa) => {
      const mesMap = empMesMap.get(empresa)!;
      const porMes: Record<number, number> = {};
      let total = 0;
      let count = 0;
      for (const [mes, vals] of mesMap.entries()) {
        const a = avg(vals);
        porMes[mes] = parseFloat(a.toFixed(1));
        total += a;
        count++;
      }
      return {
        empresa,
        porMes,
        media: parseFloat((count ? total / count : 0).toFixed(1)),
        meta: 6,
      };
    });

    const mesesDisponiveis = mesesOrdenados.map((mes) => ({
      mes,
      label: MES_NOMES[mes] ?? `Mês ${mes}`,
    }));

    const summary: RHSummary = {
      kpis: {
        turnoverMedio,
        totalDesligamentos: desligRows.length,
        absenteismoMedio,
        horasAusencia: Math.round(totalHoras),
        periodo: periodoLabel,
      },
      turnoverMeses,
      desligPorEmpresa,
      motivosDeslig,
      cids: DEMO.cids,
      desligamentos: desligamentos_list,
      empresas,
      turnoversEmpresa,
      mesesDisponiveis,
    };

    return NextResponse.json({ available: true, summary });
  } catch (err) {
    console.error("[rh] GET error:", err);
    return NextResponse.json({ available: false, summary: DEMO });
  }
}
