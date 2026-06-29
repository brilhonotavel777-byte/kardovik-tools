# Calculadora de Precificação Odontológica — Escopo Financeiro

**Ferramenta:** Calculadora de Precificação Odontológica  
**Versão alvo:** v1.1.0  
**Bloco:** 1 — Escopo Financeiro  
**Status:** Aprovado para implementação  
**Data:** 2026-06-29

---

## 1. Visão Geral

A Calculadora de Precificação Odontológica responde a pergunta central:

> **"Quanto devo cobrar por este procedimento para cobrir custos, remunerar meu tempo e preservar margem?"**

A ferramenta estima um **preço mínimo** (para não operar no prejuízo) e um **preço sugerido** (para atingir a margem desejada), considerando custos diretos, custo do tempo clínico, taxas financeiras e impostos.

Ela não é uma ferramenta contábil. É uma calculadora de apoio à decisão — simples, rápida e focada em resultados práticos.

---

## 2. Dor Resolvida

**Problema:** Muitos dentistas definem preços com base no mercado, no concorrente ou no costume histórico — sem saber se o valor realmente cobre os custos e gera lucro real.

**Consequência:** Procedimentos que parecem lucrativos podem estar gerando prejuízo após considerar materiais, tempo clínico, taxas e impostos.

**O que a ferramenta entrega:**

- Preço mínimo (cobertura de custos sem lucro)
- Preço sugerido (com margem desejada)
- Custo total estimado do procedimento
- Lucro estimado por atendimento
- Interpretação clara do resultado
- Ação prática recomendada
- Comparação com preço atual (se informado)

---

## 3. Público-Alvo

| Perfil | Uso principal |
|---|---|
| Dentista autônomo | Precificar procedimentos do dia a dia |
| Dono de clínica | Revisar tabela de preços |
| Estudante de odontologia | Entender a estrutura de custos antes de entrar no mercado |
| Gestor administrativo | Identificar procedimentos deficitários |

---

## 4. Inputs Oficiais

### 4.1 Definição do tipo

```typescript
interface PrecificacaoInput {
  procedureName?: string            // Nome do procedimento (opcional, descritivo)
  materialCost: number              // Custo de materiais (obrigatório)
  labCost: number                   // Custo de laboratório/terceiros (obrigatório, default 0)
  clinicalTimeMinutes: number       // Tempo clínico em minutos (obrigatório)
  hourlyClinicalCost: number        // Custo da hora clínica em R$ (obrigatório)
  cardFeePercent: number            // Taxa da maquininha em % (obrigatório, default 3.5)
  taxPercent: number                // Estimativa de impostos em % (obrigatório, default 6)
  desiredMarginPercent: number      // Margem desejada em % (obrigatório, default 30)
  currentPrice?: number             // Preço atualmente cobrado (opcional)
}
```

### 4.2 Defaults sugeridos na interface

| Campo | Default | Justificativa |
|---|---|---|
| `labCost` | 0 | Nem todo procedimento usa laboratório |
| `cardFeePercent` | 3.5 | Média de mercado para cartão de crédito |
| `taxPercent` | 6 | Referência ao Simples Nacional — perfil mais comum |
| `desiredMarginPercent` | 30 | Margem-alvo saudável para clínicas odontológicas |

### 4.3 Semântica dos campos

**`materialCost`** — Inclui todos os materiais consumidos no procedimento: resinas, anestésicos, descartáveis, biomateriais, membranas, implantes, etc. Cada procedimento tem seu perfil específico.

**`labCost`** — Custo de próteses, coroas, aparelhos e outros trabalhos enviados ao laboratório. Deve refletir o custo real cobrado pelo laboratório, não o preço de venda da prótese.

**`clinicalTimeMinutes`** — Tempo real de cadeira, incluindo preparo e finalização. Não considera tempo administrativo.

**`hourlyClinicalCost`** — Custo que o dentista ou a clínica atribui a cada hora de cadeira ocupada. Pode vir manualmente ou, no futuro, ser calculado pela Calculadora de Hora Clínica.

**`cardFeePercent`** — Taxa cobrada pela operadora de cartão. Varia por bandeira, prazo e volume. O usuário informa a taxa que realmente paga.

**`taxPercent`** — Estimativa simplificada do percentual de impostos sobre o faturamento. Não substitui cálculo contábil real.

**`desiredMarginPercent`** — Margem de lucro desejada sobre o preço final. Representa o retorno que o dentista quer preservar após todos os custos e deduções.

**`currentPrice`** — Opcional. Quando informado, permite diagnóstico comparativo: o preço atual está acima, dentro ou abaixo do sugerido?

---

## 5. Validações

### 5.1 Regras

| Campo | Regra | Mensagem de erro |
|---|---|---|
| `materialCost` | `>= 0` | "O custo de materiais deve ser maior ou igual a zero." |
| `labCost` | `>= 0` | "O custo de laboratório deve ser maior ou igual a zero." |
| `clinicalTimeMinutes` | `> 0` e inteiro | "O tempo clínico deve ser maior que zero." |
| `hourlyClinicalCost` | `> 0` | "O custo da hora clínica deve ser maior que zero." |
| `cardFeePercent` | `>= 0` | "A taxa da maquininha deve ser maior ou igual a zero." |
| `taxPercent` | `>= 0` | "O percentual de impostos deve ser maior ou igual a zero." |
| `desiredMarginPercent` | `>= 0 AND < 95` | "A margem desejada deve ser menor que 95%." |
| `currentPrice` | `> 0` quando informado | "O preço atual deve ser maior que zero." |

### 5.2 Regra crítica: soma de deduções

Se `cardFeePercent + taxPercent + desiredMarginPercent >= 100`:

A fórmula do preço sugerido produziria divisão por zero ou resultado negativo. Este cenário deve ser detectado e reportado como `critical` no diagnóstico, com mensagem clara ao usuário.

Se `cardFeePercent + taxPercent >= 95` mesmo sem margem:

O preço mínimo já seria distorcido. Detectar e sinalizar.

---

## 6. Fórmulas Oficiais

Todas as fórmulas são determinísticas. Todos os valores monetários são arredondados para 2 casas decimais. Percentuais: 2 casas. Horas: 2 casas.

### 6.1 Custo do tempo clínico

```
clinicalTimeHours = round2(clinicalTimeMinutes / 60)

clinicalTimeCost = round2(clinicalTimeHours * hourlyClinicalCost)
```

### 6.2 Custo direto total

```
directCost = round2(materialCost + labCost + clinicalTimeCost)
```

Representa o custo real do procedimento antes de qualquer dedução ou lucro.

### 6.3 Percentual total de deduções

```
deductionPercent = round2(cardFeePercent + taxPercent)
```

Note: `desiredMarginPercent` NÃO entra em `deductionPercent`. A margem é separada para clareza conceitual.

### 6.4 Preço mínimo (breakeven)

```
minimumPrice = round2(directCost / (1 - deductionPercent / 100))
```

O preço mínimo cobre todos os custos diretos e absorve as deduções (taxas + impostos), mas não gera lucro. É o piso financeiro do procedimento.

**Pré-condição:** `deductionPercent < 100` (validado antes do cálculo).

### 6.5 Preço sugerido (com margem desejada)

```
suggestedPrice = round2(
  directCost / (1 - (deductionPercent + desiredMarginPercent) / 100)
)
```

O preço sugerido é calculado de forma que, após deduzir taxas, impostos e margem desejada, o resultado líquido ainda cobre os custos diretos.

**Pré-condição:** `deductionPercent + desiredMarginPercent < 100` (validado antes do cálculo).

### 6.6 Valor total de deduções sobre preço sugerido

```
deductionAmount = round2(suggestedPrice * (deductionPercent / 100))
```

### 6.7 Lucro estimado

```
estimatedProfit = round2(suggestedPrice - directCost - deductionAmount)
```

### 6.8 Margem real estimada

```
estimatedMarginPercent = round2((estimatedProfit / suggestedPrice) * 100)
```

Deve estar próxima de `desiredMarginPercent`. Pequenas diferenças são esperadas por arredondamento.

### 6.9 Comparação com preço atual (quando `currentPrice` informado)

```
priceGap = round2(suggestedPrice - currentPrice)

priceGapPercent = round2((priceGap / currentPrice) * 100)
```

`priceGap > 0` → preço atual abaixo do sugerido (subapreçamento).  
`priceGap < 0` → preço atual acima do sugerido (margem maior que desejada).  
`priceGap = 0` → preço atual igual ao sugerido.

### 6.10 Status do preço atual

Quando `currentPrice` informado:

| Condição | `currentPriceStatus` |
|---|---|
| `currentPrice >= suggestedPrice` | `"above_suggested"` |
| `currentPrice >= minimumPrice AND currentPrice < suggestedPrice` | `"covers_cost_below_margin"` |
| `currentPrice < minimumPrice` | `"below_minimum"` |

Quando `currentPrice` não informado: campo ausente no output.

---

## 7. Outputs Esperados

### 7.1 Tipo completo

```typescript
interface PrecificacaoCalculationResult {
  // Inputs espelhados
  procedureName?: string
  materialCost: number
  labCost: number
  clinicalTimeMinutes: number
  clinicalTimeHours: number           // calculado
  hourlyClinicalCost: number
  cardFeePercent: number
  taxPercent: number
  desiredMarginPercent: number

  // Custos calculados
  clinicalTimeCost: number
  directCost: number
  deductionPercent: number

  // Preços calculados
  minimumPrice: number
  suggestedPrice: number
  deductionAmount: number
  estimatedProfit: number
  estimatedMarginPercent: number

  // Comparação com preço atual (opcionais)
  currentPrice?: number
  priceGap?: number
  priceGapPercent?: number
  currentPriceStatus?: 'above_suggested' | 'covers_cost_below_margin' | 'below_minimum'
}
```

### 7.2 MetricCards principais da interface

| Card | Campo | Destaque |
|---|---|---|
| Preço mínimo | `minimumPrice` | Neutro |
| Preço sugerido | `suggestedPrice` | Accent (azul) |
| Custo total estimado | `directCost` | Neutro |
| Lucro estimado | `estimatedProfit` | Positivo (emerald) ou Warning (amber) se negativo |

---

## 8. Critérios de Diagnóstico

### 8.1 Status possíveis

`excellent` | `healthy` | `attention` | `critical`

### 8.2 Cálculo de score

Score inicial: **100**

Deduções:

| Condição | Penalidade |
|---|---|
| `estimatedMarginPercent < desiredMarginPercent` | `−(desiredMarginPercent − estimatedMarginPercent) × 1.5` |
| `currentPrice < minimumPrice` | `−30` |
| `currentPrice >= minimumPrice AND currentPrice < suggestedPrice` | `−15` |
| `deductionPercent > 15` | `−10` |
| `deductionPercent > 25` | `−10` adicionais |
| `clinicalTimeCost > directCost * 0.7` | `−8` (tempo domina o custo) |
| `labCost > directCost * 0.5` | `−8` (laboratório muito pesado) |

Clamp: `max(0, min(100, score))`

### 8.3 Mapeamento score → status

| Score | Status |
|---|---|
| `>= 80` | `excellent` |
| `>= 60 e < 80` | `healthy` |
| `>= 40 e < 60` | `attention` |
| `< 40` | `critical` |

### 8.4 Status forçado para `critical` (independente de score)

- `deductionPercent + desiredMarginPercent >= 95` (fórmula de preço sugerido próxima de divisão por zero)
- `currentPrice < minimumPrice` (preço atual não cobre nem os custos)
- `estimatedProfit < 0` (preço sugerido ainda gera prejuízo — cenário de custo incompatível)

---

## 9. Playbooks Previstos

### 9.1 Playbooks base (1 condição)

| ID | Trigger | Categoria |
|---|---|---|
| `custo_material_elevado` | `materialCost > directCost * 0.5` | `margin` |
| `laboratorio_pesando_no_preco` | `labCost > directCost * 0.4` | `pricing` |
| `tempo_clinico_alto` | `clinicalTimeCost > directCost * 0.7` | `pricing` |
| `hora_clinica_impacta_preco` | `hourlyClinicalCost > 300` (R$/h) | `pricing` |
| `margem_desejada_incompativel` | `deductionPercent + desiredMarginPercent >= 90` | `risk` |
| `preco_atual_abaixo_do_minimo` | `currentPrice < minimumPrice` | `risk` |
| `preco_atual_cobre_custo_mas_nao_margem` | `currentPrice >= minimumPrice AND currentPrice < suggestedPrice` | `attention` |
| `preco_sugerido_saudavel` | `estimatedMarginPercent >= desiredMarginPercent * 0.95` | `opportunity` |
| `revisar_taxas_e_impostos` | `deductionPercent > 15` | `fees` |
| `procedimento_precisa_reprecificacao` | `priceGap > currentPrice * 0.2` | `pricing` |

### 9.2 Playbooks compostos (2+ condições)

| ID | Trigger | Categoria |
|---|---|---|
| `custo_alto_mais_preco_baixo` | `directCost > suggestedPrice * 0.8 AND currentPrice < suggestedPrice` | `risk` |
| `tempo_alto_mais_margem_baixa` | `clinicalTimeCost > directCost * 0.6 AND estimatedMarginPercent < desiredMarginPercent` | `margin` |
| `laboratorio_alto_mais_ticket_baixo` | `labCost > directCost * 0.4 AND suggestedPrice < 500` | `risk` |
| `margem_alta_mais_deducao_alta` | `desiredMarginPercent >= 40 AND deductionPercent >= 15` | `risk` |
| `preco_atual_critico_mais_tempo_elevado` | `currentPrice < minimumPrice AND clinicalTimeMinutes >= 90` | `risk` |
| `procedimento_inviavel_sem_reajuste` | `priceGap > currentPrice * 0.3` | `risk` |
| `reprecificacao_prioritaria` | `currentPrice < minimumPrice AND diagnostic.status === 'critical'` | `risk` |
| `bom_cenario_para_padronizar_tabela` | `diagnostic.status === 'excellent' AND currentPrice >= suggestedPrice` | `opportunity` |

---

## 10. Estrutura dos Próximos Blocos

| Bloco | Arquivo | Responsabilidade |
|---|---|---|
| **Bloco 2** | `src/features/precificacao/types.ts` | Tipos TypeScript completos |
| **Bloco 2** | `src/features/precificacao/constants.ts` | Defaults e limites |
| **Bloco 2** | `src/features/precificacao/calculator.ts` | Motor financeiro puro |
| **Bloco 3** | `src/features/precificacao/diagnostics.ts` | Score e status |
| **Bloco 3A** | `src/features/precificacao/playbooks.ts` | 18 playbooks base |
| **Bloco 3B** | `src/features/precificacao/playbooks.ts` | Playbooks compostos |
| **Bloco 3A.1** | `src/features/precificacao/playbooks.ts` | Metadados (urgency, effort, impact) |
| **Bloco 4** | `src/features/precificacao/orchestrator.ts` | Integração em cascata |
| **Bloco 5** | `src/features/precificacao/narrative.ts` | Narrativa humanizada |
| **Bloco 6** | `src/features/precificacao/PrecificacaoSimulator.tsx` | Interface Client Component |
| **Bloco 7** | Atualização de `precificacao/page.tsx` | Integrar simulador via `calculatorSlot` |
| **Bloco H1** | `src/features/precificacao/homologation.ts` | 40+ cenários de homologação |

### 10.1 Arquivos da feature (estrutura futura completa)

```
src/features/precificacao/
  index.ts                      ← já existe (stub)
  types.ts                      ← Bloco 2
  constants.ts                  ← Bloco 2
  calculator.ts                 ← Bloco 2
  diagnostics.ts                ← Bloco 3
  playbooks.ts                  ← Blocos 3A + 3B + 3A.1
  orchestrator.ts               ← Bloco 4
  narrative.ts                  ← Bloco 5
  PrecificacaoSimulator.tsx     ← Bloco 6
  homologation.ts               ← Bloco H1
```

---

## 11. Riscos e Observações

### R1 — Fórmula de preço sugerido com soma de deduções próxima de 100%

Se `deductionPercent + desiredMarginPercent >= 100`, a divisão resulta em valor negativo ou infinito. O motor deve validar e detectar antes de calcular. Status forçado: `critical`.

### R2 — `hourlyClinicalCost` sem integração com Calculadora de Hora Clínica

Nesta versão, o custo da hora clínica é inserido manualmente. O usuário pode não saber seu valor real. A interface deve oferecer contexto e, futuramente, integrar com a Calculadora de Hora Clínica do mesmo ecossistema.

### R3 — `taxPercent` é uma estimativa simplificada

A ferramenta usa um percentual único para impostos, o que é uma aproximação. A alíquota real varia por regime tributário, tipo de serviço e faturamento. O ToolDisclaimer existente cobre esta limitação adequadamente.

### R4 — Preço atual opcional cria duas experiências distintas

- **Sem `currentPrice`**: experiência de precificação inicial (dentista sem tabela definida).
- **Com `currentPrice`**: experiência de revisão (dentista com tabela que quer validar).

O motor e a narrativa devem tratar ambos os fluxos com clareza.

### R5 — Score de diagnóstico pode divergir se margem real diferir por arredondamento

`estimatedMarginPercent` pode diferir de `desiredMarginPercent` por frações de ponto percentual devido ao arredondamento sequencial. A homologação (Bloco H1) deve cobrir esses casos limítrofes.

### R6 — `clinicalTimeMinutes` deve ser inteiro na validação

Embora tecnicamente aceite float, o tempo clínico em minutos deve ser validado como número positivo. A interface pode usar incrementos de 5 ou 15 minutos para facilitar a entrada.

---

## 12. Critérios para Avançar ao Bloco 2

O Bloco 1 é considerado encerrado quando:

- [x] Todos os inputs estão definidos com tipo e regra de validação
- [x] Todas as fórmulas estão documentadas com pré-condições
- [x] Todos os outputs estão especificados com tipagem
- [x] Critérios de diagnóstico estão definidos com limites numéricos
- [x] Playbooks base e compostos estão mapeados
- [x] Estrutura de blocos futuros está definida
- [x] Riscos estão documentados
- [x] Documento aprovado para implementação

**O Bloco 2 pode ser iniciado.**

---

## Apêndice — Exemplos de Cálculo

### Exemplo A: Restauração simples

| Input | Valor |
|---|---|
| `materialCost` | R$ 45,00 |
| `labCost` | R$ 0,00 |
| `clinicalTimeMinutes` | 60 min |
| `hourlyClinicalCost` | R$ 200,00 |
| `cardFeePercent` | 3,5% |
| `taxPercent` | 6% |
| `desiredMarginPercent` | 30% |
| `currentPrice` | R$ 250,00 |

**Cálculo:**
- `clinicalTimeCost` = 1h × R$200 = R$200,00
- `directCost` = R$45 + R$0 + R$200 = R$245,00
- `deductionPercent` = 3,5 + 6 = 9,5%
- `minimumPrice` = R$245 / (1 − 0,095) = R$270,72
- `suggestedPrice` = R$245 / (1 − 0,395) = R$404,96
- `priceGap` = R$404,96 − R$250 = R$154,96
- `currentPriceStatus` = `covers_cost_below_margin`
- Diagnóstico esperado: `attention`

### Exemplo B: Implante com laboratório

| Input | Valor |
|---|---|
| `materialCost` | R$ 800,00 |
| `labCost` | R$ 1.200,00 |
| `clinicalTimeMinutes` | 120 min |
| `hourlyClinicalCost` | R$ 300,00 |
| `cardFeePercent` | 3,5% |
| `taxPercent` | 6% |
| `desiredMarginPercent` | 30% |

**Cálculo:**
- `clinicalTimeCost` = 2h × R$300 = R$600,00
- `directCost` = R$800 + R$1.200 + R$600 = R$2.600,00
- `minimumPrice` = R$2.600 / 0,905 = R$2.872,38
- `suggestedPrice` = R$2.600 / 0,605 = R$4.297,52
- Diagnóstico esperado: `excellent` (sem preço atual)
