import { calculatePontoEquilibrio } from './calculator'
import { diagnosePontoEquilibrio } from './diagnostics'
import { getPontoEquilibrioPlaybooks } from './playbooks'
import type {
  PontoEquilibrioCalculationResult,
  PontoEquilibrioDiagnosticResult,
  PontoEquilibrioDiagnosticStatus,
  PontoEquilibrioInput,
  PontoEquilibrioOrchestratorResult,
  PontoEquilibrioPlaybook,
  PontoEquilibrioPlaybookCategory,
  PontoEquilibrioRecommendedAction,
} from './types'

// ── Score interno ──────────────────────────────────────────────────────

function scorePlaybook(playbook: PontoEquilibrioPlaybook): number {
  const priorityScore: Record<PontoEquilibrioPlaybook['priority'], number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }

  const urgencyBonus: Record<PontoEquilibrioPlaybook['urgency'], number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 0,
  }

  const impactBonus: Record<PontoEquilibrioPlaybook['financialImpactLevel'], number> = {
    high: 25,
    medium: 15,
    low: 5,
  }

  const effortBonus: Record<PontoEquilibrioPlaybook['implementationEffort'], number> = {
    low: 10,
    medium: 0,
    high: -5,
  }

  const categoryBonus: Record<PontoEquilibrioPlaybookCategory, number> = {
    risk: 20,
    pricing: 18,
    revenue: 16,
    margin: 14,
    costs: 14,
    volume: 12,
    operations: 10,
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
  playbooks: PontoEquilibrioPlaybook[],
): PontoEquilibrioPlaybook[] {
  return [...playbooks].sort((a, b) => scorePlaybook(b) - scorePlaybook(a))
}

// ── Seleção priorizada ─────────────────────────────────────────────────

function canAddPlaybook(
  playbook: PontoEquilibrioPlaybook,
  selected: PontoEquilibrioPlaybook[],
  categoryCount: Partial<Record<PontoEquilibrioPlaybookCategory, number>>,
  seenIds: Set<string>,
): boolean {
  if (seenIds.has(playbook.id)) return false
  if (selected.length >= 5) return false
  const count = categoryCount[playbook.category] ?? 0
  if (count >= 2) return false
  return true
}

function selectPrioritizedPlaybooks(
  playbooks: PontoEquilibrioPlaybook[],
): PontoEquilibrioPlaybook[] {
  const sorted = sortPlaybooksByScore(playbooks)

  const selected: PontoEquilibrioPlaybook[] = []
  const categoryCount: Partial<Record<PontoEquilibrioPlaybookCategory, number>> = {}
  const seenIds = new Set<string>()

  function tryAdd(playbook: PontoEquilibrioPlaybook): boolean {
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

  // Preencher restante por score, respeitando limites de categoria
  for (const playbook of sorted) {
    if (selected.length >= 5) break
    tryAdd(playbook)
  }

  return selected
}

// ── Alertas críticos ───────────────────────────────────────────────────

function selectCriticalAlerts(
  playbooks: PontoEquilibrioPlaybook[],
): PontoEquilibrioPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.priority === 'critical' || p.urgency === 'critical',
    ),
  ).slice(0, 5)
}

// ── Oportunidades ──────────────────────────────────────────────────────

function selectOpportunities(
  playbooks: PontoEquilibrioPlaybook[],
): PontoEquilibrioPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.category === 'opportunity' || p.category === 'standardization',
    ),
  ).slice(0, 4)
}

// ── Ação recomendada ───────────────────────────────────────────────────

const FALLBACK_ACTION: Record<
  PontoEquilibrioDiagnosticStatus,
  Omit<PontoEquilibrioRecommendedAction, 'playbookId'>
> = {
  excellent: {
    title: 'Padronizar o ponto de equilíbrio',
    message:
      'Use este cenário como referência para acompanhar metas mensais, faturamento diário e margem de segurança.',
  },
  healthy: {
    title: 'Monitorar margem e volume',
    message:
      'Acompanhe o ponto de equilíbrio mensalmente e revise ticket, custos e volume quando houver variações relevantes.',
  },
  attention: {
    title: 'Revisar custos, ticket e volume',
    message:
      'Analise a margem de contribuição, o ticket médio e o volume necessário antes de definir metas comerciais.',
  },
  critical: {
    title: 'Reestruturar o ponto de equilíbrio',
    message:
      'Priorize a revisão de custos fixos, margem de contribuição e ticket médio antes de avançar em novas metas de crescimento.',
  },
}

function buildRecommendedAction(
  prioritizedPlaybooks: PontoEquilibrioPlaybook[],
  diagnostic: PontoEquilibrioDiagnosticResult,
): PontoEquilibrioRecommendedAction {
  // Hierarquia 1: playbook critical ou urgency critical priorizado
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

  // Hierarquia 2: playbook high ou urgency high priorizado
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

const SUMMARY_BASE: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent:
    'O ponto de equilíbrio está bem estruturado para apoiar metas mensais e decisões comerciais.',
  healthy:
    'O ponto de equilíbrio está administrável, mas deve ser acompanhado em conjunto com margem, ticket e volume.',
  attention:
    'O ponto de equilíbrio exige revisão antes de ser usado como referência definitiva para metas comerciais.',
  critical:
    'O ponto de equilíbrio está pressionado e pode comprometer a sustentabilidade financeira da clínica.',
}

function buildExecutiveSummary(
  calculation: PontoEquilibrioCalculationResult,
  diagnostic: PontoEquilibrioDiagnosticResult,
  prioritizedPlaybooks: PontoEquilibrioPlaybook[],
): string {
  let summary = SUMMARY_BASE[diagnostic.status]

  if (calculation.contributionMarginPercent < 60) {
    summary += ' A margem de contribuição é um dos principais pontos de atenção.'
  }

  if (calculation.breakEvenProcedures > 140) {
    summary += ' O volume necessário para empatar está elevado.'
  }

  if (calculation.revenueGapPercent !== undefined && calculation.revenueGapPercent < 0) {
    summary += ' O faturamento atual está abaixo do ponto de equilíbrio.'
  }

  if (
    calculation.safetyMarginPercent !== undefined &&
    calculation.safetyMarginPercent < 5
  ) {
    summary += ' A margem de segurança é estreita.'
  }

  const firstPlaybook = prioritizedPlaybooks[0]
  if (firstPlaybook) {
    summary += ` Principal ponto: ${firstPlaybook.title}.`
  }

  return truncateText(summary, MAX_SUMMARY_LENGTH)
}

// ── Função principal ───────────────────────────────────────────────────

export function runPontoEquilibrioSimulator(
  input: PontoEquilibrioInput,
): PontoEquilibrioOrchestratorResult {
  const calculation = calculatePontoEquilibrio(input)
  const diagnostic = diagnosePontoEquilibrio(calculation)
  const { playbooks } = getPontoEquilibrioPlaybooks(calculation, diagnostic)

  const allPlaybooks = sortPlaybooksByScore(playbooks)

  const prioritizedPlaybooks = selectPrioritizedPlaybooks(allPlaybooks)

  const criticalAlerts = selectCriticalAlerts(allPlaybooks)

  const opportunities = selectOpportunities(allPlaybooks)

  const recommendedAction = buildRecommendedAction(prioritizedPlaybooks, diagnostic)

  const executiveSummary = buildExecutiveSummary(
    calculation,
    diagnostic,
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
