import type {
  PontoEquilibrioCalculationResult,
  PontoEquilibrioDiagnosticItem,
  PontoEquilibrioDiagnosticResult,
  PontoEquilibrioDiagnosticSeverity,
  PontoEquilibrioDiagnosticStatus,
} from './types'

// Lower number = higher priority in warnings list
const SEVERITY_ORDER: Record<PontoEquilibrioDiagnosticSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
}

// ── Avaliadores individuais ────────────────────────────────────────────

function evalContributionMargin(
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticItem {
  const { contributionMarginPercent } = c

  if (contributionMarginPercent >= 75) {
    return {
      id: 'contribution-margin',
      severity: 'success',
      title: 'Margem de contribuição saudável',
      message:
        'A margem de contribuição oferece boa capacidade para cobrir custos fixos e gerar resultado.',
    }
  }
  if (contributionMarginPercent >= 60) {
    return {
      id: 'contribution-margin',
      severity: 'info',
      title: 'Margem de contribuição adequada',
      message:
        'A margem de contribuição é administrável, mas deve ser acompanhada em conjunto com volume e ticket médio.',
    }
  }
  if (contributionMarginPercent >= 40) {
    return {
      id: 'contribution-margin',
      severity: 'warning',
      title: 'Margem de contribuição pressionada',
      message:
        'A margem de contribuição reduz a capacidade da clínica de absorver custos fixos.',
    }
  }
  return {
    id: 'contribution-margin',
    severity: 'danger',
    title: 'Margem de contribuição crítica',
    message:
      'A margem de contribuição está baixa e exige revisão de custos variáveis, preços ou mix de procedimentos.',
  }
}

function evalProcedureVolume(
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticItem {
  const { breakEvenProcedures } = c

  if (breakEvenProcedures <= 80) {
    return {
      id: 'procedure-volume',
      severity: 'success',
      title: 'Volume de equilíbrio confortável',
      message:
        'A quantidade necessária de procedimentos para empatar parece operacionalmente confortável.',
    }
  }
  if (breakEvenProcedures <= 140) {
    return {
      id: 'procedure-volume',
      severity: 'info',
      title: 'Volume de equilíbrio administrável',
      message:
        'O volume necessário para empatar é relevante, mas ainda pode ser administrado com boa agenda.',
    }
  }
  if (breakEvenProcedures <= 220) {
    return {
      id: 'procedure-volume',
      severity: 'warning',
      title: 'Volume de equilíbrio elevado',
      message:
        'A clínica precisa de alto volume para cobrir custos, aumentando a pressão comercial e operacional.',
    }
  }
  return {
    id: 'procedure-volume',
    severity: 'danger',
    title: 'Volume de equilíbrio crítico',
    message:
      'O volume necessário para empatar parece muito alto e pode indicar estrutura de custos ou ticket incompatível.',
  }
}

function evalCurrentRevenueGap(
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticItem {
  if (c.currentMonthlyRevenue === undefined || c.revenueGapPercent === undefined) {
    return {
      id: 'current-revenue-gap',
      severity: 'info',
      title: 'Sem faturamento atual para comparação',
      message:
        'Informe o faturamento atual futuramente para comparar a operação com o ponto de equilíbrio.',
    }
  }

  const { revenueGapPercent } = c

  if (revenueGapPercent >= 25) {
    return {
      id: 'current-revenue-gap',
      severity: 'success',
      title: 'Faturamento acima do ponto de equilíbrio',
      message:
        'O faturamento atual está acima do ponto de equilíbrio com boa folga operacional.',
    }
  }
  if (revenueGapPercent >= 0) {
    return {
      id: 'current-revenue-gap',
      severity: 'info',
      title: 'Faturamento acima do mínimo',
      message:
        'O faturamento atual cobre o ponto de equilíbrio, mas a folga ainda deve ser acompanhada.',
    }
  }
  if (revenueGapPercent >= -20) {
    return {
      id: 'current-revenue-gap',
      severity: 'warning',
      title: 'Faturamento abaixo do ponto de equilíbrio',
      message:
        'O faturamento atual está abaixo do ponto de equilíbrio e exige atenção para evitar prejuízo operacional.',
    }
  }
  return {
    id: 'current-revenue-gap',
    severity: 'danger',
    title: 'Faturamento criticamente abaixo do equilíbrio',
    message:
      'O faturamento atual está muito abaixo do necessário para cobrir os custos fixos e variáveis estimados.',
  }
}

function evalSafetyMargin(
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticItem {
  if (c.safetyMarginPercent === undefined) {
    return {
      id: 'safety-margin',
      severity: 'info',
      title: 'Sem margem de segurança calculada',
      message:
        'A margem de segurança depende do faturamento atual informado.',
    }
  }

  const { safetyMarginPercent } = c

  if (safetyMarginPercent >= 20) {
    return {
      id: 'safety-margin',
      severity: 'success',
      title: 'Margem de segurança saudável',
      message: 'A clínica opera com folga relevante acima do ponto de equilíbrio.',
    }
  }
  if (safetyMarginPercent >= 5) {
    return {
      id: 'safety-margin',
      severity: 'info',
      title: 'Margem de segurança moderada',
      message:
        'Existe folga acima do ponto de equilíbrio, mas ela ainda é sensível a quedas de faturamento.',
    }
  }
  if (safetyMarginPercent >= 0) {
    return {
      id: 'safety-margin',
      severity: 'warning',
      title: 'Margem de segurança estreita',
      message:
        'A operação está pouco acima do equilíbrio e pode entrar em pressão com pequenas variações.',
    }
  }
  return {
    id: 'safety-margin',
    severity: 'danger',
    title: 'Sem margem de segurança',
    message:
      'A clínica está abaixo do ponto de equilíbrio e não apresenta folga financeira.',
  }
}

function evalFixedCostVsTicket(
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticItem {
  const fixedCostTicketRatio = c.monthlyFixedCosts / c.averageTicket

  if (fixedCostTicketRatio <= 80) {
    return {
      id: 'fixed-cost-ticket',
      severity: 'success',
      title: 'Custo fixo compatível com ticket',
      message:
        'A relação entre custo fixo e ticket médio indica uma estrutura operacional mais leve.',
    }
  }
  if (fixedCostTicketRatio <= 140) {
    return {
      id: 'fixed-cost-ticket',
      severity: 'info',
      title: 'Custo fixo administrável',
      message:
        'A estrutura de custo fixo exige volume relevante, mas ainda parece administrável.',
    }
  }
  if (fixedCostTicketRatio <= 220) {
    return {
      id: 'fixed-cost-ticket',
      severity: 'warning',
      title: 'Custo fixo pesado para o ticket',
      message:
        'O custo fixo exige muitos atendimentos para ser absorvido pelo ticket médio.',
    }
  }
  return {
    id: 'fixed-cost-ticket',
    severity: 'danger',
    title: 'Custo fixo crítico para o ticket',
    message:
      'A relação entre custo fixo e ticket médio indica forte pressão sobre o ponto de equilíbrio.',
  }
}

// ── Score ──────────────────────────────────────────────────────────────

function calculateScore(c: PontoEquilibrioCalculationResult): number {
  const { contributionMarginPercent, breakEvenProcedures, monthlyFixedCosts, averageTicket } = c
  const fixedCostTicketRatio = monthlyFixedCosts / averageTicket

  let score = 100

  // Contribution margin
  if (contributionMarginPercent < 75) score -= 8
  if (contributionMarginPercent < 60) score -= 12
  if (contributionMarginPercent < 40) score -= 20

  // Procedure volume
  if (breakEvenProcedures > 80) score -= 6
  if (breakEvenProcedures > 140) score -= 10
  if (breakEvenProcedures > 220) score -= 16

  // Current revenue gap (when available)
  if (c.revenueGapPercent !== undefined) {
    if (c.revenueGapPercent < 25) score -= 6
    if (c.revenueGapPercent < 0) score -= 18
    if (c.revenueGapPercent < -20) score -= 18
  }

  // Safety margin (when available)
  if (c.safetyMarginPercent !== undefined) {
    if (c.safetyMarginPercent < 20) score -= 6
    if (c.safetyMarginPercent < 5) score -= 10
    if (c.safetyMarginPercent < 0) score -= 18
  }

  // Fixed cost vs ticket
  if (fixedCostTicketRatio > 80) score -= 6
  if (fixedCostTicketRatio > 140) score -= 10
  if (fixedCostTicketRatio > 220) score -= 16

  return Math.round(Math.min(100, Math.max(0, score)))
}

// ── Status ─────────────────────────────────────────────────────────────

function getStatus(
  score: number,
  c: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticStatus {
  const fixedCostTicketRatio = c.monthlyFixedCosts / c.averageTicket

  // Force-critical conditions
  if (
    c.contributionMarginPercent <= 5 ||
    (c.revenueGapPercent !== undefined && c.revenueGapPercent < -35) ||
    c.breakEvenProcedures > 300 ||
    fixedCostTicketRatio > 300
  ) {
    return 'critical'
  }

  if (score >= 80) return 'excellent'
  if (score >= 60) return 'healthy'
  if (score >= 40) return 'attention'
  return 'critical'
}

const SUMMARIES: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent:
    'O ponto de equilíbrio está bem estruturado, com margem e volume em condição saudável.',
  healthy:
    'O ponto de equilíbrio está administrável, mas alguns indicadores devem ser acompanhados.',
  attention:
    'O ponto de equilíbrio exige revisão, pois volume, margem ou faturamento atual estão pressionados.',
  critical:
    'O ponto de equilíbrio está em condição crítica e pode comprometer a sustentabilidade financeira da clínica.',
}

// ── Função principal ───────────────────────────────────────────────────

export function diagnosePontoEquilibrio(
  calculation: PontoEquilibrioCalculationResult,
): PontoEquilibrioDiagnosticResult {
  const items: PontoEquilibrioDiagnosticItem[] = [
    evalContributionMargin(calculation),
    evalProcedureVolume(calculation),
    evalCurrentRevenueGap(calculation),
    evalSafetyMargin(calculation),
    evalFixedCostVsTicket(calculation),
  ]

  const positives = items.filter((item) => item.severity === 'success')
  const warnings = items
    .filter((item) => item.severity !== 'success')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const score = calculateScore(calculation)
  const status = getStatus(score, calculation)

  return {
    status,
    score,
    summary: SUMMARIES[status],
    positives,
    warnings,
  }
}
