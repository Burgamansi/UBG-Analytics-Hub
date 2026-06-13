import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const moduloEnum = pgEnum("modulo", [
  "comercial",
  "rh",
  "turnover",
  "atestados",
  "financeiro",
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "processando",
  "sucesso",
  "erro",
]);

export const atestadoTipoEnum = pgEnum("atestado_tipo", ["integral", "parcial"]);

export const tipoLancamentoEnum = pgEnum("tipo_lancamento", ["entrada", "saida", "outro"]);

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  nome_arquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  modulo: moduloEnum("modulo").notNull(),
  mes_referencia: integer("mes_referencia"),
  ano_referencia: integer("ano_referencia"),
  status: uploadStatusEnum("status").default("processando").notNull(),
  registros_importados: integer("registros_importados"),
  erro_mensagem: text("erro_mensagem"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ─── Comercial ────────────────────────────────────────────────────────────────

export const registros_comercial = pgTable("registros_comercial", {
  id: serial("id").primaryKey(),
  upload_id: integer("upload_id").references(() => uploads.id),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  empresa: varchar("empresa", { length: 100 }).notNull(),
  vendedor: varchar("vendedor", { length: 100 }).notNull(),
  fornecedor: varchar("fornecedor", { length: 200 }),
  tipo_produto: varchar("tipo_produto", { length: 100 }),
  quantidade: numeric("quantidade", { precision: 12, scale: 2 }).notNull(),
  valor_unitario: numeric("valor_unitario", { precision: 12, scale: 4 }),
  valor_total: numeric("valor_total", { precision: 15, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ─── RH ───────────────────────────────────────────────────────────────────────

export const registros_rh = pgTable("registros_rh", {
  id: serial("id").primaryKey(),
  upload_id: integer("upload_id").references(() => uploads.id),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  empresa: varchar("empresa", { length: 100 }).notNull(),
  colaboradores_inicio: integer("colaboradores_inicio"),
  colaboradores_fim: integer("colaboradores_fim"),
  admissoes: integer("admissoes").default(0),
  desligamentos: integer("desligamentos").default(0),
  turnover_pct: numeric("turnover_pct", { precision: 6, scale: 2 }),
  absenteismo_pct: numeric("absenteismo_pct", { precision: 6, scale: 2 }),
  horas_justificadas: numeric("horas_justificadas", { precision: 10, scale: 2 }),
  horas_nao_justificadas: numeric("horas_nao_justificadas", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const desligamentos = pgTable("desligamentos", {
  id: serial("id").primaryKey(),
  upload_id: integer("upload_id").references(() => uploads.id),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  empresa: varchar("empresa", { length: 100 }).notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  cargo: varchar("cargo", { length: 200 }),
  motivo: varchar("motivo", { length: 300 }),
  data_admissao: varchar("data_admissao", { length: 20 }),
  data_desligamento: varchar("data_desligamento", { length: 20 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const atestados = pgTable("atestados", {
  id: serial("id").primaryKey(),
  upload_id: integer("upload_id").references(() => uploads.id),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  empresa: varchar("empresa", { length: 100 }).notNull(),
  colaborador: varchar("colaborador", { length: 200 }),
  cid: varchar("cid", { length: 300 }),
  dias: integer("dias").default(0),
  tipo: atestadoTipoEnum("tipo").default("integral"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ─── Financeiro / DRE ─────────────────────────────────────────────────────────

export const registros_financeiro = pgTable("registros_financeiro", {
  id: serial("id").primaryKey(),
  upload_id: integer("upload_id").references(() => uploads.id),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  tipo: tipoLancamentoEnum("tipo").default("outro"),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  descricao: varchar("descricao", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
