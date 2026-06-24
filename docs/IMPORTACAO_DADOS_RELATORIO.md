# Relatório Técnico — Sprint 04 — Motor de Importação de Dados

Projeto: UBG Analytics Hub  
Escopo: infraestrutura de importação de planilhas Excel sem troca do fluxo atual em produção.

## 1. Mapeamento do Upload Atual

### Página Upload

Arquivo: `app/(dashboard)/upload/page.tsx`

Responsabilidades atuais:

- Seleção de módulo de importação.
- Drag and drop de arquivo via `react-dropzone`.
- Validação client-side de extensão/tamanho.
- Envio `POST` para `/api/upload` com `FormData`.
- Exibição de retorno: sucesso, erro, registros importados e avisos.

Módulos expostos hoje:

- `comercial`
- `rh`
- `turnover`
- `atestados`
- `financeiro`

Formatos aceitos:

- `.xls`
- `.xlsx`
- `.xlsm`
- `.csv`

### API Upload

Arquivo: `app/api/upload/route.ts`

Responsabilidades atuais:

- Recebe arquivo e módulo.
- Valida tipo/extensão.
- Converte `File` para `Buffer`.
- Direciona para parser específico.
- Retorna JSON com `success`, `arquivo`, `modulo`, `registros`, `erros` e `preview`.
- Salva no banco apenas quando `DATABASE_URL` existe e para fluxos já implementados.

Parsers chamados pela API atual:

- Comercial: `parseComercialXLS` em `lib/parsers/parse-meses.ts`
- RH / Turnover / Atestados: `parseRHXLS`, `parseAtestadosXLS` em `lib/parsers/parse-rh.ts`
- Financeiro: `parseFinanceiroXLS` em `lib/parsers/parse-financeiro.ts`

### Parsers Existentes

Diretório atual: `lib/parsers`

Arquivos:

- `parse-meses.ts`: parser comercial dinâmico por abas/colunas.
- `parse-rh.ts`: parser RH, desligamentos e atestados.
- `parse-financeiro.ts`: parser financeiro/DRE com suporte a planilha protegida por senha via `officecrypto-tool`.

Observação técnica:

- Parsers atuais são funcionais, mas cada um possui contrato próprio.
- Não existe ainda uma interface comum de importação.
- Validação de colunas e normalização estão implementadas de forma local em cada parser.

### Estrutura de Armazenamento

Arquivos:

- `lib/db/index.ts`
- `lib/db/schema.ts`

Banco configurado:

- Neon PostgreSQL via `@neondatabase/serverless`.
- ORM: Drizzle ORM.
- Variável obrigatória: `DATABASE_URL`.

Tabelas atuais relevantes:

- `uploads`
- `registros_comercial`
- `registros_rh`
- `desligamentos`
- `atestados`
- `registros_financeiro`

Tabela `uploads` já contém campos adequados para status:

- `nome_arquivo`
- `modulo`
- `mes_referencia`
- `ano_referencia`
- `status`
- `registros_importados`
- `erro_mensagem`
- `created_at`

## 2. Arquitetura Padrão Criada

Nova estrutura criada em `src/lib/parsers`:

```text
src/lib/parsers/
  core/
    DataImportService.ts
    excel.ts
    index.ts
    types.ts
  financeiro/
    dre2026.ts
    index.ts
  comercial/
    index.ts
  rh/
    index.ts
  compras/
    index.ts
  qualidade/
    index.ts
  operacoes/
    index.ts
  index.ts
```

Objetivo:

- Preparar um motor único para leitura, validação, normalização e retorno JSON padronizado.
- Manter parsers atuais em `lib/parsers` intactos para não quebrar produção.
- Permitir migração gradual módulo por módulo.

## 3. Interface Padrão — DataImportService

Arquivo: `src/lib/parsers/core/types.ts`  
Arquivo: `src/lib/parsers/core/DataImportService.ts`

Contrato criado:

- `readExcel(buffer, fileName?)`
- `validateColumns(rows)`
- `normalizeData(rows)`
- `parse(buffer, fileName?)`

Retorno padrão:

```ts
StandardImportResult<TRecord, TSummary>
```

Campos principais:

- `module`
- `parser`
- `fileName`
- `status`
- `records`
- `summary`
- `issues`
- `meta`

Benefícios:

- Mesmo contrato para todos os módulos.
- Validação de colunas reutilizável.
- Normalização centralizada.
- Retorno pronto para API, banco e dashboards.

## 4. Parser Financeiro Real — DRE 2026

Arquivo: `src/lib/parsers/financeiro/dre2026.ts`

Criado parser inicial para DRE 2026.

Preparado para:

- Receita
- Custos
- Despesas
- EBITDA
- Resultado

Campos normalizados:

- `mes`
- `ano`
- `categoria`
- `grupo`
- `tipo`
- `valor`
- `descricao`

Resumo gerado:

- `receita`
- `custos`
- `despesas`
- `ebitda`
- `resultado`

Status:

- Estrutura pronta.
- Não conectada ainda à API `/api/upload`, por segurança da Sprint.

## 5. Parsers Preparados Para Demais Módulos

Criados placeholders estruturais para:

- Comercial
- RH
- Compras
- Qualidade
- Operações

Cada módulo já exporta função de parser com retorno `StandardImportResult` em status `pending`.

Isso permite:

- Evoluir cada parser em sprint própria.
- Não quebrar fluxo atual.
- Manter contrato comum.

## 6. Tela Status das Importações

Arquivo: `app/(dashboard)/importacoes/page.tsx`  
Dados: `src/lib/data/importStatus.ts`

Criada tela visual para acompanhamento.

Exibe:

- Arquivo
- Módulo
- Data Upload
- Status
- Registros Processados
- Observação

Importante:

- Tela usa dados mockados estruturados.
- Não consulta banco ainda.
- Não altera API existente.
- Preparada para futura ligação com tabela `uploads`.

## 7. O Que Não Foi Alterado

Conforme regra da Sprint:

- Banco não alterado.
- Schema não alterado.
- Auth não alterado.
- Upload atual não alterado.
- Parser atual não alterado.
- API atual não alterada.
- Dashboard Presidência não alterado nesta Sprint.
- Financeiro não alterado nesta Sprint.
- RH, Compras, Qualidade e Operações não alterados.

## 8. Recomendação Técnica

Próxima etapa recomendada:

1. Criar endpoint read-only `/api/importacoes/status` lendo tabela `uploads`.
2. Ligar a tela `/importacoes` ao endpoint real.
3. Criar feature flag para trocar parser financeiro antigo pelo novo `DRE2026ImportService`.
4. Definir contratos reais de planilha para Compras, Qualidade e Operações.
5. Criar testes unitários para `DataImportService` e `DRE2026ImportService`.

## 9. Risco Atual

Baixo.

Motivo:

- Infraestrutura criada em paralelo.
- Nenhum fluxo produtivo foi substituído.
- Build e TypeScript validam a nova estrutura.