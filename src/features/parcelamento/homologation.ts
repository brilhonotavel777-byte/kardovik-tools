/**
 * Bloco H1 — Homologação de Negócio
 *
 * Valida invariantes financeiros, status de diagnóstico e integridade de
 * narrativa para 40 cenários reais de clínica odontológica.
 *
 * NÃO altera nenhuma regra de negócio.
 * NÃO altera nenhuma fórmula.
 * Apenas executa e reporta.
 */

import { generateParcelamentoNarrative } from './narrative'
import { runParcelamentoSimulator } from './orchestrator'
import type { ParcelamentoDiagnosticStatus, ParcelamentoInput } from './types'

// ── Tipos locais ───────────────────────────────────────────────────────

export interface ParcelamentoHomologationScenario {
  id: string
  description: string
  input: ParcelamentoInput
  expectedRisk: ParcelamentoDiagnosticStatus
  notes: string
}

export interface ParcelamentoHomologationResult {
  scenarioId: string
  passed: boolean
  status: ParcelamentoDiagnosticStatus
  score: number
  issues: string[]
}

export interface ParcelamentoHomologationReport {
  total: number
  passed: number
  failed: number
  results: ParcelamentoHomologationResult[]
}

// ── Helper de arredondamento (replica a lógica do calculator) ──────────

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// ── Cenários ───────────────────────────────────────────────────────────
//
// Expected risk derivado da fórmula de score:
//   effectiveFeePercent = cardFee + antFee × n
//   score = 100 - 2×effective - [5 se n>6] - [10 se n>12]
//           - [10 se antFee×n > 5] - [10 se antFee×n > 12]
//   excellent ≥ 85 | healthy 70–84 | attention 50–69 | critical < 50
//
// Nota: effectiveFeePercent sofre arredondamento interno; valores limítrofes
// foram calculados com margem conservadora.

const SCENARIOS: ParcelamentoHomologationScenario[] = [
  // ── Grupo 1: Ticket baixo (R$800) ─────────────────────────────────
  {
    id: 'H01',
    description: 'Ticket baixo, 1x, sem taxas',
    input: { treatmentValue: 800, installments: 1, cardFeePercent: 0, anticipationFeePercent: 0 },
    // effective=0, score=100
    expectedRisk: 'excellent',
    notes: 'Caso base. Sem custo financeiro. Score máximo esperado.',
  },
  {
    id: 'H02',
    description: 'Ticket baixo, 6x, taxa normal sem antecipação',
    input: { treatmentValue: 800, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=100-7=93
    expectedRisk: 'excellent',
    notes: 'Parcelamento curto com taxa padrão. Sem custo de antecipação.',
  },
  {
    id: 'H03',
    description: 'Ticket baixo, 12x, taxa alta sem antecipação',
    input: { treatmentValue: 800, installments: 12, cardFeePercent: 8, anticipationFeePercent: 0 },
    // effective=8, n=12>6(-5), score=100-16-5=79
    expectedRisk: 'healthy',
    notes: 'Taxa alta mas sem antecipação. Prazo longo reduz o score.',
  },
  {
    id: 'H04',
    description: 'Ticket baixo, 24x, taxa e antecipação altas',
    input: { treatmentValue: 800, installments: 24, cardFeePercent: 5, anticipationFeePercent: 2 },
    // effective=5+48=53, n>6(-5), n>12(-10), antFee*n=48>12(-10,-10)
    // score=100-106-5-10-10-10<0 → crítico
    expectedRisk: 'critical',
    notes: 'Cenário extremo. Taxa e prazo muito longos. Score negativo (clampado em 0).',
  },

  // ── Grupo 2: Ticket médio-baixo (R$2.500) ─────────────────────────
  {
    id: 'H05',
    description: 'Ticket médio-baixo, 1x, taxa normal',
    input: { treatmentValue: 2500, installments: 1, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=93
    expectedRisk: 'excellent',
    notes: 'À vista com taxa padrão. Excelente.',
  },
  {
    id: 'H06',
    description: 'Ticket médio-baixo, 3x, taxa normal',
    input: { treatmentValue: 2500, installments: 3, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=93
    expectedRisk: 'excellent',
    notes: 'Parcelamento curto e saudável.',
  },
  {
    id: 'H07',
    description: 'Ticket médio-baixo, 6x, taxa alta sem antecipação',
    input: { treatmentValue: 2500, installments: 6, cardFeePercent: 8, anticipationFeePercent: 0 },
    // effective=8, n=6 (6>6 false), score=100-16=84
    expectedRisk: 'healthy',
    notes: 'Taxa alta mas prazo controlado. Score borderline (84).',
  },
  {
    id: 'H08',
    description: 'Ticket médio-baixo, 6x, taxa normal com antecipação moderada',
    input: { treatmentValue: 2500, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=15.5, antFee*n=12 (>5 sim, >12 não), n=6 (6>6 false)
    // score=100-31-10=59
    expectedRisk: 'attention',
    notes: 'Antecipação em 6x sobe custo efetivo para 15.5%. Atenção recomendada.',
  },
  {
    id: 'H09',
    description: 'Ticket médio-baixo, 12x, taxa normal sem antecipação',
    input: { treatmentValue: 2500, installments: 12, cardFeePercent: 5, anticipationFeePercent: 0 },
    // effective=5, n=12>6(-5), score=100-10-5=85
    expectedRisk: 'excellent',
    notes: 'Score exatamente 85 → excellent. Limítrofe entre excellent e healthy.',
  },
  {
    id: 'H10',
    description: 'Ticket médio-baixo, 12x, taxa normal com antecipação',
    input: { treatmentValue: 2500, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=27.5, antFee*n=24>12(-10,-10), n=12>6(-5), score=100-55-5-10-10=20
    expectedRisk: 'critical',
    notes: 'Antecipação total em 12x gera custo muito elevado.',
  },

  // ── Grupo 3: Ticket médio (R$5.000) ───────────────────────────────
  {
    id: 'H11',
    description: 'Ticket médio, 1x, sem taxas (caso base puro)',
    input: { treatmentValue: 5000, installments: 1, cardFeePercent: 0, anticipationFeePercent: 0 },
    // effective=0, score=100
    expectedRisk: 'excellent',
    notes: 'Pagamento à vista sem custo. Score máximo.',
  },
  {
    id: 'H12',
    description: 'Ticket médio, 1x, taxa normal sem antecipação',
    input: { treatmentValue: 5000, installments: 1, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=93
    expectedRisk: 'excellent',
    notes: 'Parcelamento em 1x com taxa padrão.',
  },
  {
    id: 'H13',
    description: 'Ticket médio, 3x, taxa baixa com antecipação moderada',
    input: { treatmentValue: 5000, installments: 3, cardFeePercent: 2.5, anticipationFeePercent: 2 },
    // effective=2.5+6=8.5, antFee*n=6>5(-10), n=3 (nenhuma penalidade)
    // score=100-17-10=73
    expectedRisk: 'healthy',
    notes: 'Antecipação em 3x tem impacto moderado.',
  },
  {
    id: 'H14',
    description: 'Ticket médio, 6x, taxa normal sem antecipação',
    input: { treatmentValue: 5000, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=93
    expectedRisk: 'excellent',
    notes: 'Cenário de referência mais comum em clínicas. Excelente.',
  },
  {
    id: 'H15',
    description: 'Ticket médio, 6x, taxa normal com antecipação',
    input: { treatmentValue: 5000, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=15.5, antFee*n=12>5(!>12), n=6>6 false
    // score=100-31-10=59
    expectedRisk: 'attention',
    notes: 'Antecipação em 6x com taxa padrão coloca o cenário em atenção.',
  },
  {
    id: 'H16',
    description: 'Ticket médio, 6x, taxa e antecipação altas',
    input: { treatmentValue: 5000, installments: 6, cardFeePercent: 5, anticipationFeePercent: 3.5 },
    // effective=5+21=26, antFee*n=21>12(-10,-10), n=6>6 false
    // score=100-52-10-10=28
    expectedRisk: 'critical',
    notes: 'Antecipação alta em 6x já é crítico.',
  },
  {
    id: 'H17',
    description: 'Ticket médio, 12x, taxa normal sem antecipação',
    input: { treatmentValue: 5000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n=12>6(-5), score=100-7-5=88
    expectedRisk: 'excellent',
    notes: '12x sem antecipação mantém score alto.',
  },
  {
    id: 'H18',
    description: 'Ticket médio, 12x, taxa normal com antecipação leve',
    input: { treatmentValue: 5000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 1 },
    // effective=3.5+12=15.5, antFee*n=12>5(!>12), n=12>6(-5)
    // score=100-31-5-10=54
    expectedRisk: 'attention',
    notes: 'Mesmo antecipação leve em 12x reduz margem.',
  },
  {
    id: 'H19',
    description: 'Ticket médio, 12x, taxa e antecipação normais',
    input: { treatmentValue: 5000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=27.5, antFee*n=24>12(-10,-10), n=12>6(-5)
    // score=100-55-5-10-10=20
    expectedRisk: 'critical',
    notes: 'Parcelamento 12x com antecipação total é cenário crítico.',
  },
  {
    id: 'H20',
    description: 'Ticket médio, 24x, taxa normal sem antecipação',
    input: { treatmentValue: 5000, installments: 24, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n=24>6(-5), n>12(-10), score=100-7-5-10=78
    expectedRisk: 'healthy',
    notes: '24x sem antecipação ainda é healthy. Prazo longo mas sem custo extra.',
  },
  {
    id: 'H21',
    description: 'Ticket médio, 24x, taxa normal com antecipação moderada',
    input: { treatmentValue: 5000, installments: 24, cardFeePercent: 3.5, anticipationFeePercent: 1 },
    // effective=3.5+24=27.5, antFee*n=24>12(-10,-10), n>6(-5), n>12(-10)
    // score=100-55-5-10-10-10=10
    expectedRisk: 'critical',
    notes: 'Antecipação leve em 24x já é crítico pelo acúmulo de penalidades.',
  },

  // ── Grupo 4: Ticket alto (R$12.000) ───────────────────────────────
  {
    id: 'H22',
    description: 'Ticket alto, 6x, taxa baixa sem antecipação',
    input: { treatmentValue: 12000, installments: 6, cardFeePercent: 2.5, anticipationFeePercent: 0 },
    // effective=2.5, score=95
    expectedRisk: 'excellent',
    notes: 'Cenário ideal para tratamentos de alto valor.',
  },
  {
    id: 'H23',
    description: 'Ticket alto, 6x, taxa normal com antecipação leve',
    input: { treatmentValue: 12000, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 1 },
    // effective=3.5+6=9.5, antFee*n=6>5(!>12), n=6>6 false
    // score=100-19-10=71
    expectedRisk: 'healthy',
    notes: 'Antecipação leve em 6x é viável com atenção.',
  },
  {
    id: 'H24',
    description: 'Ticket alto, 12x, sem taxas',
    input: { treatmentValue: 12000, installments: 12, cardFeePercent: 0, anticipationFeePercent: 0 },
    // effective=0, n=12>6(-5), score=100-5=95
    expectedRisk: 'excellent',
    notes: 'Sem taxas, 12x ainda é excellent.',
  },
  {
    id: 'H25',
    description: 'Ticket alto, 12x, taxa normal com antecipação',
    input: { treatmentValue: 12000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=27.5, antFee*n=24>12(-10,-10), n=12>6(-5)
    // score=100-55-5-10-10=20
    expectedRisk: 'critical',
    notes: 'Padrão comum de clínicas grandes — o custo financeiro é relevante.',
  },
  {
    id: 'H26',
    description: 'Ticket alto, 18x, taxa normal sem antecipação',
    input: { treatmentValue: 12000, installments: 18, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n=18>6(-5), n>12(-10), score=100-7-5-10=78
    expectedRisk: 'healthy',
    notes: '18x sem antecipação é viável mas merece atenção ao prazo.',
  },
  {
    id: 'H27',
    description: 'Ticket alto, 18x, taxa e antecipação normais',
    input: { treatmentValue: 12000, installments: 18, cardFeePercent: 3.5, anticipationFeePercent: 1 },
    // effective=3.5+18=21.5, antFee*n=18>12(-10,-10), n>6(-5), n>12(-10)
    // score=100-43-5-10-10-10=22
    expectedRisk: 'critical',
    notes: 'Antecipação em 18x gera custo acumulado elevado.',
  },
  {
    id: 'H28',
    description: 'Ticket alto, 24x, taxa normal sem antecipação',
    input: { treatmentValue: 12000, installments: 24, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n>6(-5), n>12(-10), score=78
    expectedRisk: 'healthy',
    notes: '24x sem antecipação mantém-se healthy.',
  },

  // ── Grupo 5: Ticket muito alto (R$25.000) ─────────────────────────
  {
    id: 'H29',
    description: 'Ticket muito alto, 6x, taxa normal sem antecipação',
    input: { treatmentValue: 25000, installments: 6, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, score=93
    expectedRisk: 'excellent',
    notes: 'Tratamento de alto valor em prazo curto é excelente.',
  },
  {
    id: 'H30',
    description: 'Ticket muito alto, 12x, taxa normal sem antecipação',
    input: { treatmentValue: 25000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n>6(-5), score=100-7-5=88
    expectedRisk: 'excellent',
    notes: '12x sem antecipação é excelente mesmo em ticket alto.',
  },
  {
    id: 'H31',
    description: 'Ticket muito alto, 12x, taxa normal com antecipação',
    input: { treatmentValue: 25000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // effective=27.5, antFee*n=24>12, n>6(-5), score=20
    expectedRisk: 'critical',
    notes: 'O custo absoluto em R$ é relevante, mas o score segue o padrão.',
  },
  {
    id: 'H32',
    description: 'Ticket muito alto, 24x, taxa e antecipação altas',
    input: { treatmentValue: 25000, installments: 24, cardFeePercent: 5, anticipationFeePercent: 3.5 },
    // effective=5+84=89, antFee*n=84>12, n>6(-5), n>12(-10)
    // score → muito negativo → 0 → critical
    expectedRisk: 'critical',
    notes: 'Cenário extremo. Score clampado em 0.',
  },

  // ── Grupo 6: Taxas zero — validação de invariantes ────────────────
  {
    id: 'H33',
    description: 'Zero taxa de cartão e zero antecipação (invariante 9)',
    input: { treatmentValue: 5000, installments: 6, cardFeePercent: 0, anticipationFeePercent: 0 },
    // effective=0, score=100
    expectedRisk: 'excellent',
    notes: 'Invariante 9: netValueFlow e netValueAnticipated devem igualar treatmentValue.',
  },
  {
    id: 'H34',
    description: 'Taxa de cartão alta sem antecipação (isolamento)',
    input: { treatmentValue: 5000, installments: 6, cardFeePercent: 8, anticipationFeePercent: 0 },
    // effective=8, score=84
    expectedRisk: 'healthy',
    notes: 'Isola o impacto de taxa alta de cartão sem custo de antecipação.',
  },
  {
    id: 'H35',
    description: 'Antecipação alta com poucas parcelas',
    input: { treatmentValue: 5000, installments: 3, cardFeePercent: 3.5, anticipationFeePercent: 5 },
    // effective=3.5+15=18.5, antFee*n=15>12(-10,-10), n=3 (nenhuma penalidade)
    // score=100-37-10-10=43
    expectedRisk: 'critical',
    notes: 'Mesmo poucas parcelas, antecipação alta (5%/mês) é crítico.',
  },
  {
    id: 'H36',
    description: 'Antecipação alta com muitas parcelas',
    input: { treatmentValue: 5000, installments: 12, cardFeePercent: 3.5, anticipationFeePercent: 5 },
    // effective=3.5+60=63.5, antFee*n=60>12, n>6(-5)
    // score muito negativo → 0 → critical
    expectedRisk: 'critical',
    notes: 'Taxa de antecipação de 5%/mês em 12x gera custo inviável.',
  },

  // ── Grupo 7: Com margem desejada ──────────────────────────────────
  {
    id: 'H37',
    description: 'Margem desejada 10%, cenário saudável',
    input: {
      treatmentValue: 5000,
      installments: 6,
      cardFeePercent: 3.5,
      anticipationFeePercent: 0,
      desiredMarginPercent: 10,
    },
    expectedRisk: 'excellent',
    notes: 'desiredMarginPercent capturado mas não usado no cálculo atual. Registrado para revisão.',
  },
  {
    id: 'H38',
    description: 'Margem desejada 20%, cenário de atenção',
    input: {
      treatmentValue: 5000,
      installments: 6,
      cardFeePercent: 3.5,
      anticipationFeePercent: 2,
      desiredMarginPercent: 20,
    },
    // effective=15.5, antFee*n=12>5(!>12), score=59
    expectedRisk: 'attention',
    notes: 'desiredMarginPercent não altera o score atual. Ponto para evolução futura.',
  },
  {
    id: 'H39',
    description: 'Margem desejada 30%, cenário crítico',
    input: {
      treatmentValue: 5000,
      installments: 12,
      cardFeePercent: 3.5,
      anticipationFeePercent: 2,
      desiredMarginPercent: 30,
    },
    // score=20 → critical (independente da margem)
    expectedRisk: 'critical',
    notes: 'Margem desejada de 30% não é protegida pelo motor atual neste cenário.',
  },

  // ── Grupo 8: Casos representativos de ticket médio-alto ───────────
  {
    id: 'H40',
    description: 'Ticket médio, 18x, taxa normal sem antecipação',
    input: { treatmentValue: 5000, installments: 18, cardFeePercent: 3.5, anticipationFeePercent: 0 },
    // effective=3.5, n>6(-5), n>12(-10), score=78
    expectedRisk: 'healthy',
    notes: '18x sem antecipação — prazo longo mas sem custo adicional.',
  },

  // ── Grupo 9: Invariante INV-10 — antecipação em 1x (H1.1) ─────────
  {
    id: 'H41',
    description: 'Ticket médio-baixo, 1x, antecipação informada (deve ser ignorada)',
    input: { treatmentValue: 2500, installments: 1, cardFeePercent: 3.5, anticipationFeePercent: 2 },
    // Após H1.1: anticipationCost=0, effective=3.5, score=93 → excellent
    expectedRisk: 'excellent',
    notes:
      'Valida INV-10: installments=1 deve zerar anticipationCost independente de anticipationFeePercent. ' +
      'RH-2 encerrado: comportamento agora é determinístico e financeiramente coerente.',
  },
]

// ── Validação de invariantes financeiros ───────────────────────────────

function validateInvariants(
  input: ParcelamentoInput,
  calc: ReturnType<typeof runParcelamentoSimulator>['calculation'],
): string[] {
  const issues: string[] = []
  const { treatmentValue, installments, cardFeePercent, anticipationFeePercent } = input

  // 1. installmentValue === round2(treatmentValue / installments)
  const expectedInstallment = round2(treatmentValue / installments)
  if (calc.installmentValue !== expectedInstallment) {
    issues.push(
      `[INV-1] installmentValue esperado ${expectedInstallment}, recebido ${calc.installmentValue}`,
    )
  }

  // 2. netValueFlow <= treatmentValue
  if (calc.netValueFlow > treatmentValue + 0.001) {
    issues.push(
      `[INV-2] netValueFlow (${calc.netValueFlow}) > treatmentValue (${treatmentValue})`,
    )
  }

  // 3. netValueAnticipated <= netValueFlow
  if (calc.netValueAnticipated > calc.netValueFlow + 0.001) {
    issues.push(
      `[INV-3] netValueAnticipated (${calc.netValueAnticipated}) > netValueFlow (${calc.netValueFlow})`,
    )
  }

  // 4. cardFeeAmount >= 0
  if (calc.cardFeeAmount < 0) {
    issues.push(`[INV-4] cardFeeAmount negativo: ${calc.cardFeeAmount}`)
  }

  // 5. anticipationCost >= 0
  if (calc.anticipationCost < 0) {
    issues.push(`[INV-5] anticipationCost negativo: ${calc.anticipationCost}`)
  }

  // 6. effectiveFeePercent >= 0
  if (calc.effectiveFeePercent < 0) {
    issues.push(`[INV-6] effectiveFeePercent negativo: ${calc.effectiveFeePercent}`)
  }

  // 7. suggestedTreatmentValue >= treatmentValue
  if (calc.suggestedTreatmentValue < treatmentValue - 0.001) {
    issues.push(
      `[INV-7] suggestedTreatmentValue (${calc.suggestedTreatmentValue}) < treatmentValue (${treatmentValue})`,
    )
  }

  // 8. suggestedInstallmentValue >= installmentValue
  if (calc.suggestedInstallmentValue < calc.installmentValue - 0.001) {
    issues.push(
      `[INV-8] suggestedInstallmentValue (${calc.suggestedInstallmentValue}) < installmentValue (${calc.installmentValue})`,
    )
  }

  // 9. Se ambas as taxas são zero
  if (cardFeePercent === 0 && anticipationFeePercent === 0) {
    if (Math.abs(calc.netValueFlow - treatmentValue) > 0.001) {
      issues.push(
        `[INV-9a] taxas=0 mas netValueFlow (${calc.netValueFlow}) ≠ treatmentValue (${treatmentValue})`,
      )
    }
    if (Math.abs(calc.netValueAnticipated - treatmentValue) > 0.001) {
      issues.push(
        `[INV-9b] taxas=0 mas netValueAnticipated (${calc.netValueAnticipated}) ≠ treatmentValue (${treatmentValue})`,
      )
    }
    if (calc.effectiveFeePercent !== 0) {
      issues.push(
        `[INV-9c] taxas=0 mas effectiveFeePercent = ${calc.effectiveFeePercent}`,
      )
    }
  }

  // 10. installments=1: anticipationCost deve ser 0 (regra de negócio H1.1)
  if (installments === 1 && anticipationFeePercent > 0) {
    if (calc.anticipationCost !== 0) {
      issues.push(
        `[INV-10a] installments=1 mas anticipationCost = ${calc.anticipationCost} (esperado 0)`,
      )
    }
    if (Math.abs(calc.netValueAnticipated - calc.netValueFlow) > 0.001) {
      issues.push(
        `[INV-10b] installments=1 mas netValueAnticipated (${calc.netValueAnticipated}) ≠ netValueFlow (${calc.netValueFlow})`,
      )
    }
  }

  return issues
}

// ── Validação de narrativa ─────────────────────────────────────────────

function validateNarrative(
  narrative: ReturnType<typeof generateParcelamentoNarrative>,
): string[] {
  const issues: string[] = []

  if (!narrative.headline)
    issues.push('[NAR-1] headline vazia')
  if (narrative.headline.length > 80)
    issues.push(`[NAR-2] headline excede 80 chars (${narrative.headline.length})`)

  if (!narrative.summary)
    issues.push('[NAR-3] summary vazia')
  if (narrative.summary.length > 280)
    issues.push(`[NAR-4] summary excede 280 chars (${narrative.summary.length})`)

  if (!narrative.scenarioReading.body)
    issues.push('[NAR-5] scenarioReading.body vazio')
  if (narrative.scenarioReading.body.length > 240)
    issues.push(`[NAR-6] scenarioReading.body excede 240 chars (${narrative.scenarioReading.body.length})`)

  if (!narrative.practicalAction.body)
    issues.push('[NAR-7] practicalAction.body vazio')
  if (narrative.practicalAction.body.length > 240)
    issues.push(`[NAR-8] practicalAction.body excede 240 chars (${narrative.practicalAction.body.length})`)

  if (!narrative.closingNote)
    issues.push('[NAR-9] closingNote vazio')
  if (narrative.closingNote.length > 160)
    issues.push(`[NAR-10] closingNote excede 160 chars (${narrative.closingNote.length})`)

  return issues
}

// ── Função principal ───────────────────────────────────────────────────

export function runParcelamentoHomologation(): ParcelamentoHomologationReport {
  const results: ParcelamentoHomologationResult[] = []

  for (const scenario of SCENARIOS) {
    const issues: string[] = []

    const orchestratorResult = runParcelamentoSimulator(scenario.input)
    const narrative = generateParcelamentoNarrative(orchestratorResult)

    const { calculation, diagnostic } = orchestratorResult

    // Invariantes financeiros
    issues.push(...validateInvariants(scenario.input, calculation))

    // Status esperado
    if (diagnostic.status !== scenario.expectedRisk) {
      issues.push(
        `[STATUS] Esperado "${scenario.expectedRisk}", recebido "${diagnostic.status}" (score=${diagnostic.score})`,
      )
    }

    // Narrativa
    issues.push(...validateNarrative(narrative))

    results.push({
      scenarioId: scenario.id,
      passed: issues.length === 0,
      status: diagnostic.status,
      score: diagnostic.score,
      issues,
    })
  }

  const passed = results.filter((r) => r.passed).length

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  }
}
