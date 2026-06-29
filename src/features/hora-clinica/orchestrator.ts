import { calculateHoraClinica } from './calculator'
import { diagnoseHoraClinica } from './diagnostics'
import { getHoraClinicaPlaybooks } from './playbooks'
import type {
  HoraClinicaCalculationResult,
  HoraClinicaDiagnosticResult,
  HoraClinicaDiagnosticStatus,
  HoraClinicaInput,
  HoraClinicaOrchestratorResult,
  HoraClinicaPlaybook,
  HoraClinicaPlaybookCategory,
  HoraClinicaRecommendedAction,
} from './types'

// ── Score interno ──────────────────────────────────────────────────────

function scorePlaybook(playbook: HoraClinicaPlaybook): number {
  const priorityScore: Record<HoraClinicaPlaybook['priority'], number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  }

  const urgencyBonus: Record<HoraClinicaPlaybook['urgency'], number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 0,
  }

  const impactBonus: Record<HoraClinicaPlaybook['financialImpactLevel'], number> = {
    high: 25,
    medium: 15,
    low: 5,
  }

  const effortBonus: Record<HoraClinicaPlaybook['implementationEffort'], number> = {
    low: 10,
    medium: 0,
    high: -5,
  }

  const categoryBonus: Record<HoraClinicaPlaybookCategory, number> = {
    risk: 20,
    pricing: 18,
    profit: 16,
    costs: 14,
    idle_time: 14,
    capacity: 12,
    schedule: 12,
    efficiency: 10,
    team: 10,
    occupancy: 8,
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

function sortPlaybooksByScore(playbooks: HoraClinicaPlaybook[]): HoraClinicaPlaybook[] {
  return [...playbooks].sort((a, b) => scorePlaybook(b) - scorePlaybook(a))
}

// ── Seleção priorizada ─────────────────────────────────────────────────

function canAddPlaybook(
  playbook: HoraClinicaPlaybook,
  selected: HoraClinicaPlaybook[],
  categoryCount: Partial<Record<HoraClinicaPlaybookCategory, number>>,
  seenIds: Set<string>,
): boolean {
  if (seenIds.has(playbook.id)) return false
  if (selected.length >= 5) return false
  const count = categoryCount[playbook.category] ?? 0
  if (count >= 2) return false
  return true
}

function selectPrioritizedPlaybooks(
  playbooks: HoraClinicaPlaybook[],
): HoraClinicaPlaybook[] {
  const sorted = sortPlaybooksByScore(playbooks)

  const selected: HoraClinicaPlaybook[] = []
  const categoryCount: Partial<Record<HoraClinicaPlaybookCategory, number>> = {}
  const seenIds = new Set<string>()

  function tryAdd(playbook: HoraClinicaPlaybook): boolean {
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
  playbooks: HoraClinicaPlaybook[],
): HoraClinicaPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.priority === 'critical' || p.urgency === 'critical',
    ),
  ).slice(0, 5)
}

// ── Oportunidades ──────────────────────────────────────────────────────

function selectOpportunities(
  playbooks: HoraClinicaPlaybook[],
): HoraClinicaPlaybook[] {
  return sortPlaybooksByScore(
    playbooks.filter(
      (p) => p.category === 'opportunity' || p.category === 'standardization',
    ),
  ).slice(0, 4)
}

// ── Ação recomendada ───────────────────────────────────────────────────

const FALLBACK_ACTION: Record<
  HoraClinicaDiagnosticStatus,
  Omit<HoraClinicaRecommendedAction, 'playbookId'>
> = {
  excellent: {
    title: 'Padronizar a hora clínica como referência',
    message:
      'Use este cenário como base para padronizar preços, revisar agenda periodicamente e manter previsibilidade financeira.',
  },
  healthy: {
    title: 'Acompanhar eficiência e ocupação',
    message:
      'Mantenha a hora clínica monitorada e revise ocupação, custos e meta de lucro antes de mudanças relevantes na agenda.',
  },
  attention: {
    title: 'Revisar agenda e estrutura de custos',
    message:
      'Analise ocupação, custo da hora e horas ociosas antes de utilizar a hora clínica como base definitiva de precificação.',
  },
  critical: {
    title: 'Reestruturar a operação clínica',
    message:
      'Priorize a revisão da agenda, da ocupação e da estrutura de custos antes de avançar para novas decisões de precificação.',
  },
}

function buildRecommendedAction(
  prioritizedPlaybooks: HoraClinicaPlaybook[],
  diagnostic: HoraClinicaDiagnosticResult,
): HoraClinicaRecommendedAction {
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

const SUMMARY_BASE: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent:
    'A hora clínica está bem estruturada para apoiar decisões de precificação e planejamento operacional.',
  healthy:
    'A hora clínica está em condição administrável, com pontos de atenção que devem ser acompanhados.',
  attention:
    'A hora clínica exige revisão operacional antes de ser usada como referência definitiva de precificação.',
  critical:
    'A hora clínica está pressionada e pode comprometer a sustentabilidade financeira da operação.',
}

function buildExecutiveSummary(
  calculation: HoraClinicaCalculationResult,
  diagnostic: HoraClinicaDiagnosticResult,
  prioritizedPlaybooks: HoraClinicaPlaybook[],
): string {
  let summary = SUMMARY_BASE[diagnostic.status]

  if (calculation.occupancyRatePercent < 65) {
    summary += ' A ocupação é um dos principais pontos de atenção.'
  }

  if (calculation.clinicalHourCost > 400) {
    summary += ' O custo por hora está elevado.'
  }

  if (calculation.revenueGapPercent > 25) {
    summary += ' A meta de lucro aumenta de forma relevante a receita necessária por hora.'
  }

  const firstPlaybook = prioritizedPlaybooks[0]
  if (firstPlaybook) {
    summary += ` Principal ponto: ${firstPlaybook.title}.`
  }

  return truncateText(summary, MAX_SUMMARY_LENGTH)
}

// ── Função principal ───────────────────────────────────────────────────

export function runHoraClinicaSimulator(
  input: HoraClinicaInput,
): HoraClinicaOrchestratorResult {
  const calculation = calculateHoraClinica(input)
  const diagnostic = diagnoseHoraClinica(calculation)
  const { playbooks } = getHoraClinicaPlaybooks(calculation, diagnostic)

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
