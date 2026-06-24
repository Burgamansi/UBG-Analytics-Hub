const MOCK_KPIS = {
  totalFornecedores: 147,
  totalHomologados: 124,
  totalPendentes: 18,
  totalBloqueados: 5,
  valorComprado: 3150250,
  economiaObtida: 245180,
  leadTimeMedio: 8.2,
  avaliacoesPendentes: 12,
  fornecedoresCriticos: 7,
};

const MOCK_COMPRAS_MESES = [
  { label: "Jan", valor: 480000, economia: 35000 },
  { label: "Fev", valor: 520000, economia: 42000 },
  { label: "Mar", valor: 610000, economia: 48000 },
  { label: "Abr", valor: 590000, economia: 38000 },
  { label: "Mai", valor: 450000, economia: 30000 },
  { label: "Jun", valor: 500250, economia: 52180 },
];

const MOCK_FORNECEDORES_STATUS = [
  { name: "Homologados", value: 124 },
  { name: "Pendentes", value: 18 },
  { name: "Bloqueados", value: 5 },
];

const MOCK_FORNECEDORES_RECENTES = [
  { nome: "Big Bags Brasil Ltda", cnpj: "12.345.678/0001-90", status: "homologado" },
  { nome: "Sacarias União Industrial", cnpj: "98.765.432/0001-10", status: "homologado" },
  { nome: "Plásticos Sul-Sudeste S/A", cnpj: "45.678.901/0002-20", status: "pendente" },
  { nome: "Tecidos e Fios Nordeste", cnpj: "23.456.789/0001-30", status: "bloqueado" },
  { nome: "Insumos Químicos Paraná", cnpj: "34.567.890/0001-40", status: "homologado" },
];

const MOCK_PEDIDOS_RECENTES = [
  { numero: "PED-98741", fornecedor: "Big Bags Brasil Ltda", data: "2026-06-20", valor: 85000, leadTime: 6 },
  { numero: "PED-98735", fornecedor: "Sacarias União Industrial", data: "2026-06-18", valor: 124000, leadTime: 9 },
  { numero: "PED-98730", fornecedor: "Insumos Químicos Paraná", data: "2026-06-15", valor: 45000, leadTime: 5 },
  { numero: "PED-98722", fornecedor: "Plásticos Sul-Sudeste S/A", data: "2026-06-12", valor: 62000, leadTime: 12 },
  { numero: "PED-98715", fornecedor: "Tecidos e Fios Nordeste", data: "2026-06-08", valor: 195000, leadTime: 8 },
];

export interface ComprasProviderModel {
  source: "real" | "mock";
  sourceLabel: string;
  technicalAlert?: string;
  kpis: typeof MOCK_KPIS;
  comprasMeses: typeof MOCK_COMPRAS_MESES;
  fornecedoresStatus: typeof MOCK_FORNECEDORES_STATUS;
  fornecedoresRecentes: typeof MOCK_FORNECEDORES_RECENTES;
  pedidosRecentes: typeof MOCK_PEDIDOS_RECENTES;
}

export function buildMockComprasDashboardData(technicalAlert?: string): ComprasProviderModel {
  return {
    source: "mock",
    sourceLabel: "Dados demonstrativos",
    technicalAlert,
    kpis: MOCK_KPIS,
    comprasMeses: MOCK_COMPRAS_MESES,
    fornecedoresStatus: MOCK_FORNECEDORES_STATUS,
    fornecedoresRecentes: MOCK_FORNECEDORES_RECENTES,
    pedidosRecentes: MOCK_PEDIDOS_RECENTES,
  };
}

export async function getComprasDashboardData(): Promise<ComprasProviderModel> {
  if (!process.env.DATABASE_URL) {
    return buildMockComprasDashboardData("DATABASE_URL nao configurada; usando fallback demonstrativo.");
  }

  try {
    const { db, uploads, fornecedores, homologacoes, avaliacoes_fornecedor, compras, cotacoes } = await import("@/lib/db");
    const { desc, eq } = await import("drizzle-orm");

    // Tentar buscar o ultimo upload de compras
    const uploadRows = await db
      .select({ id: uploads.id })
      .from(uploads)
      .where(eq(uploads.modulo, "compras" as any))
      .orderBy(desc(uploads.created_at))
      .limit(1);

    const latestUploadId = uploadRows[0]?.id;
    if (!latestUploadId) {
      return buildMockComprasDashboardData("Nenhum upload de compras encontrado; usando fallback demonstrativo.");
    }

    // Buscando dados do banco para o ultimo upload
    const queryDb = async <T>(queryPromise: Promise<T[]>): Promise<T[]> => {
      try {
        return await queryPromise;
      } catch (err) {
        const msg = String(err).toLowerCase();
        if (msg.includes("relation") && msg.includes("does not exist")) {
          throw new Error("TABLE_NOT_FOUND");
        }
        throw err;
      }
    };

    const fornRows = await queryDb(db.select().from(fornecedores).where(eq(fornecedores.upload_id, latestUploadId)));
    const compRows = await queryDb(db.select().from(compras).where(eq(compras.upload_id, latestUploadId)));
    const evalRows = await queryDb(db.select().from(avaliacoes_fornecedor).where(eq(avaliacoes_fornecedor.upload_id, latestUploadId)));

    if (fornRows.length === 0 && compRows.length === 0) {
      return buildMockComprasDashboardData("Upload encontrado, mas tabelas de compras estao vazias; usando fallback demonstrativo.");
    }

    // Calcular KPIs
    const totalFornecedores = fornRows.length;
    const totalHomologados = fornRows.filter((f) => f.status === "homologado").length;
    const totalPendentes = fornRows.filter((f) => f.status === "pendente").length;
    const totalBloqueados = fornRows.filter((f) => f.status === "bloqueado").length;

    const valorComprado = compRows.reduce((sum, c) => sum + Number(c.valor_total), 0);
    const economiaObtida = compRows.reduce((sum, c) => sum + Number(c.economia_obtida || 0), 0);
    const leadTimeSum = compRows.reduce((sum, c) => sum + (c.lead_time_dias || 0), 0);
    const leadTimeMedio = compRows.length ? leadTimeSum / compRows.length : 0;

    const avaliacoesPendentes = evalRows.filter((e) => e.status === "pendente").length;
    const fornecedoresCriticos = evalRows.filter((e) => Number(e.nota_desempenho) < 70).length;

    // Agrupamento mensal para grafico
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyMap = new Map<number, { valor: number; economia: number }>();
    compRows.forEach((c) => {
      const mes = c.mes;
      const current = monthlyMap.get(mes) || { valor: 0, economia: 0 };
      current.valor += Number(c.valor_total);
      current.economia += Number(c.economia_obtida || 0);
      monthlyMap.set(mes, current);
    });

    const comprasMeses = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([mes, data]) => ({
        label: months[mes - 1] || `${mes}`,
        valor: data.valor,
        economia: data.economia,
      }));

    const finalComprasMeses = comprasMeses.length > 0 ? comprasMeses : [
      { label: "Jun", valor: valorComprado, economia: economiaObtida }
    ];

    const fornecedoresStatus = [
      { name: "Homologados", value: totalHomologados },
      { name: "Pendentes", value: totalPendentes },
      { name: "Bloqueados", value: totalBloqueados },
    ];

    const fornecedoresRecentes = fornRows.slice(0, 5).map((f) => ({
      nome: f.nome,
      cnpj: f.cnpj || "N/A",
      status: f.status,
    }));

    const pedidosRecentes = compRows.slice(0, 5).map((c) => ({
      numero: c.numero_pedido,
      fornecedor: c.fornecedor_nome || "N/A",
      data: c.data_compra || "N/A",
      valor: Number(c.valor_total),
      leadTime: c.lead_time_dias || 0,
    }));

    return {
      source: "real",
      sourceLabel: "Dados reais",
      kpis: {
        totalFornecedores,
        totalHomologados,
        totalPendentes,
        totalBloqueados,
        valorComprado,
        economiaObtida,
        leadTimeMedio,
        avaliacoesPendentes,
        fornecedoresCriticos,
      },
      comprasMeses: finalComprasMeses,
      fornecedoresStatus,
      fornecedoresRecentes,
      pedidosRecentes,
    };
  } catch (err) {
    const errorMsg = String(err);
    console.warn("Compras provider fall back due to error:", errorMsg);
    return buildMockComprasDashboardData(
      errorMsg.includes("TABLE_NOT_FOUND")
        ? "Tabelas do banco ausentes (migracao pendente); usando fallback demonstrativo."
        : "Erro ao ler dados de Compras do banco; usando fallback demonstrativo."
    );
  }
}
