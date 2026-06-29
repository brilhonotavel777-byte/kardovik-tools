# Calculadora de Hora Clínica — Escopo Financeiro

**Ferramenta:** Calculadora de Hora Clínica  
**Versão alvo:** v1.2.0  
**Bloco:** 1 — Escopo Financeiro  
**Status:** Aprovado para implementação  
**Data:** 2026-06-29

---

## 1. Visão Geral

A Calculadora de Hora Clínica responde à pergunta central:

> **"Quanto custa, de forma real, cada hora de atendimento da clínica e quanto cada hora precisa produzir para sustentar uma operação financeiramente saudável?"**

A ferramenta permite ao gestor odontológico compreender o custo real do tempo clínico **antes** de precificar qualquer procedimento. Ela é o insumo fundamental para a Calculadora de Precificação Odontológica: sem saber o custo da hora, é impossível precificar com precisão.

---

## 2. Dor Resolvida

**Problema:** A maioria dos dentistas e gestores de clínica precifica procedimentos sem considerar o custo real da hora clínica. Eles somam materiais e laboratório, mas ignoram o custo fixo por hora, a ociosidade de agenda e a meta de lucro necessária para sustentabilidade.

**Consequência:** Procedimentos que parecem lucrativos podem estar gerando prejuízo oculto, pois o tempo clínico não é contabilizado como insumo financeiro.

**O que a ferramenta entrega:**
- Custo real de cada hora de cadeira ocupada
- Horas produtivas disponíveis por mês
- Capacidade máxima de produção mensal
- Receita mínima por hora para cobrir custos
- Receita recomendada por hora para atingir a meta de lucro
- Diagnóstico da saúde financeira operacional
- Orientações práticas para melhora

---

## 3. Público-Alvo

| Perfil | Uso principal |
|---|---|
| Dentista autônomo | Entender o custo real da agenda |
| Dono de clínica | Avaliar eficiência operacional |
| Gestor administrativo | Definir metas de faturamento |
| Estudante de odontologia | Aprender gestão financeira antes de abrir clínica |

---

## 4. Conceitos Financeiros Fundamentais

### 4.1 Hora Clínica

A hora clínica é a unidade fundamental de tempo do dentista na cadeira atendendo pacientes. Cada hora tem um **custo real** associado (custos fixos + variáveis distribuídos sobre o tempo disponível) e precisa gerar uma **receita mínima** para cobrir esse custo.

### 4.2 Horas Disponíveis

Total de horas que a clínica/profissional está tecnicamente aberto para atendimento por mês. Calculado a partir dos dias úteis e horas por dia.

### 4.3 Horas Efetivamente Produtivas

Subconjunto das horas disponíveis que é efetivamente preenchido por atendimentos. Determinado pela taxa de ocupação da agenda. Uma taxa de 70% significa que 30% das horas disponíveis ficam ociosas.

### 4.4 Taxa de Ocupação

Percentual médio da agenda que está preenchida com atendimentos reais. É um dos principais indicadores de saúde operacional. Varia por perfil da clínica, especialidade e estratégia comercial.

### 4.5 Custo Total Mensal

Soma de todos os custos operacionais mensais: fixos (aluguel, salários, contas) e variáveis (materiais, consumíveis, comissões). É a base para qualquer cálculo de hora clínica.

### 4.6 Custo da Hora Clínica

Custo total mensal distribuído pelas horas efetivamente produtivas. Representa quanto a clínica "gasta" a cada hora de atendimento, independente do procedimento realizado.

### 4.7 Faturamento Mínimo

Quanto a clínica precisa faturar **por hora de atendimento** apenas para cobrir os custos, sem gerar lucro. É o piso financeiro da operação.

### 4.8 Faturamento Recomendado

Quanto a clínica precisa faturar por hora para cobrir custos E atingir a meta de lucro desejada. É o valor de referência para precificação de procedimentos.

---

## 5. Inputs Oficiais

### 5.1 Definição dos campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `workingDaysPerMonth` | `number` | Sim | Dias trabalhados por mês |
| `hoursPerDay` | `number` | Sim | Horas clínicas por dia (tempo de cadeira) |
| `occupancyRatePercent` | `number` | Sim | Taxa média de ocupação da agenda (%) |
| `monthlyFixedCosts` | `number` | Sim | Custos fixos mensais em R$ |
| `monthlyVariableCosts` | `number` | Sim | Custos variáveis mensais em R$ |
| `desiredMonthlyProfit` | `number` | Não | Meta de lucro mensal em R$ (default 0) |

### 5.2 Semântica dos campos

**`workingDaysPerMonth`**  
Quantidade de dias em que a clínica realiza atendimentos por mês. Exclui fins de semana (quando não atende), feriados e folgas planejadas. Uma clínica que atende de segunda a sexta, com ~1 feriado e 1 folga por mês, tem em torno de 20 dias úteis.

**`hoursPerDay`**  
Horas de cadeira disponíveis por dia. Não inclui horário administrativo, reuniões, planejamento. Uma clínica que abre às 8h e fecha às 18h com 1h de almoço tem **9 horas disponíveis**, mas o profissional pode optar por declarar apenas as horas em que realiza atendimentos efetivos.

**`occupancyRatePercent`**  
Taxa média de ocupação da agenda. Reflete quantos por cento das horas disponíveis são efetivamente preenchidas com atendimentos. Inclui tempo entre pacientes, cancelamentos e encaixes não realizados. Deve ser um número real da clínica, não uma projeção otimista.

**`monthlyFixedCosts`**  
Todos os custos que existem independente do número de atendimentos: aluguel, salários fixos, pró-labore, equipamentos (depreciação ou financiamento), seguro, contador, softwares, assinaturas, limpeza, energia fixa, telefone.

**`monthlyVariableCosts`**  
Custos que variam com o volume de atendimentos: materiais consumíveis, luvas, máscaras, anestésicos, descartáveis por paciente, comissões sobre atendimentos, lavanderia de aventais. Em uma estimativa simplificada, pode ser informado como média mensal.

**`desiredMonthlyProfit`**  
Meta de lucro líquido mensal que o gestor deseja extrair da operação. Não é pró-labore (que já está nos custos fixos), mas sim o retorno sobre o investimento da clínica. Campo opcional — quando omitido ou zero, a calculadora mostra apenas o ponto de equilíbrio.

### 5.3 Defaults sugeridos na interface

| Campo | Default | Justificativa |
|---|---|---|
| `workingDaysPerMonth` | 20 | Média de dias úteis mensais |
| `hoursPerDay` | 8 | Jornada clínica comum |
| `occupancyRatePercent` | 70 | Taxa realista para clínicas estabelecidas |
| `monthlyFixedCosts` | — | Sem default (muito variável por perfil) |
| `monthlyVariableCosts` | — | Sem default (variável por volume) |
| `desiredMonthlyProfit` | 0 | Começa sem meta de lucro (só ponto de equilíbrio) |

### 5.4 Limites de validação

| Campo | Mínimo | Máximo | Observação |
|---|---|---|---|
| `workingDaysPerMonth` | 1 | 31 | Inteiro positivo |
| `hoursPerDay` | 0.5 | 16 | Mínimo 30 min, máximo razoável |
| `occupancyRatePercent` | 1 | 100 | Não pode ser 0% (sem sentido operacional) |
| `monthlyFixedCosts` | 0 | — | Pode ser 0 em casos extremos |
| `monthlyVariableCosts` | 0 | — | Pode ser 0 |
| `desiredMonthlyProfit` | 0 | — | Não pode ser negativo |

---

## 6. Fórmulas Conceituais

### 6.1 Horas disponíveis por mês

```
totalAvailableHours = workingDaysPerMonth × hoursPerDay
```

**Explicação financeira:** Capacidade bruta de produção. Representa o teto máximo de horas de atendimento possíveis se a agenda fosse 100% preenchida. É o denominador base para todos os cálculos de ocupação.

**Exemplo:** 20 dias × 8h = 160 horas disponíveis/mês.

---

### 6.2 Horas efetivamente produtivas

```
productiveHours = totalAvailableHours × (occupancyRatePercent / 100)
```

**Explicação financeira:** Horas de cadeira efetivamente ocupadas por atendimentos. É sobre esse número que os custos precisam ser distribuídos — pagar os custos fixos com menos horas produtivas significa um custo por hora maior.

**Exemplo:** 160h × 0,70 = 112 horas produtivas/mês.

---

### 6.3 Custo total mensal

```
totalMonthlyCost = monthlyFixedCosts + monthlyVariableCosts
```

**Explicação financeira:** A soma de todos os desembolsos operacionais mensais da clínica, independente do volume de atendimentos (fixos) e proporcionais ao volume (variáveis). É o numerador base para o cálculo do custo da hora.

**Exemplo:** R$ 8.000 fixos + R$ 2.000 variáveis = R$ 10.000/mês.

---

### 6.4 Custo da hora clínica

```
clinicalHourCost = totalMonthlyCost / productiveHours
```

**Explicação financeira:** Quanto a clínica "gasta" a cada hora de atendimento realizado. Se 100% das horas disponíveis fossem produtivas, o custo por hora seria menor. A ociosidade de agenda eleva o custo da hora porque os mesmos custos fixos precisam ser cobertos por menos horas.

**Exemplo:** R$ 10.000 / 112h = **R$ 89,29/hora**.

---

### 6.5 Receita mínima por hora

```
minimumHourlyRevenue = clinicalHourCost
```

**Explicação financeira:** O valor mínimo que cada hora produtiva precisa gerar para que a clínica cubra exatamente seus custos operacionais — sem lucro, sem prejuízo. É o piso absoluto de faturamento por hora.

**Exemplo:** **R$ 89,29/hora** — qualquer atendimento abaixo disso gera prejuízo operacional.

---

### 6.6 Receita recomendada por hora

```
recommendedHourlyRevenue = (totalMonthlyCost + desiredMonthlyProfit) / productiveHours
```

**Explicação financeira:** Quanto cada hora produtiva precisa faturar para cobrir todos os custos E gerar o lucro mensal desejado. É o valor de referência para precificação de procedimentos quando se deseja uma operação lucrativa.

**Exemplo:** (R$ 10.000 + R$ 3.000) / 112h = **R$ 116,07/hora**.

---

### 6.7 Capacidade máxima mensal

```
monthlyCapacity = totalAvailableHours × recommendedHourlyRevenue
```

**Explicação financeira:** Potencial máximo de faturamento se a agenda estivesse 100% ocupada ao preço recomendado. Serve como teto e como benchmark de eficiência.

**Exemplo:** 160h × R$ 116,07 = **R$ 18.571/mês** (capacidade máxima).

---

### 6.8 Receita mínima mensal total

```
minimumMonthlyRevenue = minimumHourlyRevenue × productiveHours
```

**Verificação:** `minimumMonthlyRevenue` deve ser igual a `totalMonthlyCost` (por construção).

---

### 6.9 Gap de ociosidade

```
idleHours = totalAvailableHours - productiveHours
idleHoursCost = idleHours × clinicalHourCost
```

**Explicação financeira:** Custo real das horas ociosas — o quanto a clínica "perde" financeiramente com a agenda não preenchida. Auxilia na decisão de estratégias de captação e retenção de pacientes.

**Exemplo:** 48h ociosas × R$ 89,29 = **R$ 4.286/mês** em custo de ociosidade.

---

## 7. Outputs Previstos

### 7.1 Tipo completo — `HoraClinicaCalculationResult`

```typescript
interface HoraClinicaCalculationResult {
  // Inputs espelhados
  workingDaysPerMonth: number
  hoursPerDay: number
  occupancyRatePercent: number
  monthlyFixedCosts: number
  monthlyVariableCosts: number
  desiredMonthlyProfit: number

  // Capacidade
  totalAvailableHours: number      // horas disponíveis/mês
  productiveHours: number          // horas produtivas/mês
  idleHours: number                // horas ociosas/mês
  occupancyRateDecimal: number     // taxa de ocupação como decimal

  // Custos
  totalMonthlyCost: number         // custo total mensal
  clinicalHourCost: number         // custo por hora produtiva
  idleHoursCost: number            // custo das horas ociosas

  // Receitas
  minimumHourlyRevenue: number     // receita mínima/hora (só custos)
  recommendedHourlyRevenue: number // receita recomendada/hora (com lucro)
  minimumMonthlyRevenue: number    // faturamento mínimo mensal
  recommendedMonthlyRevenue: number // faturamento recomendado mensal
  monthlyCapacity: number          // capacidade máxima (100% ocupação)

  // Gap
  revenueGapPerHour: number        // diferença recomendado − mínimo
  revenueGapPercent: number        // gap em % sobre o mínimo
}
```

### 7.2 MetricCards principais da interface (4 cards)

| Card | Campo | Destaque |
|---|---|---|
| Custo da hora clínica | `clinicalHourCost` | Accent |
| Receita recomendada/hora | `recommendedHourlyRevenue` | Positivo |
| Horas produtivas/mês | `productiveHours` | Neutro |
| Faturamento mínimo/mês | `minimumMonthlyRevenue` | Neutro |

---

## 8. Critérios de Diagnóstico

### 8.1 Status possíveis

`excellent` | `healthy` | `attention` | `critical`

### 8.2 Avaliadores independentes

**Avaliador 1 — Taxa de ocupação**
- `>= 80%` → success: "Agenda bem ocupada"
- `>= 65%` → info: "Ocupação moderada"
- `>= 50%` → warning: "Ocupação baixa"
- `< 50%` → danger: "Agenda muito ociosa"

**Avaliador 2 — Custo da hora vs. benchmark de mercado**

*(Benchmark sugerido: R$ 60–120/hora para clínicas odontológicas gerais)*
- `clinicalHourCost <= 80` → success: "Hora clínica controlada"
- `clinicalHourCost <= 120` → info: "Hora clínica dentro do mercado"
- `clinicalHourCost <= 180` → warning: "Hora clínica elevada"
- `clinicalHourCost > 180` → danger: "Hora clínica crítica"

*Nota: Esses limites devem ser configuráveis por constante para ajuste futuro.*

**Avaliador 3 — Custo de ociosidade**
- `idleHoursCost <= totalMonthlyCost * 0.15` → success: "Ociosidade controlada"
- `idleHoursCost <= totalMonthlyCost * 0.25` → info: "Ociosidade moderada"
- `idleHoursCost <= totalMonthlyCost * 0.40` → warning: "Ociosidade relevante"
- `idleHoursCost > totalMonthlyCost * 0.40` → danger: "Ociosidade crítica"

**Avaliador 4 — Gap entre receita recomendada e mínima**
- `revenueGapPercent <= 20` → success: "Meta de lucro acessível"
- `revenueGapPercent <= 40` → info: "Meta de lucro moderada"
- `revenueGapPercent <= 70` → warning: "Meta de lucro exigente"
- `revenueGapPercent > 70` → danger: "Meta de lucro muito ambiciosa para a operação atual"

**Avaliador 5 — Horas produtivas absolutas**
- `productiveHours >= 100` → success: "Capacidade operacional sólida"
- `productiveHours >= 70` → info: "Capacidade operacional moderada"
- `productiveHours >= 40` → warning: "Capacidade operacional baixa"
- `productiveHours < 40` → danger: "Capacidade operacional crítica"

### 8.3 Cálculo de Score (0–100)

```
score = 100
- se occupancyRatePercent < 65: score -= (65 - occupancyRatePercent) * 1.5
- se clinicalHourCost > 120: score -= (clinicalHourCost - 120) * 0.1
- se idleHoursCost > totalMonthlyCost * 0.25: score -= 10
- se idleHoursCost > totalMonthlyCost * 0.40: score -= 10 (adicional)
- se productiveHours < 70: score -= 10
- se productiveHours < 40: score -= 10 (adicional)

clamp: max(0, min(100, round(score)))
```

### 8.4 Mapeamento score → status

| Score | Status |
|---|---|
| `>= 80` | `excellent` |
| `>= 60` | `healthy` |
| `>= 40` | `attention` |
| `< 40` | `critical` |

---

## 9. Playbooks Previstos

### 9.1 Playbooks base (condição única)

| ID | Condição | Categoria | Prioridade |
|---|---|---|---|
| `agenda_bem_ocupada` | `occupancyRatePercent >= 80` | opportunity | low |
| `agenda_moderada` | `occupancyRatePercent >= 65 && < 80` | sales | medium |
| `agenda_baixa` | `occupancyRatePercent >= 50 && < 65` | sales | high |
| `agenda_critica` | `occupancyRatePercent < 50` | risk | critical |
| `hora_clinica_controlada` | `clinicalHourCost <= 80` | opportunity | low |
| `hora_clinica_elevada` | `clinicalHourCost > 120` | costs | high |
| `hora_clinica_critica` | `clinicalHourCost > 180` | risk | critical |
| `custo_ociosidade_relevante` | `idleHoursCost > totalMonthlyCost * 0.25` | cashflow | high |
| `custo_ociosidade_critico` | `idleHoursCost > totalMonthlyCost * 0.40` | risk | critical |
| `custos_fixos_elevados` | `monthlyFixedCosts > totalMonthlyCost * 0.75` | costs | high |
| `capacidade_operacional_boa` | `productiveHours >= 100` | opportunity | low |
| `capacidade_operacional_baixa` | `productiveHours < 70` | time | medium |
| `meta_lucro_exigente` | `revenueGapPercent > 50` | margin | high |
| `sem_meta_de_lucro` | `desiredMonthlyProfit === 0` | standardization | low |
| `jornada_longa` | `hoursPerDay > 10` | time | medium |
| `poucos_dias_mes` | `workingDaysPerMonth < 15` | time | medium |
| `custo_hora_sem_lucro_baixo` | `minimumHourlyRevenue <= 60` | opportunity | low |
| `referencia_para_precificacao` | `diagnostic.status === 'excellent'` | standardization | low |

### 9.2 Playbooks compostos (múltiplas condições)

| ID | Condições | Categoria | Prioridade |
|---|---|---|---|
| `agenda_baixa_mais_custo_alto` | `occupancyRatePercent < 65 AND clinicalHourCost > 120` | risk | critical |
| `ociosidade_alta_mais_custo_fixo_alto` | `idleHoursCost > 40% AND monthlyFixedCosts > 75%` | risk | critical |
| `jornada_alta_mais_ocupacao_baixa` | `hoursPerDay > 10 AND occupancyRatePercent < 60` | time | high |
| `meta_ambiciosa_mais_agenda_baixa` | `revenueGapPercent > 50 AND occupancyRatePercent < 65` | risk | critical |
| `boa_ocupacao_mais_custo_controlado` | `occupancyRatePercent >= 75 AND clinicalHourCost <= 100` | opportunity | low |
| `excelente_rentabilidade_hora` | `status === 'excellent' AND revenueGapPercent <= 30` | opportunity | low |
| `revisar_agenda_e_custos` | `status === 'critical' OR status === 'attention'` | risk | high |
| `modelo_para_padronizar` | `status === 'excellent' AND occupancyRatePercent >= 80` | standardization | low |

---

## 10. Arquitetura

A Calculadora de Hora Clínica seguirá rigorosamente o Framework Kardovik v1:

```
HoraClinicaInput
    ↓
calculateHoraClinica()          ← calculator.ts
    ↓
diagnoseHoraClinica()           ← diagnostics.ts
    ↓
getHoraClinicaPlaybooks()       ← playbooks.ts
    ↓
runHoraClinicaSimulator()       ← orchestrator.ts
    ↓
generateHoraClinicaNarrative()  ← narrative.ts
    ↓
HoraClinicaSimulator.tsx        ← interface
```

**Regra arquitetural:** Cada camada consome exclusivamente a saída da camada anterior. A interface nunca faz cálculos. O orchestrator nunca cria UI. Os motores são puros e determinísticos.

---

## 11. Limitações do Modelo

### L1 — Custos variáveis como média mensal

O modelo simplifica custos variáveis como um valor mensal médio, não calculado por procedimento. Isso pode subestimar ou superestimar o custo real em meses com mix de procedimentos muito diferente do habitual.

### L2 — Taxa de ocupação como constante

A taxa de ocupação é informada como uma média mensal. Sazonalidades (meses de férias, datas comemorativas) e variações semanais não são modeladas.

### L3 — Não considera múltiplos profissionais

O modelo assume um único profissional ou uma única cadeira. Clínicas com múltiplos dentistas devem calcular por cadeira/profissional ou agregar os custos proporcionalmente.

### L4 — Benchmark de custo por hora é orientativo

O benchmark de R$ 60–180/hora é uma referência geral. Clínicas especializadas (implantes, ortodontia) têm estruturas muito diferentes de clínicas gerais. Os limites devem ser revisados periodicamente.

### L5 — `desiredMonthlyProfit` não inclui pró-labore

O lucro desejado é adicional ao pró-labore do dentista (que deve estar em `monthlyFixedCosts`). Se o profissional confundir os dois, a meta de lucro ficará inflada.

### L6 — Sem modelagem de investimentos

Custos de equipamentos, obras ou expansões não são modelados (seriam custos não-recorrentes). O modelo foca na operação mensal contínua.

---

## 12. Exemplos Numéricos Ilustrativos

### Exemplo A — Clínica Geral Equilibrada

| Campo | Valor |
|---|---|
| Dias trabalhados/mês | 20 |
| Horas por dia | 8 |
| Taxa de ocupação | 75% |
| Custos fixos/mês | R$ 8.000 |
| Custos variáveis/mês | R$ 2.000 |
| Lucro desejado/mês | R$ 3.000 |

**Cálculos:**
- `totalAvailableHours` = 20 × 8 = **160h**
- `productiveHours` = 160 × 0,75 = **120h**
- `idleHours` = 160 − 120 = **40h**
- `totalMonthlyCost` = R$ 8.000 + R$ 2.000 = **R$ 10.000**
- `clinicalHourCost` = R$ 10.000 / 120 = **R$ 83,33/h**
- `minimumHourlyRevenue` = **R$ 83,33/h**
- `recommendedHourlyRevenue` = (R$ 10.000 + R$ 3.000) / 120 = **R$ 108,33/h**
- `idleHoursCost` = 40 × R$ 83,33 = **R$ 3.333/mês em ociosidade**
- `revenueGapPercent` = (R$ 108,33 − R$ 83,33) / R$ 83,33 × 100 = **30%**

**Diagnóstico estimado:** `healthy` a `excellent` — operação equilibrada, custo de hora controlado, ocupação adequada.

---

### Exemplo B — Clínica com Baixa Ocupação e Custo Alto

| Campo | Valor |
|---|---|
| Dias trabalhados/mês | 22 |
| Horas por dia | 9 |
| Taxa de ocupação | 45% |
| Custos fixos/mês | R$ 15.000 |
| Custos variáveis/mês | R$ 3.000 |
| Lucro desejado/mês | R$ 5.000 |

**Cálculos:**
- `totalAvailableHours` = 22 × 9 = **198h**
- `productiveHours` = 198 × 0,45 = **89,1h**
- `idleHours` = 198 − 89,1 = **108,9h**
- `totalMonthlyCost` = **R$ 18.000**
- `clinicalHourCost` = R$ 18.000 / 89,1 = **R$ 202,02/h**
- `minimumHourlyRevenue` = **R$ 202,02/h**
- `recommendedHourlyRevenue` = R$ 23.000 / 89,1 = **R$ 258,14/h**
- `idleHoursCost` = 108,9 × R$ 202,02 = **R$ 22.000/mês em ociosidade**

**Diagnóstico estimado:** `critical` — custo da hora acima de R$ 200, mais da metade do tempo ocioso, meta de faturamento muito exigente para a capacidade atual.

---

### Exemplo C — Profissional Autônomo Enxuto

| Campo | Valor |
|---|---|
| Dias trabalhados/mês | 18 |
| Horas por dia | 6 |
| Taxa de ocupação | 85% |
| Custos fixos/mês | R$ 2.500 |
| Custos variáveis/mês | R$ 800 |
| Lucro desejado/mês | R$ 2.000 |

**Cálculos:**
- `totalAvailableHours` = 18 × 6 = **108h**
- `productiveHours` = 108 × 0,85 = **91,8h**
- `totalMonthlyCost` = **R$ 3.300**
- `clinicalHourCost` = R$ 3.300 / 91,8 = **R$ 35,95/h**
- `recommendedHourlyRevenue` = R$ 5.300 / 91,8 = **R$ 57,74/h**

**Diagnóstico estimado:** `excellent` — estrutura enxuta, alta ocupação, custo de hora muito controlado. Bom modelo de referência para profissional autônomo.

---

## 13. Roadmap de Implementação

| Bloco | Entregável |
|---|---|
| **Bloco 1** (este) | Escopo financeiro — documento técnico |
| **Bloco 2** | `types.ts`, `constants.ts`, `calculator.ts` |
| **Bloco 3** | `diagnostics.ts` |
| **Bloco 4A** | `playbooks.ts` — base (18 playbooks) |
| **Bloco 4B** | `playbooks.ts` — compostos (8–12 playbooks) |
| **Bloco 5** | `orchestrator.ts` |
| **Bloco 6** | `narrative.ts` |
| **Bloco 7** | `HoraClinicaSimulator.tsx` — interface |
| **Bloco 8** | Integração e validação final |
| **Bloco H1** | Homologação técnica (30+ cenários) |
| **Bloco 10** | Release v1.2.0 |

---

## 14. Critérios para Avançar ao Bloco 2

- [x] Todos os inputs definidos com tipo e regra de validação
- [x] Todas as fórmulas documentadas com exemplos
- [x] Todos os outputs especificados com tipagem prevista
- [x] Critérios de diagnóstico definidos com limites numéricos
- [x] Playbooks base e compostos mapeados
- [x] Limitações documentadas
- [x] Arquitetura confirmada (Framework Kardovik v1)
- [x] Dois exemplos numéricos com diagnóstico estimado
- [x] Documento aprovado para implementação

**O Bloco 2 pode ser iniciado.**
