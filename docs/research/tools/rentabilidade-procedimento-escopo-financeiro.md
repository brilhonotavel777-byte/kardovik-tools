# Calculadora de Rentabilidade por Procedimento — Escopo Financeiro

**Ferramenta:** Calculadora de Rentabilidade por Procedimento  
**Versão alvo:** v1.4.0  
**Bloco:** 1 — Escopo Financeiro  
**Status:** Aprovado para implementação  
**Data:** 2026-06-30

---

## 1. Visão Geral

A Calculadora de Rentabilidade por Procedimento responde à pergunta central:

> **"Este procedimento realmente dá lucro para a clínica?"**

Ela também responde perguntas derivadas:

- Qual é o custo total real do procedimento — incluindo materiais, tempo clínico e overhead fixo?
- Quanto sobra depois de todos os custos?
- Qual é a margem líquida real deste procedimento?
- Quanto o procedimento gera por hora clínica utilizada?
- O preço atual está saudável, pressionado ou crítico?
- Qual reajuste seria necessário para atingir a margem desejada?

---

## 2. Dor Resolvida

**Problema:** Dentistas e gestores frequentemente precificam procedimentos com base no mercado ou intuição, sem calcular o custo real que inclui o tempo clínico como insumo financeiro. Um procedimento pode parecer lucrativo pelo preço cobrado, mas gerar prejuízo real quando o custo da hora clínica e os custos fixos são contabilizados adequadamente.

**Consequências:**
- Procedimentos deficitários perpetuados na tabela por falta de diagnóstico financeiro
- Decisões de investimento em equipamentos ou capacitação sem base em rentabilidade real
- Mix de procedimentos que não maximiza o retorno por hora clínica disponível
- Precificação que cobre materiais mas não remunera o tempo do profissional

**O que a ferramenta entrega:**
- Custo total do procedimento (variável + tempo clínico + overhead fixo)
- Lucro bruto e lucro líquido por procedimento
- Margem de lucro percentual real
- Rentabilidade por hora clínica
- ROI operacional do procedimento
- Preço mínimo sustentável (breakeven por procedimento)
- Preço sugerido para atingir a margem desejada
- Diagnóstico com playbooks práticos

---

## 3. Público-Alvo

| Perfil | Uso principal |
|---|---|
| Dentista autônomo | Avaliar se cada procedimento da tabela realmente compensa financeiramente |
| Dono de clínica | Identificar quais procedimentos mais contribuem para o resultado |
| Gestor administrativo | Orientar o mix de procedimentos para maximizar rentabilidade por hora |
| Estudante de odontologia | Aprender a pensar financeiramente sobre a prática clínica |

---

## 4. Conceitos Financeiros

### 4.1 Receita do Procedimento

O valor cobrado do paciente pelo procedimento. É o topo da cascata financeira.

### 4.2 Custo Variável Direto

Todos os custos que existem especificamente por causa deste procedimento: materiais consumíveis, trabalhos de laboratório, insumos específicos, repasses a especialistas. Varia diretamente com o volume do procedimento.

### 4.3 Custo do Tempo Clínico

O custo real do tempo de cadeira alocado ao procedimento, calculado a partir da hora clínica da Calculadora de Hora Clínica. Representa o insumo mais frequentemente ignorado na precificação.

### 4.4 Alocação de Custo Fixo

Fração dos custos fixos da clínica que pode ser atribuída ao procedimento (aluguel, energia, salários administrativos, etc.). Pode ser calculada proporcionalmente ao tempo ou informada como valor médio por procedimento.

### 4.5 Custo Total

Soma de todos os custos imputáveis ao procedimento: variável + tempo clínico + custo fixo alocado.

### 4.6 Lucro Bruto

Receita menos apenas o custo variável direto. Representa a contribuição do procedimento antes de considerar o tempo clínico e os custos fixos.

### 4.7 Lucro Líquido

Receita menos o custo total (variável + tempo clínico + fixo alocado). É o lucro real do procedimento após todos os custos imputáveis.

### 4.8 Margem de Lucro

Percentual do preço do procedimento que se converte em lucro líquido. Principal indicador de rentabilidade do procedimento.

### 4.9 Rentabilidade por Hora

Lucro líquido gerado por hora de cadeira alocada ao procedimento. Permite comparar procedimentos de durações diferentes em uma base comum (hora clínica).

### 4.10 ROI Operacional

Retorno percentual sobre o custo total investido no procedimento. Indica o retorno gerado por cada real de custo.

### 4.11 Gap para Margem Desejada

Diferença entre a margem real e a margem desejada. Positivo = está acima da meta. Negativo = abaixo da meta.

### 4.12 Preço Mínimo Sustentável

O preço mínimo que cobre todos os custos do procedimento sem gerar lucro. É o piso financeiro.

### 4.13 Preço Sugerido com Margem Desejada

O preço que, ao cobrir todos os custos, ainda entrega a margem de lucro desejada.

---

## 5. Inputs Oficiais

### 5.1 Definição dos campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `procedurePrice` | `number` | Sim | Preço cobrado pelo procedimento em R$ |
| `procedureVariableCost` | `number` | Sim | Custo variável direto do procedimento em R$ |
| `procedureDurationMinutes` | `number` | Sim | Duração clínica do procedimento em minutos |
| `hourlyClinicalCost` | `number` | Sim | Custo da hora clínica em R$/h (da Hora Clínica Calculator) |
| `fixedCostAllocation` | `number` | Não | Alocação de custo fixo por procedimento em R$ (default 0) |
| `desiredProfitMarginPercent` | `number` | Não | Margem de lucro desejada em % (default 30) |

### 5.2 Semântica dos campos

**`procedurePrice`**  
Valor líquido recebido pelo procedimento. Deve refletir o preço real praticado, não o preço de tabela se houver descontos frequentes.

**`procedureVariableCost`**  
Inclui materiais de consumo direto (resina, anestésico, membranas, implante, prótese do lab), laboratórios terceirizados, CBCT, exames e repasses. Deve ser o custo real por procedimento executado.

**`procedureDurationMinutes`**  
Tempo de cadeira incluindo preparo e finalização do procedimento. Não inclui tempo administrativo. Deve refletir o tempo real, não o tempo ideal.

**`hourlyClinicalCost`**  
Custo que a clínica atribui a cada hora de cadeira ocupada. Idealmente obtido da Calculadora de Hora Clínica do mesmo ecossistema. Inclui rateio dos custos fixos sobre as horas produtivas.

**`fixedCostAllocation`**  
Parcela adicional de custo fixo que o gestor decide alocar explicitamente ao procedimento. Pode ser zero se o `hourlyClinicalCost` já incorpora a alocação de custos fixos.

**`desiredProfitMarginPercent`**  
Meta de margem líquida sobre o preço do procedimento. Representa quanto do preço deve se converter em lucro após todos os custos.

### 5.3 Defaults sugeridos

| Campo | Default |
|---|---|
| `fixedCostAllocation` | `0` |
| `desiredProfitMarginPercent` | `30` |

### 5.4 Limites de validação

| Campo | Mínimo | Máximo | Observação |
|---|---|---|---|
| `procedurePrice` | 0.01 | — | Deve ser positivo |
| `procedureVariableCost` | 0 | — | Pode ser zero |
| `procedureDurationMinutes` | 1 | — | Ao menos 1 minuto |
| `hourlyClinicalCost` | 0.01 | — | Deve ser positivo |
| `fixedCostAllocation` | 0 | — | Pode ser zero |
| `desiredProfitMarginPercent` | 0 | 94.99 | Próximo de 95% gera `suggestedPrice` inviável |

---

## 6. Fórmulas Conceituais

### 6.1 Duração em horas

```
procedureDurationHours = procedureDurationMinutes / 60
```

**Explicação:** Converte a duração do procedimento para horas, unidade do custo clínico.

---

### 6.2 Custo do tempo clínico

```
clinicalTimeCost = procedureDurationHours * hourlyClinicalCost
```

**Explicação:** Quanto custa o tempo de cadeira alocado ao procedimento. Se a hora clínica custa R$300 e o procedimento dura 45 min, o custo do tempo é R$225.

---

### 6.3 Custo total

```
totalCost = procedureVariableCost + clinicalTimeCost + fixedCostAllocation
```

**Explicação:** Soma de todos os custos imputáveis ao procedimento. É o piso financeiro absoluto.

---

### 6.4 Lucro bruto

```
grossProfit = procedurePrice - procedureVariableCost
```

**Explicação:** Quanto sobra após pagar apenas os materiais e custos variáveis diretos. Não considera tempo clínico nem custos fixos.

---

### 6.5 Lucro líquido

```
netProfit = procedurePrice - totalCost
```

**Explicação:** Lucro real após todos os custos. Pode ser negativo se o preço não cobre o custo total.

---

### 6.6 Margem de lucro

```
profitMarginPercent = (netProfit / procedurePrice) * 100
```

**Explicação:** Percentual do preço que se converte em lucro real. Valor negativo = prejuízo.

**Pré-condição:** `procedurePrice > 0`

---

### 6.7 Rentabilidade por hora

```
profitPerHour = netProfit / procedureDurationHours
```

**Explicação:** Quanto de lucro líquido o procedimento gera por hora de cadeira. Base de comparação entre procedimentos de durações diferentes.

**Pré-condição:** `procedureDurationHours > 0`

---

### 6.8 ROI operacional

```
operationalRoiPercent =
  totalCost > 0
    ? (netProfit / totalCost) * 100
    : 0
```

**Explicação:** Retorno percentual sobre o custo total investido. Positivo = retorno sobre o investimento. Negativo = prejuízo.

---

### 6.9 Preço mínimo sustentável

```
minimumSustainablePrice = totalCost
```

**Explicação:** O preço que cobre exatamente todos os custos sem gerar lucro. Qualquer preço abaixo gera prejuízo.

---

### 6.10 Preço sugerido com margem desejada

```
suggestedPrice = totalCost / (1 - desiredProfitMarginPercent / 100)
```

**Explicação:** O preço que, após cobrir todos os custos, ainda entrega a margem desejada. Mesmo lógica da Calculadora de Precificação mas aplicada por procedimento.

**Pré-condição:** `desiredProfitMarginPercent < 100`

---

### 6.11 Gap para margem desejada

```
marginGapPercent = profitMarginPercent - desiredProfitMarginPercent
```

**Explicação:** Positivo = está acima da meta (procedimento supera a expectativa). Negativo = abaixo da meta (ajuste necessário).

---

### 6.12 Reajuste necessário no preço

```
priceAdjustmentNeeded = suggestedPrice - procedurePrice
```

**Explicação:** Quanto o preço precisaria ser aumentado para atingir a margem desejada. Negativo = preço já supera o sugerido.

---

## 7. Outputs Previstos

### 7.1 Tipo — `RentabilidadeProcedimentoCalculationResult`

```typescript
interface RentabilidadeProcedimentoCalculationResult {
  // Inputs espelhados
  procedurePrice: number
  procedureVariableCost: number
  procedureDurationMinutes: number
  hourlyClinicalCost: number
  fixedCostAllocation: number
  desiredProfitMarginPercent: number

  // Calculados
  procedureDurationHours: number
  clinicalTimeCost: number
  totalCost: number
  grossProfit: number
  netProfit: number
  profitMarginPercent: number
  profitPerHour: number
  operationalRoiPercent: number
  minimumSustainablePrice: number
  suggestedPrice: number
  marginGapPercent: number
  priceAdjustmentNeeded: number
}
```

### 7.2 MetricCards previstos na interface (8 cards)

| Card | Campo | Destaque |
|---|---|---|
| Receita do procedimento | `procedurePrice` | Neutro |
| Custo total | `totalCost` | Warning se > 80% do preço |
| Lucro líquido | `netProfit` | Accent se positivo, Warning se negativo |
| Margem líquida | `profitMarginPercent` | Accent se ≥ desejada |
| Rentabilidade por hora | `profitPerHour` | Accent |
| ROI operacional | `operationalRoiPercent` | Positivo se > 0 |
| Preço mínimo sustentável | `minimumSustainablePrice` | Neutro |
| Preço sugerido | `suggestedPrice` | Referência |

---

## 8. Critérios Futuros de Diagnóstico

### 8.1 Status possíveis

`excellent` | `healthy` | `attention` | `critical`

### 8.2 Avaliadores independentes

**Avaliador 1 — Margem de Lucro** (`profit-margin`)

| Condição | Severity | Título |
|---|---|---|
| `profitMarginPercent >= desiredMargin` | success | "Margem de lucro atingida" |
| `profitMarginPercent >= desiredMargin * 0.7` | info | "Margem próxima da meta" |
| `profitMarginPercent >= 0` | warning | "Margem positiva mas abaixo da meta" |
| `profitMarginPercent < 0` | danger | "Procedimento gerando prejuízo" |

**Avaliador 2 — Rentabilidade por Hora** (`profit-per-hour`)

*(Referência: comparar `profitPerHour` com `hourlyClinicalCost`)*

| Condição | Severity | Título |
|---|---|---|
| `profitPerHour >= hourlyClinicalCost` | success | "Rentabilidade por hora saudável" |
| `profitPerHour >= hourlyClinicalCost * 0.5` | info | "Rentabilidade por hora moderada" |
| `profitPerHour > 0` | warning | "Rentabilidade por hora baixa" |
| `profitPerHour <= 0` | danger | "Sem rentabilidade por hora" |

**Avaliador 3 — Peso dos Custos Variáveis** (`variable-cost-weight`)

*(Referência: `procedureVariableCost / procedurePrice`)*

| Condição | Severity | Título |
|---|---|---|
| `ratio <= 0.25` | success | "Custos variáveis controlados" |
| `ratio <= 0.40` | info | "Custos variáveis administráveis" |
| `ratio <= 0.60` | warning | "Custos variáveis elevados" |
| `ratio > 0.60` | danger | "Custos variáveis críticos" |

**Avaliador 4 — ROI Operacional** (`operational-roi`)

| Condição | Severity | Título |
|---|---|---|
| `operationalRoiPercent >= 40` | success | "ROI operacional saudável" |
| `operationalRoiPercent >= 15` | info | "ROI operacional moderado" |
| `operationalRoiPercent > 0` | warning | "ROI operacional baixo" |
| `operationalRoiPercent <= 0` | danger | "ROI operacional negativo" |

**Avaliador 5 — Gap da Margem Desejada** (`margin-gap`)

| Condição | Severity | Título |
|---|---|---|
| `marginGapPercent >= 0` | success | "Margem desejada atingida" |
| `marginGapPercent >= -10` | info | "Margem próxima da meta" |
| `marginGapPercent >= -20` | warning | "Margem abaixo da meta" |
| `marginGapPercent < -20` | danger | "Margem muito abaixo da meta" |

### 8.3 Score 0–100

```
score = 100

// Margem de lucro
- profitMarginPercent < desiredMargin: -10
- profitMarginPercent < desiredMargin * 0.7: -15 adicionais
- profitMarginPercent < 0: -20 adicionais

// ROI operacional
- operationalRoiPercent < 40: -8
- operationalRoiPercent < 15: -12 adicionais
- operationalRoiPercent <= 0: -20 adicionais

// Peso dos custos variáveis
- variableCostRatio > 0.40: -6
- variableCostRatio > 0.60: -10 adicionais

// Rentabilidade por hora
- profitPerHour < hourlyClinicalCost: -6
- profitPerHour < hourlyClinicalCost * 0.5: -10 adicionais
- profitPerHour <= 0: -15 adicionais

// Gap da margem desejada
- marginGapPercent < -10: -6
- marginGapPercent < -20: -12 adicionais

clamp: max(0, min(100, round(score)))
```

### 8.4 Status

| Score | Status |
|---|---|
| ≥ 80 | `excellent` |
| ≥ 60 | `healthy` |
| ≥ 40 | `attention` |
| < 40 | `critical` |

### 8.5 Force-critical

- `netProfit < 0` — procedimento gera prejuízo
- `profitMarginPercent < 0` — margem negativa
- `totalCost >= procedurePrice` — preço não cobre custos
- `operationalRoiPercent <= -20` — ROI muito negativo

---

## 9. Playbooks Previstos

### 9.1 Base (18)

| ID | Condição | Categoria | Prioridade |
|---|---|---|---|
| `margem_saudavel` | `marginGapPercent >= 0` | opportunity | low |
| `margem_proxima_da_meta` | `marginGapPercent >= -10 AND < 0` | margin | medium |
| `margem_pressionada` | `marginGapPercent >= -20 AND < -10` | margin | high |
| `margem_critica` | `marginGapPercent < -20` | risk | critical |
| `procedimento_com_prejuizo` | `netProfit < 0` | risk | critical |
| `roi_saudavel` | `operationalRoiPercent >= 40` | opportunity | low |
| `roi_moderado` | `operationalRoiPercent >= 15 AND < 40` | roi | medium |
| `roi_baixo` | `operationalRoiPercent > 0 AND < 15` | roi | high |
| `roi_negativo` | `operationalRoiPercent <= 0` | risk | critical |
| `custo_variavel_controlado` | `variableCostRatio <= 0.25` | opportunity | low |
| `custo_variavel_elevado` | `variableCostRatio > 0.40 AND <= 0.60` | costs | high |
| `custo_variavel_critico` | `variableCostRatio > 0.60` | risk | critical |
| `rentabilidade_hora_saudavel` | `profitPerHour >= hourlyClinicalCost` | opportunity | low |
| `rentabilidade_hora_baixa` | `profitPerHour > 0 AND < hourlyClinicalCost` | time | medium |
| `rentabilidade_hora_negativa` | `profitPerHour <= 0` | risk | critical |
| `preco_abaixo_do_sustentavel` | `procedurePrice < minimumSustainablePrice` | pricing | critical |
| `preco_entre_minimo_e_sugerido` | `procedurePrice >= minimumSustainablePrice AND < suggestedPrice` | pricing | high |
| `procedimento_para_padronizar` | `diagnostic.status === 'excellent'` | standardization | low |

### 9.2 Compostos (8)

| ID | Condições | Categoria | Prioridade |
|---|---|---|---|
| `margem_baixa_mais_custo_alto` | `marginGapPercent < -10 AND variableCostRatio > 0.40` | risk | critical |
| `lucro_negativo_mais_tempo_alto` | `netProfit < 0 AND procedureDurationMinutes > 60` | risk | critical |
| `preco_baixo_mais_margem_alta_desejada` | `procedurePrice < suggestedPrice AND desiredMargin > 30` | pricing | critical |
| `custo_variavel_alto_mais_roi_baixo` | `variableCostRatio > 0.50 AND operationalRoiPercent < 15` | costs | high |
| `procedimento_inviavel_sem_reajuste` | `netProfit < 0 OR totalCost >= procedurePrice` | risk | critical |
| `procedimento_saudavel_para_escala` | `status === 'excellent' AND profitPerHour >= hourlyClinicalCost` | opportunity | low |
| `tempo_alto_mais_profit_hora_baixo` | `procedureDurationMinutes > 90 AND profitPerHour < hourlyClinicalCost * 0.5` | time | high |
| `reprecificacao_prioritaria` | `status === 'critical' AND priceAdjustmentNeeded > procedurePrice * 0.20` | pricing | critical |

---

## 10. Arquitetura Esperada

```
RentabilidadeProcedimentoInput
    ↓
calculateRentabilidadeProcedimento()     ← calculator.ts
    ↓
diagnoseRentabilidadeProcedimento()      ← diagnostics.ts
    ↓
getRentabilidadeProcedimentoPlaybooks()  ← playbooks.ts
    ↓
runRentabilidadeProcedimentoSimulator()  ← orchestrator.ts
    ↓
generateRentabilidadeNarrative()         ← narrative.ts
    ↓
RentabilidadeProcedimentoSimulator.tsx   ← interface
```

**Estrutura de arquivos:**

```
src/features/rentabilidade-procedimento/
  index.ts                                     ← já existe (stub)
  types.ts                                     ← Bloco 2
  constants.ts                                 ← Bloco 2
  calculator.ts                                ← Bloco 2
  diagnostics.ts                               ← Bloco 3
  playbooks.ts                                 ← Bloco 4
  orchestrator.ts                              ← Bloco 5
  narrative.ts                                 ← Bloco 6
  RentabilidadeProcedimentoSimulator.tsx       ← Bloco 7

src/app/(public)/rentabilidade/
  page.tsx                                     ← Bloco 7 (atualizar)
```

---

## 11. Limitações do Modelo

### L1 — Custo variável como valor único

O modelo aceita um único valor de custo variável por procedimento. Não decompõe materiais, laboratório e repasses separadamente. Isso simplifica a entrada mas reduz a granularidade do diagnóstico.

### L2 — Alocação de custo fixo por procedimento

A alocação de custo fixo é inserida manualmente como valor por procedimento. O cálculo mais preciso envolveria dividir os custos fixos totais pelas horas produtivas disponíveis e multiplicar pelo tempo do procedimento — que já é, em parte, capturado pelo `hourlyClinicalCost` da Calculadora de Hora Clínica. O `fixedCostAllocation` opcional serve para double-counting intencional ou ajustes específicos.

### L3 — `hourlyClinicalCost` sem integração direta

O campo `hourlyClinicalCost` é inserido manualmente. Idealmente virá da Calculadora de Hora Clínica, mas por enquanto não há integração automática. O usuário deve anotar o valor calculado na outra ferramenta.

### L4 — Sem modelagem de sazonalidade ou volume

O modelo avalia um procedimento isoladamente, sem considerar o mix de procedimentos do mês, sazonalidade ou impacto em volume sobre os custos fixos unitários.

### L5 — `suggestedPrice` pode ser inviável de mercado

O preço sugerido pela fórmula pode ser muito acima do mercado local. A ferramenta entrega o número correto financeiramente, mas a viabilidade comercial é responsabilidade do gestor.

### L6 — `desiredProfitMarginPercent` não pode se aproximar de 100%

Com margem desejada próxima de 95% ou mais, `suggestedPrice` tende ao infinito. A validação deve bloquear valores ≥ 95%.

---

## 12. Exemplos Numéricos

### Exemplo A — Procedimento saudável

| Campo | Valor |
|---|---|
| `procedurePrice` | R$ 800 |
| `procedureVariableCost` | R$ 180 |
| `procedureDurationMinutes` | 60 min |
| `hourlyClinicalCost` | R$ 250 |
| `fixedCostAllocation` | R$ 70 |
| `desiredProfitMarginPercent` | 30% |

**Cálculos:**
- `procedureDurationHours` = 60/60 = **1,00h**
- `clinicalTimeCost` = 1,00 × R$250 = **R$250,00**
- `totalCost` = R$180 + R$250 + R$70 = **R$500,00**
- `grossProfit` = R$800 − R$180 = **R$620,00**
- `netProfit` = R$800 − R$500 = **R$300,00**
- `profitMarginPercent` = R$300/R$800 × 100 = **37,5%**
- `profitPerHour` = R$300/1h = **R$300,00/h**
- `operationalRoiPercent` = R$300/R$500 × 100 = **60%**
- `minimumSustainablePrice` = **R$500,00**
- `suggestedPrice` = R$500/(1−0,30) = **R$714,29**
- `marginGapPercent` = 37,5 − 30 = **+7,5%** (acima da meta)
- `priceAdjustmentNeeded` = R$714,29 − R$800 = **−R$85,71** (preço já supera o sugerido)

**Diagnóstico estimado:** `excellent` — margem real (37,5%) supera a desejada (30%), ROI de 60%, preço acima do sugerido.

---

### Exemplo B — Procedimento pressionado

| Campo | Valor |
|---|---|
| `procedurePrice` | R$ 500 |
| `procedureVariableCost` | R$ 220 |
| `procedureDurationMinutes` | 90 min |
| `hourlyClinicalCost` | R$ 280 |
| `fixedCostAllocation` | R$ 60 |
| `desiredProfitMarginPercent` | 30% |

**Cálculos:**
- `procedureDurationHours` = 90/60 = **1,50h**
- `clinicalTimeCost` = 1,50 × R$280 = **R$420,00**
- `totalCost` = R$220 + R$420 + R$60 = **R$700,00**
- `netProfit` = R$500 − R$700 = **−R$200,00** ← **PREJUÍZO**
- `profitMarginPercent` = −R$200/R$500 × 100 = **−40%**
- `profitPerHour` = −R$200/1,5h = **−R$133,33/h**
- `operationalRoiPercent` = −R$200/R$700 × 100 = **−28,57%**
- `minimumSustainablePrice` = **R$700,00**
- `suggestedPrice` = R$700/(1−0,30) = **R$1.000,00**
- `priceAdjustmentNeeded` = R$1.000 − R$500 = **+R$500,00** (precisa dobrar o preço)

**Diagnóstico estimado:** `critical` (force: `netProfit < 0`) — procedimento gera prejuízo de R$200. O custo do tempo clínico (1,5h × R$280) sozinho já supera o preço cobrado.

---

### Exemplo C — Procedimento em atenção

| Campo | Valor |
|---|---|
| `procedurePrice` | R$ 350 |
| `procedureVariableCost` | R$ 190 |
| `procedureDurationMinutes` | 90 min |
| `hourlyClinicalCost` | R$ 300 |
| `fixedCostAllocation` | R$ 80 |
| `desiredProfitMarginPercent` | 30% |

**Cálculos:**
- `procedureDurationHours` = 1,50h
- `clinicalTimeCost` = 1,50 × R$300 = **R$450,00**
- `totalCost` = R$190 + R$450 + R$80 = **R$720,00**
- `netProfit` = R$350 − R$720 = **−R$370,00** ← **PREJUÍZO GRAVE**
- `profitMarginPercent` = **−105,7%**
- `profitPerHour` = **−R$246,67/h**
- `minimumSustainablePrice` = **R$720,00**
- `suggestedPrice` = R$720/(0,70) = **R$1.028,57**
- `priceAdjustmentNeeded` = **+R$678,57** (quase o triplo do preço atual)
- `variableCostRatio` = R$190/R$350 = **54,3%** (crítico)

**Diagnóstico estimado:** `critical` — prejuízo grave com custo variável elevado (54%) e tempo clínico longo. Procedimento inviável no preço atual.

---

## 13. Roadmap v1.4.0

| Bloco | Entregável |
|---|---|
| **Bloco 1** (este) | Escopo financeiro — documento técnico |
| **Bloco 2** | `types.ts`, `constants.ts`, `calculator.ts` |
| **Bloco 3** | `diagnostics.ts` |
| **Bloco 4** | `playbooks.ts` (18 base + 8 compostos) |
| **Bloco 5** | `orchestrator.ts` |
| **Bloco 6** | `narrative.ts` |
| **Bloco 7** | `RentabilidadeProcedimentoSimulator.tsx` + `page.tsx` |
| **Bloco 8** | Integração final, homologação e release v1.4.0 |

---

## 14. Critérios de Avanço para o Bloco 2

- [x] Todos os inputs definidos com tipo e regra de validação
- [x] Todas as fórmulas documentadas com exemplos numéricos
- [x] Todos os outputs especificados com tipagem prevista
- [x] Critérios de diagnóstico definidos com limites numéricos
- [x] Playbooks base e compostos mapeados (26 total)
- [x] Force-critical definido (4 condições)
- [x] Limitações documentadas (6 itens)
- [x] Arquitetura de pastas confirmada
- [x] 3 exemplos numéricos com diagnóstico estimado
- [x] Documento aprovado para implementação

**O Bloco 2 pode ser iniciado.**
