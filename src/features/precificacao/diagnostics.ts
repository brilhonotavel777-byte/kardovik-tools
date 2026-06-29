import type {
  PrecificacaoCalculationResult,
  PrecificacaoDiagnosticItem,
  PrecificacaoDiagnosticResult,
  PrecificacaoDiagnosticSeverity,
  PrecificacaoDiagnosticStatus,
} from './types'

// Lower number = higher priority in warnings list
const SEVERITY_ORDER: Record<PrecificacaoDiagnosticSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
}

// ── Avaliadores individuais ────────────────────────────────────────────

function evalEstimatedMargin(
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticItem {
  const { estimatedMarginPercent, desiredMarginPercent } = c

  if (estimatedMarginPercent >= desiredMarginPercent) {
    return {
      id: 'margin-level',
      severity: 'success',
      title: 'Margem preservada',
      message:
        'O preço sugerido preserva a margem desejada com base nos custos informados.',
    }
  }
  if (estimatedMarginPercent >= desiredMarginPercent * 0.8) {
    return {
      id: 'margin-level',
      severity: 'info',
      title: 'Margem próxima do desejado',
      message:
        'A margem estimada fica próxima da meta, mas ainda merece acompanhamento.',
    }
  }
  if (estimatedMarginPercent >= desiredMarginPercent * 0.5) {
    return {
      id: 'margin-level',
      severity: 'warning',
      title: 'Margem pressionada',
      message:
        'A margem estimada fica abaixo do objetivo e pode limitar o lucro do procedimento.',
    }
  }
  return {
    id: 'margin-level',
    severity: 'danger',
    title: 'Margem insuficiente',
    message:
      'A margem estimada está muito abaixo do desejado e exige revisão do preço ou dos custos.',
  }
}

function evalCurrentPrice(
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticItem {
  if (c.currentPriceStatus === undefined) {
    return {
      id: 'current-price',
      severity: 'info',
      title: 'Sem preço atual para comparação',
      message:
        'Informe um preço atual futuramente para comparar o valor praticado com o preço sugerido.',
    }
  }
  if (c.currentPriceStatus === 'healthy') {
    return {
      id: 'current-price',
      severity: 'success',
      title: 'Preço atual saudável',
      message: 'O preço atual informado está igual ou acima do preço sugerido.',
    }
  }
  if (c.currentPriceStatus === 'belowSuggested') {
    return {
      id: 'current-price',
      severity: 'warning',
      title: 'Preço atual abaixo do sugerido',
      message:
        'O preço atual cobre os custos estimados, mas não preserva toda a margem desejada.',
    }
  }
  return {
    id: 'current-price',
    severity: 'danger',
    title: 'Preço atual abaixo do mínimo',
    message:
      'O preço atual pode não cobrir os custos e deduções estimadas.',
  }
}

function evalDeductions(
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticItem {
  const { deductionPercent } = c

  if (deductionPercent <= 8) {
    return {
      id: 'deduction-level',
      severity: 'success',
      title: 'Taxas e impostos controlados',
      message: 'As deduções estimadas têm impacto baixo na formação do preço.',
    }
  }
  if (deductionPercent <= 15) {
    return {
      id: 'deduction-level',
      severity: 'info',
      title: 'Deduções moderadas',
      message:
        'As taxas e impostos têm impacto relevante, mas ainda administrável.',
    }
  }
  if (deductionPercent <= 25) {
    return {
      id: 'deduction-level',
      severity: 'warning',
      title: 'Deduções elevadas',
      message:
        'As deduções consomem parte importante do preço e pressionam a margem.',
    }
  }
  return {
    id: 'deduction-level',
    severity: 'danger',
    title: 'Deduções críticas',
    message:
      'As deduções são altas e podem tornar o preço sugerido difícil de sustentar.',
  }
}

function evalClinicalTimeWeight(
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticItem {
  const clinicalTimeWeightPercent = (c.clinicalTimeCost / c.directCost) * 100

  if (clinicalTimeWeightPercent <= 35) {
    return {
      id: 'clinical-time-weight',
      severity: 'success',
      title: 'Tempo clínico equilibrado',
      message:
        'O tempo clínico não domina a composição de custo do procedimento.',
    }
  }
  if (clinicalTimeWeightPercent <= 55) {
    return {
      id: 'clinical-time-weight',
      severity: 'info',
      title: 'Tempo clínico relevante',
      message:
        'O tempo clínico tem peso importante e deve ser considerado na precificação.',
    }
  }
  if (clinicalTimeWeightPercent <= 75) {
    return {
      id: 'clinical-time-weight',
      severity: 'warning',
      title: 'Tempo clínico dominante',
      message:
        'Grande parte do custo vem do tempo de cadeira, exigindo atenção à agenda e produtividade.',
    }
  }
  return {
    id: 'clinical-time-weight',
    severity: 'danger',
    title: 'Tempo clínico crítico',
    message:
      'O tempo clínico domina o custo e pode comprometer a viabilidade do procedimento.',
  }
}

function evalLabWeight(
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticItem {
  if (c.labCost === 0) {
    return {
      id: 'lab-weight',
      severity: 'success',
      title: 'Sem custo de laboratório',
      message: 'Não há custo de laboratório informado para este procedimento.',
    }
  }

  const labWeightPercent = (c.labCost / c.directCost) * 100

  if (labWeightPercent <= 20) {
    return {
      id: 'lab-weight',
      severity: 'info',
      title: 'Laboratório controlado',
      message:
        'O custo de laboratório tem participação administrável no custo total.',
    }
  }
  if (labWeightPercent <= 40) {
    return {
      id: 'lab-weight',
      severity: 'warning',
      title: 'Laboratório pesa no preço',
      message:
        'O laboratório representa uma parcela relevante e deve ser considerado no valor final.',
    }
  }
  return {
    id: 'lab-weight',
    severity: 'danger',
    title: 'Laboratório crítico',
    message:
      'O custo de laboratório domina parte importante da precificação.',
  }
}

// ── Score ──────────────────────────────────────────────────────────────

function clampScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}

function calculateScore(c: PrecificacaoCalculationResult): number {
  const {
    estimatedMarginPercent,
    desiredMarginPercent,
    currentPriceStatus,
    deductionPercent,
    clinicalTimeCost,
    directCost,
    labCost,
    estimatedProfit,
  } = c

  // Lucro negativo → score zero imediato
  if (estimatedProfit < 0) return 0

  let score = 100

  // A. Margem abaixo do desejado
  const marginGap = desiredMarginPercent - estimatedMarginPercent
  if (marginGap > 0) {
    score -= marginGap * 2
  }

  // B. Preço atual
  if (currentPriceStatus === 'belowSuggested') score -= 15
  if (currentPriceStatus === 'belowMinimum') score -= 35

  // C. Deduções
  if (deductionPercent > 15) score -= 10
  if (deductionPercent > 25) score -= 10

  // D. Tempo clínico dominante
  const clinicalTimeWeightPercent = (clinicalTimeCost / directCost) * 100
  if (clinicalTimeWeightPercent > 55) score -= 8
  if (clinicalTimeWeightPercent > 75) score -= 10

  // E. Laboratório dominante
  const labWeightPercent = (labCost / directCost) * 100
  if (labWeightPercent > 40) score -= 10

  return clampScore(score)
}

// ── Status ─────────────────────────────────────────────────────────────

function resolveStatus(
  score: number,
  c: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticStatus {
  // Condições que forçam critical independente do score
  if (
    c.estimatedProfit < 0 ||
    c.currentPriceStatus === 'belowMinimum' ||
    c.deductionPercent + c.desiredMarginPercent >= 95
  ) {
    return 'critical'
  }

  if (score >= 80) return 'excellent'
  if (score >= 60) return 'healthy'
  if (score >= 40) return 'attention'
  return 'critical'
}

const SUMMARIES: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent:
    'Preço sugerido bem estruturado para cobrir custos e preservar margem.',
  healthy: 'Preço viável, com alguns pontos que merecem acompanhamento.',
  attention:
    'O cenário exige revisão antes de manter ou apresentar este preço.',
  critical:
    'Há risco financeiro relevante na formação do preço deste procedimento.',
}

// ── Função principal ───────────────────────────────────────────────────

export function diagnosePrecificacao(
  calculation: PrecificacaoCalculationResult,
): PrecificacaoDiagnosticResult {
  const items: PrecificacaoDiagnosticItem[] = [
    evalEstimatedMargin(calculation),
    evalCurrentPrice(calculation),
    evalDeductions(calculation),
    evalClinicalTimeWeight(calculation),
    evalLabWeight(calculation),
  ]

  const positives = items.filter((item) => item.severity === 'success')
  const warnings = items
    .filter((item) => item.severity !== 'success')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const score = calculateScore(calculation)
  const status = resolveStatus(score, calculation)

  return {
    status,
    score,
    summary: SUMMARIES[status],
    positives,
    warnings,
  }
}
