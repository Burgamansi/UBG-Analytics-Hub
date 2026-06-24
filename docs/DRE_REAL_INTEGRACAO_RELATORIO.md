# Relatório Técnico — Sprint 05 — Integração DRE Real

Projeto: UBG Analytics Hub  
Escopo: integração do Dashboard Financeiro com dados reais importados da DRE, mantendo fallback mock.

## 1. Diagnóstico Resumido

### Upload

Arquivo: `app/(dashboard)/upload/page.tsx`

O Upload atual envia planilhas para `/api/upload` com `FormData` contendo:

- `file`
- `modulo`

Para Financeiro, o módulo usado é `financeiro`.

### API de Upload

Arquivo: `app/api/upload/route.ts`

Fluxo financeiro atual preservado:

1. Recebe Excel.
2. Chama `parseFinanceiroXLS(buffer, "DRE2025")`.
3. Gera `rows`, `summary`, `errors`.
4. Se existe `DATABASE_URL`, salva em:
   - `uploads`
   - `registros_financeiro`

Nenhuma alteração foi feita nessa API.

### Parser Financeiro

Arquivo: `lib/parsers/parse-financeiro.ts`

Antes:

- Classificação simples por `receita`, `cmv/custo`, demais como despesas.
- Summary básico: receita, custos, despesas, lucro bruto, resultado líquido e margem.

Agora:

- Classificação DRE mais robusta.
- Summary expandido para uso executivo real.

### API Financeiro

Arquivo: `app/api/financeiro/route.ts`

Fluxo preservado:

- Busca `registros_financeiro` no banco.
- Converte para `ParsedFinanceiroRow`.
- Chama `buildFinanceiroSummary(rows)`.
- Retorna `{ available, summary }`.

Como `buildFinanceiroSummary` foi expandido, a API passa a retornar dados mais ricos sem mudar contrato base.

### Dashboard Financeiro

Arquivo: `app/(dashboard)/financeiro/page.tsx`

Antes:

- Buscava `/api/financeiro`, mas os cards executivos usavam mocks fixos.

Agora:

- Usa `FinanceiroDataProvider`.
- Se existir DRE real válida: KPIs, tendência, orçado x realizado, despesas e alertas usam dados reais.
- Se não existir DRE real: mantém mocks estruturados.

## 2. Parser DRE Robusto

Arquivo alterado: `lib/parsers/parse-financeiro.ts`

Campos adicionados ao `FinanceiroSummary`:

- `receita_bruta`
- `receita_liquida`
- `deducoes`
- `cmv`
- `despesas_administrativas`
- `resultado_financeiro`
- `ebitda`
- `margem_ebitda_pct`
- `margem_liquida_pct`
- `despesas_por_categoria`

Classificação preparada para:

- Receita Bruta
- Receita Líquida
- Deduções
- Custos / CMV
- Despesas Administrativas
- Resultado Financeiro
- Despesas gerais
- Resultado / Lucro / EBITDA informado

Compatibilidade:

- Continua aceitando estruturas anteriores.
- Mantém campos antigos (`receita_total`, `custos`, `despesas`, `resultado_liquido`, `margem_pct`) para não quebrar consumidores existentes.

## 3. FinanceiroDataProvider

Arquivo criado: `lib/data/financeiro-provider.ts`

Responsabilidades:

1. Receber `FinanceiroSummary` da API.
2. Validar se há dados reais úteis.
3. Montar modelo único para UI.
4. Retornar mocks quando não há importação válida.

Modelo retornado:

- `source`: `real` ou `mock`
- `sourceLabel`
- `kpis`
- `monthlyTrend`
- `budgetVsActual`
- `expenses`
- `alerts`
- `summary`

## 4. Substituição de Mocks no Financeiro

Arquivo alterado: `app/(dashboard)/financeiro/page.tsx`

Regra aplicada:

```text
Se /api/financeiro retornar available=true e receita_total > 0:
  usar dados reais da DRE.
Senão:
  usar mocks existentes.
```

Substituído por dados reais quando disponíveis:

- KPIs principais
- Tendência mensal
- Orçado x Realizado
- Top despesas / análise de despesas
- Alertas financeiros
- Score financeiro calculado a partir dos KPIs reais

Mantido mock por falta de fonte DRE direta:

- Fluxo de caixa projetado
- Saldos bancários
- Centros de custos

Motivo:

- DRE não contém, por si só, saldos bancários ou projeções de caixa completas.
- Esses blocos precisam de extratos, contas a pagar/receber ou ERP financeiro em sprint futura.

## 5. Indicadores Automáticos

Criados/calculados automaticamente via provider:

- Crescimento mensal
- Variação percentual vs mês anterior
- Meta x realizado
- Tendência mensal
- Margem EBITDA
- Margem líquida
- Resultado positivo/negativo
- Alertas por meta e resultado

## 6. Compatibilidade Custo - DRE 2026.xlsx

Compatibilidade preparada via aliases e classificação textual:

- `DRE`
- `Categoria`
- `Classificação`
- `Conta`
- `Grupo`
- `Valor Real`
- `Valor Pago`
- `Valor Liquidado`
- `Valor`
- `Total`
- `Receita`
- `Despesa`
- `Mês/Ano`
- `Competência`
- `Data`

A leitura segue compatível com arquivos protegidos por senha através do fluxo já existente em `parseFinanceiroXLS`.

## 7. O Que Não Foi Alterado

Conforme regra da sprint:

- Dashboard Presidência não alterado.
- RH não alterado.
- Compras não alterado.
- Qualidade não alterado.
- Operações não alterado.
- Upload não alterado.
- Banco/schema não alterado.
- Auth não alterado.

## 8. Validação

Executado:

- `npx tsc --noEmit`
- `npm run build`

Resultado esperado: ambos aprovados.

## 9. Próxima Recomendação

Sprint seguinte sugerida:

1. Criar testes unitários com amostra real/sanitizada de `Custo - DRE 2026.xlsx`.
2. Expor no dashboard a data da última importação financeira.
3. Criar endpoint read-only de status real de importações usando tabela `uploads`.
4. Evoluir DRE para hierarquia contábil completa: grupo, subgrupo, conta e centro de custo.