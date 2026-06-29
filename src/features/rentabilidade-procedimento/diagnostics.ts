import type {
  RentabilidadeProcedimentoCalculationResult,
  RentabilidadeProcedimentoDiagnosticItem,
  RentabilidadeProcedimentoDiagnosticResult,
  RentabilidadeProcedimentoDiagnosticSeverity,
  RentabilidadeProcedimentoDiagnosticStatus,
} from './types'

// ── Helpers ────────────────────────────────────────────────────────────

function item(
  id: string,
  severity: RentabilidadeProcedimentoDiagnosticSeverity,
  title: string,
  message: string,
): RentabilidadeProcedimentoDiagnosticItem {
  return { id, severity, title, message }
}

// ── Avaliadores independentes ──────────────────────────────────────────

function evalProfitMargin(
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticItem {
  const { profitMarginPercent } = c
  const id = 'profit-margin'
  if (profitMarginPercent >= 35)
    return item(id, 'success', 'Margem de lucro saudável', 'A margem líquida do procedimento oferece boa capacidade de remuneração após custos.')
  if (profitMarginPercent >= 20)
    return item(id, 'info', 'Margem de lucro adequada', 'A margem líquida é administrável, mas deve ser acompanhada junto com custo e tempo clínico.')
  if (profitMarginPercent >= 10)
    return item(id, 'warning', 'Margem de lucro pressionada', 'A margem líquida está pressionada e pode reduzir a atratividade financeira do procedimento.')
  return item(id, 'danger', 'Margem de lucro crítica', 'A margem líquida está baixa e exige revisão de preço, custo ou tempo clínico.')
}

function evalProfitPerHour(
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticItem {
  const id = 'profit-per-hour'
  const ratio = c.hourlyClinicalCost > 0 ? c.profitPerHour / c.hourlyClinicalCost : 0
  if (ratio >= 1)
    return item(id, 'success', 'Rentabilidade por hora saudável', 'O procedimento gera lucro por hora compatível com a estrutura clínica informada.')
  if (ratio >= 0.5)
    return item(id, 'info', 'Rentabilidade por hora administrável', 'A rentabilidade por hora ainda é positiva, mas pode ser sensível a variações de custo ou tempo.')
  if (ratio >= 0)
    return item(id, 'warning', 'Rentabilidade por hora baixa', 'O procedimento gera pouco lucro por hora clínica utilizada.')
  return item(id, 'danger', 'Rentabilidade por hora negativa', 'O procedimento consome tempo clínico e gera prejuízo no cenário informado.')
}

function evalVariableCostWeight(
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticItem {
  const id = 'variable-cost-weight'
  const weight =
    c.procedurePrice > 0 ? (c.procedureVariableCost / c.procedurePrice) * 100 : 0
  if (weight <= 25)
    return item(id, 'success', 'Custo variável controlado', 'O peso dos custos variáveis está controlado em relação ao preço do procedimento.')
  if (weight <= 40)
    return item(id, 'info', 'Custo variável administrável', 'O custo variável tem impacto relevante, mas ainda parece administrável.')
  if (weight <= 60)
    return item(id, 'warning', 'Custo variável elevado', 'O custo variável consome parte importante da receita do procedimento.')
  return item(id, 'danger', 'Custo variável crítico', 'O custo variável está muito alto e compromete a margem do procedimento.')
}

function evalOperationalRoi(
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticItem {
  const id = 'operational-roi'
  const { operationalRoiPercent } = c
  if (operationalRoiPercent >= 50)
    return item(id, 'success', 'ROI operacional saudável', 'O retorno operacional sobre o custo total está em condição saudável.')
  if (operationalRoiPercent >= 25)
    return item(id, 'info', 'ROI operacional adequado', 'O retorno operacional é positivo e administrável.')
  if (operationalRoiPercent >= 0)
    return item(id, 'warning', 'ROI operacional baixo', 'O retorno operacional é baixo e pode não justificar a execução do procedimento nas condições atuais.')
  return item(id, 'danger', 'ROI operacional negativo', 'O procedimento apresenta retorno negativo sobre o custo total.')
}

function evalMarginGap(
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticItem {
  const id = 'margin-gap'
  const { marginGapPercent } = c
  if (marginGapPercent >= 5)
    return item(id, 'success', 'Margem acima da meta', 'A margem atual supera a margem desejada informada.')
  if (marginGapPercent >= 0)
    return item(id, 'info', 'Margem dentro da meta', 'A margem atual atinge a margem desejada, mas deve ser monitorada.')
  if (marginGapPercent >= -10)
    return item(id, 'warning', 'Margem abaixo da meta', 'A margem atual está abaixo da meta e pode exigir ajuste moderado.')
  return item(id, 'danger', 'Margem distante da meta', 'A margem atual está distante da meta desejada e exige reprecificação ou redução de custos.')
}

// ── Score ──────────────────────────────────────────────────────────────

function calculateScore(c: RentabilidadeProcedimentoCalculationResult): number {
  let score = 100

  // Margem de lucro
  if (c.profitMarginPercent < 35) score -= 8
  if (c.profitMarginPercent < 20) score -= 12
  if (c.profitMarginPercent < 10) score -= 20

  // Rentabilidade por hora
  const ratio = c.hourlyClinicalCost > 0 ? c.profitPerHour / c.hourlyClinicalCost : 0
  if (ratio < 1) score -= 8
  if (ratio < 0.5) score -= 12
  if (ratio < 0) score -= 20

  // Peso do custo variável
  const vcWeight =
    c.procedurePrice > 0 ? (c.procedureVariableCost / c.procedurePrice) * 100 : 0
  if (vcWeight > 25) score -= 6
  if (vcWeight > 40) score -= 10
  if (vcWeight > 60) score -= 16

  // ROI operacional
  if (c.operationalRoiPercent < 50) score -= 8
  if (c.operationalRoiPercent < 25) score -= 12
  if (c.operationalRoiPercent < 0) score -= 20

  // Gap da margem desejada
  if (c.marginGapPercent < 5) score -= 6
  if (c.marginGapPercent < 0) score -= 10
  if (c.marginGapPercent < -10) score -= 16

  return Math.round(Math.min(100, Math.max(0, score)))
}

// ── Status ─────────────────────────────────────────────────────────────

function isForceCritical(c: RentabilidadeProcedimentoCalculationResult): boolean {
  return (
    c.netProfit < 0 ||
    c.profitMarginPercent < 0 ||
    c.totalCost >= c.procedurePrice ||
    c.operationalRoiPercent <= -20
  )
}

function resolveStatus(
  score: number,
  c: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticStatus {
  if (isForceCritical(c)) return 'critical'
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'healthy'
  if (score >= 40) return 'attention'
  return 'critical'
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent:
    'O procedimento apresenta rentabilidade saudável, com margem e retorno operacional bem estruturados.',
  healthy:
    'O procedimento está rentável, mas alguns indicadores devem ser acompanhados.',
  attention:
    'O procedimento exige revisão de preço, custo ou tempo clínico para preservar rentabilidade.',
  critical:
    'O procedimento está em condição crítica e pode gerar prejuízo ou baixa sustentabilidade financeira.',
}

// ── Ordenação de warnings ──────────────────────────────────────────────

const SEVERITY_ORDER: Record<RentabilidadeProcedimentoDiagnosticSeverity, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
}

// ── Função principal ───────────────────────────────────────────────────

export function diagnoseRentabilidadeProcedimento(
  calculation: RentabilidadeProcedimentoCalculationResult,
): RentabilidadeProcedimentoDiagnosticResult {
  const score = calculateScore(calculation)
  const status = resolveStatus(score, calculation)
  const summary = SUMMARY[status]

  const items: RentabilidadeProcedimentoDiagnosticItem[] = [
    evalProfitMargin(calculation),
    evalProfitPerHour(calculation),
    evalVariableCostWeight(calculation),
    evalOperationalRoi(calculation),
    evalMarginGap(calculation),
  ]

  const positives = items.filter((i) => i.severity === 'success')
  const warnings = items
    .filter((i) => i.severity !== 'success')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  return { status, score, summary, positives, warnings }
}
