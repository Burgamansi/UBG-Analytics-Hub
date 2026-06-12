# UBG Analytics Hub

**Sistema SaaS de Indicadores Gerenciais — União Bag Big Bags e Sacarias**

Dashboard interativo para visualização de indicadores comerciais e de RH, alimentado por upload de planilhas mestras.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS + shadcn/ui |
| Gráficos | Recharts |
| Banco de Dados | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM |
| Upload | react-dropzone + SheetJS (xlsx) |
| Deploy | Vercel |
| Versionamento | GitHub |

---

## Módulos

- **Visão Geral** — KPIs combinados Comercial + RH com alertas críticos
- **Comercial** — Faturamento, vendedores, empresas, produtos (aba MESES)
- **RH** — Turnover, absenteísmo, atestados, desligamentos
- **Upload de Dados** — Importação de planilhas XLS/XLSX/CSV

---

## Configuração Local

### 1. Clone o repositório

```bash
git clone https://github.com/Burgamansi/UBG-Analytics-Hub.git
cd UBG-Analytics-Hub
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
DATABASE_URL=postgresql://...  # Neon.tech (gratuito)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_aqui
```

### 4. Configure o banco de dados (opcional)

```bash
npm run db:push
```

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy na Vercel

### Opção 1 — Via Interface Web (recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe o repositório `Burgamansi/UBG-Analytics-Hub`
4. Configure as variáveis de ambiente:
   - `DATABASE_URL` — URL do Neon PostgreSQL
   - `NEXTAUTH_SECRET` — Chave secreta (gere com `openssl rand -base64 32`)
   - `NEXTAUTH_URL` — URL do seu domínio Vercel
5. Clique em **Deploy**

### Opção 2 — Via CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Upload de Planilhas

O sistema aceita os seguintes arquivos:

| Módulo | Planilha | Aba |
|--------|---------|-----|
| Comercial | `IndicadoresComercial2026.xls` | MESES |
| RH | `IndicadoresRH2026.xlsm` | Consolidado |
| Turnover | `TURNOVER2026.xlsx` | Desligamentos |
| Atestados | `CONTROLEDEATESTADOS-2026.xlsx` | Registros |
| Financeiro | `Custo-DRE2026.xlsx` | DRE |

---

## Banco de Dados (Neon.tech — Gratuito)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto: **"ubg-analytics"**
3. Copie a **Connection String** e cole em `DATABASE_URL`
4. Execute `npm run db:push` para criar as tabelas

---

## Estrutura do Projeto

```
ubg-analytics-hub/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + Topbar
│   │   ├── dashboard/page.tsx  # Visão Geral
│   │   ├── comercial/page.tsx  # Dashboard Comercial
│   │   ├── rh/page.tsx         # Dashboard RH
│   │   └── upload/page.tsx     # Upload de Planilhas
│   ├── api/
│   │   ├── upload/route.ts     # API de upload
│   │   └── indicadores/route.ts # API de dados
│   └── layout.tsx
├── components/
│   ├── ui/kpi-card.tsx
│   └── charts/
│       ├── bar-chart.tsx
│       ├── donut-chart.tsx
│       └── line-chart.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts            # Cliente Drizzle + Neon
│   │   └── schema.ts           # Schema do banco
│   └── parsers/
│       ├── parse-meses.ts      # Parser planilha Comercial
│       └── parse-rh.ts         # Parser planilhas RH
├── types/indicadores.ts        # Tipos TypeScript
├── vercel.json                 # Config Vercel
└── .env.example                # Variáveis de ambiente
```

---

## Roadmap

- [x] Dashboard Comercial (Faturamento, Vendedores, Empresas, Produtos)
- [x] Dashboard RH (Turnover, Absenteísmo, Atestados, Desligamentos)
- [x] Upload de planilhas com parser automático
- [x] API de indicadores com dados embutidos (fallback sem banco)
- [ ] Integração com banco PostgreSQL (Neon)
- [ ] Autenticação NextAuth
- [ ] Dashboard Financeiro / DRE
- [ ] Comparativo entre períodos (ano a ano)
- [ ] Exportação PDF/Excel dos relatórios
- [ ] Notificações de alertas por e-mail
- [ ] Multi-tenant (múltiplas empresas)

---

## Licença

Projeto proprietário — União Bag Big Bags e Sacarias © 2026
