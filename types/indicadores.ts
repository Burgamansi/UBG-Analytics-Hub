// ─── Comercial ────────────────────────────────────────────────────────────────

export interface RegistroComercial {
  id?: number;
  mes: number;
  ano: number;
  empresa: string;
  vendedor: string;
  fornecedor: string;
  tipo_produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  upload_id?: number;
  created_at?: string;
}

export interface KPIComercial {
  faturamento_total: number;
  quantidade_total: number;
  ticket_medio: number;
  num_vendedores: number;
  num_empresas: number;
  num_fornecedores: number;
  variacao_mes_anterior?: number;
}

export interface FaturamentoPorMes {
  mes: number;
  mes_nome: string;
  faturamento: number;
  quantidade: number;
  variacao?: number;
}

export interface FaturamentoPorVendedor {
  vendedor: string;
  faturamento: number;
  quantidade: number;
  participacao: number;
  ticket_medio: number;
}

export interface FaturamentoPorEmpresa {
  empresa: string;
  faturamento: number;
  quantidade: number;
  participacao: number;
}

export interface FaturamentoPorTipo {
  tipo: string;
  faturamento: number;
  quantidade: number;
  ticket_medio: number;
}

// ─── RH ───────────────────────────────────────────────────────────────────────

export interface RegistroRH {
  id?: number;
  mes: number;
  ano: number;
  empresa: string;
  colaboradores_inicio: number;
  colaboradores_fim: number;
  admissoes: number;
  desligamentos: number;
  turnover_pct: number;
  absenteismo_pct: number;
  horas_justificadas: number;
  horas_nao_justificadas: number;
  upload_id?: number;
}

export interface RegistroDesligamento {
  id?: number;
  mes: number;
  ano: number;
  empresa: string;
  nome: string;
  cargo: string;
  motivo: string;
  data_admissao?: string;
  data_desligamento?: string;
  upload_id?: number;
}

export interface RegistroAtestado {
  id?: number;
  mes: number;
  ano: number;
  empresa: string;
  colaborador: string;
  cid: string;
  dias: number;
  tipo: "integral" | "parcial";
  upload_id?: number;
}

export interface KPIRh {
  turnover_medio: number;
  meta_turnover: number;
  absenteismo_medio: number;
  meta_absenteismo: number;
  total_desligamentos: number;
  total_admissoes: number;
  total_horas_ausencia: number;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export type TipoModulo = "comercial" | "rh" | "turnover" | "atestados" | "financeiro";

export interface UploadRecord {
  id: number;
  nome_arquivo: string;
  modulo: TipoModulo;
  mes_referencia?: number;
  ano_referencia?: number;
  status: "processando" | "sucesso" | "erro";
  registros_importados?: number;
  erro_mensagem?: string;
  created_at: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  comercial: {
    kpis: KPIComercial;
    por_mes: FaturamentoPorMes[];
    por_vendedor: FaturamentoPorVendedor[];
    por_empresa: FaturamentoPorEmpresa[];
    por_tipo: FaturamentoPorTipo[];
  };
  rh: {
    kpis: KPIRh;
    por_mes: RegistroRH[];
    desligamentos: RegistroDesligamento[];
    atestados: RegistroAtestado[];
  };
  ultimo_upload?: string;
}
