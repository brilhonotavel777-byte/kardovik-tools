import { calculatePrecificacao } from './calculator'
import { diagnosePrecificacao } from './diagnostics'
import { getPrecificacaoPlaybooks } from './playbooks'
import type {
  PrecificacaoCalculationResult,
  PrecificacaoDiagnosticResult,
  PrecificacaoDiagnosticStatus,
  PrecificacaoInput,
  PrecificacaoOrchestratorResult,
  PrecificacaoPlaybook,
  PrecificacaoPlaybookCategory,
  PrecificacaoRecommendedAction,
} from './types'

// ── Score interno ──────────────────────────────────────────────────────

function scorePlaybook(playbook: PrecificacaoPlaybook): number {
  const priorityScore: Record<PrecificacaoPlaybook['priority'], number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }

  const urgencyBonus: Record<PrecificacaoPlaybook['urgency'], number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 0,
  }

  const impactBonus: Record<PrecificacaoPlaybook['financialImpactLevel'], number> = {
    high: 25,
    medium: 15,
    low: 5,
  }

  const effortBonus: Record<PrecificacaoPlaybook['implementationEffort'], number> = {
    low: 10,
    medium: 0,
    high: -5,
  }

  const categoryBonus: Record<PrecificacaoPlaybookCategory, number> = {
    risk: 20,
    pricing: 18,
    margin: 16,
    costs: 14,
    lab: 14,
    time: 14,
    fees: 12,
    sales: 10,
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

function sortPlaybooksByScore(playbooks: PrecificacaoPlaybook[]): PrecificacaoPlaybook[] {
  return [...playbooks].sort((a, b) => scorePlaybook(b) - scorePlaybook(a))
}

// ── Seleção priorizada ─────────────────────────────────────────────────

function selectPrioritizedPlaybooks(
  playbooks: PrecificacaoPlaybook[],
): PrecificacaoPlaybook[] {
  const sorted = sortPlaybooksByScore(playbooks)

  const selected: PrecificacaoPlaybook[] = []
  const categoryCount: Partial<Record<PrecificacaoPlaybookCategory, number>> = {}
  const seenIds = new Set<string>()

  function canAddPlaybook(playbook: PrecificacaoPlaybook): boolean {
    if (seenIds.has(playbook.id)) return false
    if (selected.length >= 5) return false
    const count = categoryCount[playbook.category] ?? 0
    if (count >= 2) return false
    return true
  }

  function tryAdd(playbook: PrecificacaoPlaybook): boolean {
    if (!canAddPlaybook(playbook)) return false
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

  // Preencher restante por score, respeitando limite de categoria
  for (const playbook of sorted) {
    if (selected.length >= 5) break
    tryAdd(playbook)
  }

  return selected
}

// ── Alertas críticos ───────────────────────────────────────────────────

function selectCriticalAlerts(
  playbooks: PrecificacaoPlaybook[],
): PrecificacaoPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.priority === 'critical' || p.urgency === 'critical',
    ),
  ).slice(0, 5)
}

// ── Oportunidades ──────────────────────────────────────────────────────

function selectOpportunities(
  playbooks: PrecificacaoPlaybook[],
): PrecificacaoPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.category === 'opportunity' || p.category === 'standardization',
    ),
  ).slice(0, 4)
}

// ── Ação recomendada ───────────────────────────────────────────────────

const FALLBACK_ACTION: Record<
  PrecificacaoDiagnosticStatus,
  Omit<PrecificacaoRecommendedAction, 'playbookId'>
> = {
  critical: {
    title: 'Revisar preço antes de apresentar',
    message:
      'O cenário indica risco financeiro relevante. Revise custos, margem e preço antes de manter essa condição.',
  },
  attention: {
    title: 'Ajustar preço com cuidado',
    message:
      'O preço pode cobrir custos, mas ainda exige revisão para preservar a margem desejada.',
  },
  healthy: {
    title: 'Manter acompanhamento',
    message:
      'O preço sugerido é viável, mas vale acompanhar custos, deduções e tempo clínico.',
  },
  excellent: {
    title: 'Padronizar este cenário',
    message:
      'O preço sugerido está bem estruturado e pode servir como referência para procedimentos semelhantes.',
  },
}

function buildRecommendedAction(
  prioritizedPlaybooks: PrecificacaoPlaybook[],
  diagnostic: PrecificacaoDiagnosticResult,
): PrecificacaoRecommendedAction {
  // Hierarquia 1: playbook critical priorizado
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

  // Hierarquia 2: playbook high priorizado
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

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

const SUMMARY_BASE: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent:
    'Preço sugerido bem estruturado para cobrir custos, deduções e preservar a margem desejada.',
  healthy:
    'Preço viável, com alguns pontos que merecem acompanhamento para manter a margem protegida.',
  attention:
    'O cenário exige revisão antes de manter ou apresentar este preço ao paciente.',
  critical:
    'Há risco financeiro relevante na formação do preço deste procedimento.',
}

const CURRENT_PRICE_STATUS_SUFFIX: Record<string, string> = {
  belowMinimum: ' O preço atual informado está abaixo do mínimo calculado.',
  belowSuggested: ' O preço atual cobre custos, mas fica abaixo do preço sugerido.',
  healthy: ' O preço atual informado está alinhado ao preço sugerido.',
}

function buildExecutiveSummary(
  calculation: PrecificacaoCalculationResult,
  diagnostic: PrecificacaoDiagnosticResult,
  prioritizedPlaybooks: PrecificacaoPlaybook[],
): string {
  let summary = SUMMARY_BASE[diagnostic.status]

  if (calculation.currentPriceStatus !== undefined) {
    summary += CURRENT_PRICE_STATUS_SUFFIX[calculation.currentPriceStatus] ?? ''
  }

  const firstPlaybook = prioritizedPlaybooks[0]
  if (firstPlaybook) {
    summary += ` Principal ponto: ${firstPlaybook.title}.`
  }

  return truncateText(summary, MAX_SUMMARY_LENGTH)
}

// ── Função principal ───────────────────────────────────────────────────

export function runPrecificacaoSimulator(
  input: PrecificacaoInput,
): PrecificacaoOrchestratorResult {
  const calculation = calculatePrecificacao(input)
  const diagnostic = diagnosePrecificacao(calculation)
  const { playbooks } = getPrecificacaoPlaybooks(calculation, diagnostic)

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
