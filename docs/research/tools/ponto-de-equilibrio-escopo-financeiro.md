# Calculadora do Ponto de Equilíbrio — Escopo Financeiro

**Ferramenta:** Calculadora do Ponto de Equilíbrio  
**Versão alvo:** v1.3.0  
**Bloco:** 1 — Escopo Financeiro  
**Status:** Aprovado para implementação  
**Data:** 2026-06-30

---

## 1. Visão Geral

A Calculadora do Ponto de Equilíbrio responde à pergunta central:

> **"Quanto minha clínica precisa faturar, produzir ou vender por mês para cobrir todos os custos e começar a gerar lucro?"**

Ela também responde perguntas operacionais derivadas:

- Qual é o ponto de equilíbrio mensal da operação?
- Quantos procedimentos preciso realizar para empatar?
- Qual faturamento mínimo sustenta a clínica sem prejuízo?
- Qual a distância entre o faturamento atual e o ponto de equilíbrio?
- A operação está segura, pressionada ou crítica?
- Qual meta diária de faturamento garante o equilíbrio?

---

## 2. Dor Resolvida

**Problema:** Muitos gestores de clínicas odontológicas desconhecem o ponto de equilíbrio da operação. Eles sabem que faturaram X reais no mês, mas não sabem se esse valor é suficiente para cobrir todos os custos. Sem essa referência, não existe gestão financeira real — apenas intuição.

**Consequências:**
- Decisões de expansão ou contratação sem base financeira
- Meses de prejuízo percebidos apenas quando o caixa zera
- Dificuldade em definir metas de produção para a equipe
- Ausência de indicador mínimo para avaliar a saúde do mês

**O que a ferramenta entrega:**
- Ponto de equilíbrio mensal em reais e em número de procedimentos
- Receita alvo para atingir a meta de lucro
- Meta diária de faturamento
- Diagnóstico comparativo com o faturamento atual (quando informado)
- Margem de segurança financeira
- Orientações práticas para melhorar a situação

---

## 3. Público-Alvo

| Perfil | Uso principal |
|---|---|
| Dono de clínica odontológica | Definir metas mensais e avaliar saúde financeira |
| Gestor administrativo | Monitorar desempenho real vs. ponto de equilíbrio |
| Dentista autônomo | Entender o mínimo necessário para sobreviver financeiramente |
| Estudante de odontologia | Aprender gestão financeira antes de abrir consultório |

---

## 4. Conceitos Financeiros

### 4.1 Custos Fixos

Custos que existem independente do volume de atendimentos: aluguel, salários fixos, pró-labore, energia fixa, softwares, contabilidade, seguros. O total de custos fixos é a base do cálculo do ponto de equilíbrio.

### 4.2 Custos Variáveis

Custos que crescem proporcionalmente ao faturamento: materiais consumidos, comissões, insumos por paciente, taxas de cartão. São expressos como percentual do faturamento para simplificar o modelo.

### 4.3 Margem de Contribuição

Percentual do faturamento que resta após pagar os custos variáveis. É o "quanto de cada real faturado contribui para pagar os custos fixos e gerar lucro."

```
Margem de Contribuição % = 100 - Custo Variável %
```

Se o custo variável é 20%, a margem de contribuição é 80%. Isso significa que a cada R$100 faturados, R$80 "contribuem" para cobrir os custos fixos.

### 4.4 Ponto de Equilíbrio

O faturamento mensal mínimo necessário para que a clínica não tenha lucro nem prejuízo. Abaixo desse ponto, a operação tem prejuízo. Acima, começa a gerar lucro.

```
Ponto de Equilíbrio = Custos Fixos / Taxa de Margem de Contribuição
```

### 4.5 Ponto de Equilíbrio com Lucro Desejado

Faturamento necessário para cobrir os custos fixos E atingir a meta de lucro.

```
Receita Alvo = (Custos Fixos + Lucro Desejado) / Taxa de Margem de Contribuição
```

### 4.6 Ticket Médio

Valor médio recebido por procedimento ou atendimento. Divide o faturamento total pelo número de atendimentos realizados no período.

### 4.7 Quantidade Mínima de Procedimentos

Número de atendimentos necessários para atingir o ponto de equilíbrio, dado o ticket médio.

```
Procedimentos para Empatar = Ponto de Equilíbrio / Ticket Médio
```

### 4.8 Gap Financeiro

Diferença entre o faturamento atual e o ponto de equilíbrio. Positivo = acima do ponto de equilíbrio (situação saudável). Negativo = abaixo (prejuízo operacional).

### 4.9 Margem de Segurança

Percentual que representa o quanto o faturamento atual está acima do ponto de equilíbrio em relação ao faturamento total. Indica o "colchão de segurança" da operação.

```
Margem de Segurança % = (Faturamento Atual - Ponto de Equilíbrio) / Faturamento Atual × 100
```

---

## 5. Inputs Oficiais

### 5.1 Definição dos campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `monthlyFixedCosts` | `number` | Sim | Custos fixos mensais totais em R$ |
| `averageVariableCostPercent` | `number` | Sim | % médio de custo variável sobre o faturamento |
| `averageTicket` | `number` | Sim | Ticket médio por procedimento em R$ |
| `currentMonthlyRevenue` | `number` | Não | Faturamento mensal atual em R$ |
| `desiredMonthlyProfit` | `number` | Não | Meta de lucro mensal em R$ (default 0) |
| `workingDaysPerMonth` | `number` | Não | Dias úteis por mês (default 20) |

### 5.2 Semântica dos campos

**`monthlyFixedCosts`**  
Soma de todos os custos que existem independente do volume: aluguel, salários, pró-labore, financiamentos de equipamentos, energia, água, internet, softwares de gestão, contabilidade. Deve refletir a realidade atual, sem estimativas otimistas.

**`averageVariableCostPercent`**  
Percentual médio de custos que crescem com o faturamento. Inclui materiais de consumo, luvas/máscaras por paciente, comissões sobre produção, taxas de cartão. Para clínicas gerais, costuma ficar entre 15% e 35%. Para clínicas com alto volume de materiais caros (implantes, próteses), pode ser maior.

**`averageTicket`**  
Valor médio por atendimento ou procedimento. Calculado dividindo o faturamento total pelo número de atendimentos em um período representativo. É o divisor que converte faturamento em quantidade de procedimentos.

**`currentMonthlyRevenue`**  
Faturamento médio mensal atual. Campo opcional — quando informado, habilita diagnóstico comparativo (está acima ou abaixo do ponto de equilíbrio?) e cálculo de margem de segurança.

**`desiredMonthlyProfit`**  
Meta de lucro líquido mensal além dos custos. Não é o pró-labore (que já está em `monthlyFixedCosts`), mas sim o retorno adicional sobre o investimento. Quando zero, calcula apenas o ponto de equilíbrio.

**`workingDaysPerMonth`**  
Dias úteis de atendimento por mês. Usado para calcular a meta diária de faturamento. Ajuda a traduzir a meta mensal em uma referência operacional mais imediata.

### 5.3 Defaults sugeridos na interface

| Campo | Default | Justificativa |
|---|---|---|
| `averageVariableCostPercent` | 20 | Referência média para clínicas gerais |
| `desiredMonthlyProfit` | 0 | Começa mostrando apenas o breakeven |
| `workingDaysPerMonth` | 20 | Média de dias úteis mensais |

### 5.4 Limites de validação

| Campo | Mínimo | Máximo | Observação |
|---|---|---|---|
| `monthlyFixedCosts` | 0 | — | Pode ser 0 em casos extremos |
| `averageVariableCostPercent` | 0 | 95 | Limite de 95% para evitar margem de contribuição <= 5% |
| `averageTicket` | 0.01 | — | Deve ser positivo |
| `currentMonthlyRevenue` | 0.01 | — | Deve ser positivo quando informado |
| `desiredMonthlyProfit` | 0 | — | Não pode ser negativo |
| `workingDaysPerMonth` | 1 | 31 | Inteiro positivo |

---

## 6. Fórmulas Conceituais

### 6.1 Margem de contribuição percentual

```
contributionMarginPercent = 100 - averageVariableCostPercent
```

**Explicação:** O complemento do custo variável. Se 20% do faturamento vai para custos variáveis, então 80% "contribui" para pagar os custos fixos e gerar lucro.

---

### 6.2 Taxa de margem de contribuição (decimal)

```
contributionMarginRate = contributionMarginPercent / 100
```

**Explicação:** Forma decimal da margem de contribuição, usada como denominador nas fórmulas seguintes.

**Pré-condição:** `contributionMarginRate > 0` (garantida pela validação `averageVariableCostPercent <= 95`).

---

### 6.3 Ponto de equilíbrio mensal

```
breakEvenRevenue = monthlyFixedCosts / contributionMarginRate
```

**Explicação:** Quanto a clínica precisa faturar para que a margem de contribuição gerada pague exatamente os custos fixos, sem lucro nem prejuízo. É o piso financeiro da operação.

**Exemplo:** Custos fixos R$40.000 / margem 80% = **R$50.000/mês**

---

### 6.4 Receita alvo (com lucro desejado)

```
targetRevenue = (monthlyFixedCosts + desiredMonthlyProfit) / contributionMarginRate
```

**Explicação:** Quando `desiredMonthlyProfit = 0`, `targetRevenue = breakEvenRevenue`. Quando há meta de lucro, a receita precisa ser maior para cobrir tanto os custos fixos quanto a meta.

**Exemplo:** (R$40.000 + R$15.000) / 80% = **R$68.750/mês**

---

### 6.5 Procedimentos para empatar

```
breakEvenProcedures = breakEvenRevenue / averageTicket
```

**Explicação:** Traduz o ponto de equilíbrio em número de atendimentos. Mais compreensível operacionalmente do que um valor em reais.

**Exemplo:** R$50.000 / R$500 = **100 procedimentos/mês**

---

### 6.6 Procedimentos para meta

```
targetProcedures = targetRevenue / averageTicket
```

**Exemplo:** R$68.750 / R$500 = **137,5 procedimentos/mês**

---

### 6.7 Receita diária mínima (breakeven)

```
dailyBreakEvenRevenue = breakEvenRevenue / workingDaysPerMonth
```

**Explicação:** Converte o ponto de equilíbrio mensal em uma meta diária mais tangível operacionalmente.

**Exemplo:** R$50.000 / 20 dias = **R$2.500/dia**

---

### 6.8 Receita diária alvo

```
dailyTargetRevenue = targetRevenue / workingDaysPerMonth
```

**Exemplo:** R$68.750 / 20 dias = **R$3.437,50/dia**

---

### 6.9 Gap de receita (quando currentMonthlyRevenue informado)

```
revenueGapAmount = currentMonthlyRevenue - breakEvenRevenue
```

**Explicação:** Positivo = clínica acima do ponto de equilíbrio (está gerando lucro operacional). Negativo = clínica abaixo (está operando no prejuízo).

**Exemplo:** R$65.000 − R$50.000 = **+R$15.000**

---

### 6.10 Gap percentual

```
revenueGapPercent = (revenueGapAmount / breakEvenRevenue) × 100
```

**Exemplo:** R$15.000 / R$50.000 × 100 = **30%** acima do ponto de equilíbrio

---

### 6.11 Margem de segurança

```
safetyMarginPercent =
  currentMonthlyRevenue > 0
    ? (revenueGapAmount / currentMonthlyRevenue) × 100
    : undefined
```

**Explicação:** Percentual do faturamento atual que está "além do necessário". Uma margem de segurança de 20% significa que o faturamento pode cair 20% antes de atingir o ponto de equilíbrio.

**Exemplo:** R$15.000 / R$65.000 × 100 = **23,1%** de margem de segurança

---

## 7. Outputs Previstos

### 7.1 Tipo completo — `PontoEquilibrioCalculationResult`

```typescript
interface PontoEquilibrioCalculationResult {
  // Inputs espelhados
  monthlyFixedCosts: number
  averageVariableCostPercent: number
  averageTicket: number
  desiredMonthlyProfit: number
  workingDaysPerMonth: number

  // Margem de contribuição
  contributionMarginPercent: number   // %
  contributionMarginRate: number       // decimal

  // Ponto de equilíbrio
  breakEvenRevenue: number            // R$/mês
  breakEvenProcedures: number         // quantidade

  // Receita alvo (com lucro)
  targetRevenue: number               // R$/mês
  targetProcedures: number            // quantidade

  // Metas diárias
  dailyBreakEvenRevenue: number       // R$/dia
  dailyTargetRevenue: number          // R$/dia

  // Campos condicionais (presentes somente quando currentMonthlyRevenue informado)
  currentMonthlyRevenue?: number
  revenueGapAmount?: number           // + = acima, - = abaixo
  revenueGapPercent?: number          // %
  safetyMarginPercent?: number        // %
}
```

### 7.2 MetricCards previstos na interface (8 cards)

| Card | Campo | Destaque |
|---|---|---|
| Ponto de equilíbrio mensal | `breakEvenRevenue` | Accent |
| Receita alvo com lucro | `targetRevenue` | Positivo |
| Procedimentos para empatar | `breakEvenProcedures` | Neutro |
| Procedimentos para meta | `targetProcedures` | Neutro |
| Faturamento diário mínimo | `dailyBreakEvenRevenue` | Neutro |
| Margem de contribuição | `contributionMarginPercent` | Positivo se >= 60 |
| Gap atual | `revenueGapAmount` | Warning se negativo |
| Margem de segurança | `safetyMarginPercent` | Condicional |

---

## 8. Critérios Futuros de Diagnóstico

### 8.1 Status possíveis

`excellent` | `healthy` | `attention` | `critical`

### 8.2 Avaliadores independentes

**Avaliador 1 — Margem de Contribuição**
- `>= 60%` → success: "Margem de contribuição sólida"
- `>= 45%` → info: "Margem de contribuição moderada"
- `>= 30%` → warning: "Margem de contribuição pressionada"
- `< 30%` → danger: "Margem de contribuição crítica"

**Avaliador 2 — Volume de Procedimentos para Equilíbrio**

*(Referência: compare com capacidade operacional estimada = workingDaysPerMonth × 6 atendimentos/dia)*
- `breakEvenProcedures <= capacidade × 0.50` → success: "Volume de equilíbrio confortável"
- `breakEvenProcedures <= capacidade × 0.70` → info: "Volume de equilíbrio administrável"
- `breakEvenProcedures <= capacidade × 0.90` → warning: "Volume de equilíbrio elevado"
- `breakEvenProcedures > capacidade × 0.90` → danger: "Volume de equilíbrio próximo do limite"

**Avaliador 3 — Situação do Faturamento Atual** (quando `currentMonthlyRevenue` informado)
- `currentMonthlyRevenue >= targetRevenue` → success: "Faturando acima da meta"
- `currentMonthlyRevenue >= breakEvenRevenue` → info: "Faturando acima do equilíbrio"
- `currentMonthlyRevenue >= breakEvenRevenue × 0.85` → warning: "Faturamento próximo do equilíbrio"
- `currentMonthlyRevenue < breakEvenRevenue × 0.85` → danger: "Faturamento abaixo do ponto de equilíbrio"

**Avaliador 4 — Margem de Segurança** (quando disponível)
- `>= 25%` → success: "Boa margem de segurança"
- `>= 15%` → info: "Margem de segurança moderada"
- `>= 5%` → warning: "Margem de segurança baixa"
- `< 5%` → danger: "Margem de segurança crítica"

**Avaliador 5 — Custo Fixo vs. Ticket Médio**

*(Referência: quantos tickets cobre os fixos com 100% de margem — teórico mínimo)*
- `monthlyFixedCosts / averageTicket <= 50` → success: "Custo fixo compatível com o ticket"
- `monthlyFixedCosts / averageTicket <= 100` → info: "Custo fixo moderado vs. ticket"
- `monthlyFixedCosts / averageTicket <= 200` → warning: "Custo fixo elevado em relação ao ticket"
- `monthlyFixedCosts / averageTicket > 200` → danger: "Custo fixo desproporcional ao ticket"

### 8.3 Score 0–100

```
score = 100

// Margem de contribuição
- < 60%: -10
- < 45%: -15 adicionais
- < 30%: -20 adicionais

// Volume de equilíbrio (vs. capacidade estimada)
- > 70% da capacidade: -10
- > 90% da capacidade: -15 adicionais

// Faturamento atual vs. breakeven (quando disponível)
- abaixo do breakeven: -20
- abaixo de 85% do breakeven: -20 adicionais

// Margem de segurança (quando disponível)
- < 15%: -8
- < 5%: -12 adicionais

clamp: max(0, min(100, round(score)))
```

### 8.4 Mapeamento score → status

| Score | Status |
|---|---|
| `>= 80` | `excellent` |
| `>= 60` | `healthy` |
| `>= 40` | `attention` |
| `< 40` | `critical` |

### 8.5 Condições force-critical

- `contributionMarginPercent <= 5` (fórmula inviável ou muito próxima)
- `currentMonthlyRevenue < breakEvenRevenue × 0.70` (prejuízo relevante)
- `breakEvenProcedures > workingDaysPerMonth × 8` (mais de 8 atendimentos por dia todos os dias)

---

## 9. Playbooks Previstos

### 9.1 Playbooks base (18)

| ID | Condição | Categoria | Prioridade |
|---|---|---|---|
| `margem_contribuicao_solida` | `contributionMarginPercent >= 60` | opportunity | low |
| `margem_contribuicao_moderada` | `>= 45 e < 60` | margin | medium |
| `margem_contribuicao_pressionada` | `>= 30 e < 45` | margin | high |
| `margem_contribuicao_critica` | `< 30` | risk | critical |
| `faturamento_acima_meta` | `currentMonthlyRevenue >= targetRevenue` | opportunity | low |
| `faturamento_acima_equilibrio` | `>= breakEven e < target` | revenue | medium |
| `faturamento_proximo_equilibrio` | `>= 85% breakEven e < breakEven` | risk | high |
| `faturamento_abaixo_equilibrio` | `< 85% breakEven` | risk | critical |
| `sem_faturamento_atual` | `currentMonthlyRevenue undefined` | standardization | low |
| `volume_confortavel` | `breakEvenProcedures <= 50% capacidade` | opportunity | low |
| `volume_elevado` | `> 70% capacidade` | volume | high |
| `volume_critico` | `> 90% capacidade` | risk | critical |
| `margem_seguranca_boa` | `safetyMarginPercent >= 25` | opportunity | low |
| `margem_seguranca_baixa` | `>= 5 e < 15` | risk | high |
| `margem_seguranca_critica` | `< 5 quando disponível` | risk | critical |
| `custo_fixo_alto_vs_ticket` | `monthlyFixedCosts/averageTicket > 100` | costs | high |
| `sem_meta_lucro` | `desiredMonthlyProfit === 0` | standardization | low |
| `meta_lucro_definida` | `desiredMonthlyProfit > 0` | revenue | medium |

### 9.2 Playbooks compostos (8)

| ID | Condições combinadas | Categoria | Prioridade |
|---|---|---|---|
| `margem_baixa_mais_custo_alto` | `contributionMarginPercent < 45 AND monthlyFixedCosts/ticket > 100` | risk | critical |
| `abaixo_equilibrio_margem_critica` | `currentRevenue < breakEven AND contributionMargin < 30` | risk | critical |
| `volume_critico_mais_ticket_baixo` | `breakEvenProcedures > 90% capacidade AND averageTicket < breakEven/120` | risk | critical |
| `boa_margem_mais_boa_seguranca` | `contributionMargin >= 60 AND safetyMargin >= 25` | opportunity | low |
| `custo_alto_mais_volume_critico` | `monthlyFixedCosts/ticket > 150 AND breakEvenProc > 70% capacidade` | costs | critical |
| `meta_ambiciosa_mais_volume_alto` | `targetProcedures > 90% capacidade AND desiredMonthlyProfit > 0` | strategy | high |
| `cenario_ideal_para_padronizar` | `status === 'excellent' AND safetyMargin >= 20` | standardization | low |
| `reestruturacao_urgente` | `status === 'critical' AND (currentRevenue < breakEven OR contributionMargin < 20)` | risk | critical |

---

## 10. Arquitetura Esperada

```
PontoEquilibrioInput
    ↓
calculatePontoEquilibrio()          ← calculator.ts
    ↓
diagnosePontoEquilibrio()           ← diagnostics.ts
    ↓
getPontoEquilibrioPlaybooks()       ← playbooks.ts
    ↓
runPontoEquilibrioSimulator()       ← orchestrator.ts
    ↓
generatePontoEquilibrioNarrative()  ← narrative.ts
    ↓
PontoEquilibrioSimulator.tsx        ← interface (Client Component)
```

**Estrutura de arquivos:**

```
src/features/ponto-de-equilibrio/
  index.ts                            ← já existe (stub)
  types.ts                            ← Bloco 2
  constants.ts                        ← Bloco 2
  calculator.ts                       ← Bloco 2
  diagnostics.ts                      ← Bloco 3
  playbooks.ts                        ← Bloco 4A + 4B
  orchestrator.ts                     ← Bloco 5
  narrative.ts                        ← Bloco 6
  PontoEquilibrioSimulator.tsx        ← Bloco 7

src/app/(public)/ponto-de-equilibrio/
  page.tsx                            ← Bloco 7 (atualizar)
```

---

## 11. Limitações do Modelo

### L1 — Custo variável como percentual único

O modelo usa um único percentual de custo variável para toda a produção. Na realidade, o custo variável varia por procedimento (um implante tem custo muito maior que uma consulta). A média é uma simplificação aceitável para visão geral, mas não substitui análise por procedimento.

### L2 — Ticket médio como constante

O ticket médio é tratado como constante. Alterações no mix de procedimentos (mais procedimentos simples ou mais complexos) mudam o ticket real sem que o modelo capture automaticamente.

### L3 — Sem sazonalidade

O modelo assume receita uniforme ao longo do mês. Meses com feriados ou com padrão de demanda diferente não são modelados separadamente.

### L4 — Não inclui tributos separados

Os tributos sobre faturamento devem ser incluídos no `averageVariableCostPercent` (Simples Nacional, IRPJ, etc.). O modelo não os separa, o que pode gerar interpretações distintas dependendo do regime tributário.

### L5 — Capacidade operacional é estimativa

A comparação de `breakEvenProcedures` com a capacidade operacional usa `workingDaysPerMonth × 6 atendimentos/dia` como referência geral. Clínicas especializadas ou com diferentes ritmos de agenda podem ter capacidades muito distintas.

### L6 — `desiredMonthlyProfit` não é pró-labore

O lucro desejado é adicional ao pró-labore que já deve estar em `monthlyFixedCosts`. Confundir os dois inflaciona a meta.

---

## 12. Exemplos Numéricos

### Exemplo A — Clínica equilibrada

| Campo | Valor |
|---|---|
| `monthlyFixedCosts` | R$ 40.000 |
| `averageVariableCostPercent` | 20% |
| `averageTicket` | R$ 500 |
| `currentMonthlyRevenue` | R$ 65.000 |
| `desiredMonthlyProfit` | R$ 15.000 |
| `workingDaysPerMonth` | 20 |

**Cálculos:**
- `contributionMarginPercent` = 100 − 20 = **80%**
- `contributionMarginRate` = **0,80**
- `breakEvenRevenue` = R$40.000 / 0,80 = **R$50.000**
- `targetRevenue` = (R$40.000 + R$15.000) / 0,80 = **R$68.750**
- `breakEvenProcedures` = R$50.000 / R$500 = **100 procedimentos**
- `targetProcedures` = R$68.750 / R$500 = **137,5 procedimentos**
- `dailyBreakEvenRevenue` = R$50.000 / 20 = **R$2.500/dia**
- `dailyTargetRevenue` = R$68.750 / 20 = **R$3.437,50/dia**
- `revenueGapAmount` = R$65.000 − R$50.000 = **+R$15.000**
- `revenueGapPercent` = R$15.000 / R$50.000 × 100 = **30%**
- `safetyMarginPercent` = R$15.000 / R$65.000 × 100 = **23,1%**

**Diagnóstico estimado:** `healthy` a `excellent` — boa margem, acima do equilíbrio, mas ainda abaixo da meta de lucro.

---

### Exemplo B — Operação crítica

| Campo | Valor |
|---|---|
| `monthlyFixedCosts` | R$ 60.000 |
| `averageVariableCostPercent` | 45% |
| `averageTicket` | R$ 350 |
| `currentMonthlyRevenue` | R$ 70.000 |
| `desiredMonthlyProfit` | R$ 20.000 |
| `workingDaysPerMonth` | 22 |

**Cálculos:**
- `contributionMarginPercent` = 100 − 45 = **55%**
- `contributionMarginRate` = **0,55**
- `breakEvenRevenue` = R$60.000 / 0,55 = **R$109.091**
- `targetRevenue` = (R$60.000 + R$20.000) / 0,55 = **R$145.455**
- `breakEvenProcedures` = R$109.091 / R$350 = **311,7 procedimentos**
- `dailyBreakEvenRevenue` = R$109.091 / 22 = **R$4.959/dia**
- `revenueGapAmount` = R$70.000 − R$109.091 = **−R$39.091** (prejuízo)
- `revenueGapPercent` = −R$39.091 / R$109.091 × 100 = **−35,8%**
- `safetyMarginPercent` = indefinido (está abaixo do breakeven)

**Diagnóstico estimado:** `critical` — faturamento atual 64% do ponto de equilíbrio, custo variável alto comprime a margem, volume de procedimentos necessário inviável (311/mês ≈ 14/dia em 22 dias).

---

### Exemplo C — Operação enxuta saudável

| Campo | Valor |
|---|---|
| `monthlyFixedCosts` | R$ 18.000 |
| `averageVariableCostPercent` | 15% |
| `averageTicket` | R$ 450 |
| `currentMonthlyRevenue` | R$ 35.000 |
| `desiredMonthlyProfit` | R$ 8.000 |
| `workingDaysPerMonth` | 18 |

**Cálculos:**
- `contributionMarginPercent` = 100 − 15 = **85%**
- `contributionMarginRate` = **0,85**
- `breakEvenRevenue` = R$18.000 / 0,85 = **R$21.176**
- `targetRevenue` = (R$18.000 + R$8.000) / 0,85 = **R$30.588**
- `breakEvenProcedures` = R$21.176 / R$450 = **47,1 procedimentos**
- `targetProcedures` = R$30.588 / R$450 = **68,0 procedimentos**
- `dailyBreakEvenRevenue` = R$21.176 / 18 = **R$1.176/dia**
- `revenueGapAmount` = R$35.000 − R$21.176 = **+R$13.824**
- `revenueGapPercent` = R$13.824 / R$21.176 × 100 = **65,3%**
- `safetyMarginPercent` = R$13.824 / R$35.000 × 100 = **39,5%**

**Diagnóstico estimado:** `excellent` — estrutura enxuta, alta margem de contribuição, faturamento 65% acima do equilíbrio, boa margem de segurança.

---

## 13. Roadmap de Implementação

| Bloco | Entregável |
|---|---|
| **Bloco 1** (este) | Escopo financeiro — documento técnico |
| **Bloco 2** | `types.ts`, `constants.ts`, `calculator.ts` |
| **Bloco 3** | `diagnostics.ts` |
| **Bloco 4A** | `playbooks.ts` — base (18 playbooks) |
| **Bloco 4B** | `playbooks.ts` — compostos (8 playbooks) |
| **Bloco 5** | `orchestrator.ts` |
| **Bloco 6** | `narrative.ts` |
| **Bloco 7** | `PontoEquilibrioSimulator.tsx` + atualização de `page.tsx` |
| **Bloco 8** | Integração final, homologação e release v1.3.0 |

---

## 14. Critérios de Avanço para o Bloco 2

- [x] Todos os inputs definidos com tipo e regra de validação
- [x] Todas as fórmulas documentadas com exemplos numéricos
- [x] Todos os outputs especificados com tipagem prevista
- [x] Critérios de diagnóstico definidos com limites numéricos
- [x] Playbooks base e compostos mapeados (26 total)
- [x] Limitações documentadas
- [x] Arquitetura de pastas confirmada
- [x] 3 exemplos numéricos com diagnóstico estimado
- [x] Documento aprovado para implementação

**O Bloco 2 pode ser iniciado.**
