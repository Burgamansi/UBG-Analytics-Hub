# UBG DRE Layout Analysis

Análise estrutural da planilha real **"Custo - DRE 2026.xlsx"** (protegida com
senha `DRE2025`, conforme `SENHA.docx`). 14 abas. Para cada aba: linhas,
colunas, linha do cabeçalho real, cabeçalhos encontrados, células mescladas e
fórmulas.

---

## 1. "Desc. DRE"

- Linhas com conteúdo: 58 (range total B1:F103)
- Colunas: 5
- Células mescladas: 1 (`B1:F1`)
- Fórmulas: não
- **Cabeçalho real: linha 3** (índice 2)
- Cabeçalhos: `Descrição`, `DRE`, `Pag. data do vencimento`, `Custo`, `Tipo`
- Tipo: tabela de mapeamento (lookup) Descrição → categoria DRE / Tipo
  (Entrada/Saida)

---

## 2. "C Crédito Itaú"

- Linhas com conteúdo: 2323 (range total B1:K2902)
- Colunas: 10
- Células mescladas: 1 (`E1:I1`)
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2)
- Cabeçalhos: `Centro de Custo`, `Data`, `Empresa`, `Valor`, `Parcelas`,
  `Tipo`, `DRE`, `Vencimento`, `mês vencimento`, `Descrição`
- Tipo: transacional (lançamentos de cartão de crédito)

---

## 3. "Lançamentos Lima"

- Linhas com conteúdo: 2730 (range total A1:Z2744)
- Colunas: 26
- Células mescladas: 0
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2) — coluna A vazia, dados começam na
  coluna B
- Cabeçalhos (25): `Verificação`, `Data Lançamento`, `Tipo Lançamento`,
  `Codigo Custo`, `Banco/ Conta`, `Numero OP/ NF`, `Boleto`,
  `Fornecedor/ Cliente`, `Nº Cheque`, `Valor`, `Data Vencimento`,
  `Observações`, `Valor Real`, `Saldo`, `DRE`, `Centro de Custo`, `Tipo`,
  `Data Real`, `Antecipação`, `Pagamento`, `Ano`, `Mês`, `Custo`,
  `Mês Lanç.`, `Ano Lanç.`
- Tipo: transacional (lançamentos de caixa/banco)

---

## 4. "Lançamentos Rafcorte"

- Linhas com conteúdo: 2837 (range total A1:Z2847)
- Colunas: 26
- Células mescladas: 0
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2) — coluna A vazia
- Cabeçalhos: idênticos aos de "Lançamentos Lima" (25 colunas)
- Tipo: transacional

---

## 5. "Lançamentos LPL"

- Linhas com conteúdo: 2985 (range total B1:Z1048576 — range "infinito"
  herdado de formatação, dados reais terminam ~linha 2985)
- Colunas: 25
- Células mescladas: 0
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2) — sem coluna vazia à esquerda
  (dados começam direto em `Verificação`)
- Cabeçalhos: idênticos aos de "Lançamentos Lima" (25 colunas, mesma ordem)
- Tipo: transacional

---

## 6. "Lançamentos OP"

- Linhas com conteúdo: 2962 (range total B1:Z2969)
- Colunas: 25
- Células mescladas: 0
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2)
- Cabeçalhos: iguais aos de "Lançamentos Lima", exceto `Data` (em vez de
  `Data Lançamento`) e `Numero OP` / `Boleto/NF` (em vez de
  `Numero OP/ NF` / `Boleto`)
- Tipo: transacional

---

## 7. "Estoque"

- Linhas com conteúdo: 9 (range total B1:AA33)
- Colunas: 26
- Células mescladas: 1 (`B2:C2`)
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2)
- Cabeçalhos: `Data`, `Dec-25`, `Jan-26`, `Feb-26`, ... `Dec-26` (14 colunas
  de mês, com colunas vazias intercaladas)
- Linhas de dados: `Estoque`, `IPI`, `Valor`, `Diferença`
- Tipo: resumo cross-tab de estoque por mês — **não** é fonte do DRE
  financeiro

---

## 8. "DRE" [PRIORITÁRIA]

- Linhas com conteúdo: 53 (range total B1:AB60)
- Colunas: 27
- Células mescladas: 1 (`C2:Z2`)
- Fórmulas: sim
- **Cabeçalho real: linha 6** (índice 5) — cabeçalho em 4 camadas:
  - Linha 2: título `DRE 2026` / `2025`
  - Linha 3: número do mês (1..12)
  - Linha 5: nome do mês (`Janeiro`..`Dezembro`)
  - **Linha 6 (cabeçalho efetivo)**: `Descrição`, `Valor`, `%`, `Valor`, `%`,
    ... (repetido 12x, um par Valor/% por mês) — 26 colunas
- Linhas de dados (a partir da linha 7): categorias do DRE
  (`Faturamento/ Receita`, `Custo Produto (CMV)`, `Beneficios`,
  `Insumos - produção`, `Materia-prima`, `Rescisão`, `Salarios`,
  `Imposto Func.`, `Sindicatos`, ...) — muitas vazias/zeradas para 2026
  nesta aba.
- Tipo: cross-tab categoria x mês (Valor/%). **Não** é a versão consolidada
  mais confiável — ver "DRE novo" (item 11).

---

## 9. "Centro de Custo Mensal" [PRIORITÁRIA]

- Linhas com conteúdo: 103 (range total B1:AM104)
- Colunas: 38
- Células mescladas: 26
- Fórmulas: sim
- **Cabeçalho real: linha 5** (índice 4) — cabeçalho em 3 camadas:
  - Linha 1: título "Centro de Custo" (mesclado `B1:AM1`)
  - Linha 3: número do mês (1..12)
  - Linha 4: nome do mês (`Janeiro`..`Dezembro`)
  - **Linha 5 (cabeçalho efetivo)**: `Codigo`, `Descrição`, `Orçado`,
    `Realizado`, `Resultado` — repetido 1x por mês (3 colunas x 12 meses +
    2 = 38 colunas)
- Linhas de dados (a partir da linha 6): centros de custo (`DIRETORIA`,
  `BENEFICIOS`, `SEGUROS`, `SALARIOS`, `ADMINISTRATIVO`, `COMPRAS`,
  `DESCARTAVEL/ LIMPEZA`, `EPI/ UNIFORME`, `PAPELARIA E SIMILARES`,
  `FRETES`, ...) com código (`1,000`, `1,100`, ...).
- Tipo: cross-tab orçado/realizado/resultado por centro de custo e mês.
  26 merges tornam parsing direto via `sheet_to_json` arriscado (sub-células
  mescladas viram vazias).

---

## 10. "Plano de contas" [PRIORITÁRIA]

- Linhas com conteúdo: 98 (range total A1:AT102)
- Colunas: 46
- Células mescladas: 0
- Fórmulas: sim
- **Cabeçalho real: linha 2** (índice 1) — cabeçalho em 2 camadas:
  - Linha 1: blocos `2026`, `Mês analise`, `Comparativo mês em analise`,
    `Orçado`, `Realizado`, `Resultado`, `Indice para "proch"`
  - **Linha 2 (cabeçalho efetivo)**: `Código`, `Descrição`, `Tipo`, `Orçado`,
    `Realizado`, `Diferença`, depois `1`..`12`,`Total` repetido 3x
    (Orçado mensal / Realizado mensal / Resultado mensal) — 46 colunas
- Linhas de dados (a partir da linha 3): contas (`DIRETORIA`, `BENEFICIOS`,
  `SEGUROS`, `SALARIOS`, `RETIRADA SÓCIOS`, `ADMINISTRATIVO`, `COMPRAS`, ...)
  com código (`1000`, `1100`, ...) e `Tipo` (`ADM`, `RETIRADA SÓCIOS`,
  `EMPRESTIMOS`, ...).
- Tipo: cross-tab orçamentário (plano de contas x mês x
  orçado/realizado/diferença).

---

## 11. "DRE novo" [PRIORITÁRIA] — ⭐ fonte oficial recomendada

- Linhas com conteúdo: 22 (range total A1:AP31)
- Colunas: 42
- Células mescladas: 1 (`AB1:AB20`)
- Fórmulas: sim
- **Cabeçalho real: linha 2** (índice 1) — cabeçalho em 2 camadas:
  - Linha 1: rótulos `Mês em numeral` (1..12) e
    `Resultado do mês em analise` (1..12)
  - **Linha 2 (cabeçalho efetivo, 41 colunas)**: `Descrição`,
    `Janeiro`..`Dezembro`, `Total`, `% acumulado`, depois `Jan`..`Dez`
    (formato abreviado, 2 blocos repetidos), `Total`, `% acumulado`
- Linhas de dados (a partir da linha 3) — uma linha por indicador do DRE
  consolidado, valores mensais + total + %:
  - `FATURAMENTO`
  - `DESPESAS VENDAS`
  - `TRIBUTOS VENDAS`
  - `RECEITA LIQUIDA`
  - `CMV`
  - `ADM`
  - `TRIBUTOS`
  - `Resultado operacional (EBITDA)`
  - `Resultado Financeiro`
  - `APLICAÇÕES`
  - `EMPRESTIMOS`
  - `Resultado liquido`
  - `Tributos sobre Lucro`
- Tipo: cross-tab consolidado mensal — versão "fechada" do DRE, já com
  totais por categoria principal.
- **Esta é a aba recomendada como fonte oficial dos indicadores do módulo
  Financeiro.**

---

## 12. "Indicadores" [PRIORITÁRIA]

- Linhas com conteúdo: 85 (range total B1:V93)
- Colunas: 21
- Células mescladas: 8
- Fórmulas: sim
- **Cabeçalho real: cabeçalho em 3 camadas, sem uma única linha
  "limpa"** — linhas 1, 4 e 5 (índices 0, 3, 4):
  - Linha 1: blocos `Parametros`, `COMPARATIVO ANO ANTERIOR X ATUAL`,
    `COMPARATIVO MÊS ANTERIOR X ATUAL`
  - Linha 4: `Mês Analise`, `3`, `2025`, `2026`, `2026`, `2026`
  - Linha 5: `Descrição`, `Março`, `%`, `Descrição`, `Março`, `%`, `Março`,
    `%`, `Descrição`, `Fevereiro`, `%`, `Março`, `%`, `Descrição`, `2026`,
    `%`
- Linhas de dados (a partir da linha 6): mesmas categorias de "DRE novo"
  (`FATURAMENTO`, `DESPESAS VENDAS`, `TRIBUTOS VENDAS`, `RECEITA LIQUIDA`,
  `CMV`, `ADM`, `TRIBUTOS`, `Resultado operacional (EBITDA)`,
  `Resultado Financeiro`, `APLICAÇÕES`...), comparando mês atual vs mesmo mês
  ano anterior vs mês anterior.
- Tipo: painel comparativo **derivado** de "DRE novo" — mesmos valores,
  recombinados para comparação. Não é fonte primária adicional.

---

## 13. "Custo Orçamento"

- Linhas com conteúdo: 18 (range total B1:N20)
- Colunas: 13
- Células mescladas: 3 (`B8:N8`, `B1:G1`, `H1:N1`)
- Fórmulas: sim
- **Cabeçalho real: linha 3** (índice 2) para o primeiro bloco; segundo
  bloco repete cabeçalho na linha 9 (não capturado nas 6 primeiras linhas)
- Cabeçalhos (bloco 1): `Descrição`, `Janeiro`..`Dezembro`
- Linhas de dados (bloco 1): `Gastos`, `Gastos Hora`,
  `Quantidade de Costureiras`
- Linhas de dados (bloco 2, a partir da linha 10): `Socios`, `RH LPL`,
  `RH Rafcorte`, `RH Lima`, `Premiação`
- Tipo: orçamento de custos de produção/RH por mês — complementar.

---

## 14. "Cheques"

- Linhas com conteúdo: 1005 (range total B1:R1006)
- Colunas: 17
- Células mescladas: 14
- Fórmulas: sim
- **Cabeçalho real: linha 4** (índice 3), com painel auxiliar nas linhas
  2-3 (`Data`, `Hoje`, `Valor`, `Quantidade`, `oculta`, `R$ 0.00`)
- Cabeçalhos: `Nº Cheque`, `Estado`, `Banco`, `Portador`, `Observação`,
  `Data de Entrada`, `OP`, `Cliente`, `Valor`, `Vencimento`,
  `Cheque Disponivel`, `Pesquisado`
- Tipo: controle operacional de cheques — sem relação com
  Receita/Custo/Despesa/Resultado do DRE.

---

## Resumo: fonte oficial por indicador

| Indicador     | Aba fonte         | Linha (na aba "DRE novo")     |
|---------------|-------------------|---------------------------------|
| Receita       | `DRE novo`        | `FATURAMENTO` (ou `RECEITA LIQUIDA` p/ receita líquida) |
| Custos        | `DRE novo`        | `CMV`                            |
| Despesas      | `DRE novo`        | `ADM` + `TRIBUTOS` (+ `DESPESAS VENDAS` + `TRIBUTOS VENDAS`, se aplicável) |
| Resultado     | `DRE novo`        | `Resultado liquido`              |
| EBITDA        | `DRE novo`        | `Resultado operacional (EBITDA)` |
| Lucro Líquido | `DRE novo`        | `Resultado liquido` (já considera Resultado Financeiro, Aplicações, Empréstimos, Tributos sobre Lucro) |
| Lançamentos detalhados | `Lançamentos Lima/Rafcorte/LPL/OP` + `C Crédito Itaú` | linha a linha, cabeçalho na linha 3, colunas `DRE`/`Valor Real`/`Mês Lanç.`/`Ano Lanç.` |
| Classificação/Mapa de categorias | `Desc. DRE` | `Descrição` → `DRE` / `Tipo` |

Abas `Estoque`, `Custo Orçamento` e `Cheques`: fora do escopo do DRE
financeiro (não contêm Receita/Custo/Despesa/Resultado/EBITDA/Lucro).

---

## Próximo passo: UBG_DRE_ADAPTER_V2

Aguardando aprovação para detalhar. Resumo da proposta (sem implementar
ainda):

1. **KPIs do painel Financeiro** (`FinanceiroSummary`): ler a aba
   `DRE novo`, cabeçalho na linha 2, extrair as linhas `FATURAMENTO`, `CMV`,
   `ADM`, `TRIBUTOS`, `Resultado operacional (EBITDA)`, `Resultado liquido`
   por mês (colunas `Janeiro`..`Dezembro`) — números já oficiais/fechados,
   sem somar transações brutas.
2. **Registros detalhados** (`registros_financeiro`, tabela
   `ParsedFinanceiroRow[]`): ler `Lançamentos Lima/Rafcorte/LPL/OP` e
   `C Crédito Itaú`, cabeçalho na linha 3, colunas `DRE`/`Tipo`/`Valor Real`/
   `Mês Lanç.`/`Ano Lanç.`/`Fornecedor/ Cliente`, ignorando `DRE = "Não Usar"`.
3. Não alterar `lib/db/schema.ts`, layout do painel ou navegação — apenas o
   parser e a montagem do `summary`.
