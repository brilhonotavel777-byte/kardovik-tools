import { calculateParcelamento } from './calculator'
import { diagnoseParcelamento } from './diagnostics'
import { getParcelamentoPlaybooks } from './playbooks'
import type {
  ParcelamentoCalculationResult,
  ParcelamentoDiagnosticResult,
  ParcelamentoDiagnosticStatus,
  ParcelamentoInput,
  ParcelamentoOrchestratorResult,
  ParcelamentoPlaybook,
  ParcelamentoPlaybookCategory,
  ParcelamentoRecommendedAction,
} from './types'

// ── Score interno ──────────────────────────────────────────────────────

function scorePlaybook(playbook: ParcelamentoPlaybook): number {
  const priorityScore: Record<ParcelamentoPlaybook['priority'], number> = {
    critical: 100,
    high: 75,
    medium: 45,
    low: 20,
  }

  const urgencyBonus: Record<ParcelamentoPlaybook['urgency'], number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 0,
  }

  const impactBonus: Record<ParcelamentoPlaybook['financialImpactLevel'], number> = {
    high: 25,
    medium: 12,
    low: 0,
  }

  const effortBonus: Record<ParcelamentoPlaybook['implementationEffort'], number> = {
    low: 10,
    medium: 3,
    high: -5,
  }

  const categoryBonus: Record<ParcelamentoPlaybookCategory, number> = {
    risk: 20,
    margin: 15,
    cashflow: 12,
    pricing: 10,
    fees: 8,
    installments: 8,
    sales: 6,
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

function sortByScore(playbooks: ParcelamentoPlaybook[]): ParcelamentoPlaybook[] {
  return [...playbooks].sort((a, b) => scorePlaybook(b) - scorePlaybook(a))
}

// ── Seleção priorizada ─────────────────────────────────────────────────

function selectPrioritizedPlaybooks(
  playbooks: ParcelamentoPlaybook[],
): ParcelamentoPlaybook[] {
  const sorted = sortByScore(playbooks)

  const selected: ParcelamentoPlaybook[] = []
  const categoryCount: Partial<Record<ParcelamentoPlaybookCategory, number>> = {}
  const seenIds = new Set<string>()

  function tryAdd(playbook: ParcelamentoPlaybook): boolean {
    if (seenIds.has(playbook.id)) return false
    if (selected.length >= 5) return false
    const count = categoryCount[playbook.category] ?? 0
    if (count >= 2) return false
    selected.push(playbook)
    seenIds.add(playbook.id)
    categoryCount[playbook.category] = count + 1
    return true
  }

  // Guarantee 1: include at least 1 critical if one exists
  const firstCritical = sorted.find(
    (p) => p.priority === 'critical' || p.urgency === 'critical',
  )
  if (firstCritical) tryAdd(firstCritical)

  // Guarantee 2: if no critical, include at least 1 high if one exists
  if (!firstCritical) {
    const firstHigh = sorted.find(
      (p) => p.priority === 'high' || p.urgency === 'high',
    )
    if (firstHigh) tryAdd(firstHigh)
  }

  // Fill remaining slots by score, respecting category diversity cap
  for (const playbook of sorted) {
    if (selected.length >= 5) break
    tryAdd(playbook)
  }

  return selected
}

// ── Ação recomendada ───────────────────────────────────────────────────

const FALLBACK_ACTION: Record<
  ParcelamentoDiagnosticStatus,
  Omit<ParcelamentoRecommendedAction, 'playbookId'>
> = {
  critical: {
    title: 'Revise a proposta antes de apresentar',
    message:
      'O cenário indica risco relevante para o recebimento líquido. Considere reduzir parcelas, incluir entrada ou revisar o valor total.',
  },
  attention: {
    title: 'Ajuste o cenário antes de fechar',
    message:
      'O parcelamento é possível, mas taxas, prazo ou antecipação podem reduzir a margem. Simule uma alternativa mais conservadora.',
  },
  healthy: {
    title: 'Cenário viável com atenção às taxas',
    message:
      'A proposta parece viável, mas vale revisar o impacto das taxas antes da apresentação final.',
  },
  excellent: {
    title: 'Cenário bem equilibrado',
    message:
      'Este cenário tende a preservar o recebimento líquido e pode servir como referência para propostas semelhantes.',
  },
}

function buildRecommendedAction(
  diagnostic: ParcelamentoDiagnosticResult,
  prioritizedPlaybooks: ParcelamentoPlaybook[],
): ParcelamentoRecommendedAction {
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

  return FALLBACK_ACTION[diagnostic.status]
}

// ── Resumo executivo ───────────────────────────────────────────────────

const SUMMARY_BASE: Record<ParcelamentoDiagnosticStatus, string> = {
  excellent:
    'Este parcelamento está bem equilibrado. As taxas estão controladas e o cenário pode servir como referência para propostas semelhantes.',
  healthy:
    'Este parcelamento é viável, mas ainda merece atenção às taxas e ao prazo para preservar o recebimento líquido.',
  attention:
    'Este cenário exige revisão. O prazo, as taxas ou a antecipação podem reduzir a margem do tratamento.',
  critical:
    'Este cenário apresenta risco financeiro relevante. Revise parcelas, entrada ou valor total antes de apresentar a proposta.',
}

const MAX_SUMMARY_LENGTH = 280

function buildExecutiveSummary(
  diagnostic: ParcelamentoDiagnosticResult,
  _calculation: ParcelamentoCalculationResult,
  prioritizedPlaybooks: ParcelamentoPlaybook[],
): string {
  const base = SUMMARY_BASE[diagnostic.status]

  const firstCritical = prioritizedPlaybooks.find(
    (p) => p.priority === 'critical' || p.urgency === 'critical',
  )

  const full = firstCritical
    ? `${base} Principal ponto: ${firstCritical.title}.`
    : base

  if (full.length <= MAX_SUMMARY_LENGTH) return full
  return full.slice(0, MAX_SUMMARY_LENGTH - 3) + '...'
}

// ── Função principal ───────────────────────────────────────────────────

export function runParcelamentoSimulator(
  input: ParcelamentoInput,
): ParcelamentoOrchestratorResult {
  const calculation = calculateParcelamento(input)
  const diagnostic = diagnoseParcelamento(calculation)
  const { playbooks } = getParcelamentoPlaybooks(calculation, diagnostic)

  const allPlaybooks = sortByScore(playbooks)

  const prioritizedPlaybooks = selectPrioritizedPlaybooks(playbooks)

  const criticalAlerts = sortByScore(
    allPlaybooks.filter(
      (p) => p.priority === 'critical' || p.urgency === 'critical',
    ),
  )

  const opportunities = sortByScore(
    allPlaybooks.filter((p) => p.category === 'opportunity'),
  )

  const recommendedAction = buildRecommendedAction(diagnostic, prioritizedPlaybooks)

  const executiveSummary = buildExecutiveSummary(
    diagnostic,
    calculation,
    prioritizedPlaybooks,
  )

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
