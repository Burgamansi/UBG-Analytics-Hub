import { NextRequest, NextResponse } from "next/server";

// Dados embutidos da planilha MESES (fallback quando não há banco)
const DADOS_COMERCIAL = {
  por_mes: [
    { mes: 1, mes_nome: "Janeiro",  faturamento: 1510000, quantidade: 42247 },
    { mes: 2, mes_nome: "Fevereiro", faturamento: 1750000, quantidade: 58813 },
    { mes: 3, mes_nome: "Março",    faturamento: 1920000, quantidade: 32853 },
    { mes: 4, mes_nome: "Abril",    faturamento: 1870000, quantidade: 28477 },
    { mes: 5, mes_nome: "Maio",     faturamento: 2050000, quantidade: 30372 },
  ],
  por_vendedor: [
    { vendedor: "Thiers",  faturamento: 6770000, quantidade: 142000, participacao: 74.4, ticket_medio: 47.7 },
    { vendedor: "Laercio", faturamento: 1200000, quantidade: 28000,  participacao: 13.2, ticket_medio: 42.9 },
    { vendedor: "Fabio",   faturamento: 960000,  quantidade: 15000,  participacao: 10.5, ticket_medio: 64.0 },
    { vendedor: "Outros",  faturamento: 170000,  quantidade: 7762,   participacao: 1.9,  ticket_medio: 21.9 },
  ],
  por_empresa: [
    { empresa: "Lima",     faturamento: 4200000, quantidade: 89000, participacao: 46.2 },
    { empresa: "LPL",      faturamento: 2800000, quantidade: 65000, participacao: 30.8 },
    { empresa: "Rafcorte", faturamento: 1900000, quantidade: 35000, participacao: 20.9 },
    { empresa: "OP",       faturamento: 200000,  quantidade: 3762,  participacao: 2.2  },
  ],
  por_tipo: [
    { tipo: "Normal",   faturamento: 5200000, quantidade: 158000, ticket_medio: 32.9 },
    { tipo: "Liner",    faturamento: 1800000, quantidade: 18500,  ticket_medio: 97.3 },
    { tipo: "Gardelon", faturamento: 1400000, quantidade: 12000,  ticket_medio: 116.7 },
    { tipo: "Travados", faturamento: 700000,  quantidade: 4262,   ticket_medio: 164.2 },
  ],
  top_fornecedores: [
    { fornecedor: "Fornecedor A", faturamento: 1850000, quantidade: 42000 },
    { fornecedor: "Fornecedor B", faturamento: 1420000, quantidade: 35000 },
    { fornecedor: "Fornecedor C", faturamento: 980000,  quantidade: 22000 },
    { fornecedor: "Fornecedor D", faturamento: 760000,  quantidade: 18000 },
    { fornecedor: "Fornecedor E", faturamento: 620000,  quantidade: 15000 },
  ],
};

const DADOS_RH = {
  por_mes: [
    { mes: 1, mes_nome: "Janeiro",  empresa: "Geral", colaboradores: 50, admissoes: 3, desligamentos: 8,  turnover: 10.4, absenteismo: 7.3 },
    { mes: 2, mes_nome: "Fevereiro",empresa: "Geral", colaboradores: 52, admissoes: 5, desligamentos: 10, turnover: 12.0, absenteismo: 6.1 },
    { mes: 3, mes_nome: "Março",    empresa: "Geral", colaboradores: 50, admissoes: 4, desligamentos: 27, turnover: 19.2, absenteismo: 8.4 },
  ],
  por_empresa: [
    { empresa: "Rafcorte", desligamentos: 20, admissoes: 8,  turnover: 22.1 },
    { empresa: "LPL",      desligamentos: 15, admissoes: 6,  turnover: 18.4 },
    { empresa: "Lima",     desligamentos: 7,  admissoes: 5,  turnover: 9.2  },
    { empresa: "OP",       desligamentos: 3,  admissoes: 3,  turnover: 7.5  },
  ],
  motivos: [
    { motivo: "Não informado",              quantidade: 25, percentual: 55.6 },
    { motivo: "Melhor salário/benefícios",  quantidade: 10, percentual: 22.2 },
    { motivo: "Produtividade/desempenho",   quantidade: 5,  percentual: 11.1 },
    { motivo: "Comportamento/disciplina",   quantidade: 3,  percentual: 6.7  },
    { motivo: "Outros",                     quantidade: 2,  percentual: 4.4  },
  ],
  cids: [
    { cid: "Falta (não justificada)", dias: 34, ocorrencias: 18 },
    { cid: "Dores Musculares",        dias: 26, ocorrencias: 12 },
    { cid: "Consulta Médica",         dias: 13, ocorrencias: 8  },
    { cid: "Gripe / Resfriado",       dias: 8,  ocorrencias: 5  },
    { cid: "Outros",                  dias: 6,  ocorrencias: 4  },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modulo = searchParams.get("modulo") || "all";

  // Se tiver banco, buscar dados reais
  if (process.env.DATABASE_URL) {
    try {
      const { db, registros_comercial, registros_rh } = await import("@/lib/db");
      const { sql } = await import("drizzle-orm");

      const countComercial = await db
        .select({ count: sql<number>`count(*)` })
        .from(registros_comercial);

      if (Number(countComercial[0]?.count) > 0) {
        // Retornar dados do banco (implementação futura)
        // Por ora, retorna dados embutidos + flag de banco ativo
      }
    } catch {
      // Banco não disponível, usar dados embutidos
    }
  }

  const response: Record<string, unknown> = {
    fonte: "dados_embutidos",
    ultimo_upload: null,
    ano: 2026,
  };

  if (modulo === "all" || modulo === "comercial") {
    response.comercial = {
      kpis: {
        faturamento_total: 9100000,
        quantidade_total: 192762,
        ticket_medio: 47.21,
        num_vendedores: 8,
        num_empresas: 4,
        num_fornecedores: 10,
        variacao_jan_mai: 35.8,
      },
      ...DADOS_COMERCIAL,
    };
  }

  if (modulo === "all" || modulo === "rh") {
    response.rh = {
      kpis: {
        turnover_medio: 13.9,
        meta_turnover: 6.0,
        absenteismo_medio: 7.3,
        meta_absenteismo: 5.0,
        total_desligamentos: 45,
        total_admissoes: 12,
        total_horas_ausencia: 2657,
        custo_oculto_estimado: 180000,
      },
      ...DADOS_RH,
    };
  }

  return NextResponse.json(response);
}
