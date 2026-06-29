import { calculateRentabilidadeProcedimento } from './calculator'
import { diagnoseRentabilidadeProcedimento } from './diagnostics'
import { getRentabilidadeProcedimentoPlaybooks } from './playbooks'
import type {
  RentabilidadeProcedimentoCalculationResult,
  RentabilidadeProcedimentoDiagnosticResult,
  RentabilidadeProcedimentoDiagnosticStatus,
  RentabilidadeProcedimentoInput,
  RentabilidadeProcedimentoOrchestratorResult,
  RentabilidadeProcedimentoPlaybook,
  RentabilidadeProcedimentoPlaybookCategory,
  RentabilidadeProcedimentoRecommendedAction,
} from './types'

// ── Score interno ──────────────────────────────────────────────────────

function scorePlaybook(playbook: RentabilidadeProcedimentoPlaybook): number {
  const priorityScore: Record<RentabilidadeProcedimentoPlaybook['priority'], number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }

  const urgencyBonus: Record<RentabilidadeProcedimentoPlaybook['urgency'], number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 0,
  }

  const impactBonus: Record<RentabilidadeProcedimentoPlaybook['financialImpactLevel'], number> = {
    high: 25,
    medium: 15,
    low: 5,
  }

  const effortBonus: Record<RentabilidadeProcedimentoPlaybook['implementationEffort'], number> = {
    low: 10,
    medium: 0,
    high: -5,
  }

  const categoryBonus: Record<RentabilidadeProcedimentoPlaybookCategory, number> = {
    risk: 20,
    pricing: 18,
    margin: 16,
    profit: 16,
    costs: 14,
    time: 14,
    roi: 12,
    strategy: 10,
    standardization: 4,
    opportunity: 0,
  }

  return (
    priorityScore[playbook.priority] +
    urgencyBonus[playbook.urgency] +
    impactBonus[playbook.financialImpactLevel] +
    effortBonus[playbook.implementationEffort] +
    categoryBonus[playbook.category]
  )
}

// ── Ordenação por score ────────────────────────────────────────────────

function sortPlaybooksByScore(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  return [...playbooks].sort((a, b) => scorePlaybook(b) - scorePlaybook(a))
}

// ── Seleção priorizada ─────────────────────────────────────────────────

function canAddPlaybook(
  playbook: RentabilidadeProcedimentoPlaybook,
  selected: RentabilidadeProcedimentoPlaybook[],
  categoryCount: Partial<Record<RentabilidadeProcedimentoPlaybookCategory, number>>,
  seenIds: Set<string>,
): boolean {
  if (seenIds.has(playbook.id)) return false
  if (selected.length >= 5) return false
  const count = categoryCount[playbook.category] ?? 0
  if (count >= 2) return false
  return true
}

function selectPrioritizedPlaybooks(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  const sorted = sortPlaybooksByScore(playbooks)

  const selected: RentabilidadeProcedimentoPlaybook[] = []
  const categoryCount: Partial<Record<RentabilidadeProcedimentoPlaybookCategory, number>> = {}
  const seenIds = new Set<string>()

  function tryAdd(playbook: RentabilidadeProcedimentoPlaybook): boolean {
    if (!canAddPlaybook(playbook, selected, categoryCount, seenIds)) return false
    selected.push(playbook)
    seenIds.add(playbook.id)
    categoryCount[playbook.category] = (categoryCount[playbook.category] ?? 0) + 1
    return true
  }

  // Garantia 1: ao menos 1 critical se existir
  const firstCritical = sorted.find(
    (p) => p.priority === 'critical' || p.urgency === 'critical',
  )
  if (firstCritical) tryAdd(firstCritical)

  // Garantia 2: se não houver critical, ao menos 1 high
  if (!firstCritical) {
    const firstHigh = sorted.find(
      (p) => p.priority === 'high' || p.urgency === 'high',
    )
    if (firstHigh) tryAdd(firstHigh)
  }

  // Preencher restante por score
  for (const playbook of sorted) {
    if (selected.length >= 5) break
    tryAdd(playbook)
  }

  return selected
}

// ── Alertas críticos ───────────────────────────────────────────────────

function selectCriticalAlerts(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.priority === 'critical' || p.urgency === 'critical',
    ),
  ).slice(0, 5)
}

// ── Oportunidades ──────────────────────────────────────────────────────

function selectOpportunities(
  playbooks: RentabilidadeProcedimentoPlaybook[],
): RentabilidadeProcedimentoPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.category === 'opportunity' || p.category === 'standardization',
    ),
  ).slice(0, 4)
}

// ── Ação recomendada ───────────────────────────────────────────────────

const FALLBACK_ACTION: Record<
  RentabilidadeProcedimentoDiagnosticStatus,
  Omit<RentabilidadeProcedimentoRecommendedAction, 'playbookId'>
> = {
  excellent: {
    title: 'Padronizar procedimento rentável',
    message:
      'Use este procedimento como referência para acompanhar margem, custo, tempo clínico e rentabilidade por hora.',
  },
  healthy: {
    title: 'Monitorar rentabilidade do procedimento',
    message:
      'Acompanhe margem, ROI, custo variável e tempo clínico para preservar previsibilidade financeira.',
  },
  attention: {
    title: 'Revisar preço, custo e tempo',
    message:
      'Analise preço cobrado, custos diretos e duração clínica antes de manter este procedimento como referência.',
  },
  critical: {
    title: 'Reestruturar rentabilidade do procedimento',
    message:
      'Priorize revisão de preço, custos variáveis, tempo clínico e alocação fixa antes de escalar este procedimento.',
  },
}

function buildRecommendedAction(
  prioritizedPlaybooks: RentabilidadeProcedimentoPlaybook[],
  diagnostic: RentabilidadeProcedimentoDiagnosticResult,
): RentabilidadeProcedimentoRecommendedAction {
  // Hierarquia 1: critical ou urgency critical
  const firstCritical = prioritizedPlaybooks.find(
    (p) => p.priority === 'critical' || p.urgency === 'critical',
  )
  if (firstCritical) {
    return {
      title: firstCritical.title,
      message: firstCritical.recommendedAction,
      playbookId: firstCritical.id,
    }
  }

  // Hierarquia 2: high ou urgency high
  const firstHigh = prioritizedPlaybooks.find(
    (p) => p.priority === 'high' || p.urgency === 'high',
  )
  if (firstHigh) {
    return {
      title: firstHigh.title,
      message: firstHigh.recommendedAction,
      playbookId: firstHigh.id,
    }
  }

  // Hierarquia 3: fallback por status
  return FALLBACK_ACTION[diagnostic.status]
}

// ── Resumo executivo ───────────────────────────────────────────────────

const MAX_SUMMARY_LENGTH = 280

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 3).trimEnd() + '...'
}

const SUMMARY_BASE: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent:
    'O procedimento apresenta rentabilidade saudável e pode servir como referência para decisões clínicas e comerciais.',
  healthy:
    'O procedimento está rentável, mas deve ser monitorado junto com custo, tempo clínico e margem.',
  attention:
    'O procedimento exige revisão para preservar margem, ROI e rentabilidade por hora.',
  critical:
    'O procedimento está em condição crítica e pode comprometer a sustentabilidade financeira se mantido sem ajustes.',
}

function buildExecutiveSummary(
  calculation: RentabilidadeProcedimentoCalculationResult,
  diagnostic: RentabilidadeProcedimentoDiagnosticResult,
  prioritizedPlaybooks: RentabilidadeProcedimentoPlaybook[],
): string {
  let summary = SUMMARY_BASE[diagnostic.status]

  if (calculation.netProfit < 0) {
    summary += ' O lucro líquido está negativo.'
  }
  if (calculation.profitMarginPercent < 20) {
    summary += ' A margem líquida está pressionada.'
  }
  if (calculation.operationalRoiPercent < 25) {
    summary += ' O ROI operacional está baixo.'
  }
  if (calculation.priceAdjustmentNeeded > 0) {
    summary += ' O preço atual está abaixo do sugerido para a margem desejada.'
  }

  const firstPlaybook = prioritizedPlaybooks[0]
  if (firstPlaybook) {
    summary += ` Principal ponto: ${firstPlaybook.title}.`
  }

  return truncateText(summary, MAX_SUMMARY_LENGTH)
}

// ── Função principal ───────────────────────────────────────────────────

export function runRentabilidadeProcedimentoSimulator(
  input: RentabilidadeProcedimentoInput,
): RentabilidadeProcedimentoOrchestratorResult {
  const calculation = calculateRentabilidadeProcedimento(input)
  const diagnostic = diagnoseRentabilidadeProcedimento(calculation)
  const { playbooks } = getRentabilidadeProcedimentoPlaybooks(calculation, diagnostic)

  const allPlaybooks = sortPlaybooksByScore(playbooks)

  const prioritizedPlaybooks = selectPrioritizedPlaybooks(allPlaybooks)

  const criticalAlerts = selectCriticalAlerts(allPlaybooks)

  const opportunities = selectOpportunities(allPlaybooks)

  const recommendedAction = buildRecommendedAction(prioritizedPlaybooks, diagnostic)

  const executiveSummary = buildExecutiveSummary(calculation, diagnostic, prioritizedPlaybooks)

  return {
    calculation,
    diagnostic,
    allPlaybooks,
    prioritizedPlaybooks,
    criticalAlerts,
    opportunities,
    recommendedAction,
    executiveSummary,
  }
}
