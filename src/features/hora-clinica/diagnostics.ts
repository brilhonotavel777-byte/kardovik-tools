import type {
  HoraClinicaCalculationResult,
  HoraClinicaDiagnosticItem,
  HoraClinicaDiagnosticResult,
  HoraClinicaDiagnosticSeverity,
  HoraClinicaDiagnosticStatus,
} from './types'

// Lower number = higher priority in warnings list
const SEVERITY_ORDER: Record<HoraClinicaDiagnosticSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
}

// ── Avaliadores individuais ────────────────────────────────────────────

function evalOccupancyRate(
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticItem {
  const { occupancyRatePercent } = c

  if (occupancyRatePercent >= 80) {
    return {
      id: 'occupancy-rate',
      severity: 'success',
      title: 'Alta ocupação',
      message: 'A clínica utiliza bem a capacidade disponível.',
    }
  }
  if (occupancyRatePercent >= 65) {
    return {
      id: 'occupancy-rate',
      severity: 'info',
      title: 'Ocupação saudável',
      message:
        'A ocupação está em uma faixa administrável, mas ainda há espaço para melhorar.',
    }
  }
  if (occupancyRatePercent >= 50) {
    return {
      id: 'occupancy-rate',
      severity: 'warning',
      title: 'Ocupação pressionada',
      message:
        'A clínica possui horas ociosas relevantes que elevam o custo da hora clínica.',
    }
  }
  return {
    id: 'occupancy-rate',
    severity: 'danger',
    title: 'Baixa ocupação',
    message:
      'A baixa ocupação dilui os custos em poucas horas produtivas e pressiona a rentabilidade.',
  }
}

function evalClinicalHourCost(
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticItem {
  const { clinicalHourCost } = c

  if (clinicalHourCost <= 250) {
    return {
      id: 'clinical-hour-cost',
      severity: 'success',
      title: 'Custo da hora controlado',
      message:
        'O custo da hora clínica está em uma faixa operacionalmente confortável.',
    }
  }
  if (clinicalHourCost <= 400) {
    return {
      id: 'clinical-hour-cost',
      severity: 'info',
      title: 'Custo da hora moderado',
      message:
        'O custo da hora clínica exige acompanhamento, mas ainda parece administrável.',
    }
  }
  if (clinicalHourCost <= 700) {
    return {
      id: 'clinical-hour-cost',
      severity: 'warning',
      title: 'Custo da hora elevado',
      message:
        'O custo da hora clínica está alto e pode dificultar a precificação dos procedimentos.',
    }
  }
  return {
    id: 'clinical-hour-cost',
    severity: 'danger',
    title: 'Custo da hora crítico',
    message:
      'O custo da hora clínica está muito elevado e pode comprometer a sustentabilidade da operação.',
  }
}

function evalIdleCost(
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticItem {
  const idleCostRatio =
    c.totalMonthlyCost > 0 ? c.idleHoursCost / c.totalMonthlyCost : 0

  if (idleCostRatio <= 0.15) {
    return {
      id: 'idle-cost',
      severity: 'success',
      title: 'Ociosidade controlada',
      message: 'O custo associado à ociosidade está em nível baixo.',
    }
  }
  if (idleCostRatio <= 0.3) {
    return {
      id: 'idle-cost',
      severity: 'info',
      title: 'Ociosidade moderada',
      message: 'A ociosidade existe, mas ainda está em uma faixa administrável.',
    }
  }
  if (idleCostRatio <= 0.5) {
    return {
      id: 'idle-cost',
      severity: 'warning',
      title: 'Ociosidade relevante',
      message:
        'A clínica está carregando um custo importante de horas não produtivas.',
    }
  }
  return {
    id: 'idle-cost',
    severity: 'danger',
    title: 'Ociosidade crítica',
    message:
      'A ociosidade consome uma parcela muito alta da estrutura financeira.',
  }
}

function evalRevenueGap(
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticItem {
  const { revenueGapPercent } = c

  if (revenueGapPercent === 0) {
    return {
      id: 'revenue-gap',
      severity: 'success',
      title: 'Sem meta adicional de lucro',
      message:
        'A ferramenta calculou apenas o custo mínimo da hora clínica.',
    }
  }
  if (revenueGapPercent <= 25) {
    return {
      id: 'revenue-gap',
      severity: 'info',
      title: 'Meta de lucro moderada',
      message:
        'A diferença entre custo mínimo e receita recomendada é moderada.',
    }
  }
  if (revenueGapPercent <= 60) {
    return {
      id: 'revenue-gap',
      severity: 'warning',
      title: 'Meta de lucro exigente',
      message:
        'A meta de lucro aumenta de forma relevante a receita necessária por hora.',
    }
  }
  return {
    id: 'revenue-gap',
    severity: 'danger',
    title: 'Meta de lucro agressiva',
    message:
      'A meta de lucro exige uma receita por hora muito acima do custo mínimo.',
  }
}

function evalProductiveHours(
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticItem {
  const { productiveHours } = c

  if (productiveHours >= 140) {
    return {
      id: 'productive-hours',
      severity: 'success',
      title: 'Boa capacidade produtiva',
      message:
        'A clínica possui volume mensal relevante de horas produtivas.',
    }
  }
  if (productiveHours >= 90) {
    return {
      id: 'productive-hours',
      severity: 'info',
      title: 'Capacidade produtiva suficiente',
      message:
        'A clínica tem uma base razoável de horas produtivas para diluir custos.',
    }
  }
  if (productiveHours >= 50) {
    return {
      id: 'productive-hours',
      severity: 'warning',
      title: 'Capacidade produtiva limitada',
      message:
        'O volume de horas produtivas é limitado e aumenta a sensibilidade do custo da hora.',
    }
  }
  return {
    id: 'productive-hours',
    severity: 'danger',
    title: 'Baixa capacidade produtiva',
    message:
      'A baixa quantidade de horas produtivas torna a hora clínica financeiramente pressionada.',
  }
}

// ── Score ──────────────────────────────────────────────────────────────

function calculateScore(c: HoraClinicaCalculationResult): number {
  const { occupancyRatePercent, clinicalHourCost, totalMonthlyCost, idleHoursCost, revenueGapPercent, productiveHours } = c

  const idleCostRatio = totalMonthlyCost > 0 ? idleHoursCost / totalMonthlyCost : 0

  let score = 100

  // Penalidade por ocupação baixa
  if (occupancyRatePercent < 80) score -= 8
  if (occupancyRatePercent < 65) score -= 12
  if (occupancyRatePercent < 50) score -= 15

  // Penalidade por custo de hora elevado
  if (clinicalHourCost > 250) score -= 6
  if (clinicalHourCost > 400) score -= 10
  if (clinicalHourCost > 700) score -= 15

  // Penalidade por ociosidade
  if (idleCostRatio > 0.15) score -= 6
  if (idleCostRatio > 0.3) score -= 10
  if (idleCostRatio > 0.5) score -= 15

  // Penalidade por gap de receita exigente
  if (revenueGapPercent > 25) score -= 6
  if (revenueGapPercent > 60) score -= 12

  // Penalidade por baixa capacidade produtiva
  if (productiveHours < 140) score -= 5
  if (productiveHours < 90) score -= 8
  if (productiveHours < 50) score -= 12

  return Math.round(Math.min(100, Math.max(0, score)))
}

// ── Status ─────────────────────────────────────────────────────────────

function resolveStatus(
  score: number,
  c: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticStatus {
  const idleCostRatio =
    c.totalMonthlyCost > 0 ? c.idleHoursCost / c.totalMonthlyCost : 0

  // Condições que forçam critical independente do score
  if (
    c.occupancyRatePercent < 40 ||
    c.clinicalHourCost > 900 ||
    c.productiveHours < 35 ||
    idleCostRatio > 0.65
  ) {
    return 'critical'
  }

  if (score >= 80) return 'excellent'
  if (score >= 60) return 'healthy'
  if (score >= 40) return 'attention'
  return 'critical'
}

const SUMMARIES: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent:
    'A hora clínica está bem estruturada, com boa capacidade produtiva e custos sob controle.',
  healthy:
    'A hora clínica está em condição administrável, mas ainda existem pontos de eficiência a acompanhar.',
  attention:
    'A hora clínica exige revisão operacional, pois custos, ocupação ou capacidade estão pressionando a operação.',
  critical:
    'A hora clínica está em condição crítica e pode comprometer a sustentabilidade financeira da clínica.',
}

// ── Função principal ───────────────────────────────────────────────────

export function diagnoseHoraClinica(
  calculation: HoraClinicaCalculationResult,
): HoraClinicaDiagnosticResult {
  const items: HoraClinicaDiagnosticItem[] = [
    evalOccupancyRate(calculation),
    evalClinicalHourCost(calculation),
    evalIdleCost(calculation),
    evalRevenueGap(calculation),
    evalProductiveHours(calculation),
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
