import type {
  ParcelamentoCalculationResult,
  ParcelamentoDiagnosticItem,
  ParcelamentoDiagnosticResult,
  ParcelamentoDiagnosticSeverity,
  ParcelamentoDiagnosticStatus,
} from './types'

// Lower number = higher priority in warnings list
const SEVERITY_ORDER: Record<ParcelamentoDiagnosticSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
}

// ── Avaliadores individuais ────────────────────────────────────────────

function evalFeeLevel(
  c: ParcelamentoCalculationResult,
): ParcelamentoDiagnosticItem {
  const pct = c.effectiveFeePercent.toFixed(2)

  if (c.effectiveFeePercent <= 5) {
    return {
      id: 'fee-level',
      severity: 'success',
      title: 'Taxas controladas',
      message: `A perda efetiva em taxas está em ${pct}%, dentro de um patamar saudável para este cenário.`,
    }
  }
  if (c.effectiveFeePercent <= 10) {
    return {
      id: 'fee-level',
      severity: 'info',
      title: 'As taxas reduzem parte da margem',
      message: `Com ${pct}% de perda efetiva, as taxas já pressionam o resultado. Um reajuste preventivo pode ser prudente.`,
    }
  }
  if (c.effectiveFeePercent <= 18) {
    return {
      id: 'fee-level',
      severity: 'warning',
      title: 'As taxas estão pressionando a rentabilidade',
      message: `A perda efetiva em taxas está em ${pct}%, um nível que afeta de forma relevante o valor líquido recebido.`,
    }
  }
  return {
    id: 'fee-level',
    severity: 'danger',
    title: 'As taxas comprometem fortemente o resultado líquido',
    message: `Com ${pct}% de perda efetiva, este cenário pode inviabilizar a margem. Revisar o valor ou as condições é necessário.`,
  }
}

function evalAnticipation(
  c: ParcelamentoCalculationResult,
): ParcelamentoDiagnosticItem {
  const { anticipationCost, differenceBetweenFlowAndAnticipated, treatmentValue } = c

  if (anticipationCost === 0) {
    return {
      id: 'anticipation-cost',
      severity: 'success',
      title: 'Sem custo de antecipação',
      message: 'Nenhuma taxa de antecipação foi considerada neste cenário.',
    }
  }

  const diff5 = treatmentValue * 0.05
  const diff12 = treatmentValue * 0.12

  if (differenceBetweenFlowAndAnticipated <= diff5) {
    return {
      id: 'anticipation-cost',
      severity: 'info',
      title: 'A antecipação tem impacto moderado',
      message: 'O custo de antecipar os recebíveis é controlado neste cenário.',
    }
  }
  if (differenceBetweenFlowAndAnticipated <= diff12) {
    return {
      id: 'anticipation-cost',
      severity: 'warning',
      title: 'A antecipação reduz de forma relevante o valor recebido',
      message:
        'Antecipar os recebíveis neste prazo implica uma perda que merece atenção antes de definir os valores finais.',
    }
  }
  return {
    id: 'anticipation-cost',
    severity: 'danger',
    title: 'A antecipação pode consumir uma parte importante do resultado',
    message:
      'O custo de antecipação neste cenário é elevado. Avaliar se a necessidade de caixa justifica essa perda é recomendado.',
  }
}

function evalAdjustment(
  c: ParcelamentoCalculationResult,
): ParcelamentoDiagnosticItem {
  const ratio = c.suggestedAdjustmentAmount / c.treatmentValue

  if (ratio <= 0.03) {
    return {
      id: 'adjustment-need',
      severity: 'success',
      title: 'Reajuste pouco necessário',
      message: 'O ajuste necessário para neutralizar as taxas é mínimo neste cenário.',
    }
  }
  if (ratio <= 0.08) {
    return {
      id: 'adjustment-need',
      severity: 'info',
      title: 'Pequeno reajuste pode preservar sua margem',
      message:
        'Um ajuste moderado no valor do tratamento pode proteger o resultado líquido sem impacto significativo para o paciente.',
    }
  }
  if (ratio <= 0.15) {
    return {
      id: 'adjustment-need',
      severity: 'warning',
      title: 'Reajuste recomendado antes de apresentar a proposta',
      message:
        'Para manter a margem, um reajuste relevante no valor deve ser considerado antes de fechar o orçamento com o paciente.',
    }
  }
  return {
    id: 'adjustment-need',
    severity: 'danger',
    title: 'Preço atual pode não proteger sua margem',
    message:
      'O reajuste necessário para neutralizar as taxas é expressivo. Avaliar a viabilidade deste formato de parcelamento é recomendado.',
  }
}

function evalInstallments(
  c: ParcelamentoCalculationResult,
): ParcelamentoDiagnosticItem {
  const { installments } = c
  const plural = installments > 1 ? 's' : ''

  if (installments <= 3) {
    return {
      id: 'installment-count',
      severity: 'success',
      title: 'Parcelamento curto',
      message: `Com ${installments} parcela${plural}, o custo financeiro tende a ser baixo e o recebimento mais rápido.`,
    }
  }
  if (installments <= 6) {
    return {
      id: 'installment-count',
      severity: 'info',
      title: 'Parcelamento equilibrado',
      message: `${installments} parcelas é um prazo adequado para a maioria dos tratamentos, com impacto financeiro controlável.`,
    }
  }
  if (installments <= 12) {
    return {
      id: 'installment-count',
      severity: 'warning',
      title: 'Parcelamento longo exige atenção às taxas',
      message: `Com ${installments} parcelas${plural.length ? '' : ''}, o custo de antecipação acumula ao longo do tempo e pode reduzir de forma relevante o valor recebido.`,
    }
  }
  return {
    id: 'installment-count',
    severity: 'danger',
    title: 'Parcelamento muito longo pode prejudicar o recebimento líquido',
    message: `${installments} parcelas implica alto custo acumulado, especialmente com antecipação dos recebíveis. Revisar o prazo ou o valor é recomendado.`,
  }
}

// ── Score ──────────────────────────────────────────────────────────────

function calcScore(c: ParcelamentoCalculationResult): number {
  const { effectiveFeePercent, installments, differenceBetweenFlowAndAnticipated, treatmentValue } = c

  let score = 100

  score -= effectiveFeePercent * 2

  if (installments > 6) score -= 5
  if (installments > 12) score -= 10

  if (differenceBetweenFlowAndAnticipated > treatmentValue * 0.05) score -= 10
  if (differenceBetweenFlowAndAnticipated > treatmentValue * 0.12) score -= 10

  return Math.round(Math.min(100, Math.max(0, score)))
}

// ── Status ─────────────────────────────────────────────────────────────

function resolveStatus(score: number): ParcelamentoDiagnosticStatus {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'healthy'
  if (score >= 50) return 'attention'
  return 'critical'
}

const SUMMARIES: Record<ParcelamentoDiagnosticStatus, string> = {
  excellent:
    'Este cenário de parcelamento está bem equilibrado e tende a preservar o recebimento líquido.',
  healthy:
    'Este cenário é viável, mas alguns custos financeiros devem ser observados antes da proposta final.',
  attention:
    'Este cenário exige atenção: taxas, antecipação ou prazo podem reduzir sua margem.',
  critical:
    'Este cenário precisa ser revisado antes de ser apresentado ao paciente, pois pode comprometer o resultado líquido.',
}

// ── Função principal ───────────────────────────────────────────────────

export function diagnoseParcelamento(
  calculation: ParcelamentoCalculationResult,
): ParcelamentoDiagnosticResult {
  const items: ParcelamentoDiagnosticItem[] = [
    evalFeeLevel(calculation),
    evalAnticipation(calculation),
    evalAdjustment(calculation),
    evalInstallments(calculation),
  ]

  const positives = items.filter((item) => item.severity === 'success')
  const warnings = items
    .filter((item) => item.severity !== 'success')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const score = calcScore(calculation)
  const status = resolveStatus(score)

  return {
    status,
    score,
    summary: SUMMARIES[status],
    positives,
    warnings,
  }
}
