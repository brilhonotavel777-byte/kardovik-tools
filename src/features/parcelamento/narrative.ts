import type {
  ParcelamentoDiagnosticStatus,
  ParcelamentoNarrative,
  ParcelamentoNarrativeSection,
  ParcelamentoNarrativeTone,
  ParcelamentoOrchestratorResult,
} from './types'

// ── Limites de texto ───────────────────────────────────────────────────

const LIMIT_HEADLINE = 80
const LIMIT_SUMMARY = 280
const LIMIT_SECTION_BODY = 240
const LIMIT_OPPORTUNITY_BODY = 200
const LIMIT_CLOSING = 160

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

// ── Headline ───────────────────────────────────────────────────────────

const HEADLINES: Record<ParcelamentoDiagnosticStatus, string> = {
  excellent: 'Parcelamento bem equilibrado',
  healthy: 'Parcelamento viável, com atenção',
  attention: 'Cenário pede revisão antes do fechamento',
  critical: 'Risco financeiro relevante na proposta',
}

function buildHeadline(result: ParcelamentoOrchestratorResult): string {
  return truncateText(HEADLINES[result.diagnostic.status], LIMIT_HEADLINE)
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY_FALLBACK: Record<ParcelamentoDiagnosticStatus, string> = {
  excellent:
    'As condições simuladas indicam um cenário equilibrado e com taxas controladas.',
  healthy:
    'O cenário é viável, mas ainda merece atenção às taxas, prazo e recebimento líquido.',
  attention:
    'O parcelamento pode funcionar, mas alguns pontos precisam ser revisados antes da apresentação.',
  critical:
    'A proposta apresenta risco financeiro relevante e deve ser revisada antes de ser apresentada.',
}

function buildSummary(result: ParcelamentoOrchestratorResult): string {
  const text =
    result.executiveSummary || SUMMARY_FALLBACK[result.diagnostic.status]
  return truncateText(text, LIMIT_SUMMARY)
}

// ── Leitura do cenário ─────────────────────────────────────────────────

const SCENARIO_BY_STATUS: Record<ParcelamentoDiagnosticStatus, ParcelamentoNarrativeSection> = {
  excellent: {
    title: 'Leitura do cenário',
    body: 'As taxas e o prazo estão em uma faixa confortável. Este cenário pode servir como referência para propostas semelhantes.',
    tone: 'positive',
  },
  healthy: {
    title: 'Leitura do cenário',
    body: 'A proposta parece viável, mas ainda existe espaço para proteger melhor o recebimento líquido.',
    tone: 'neutral',
  },
  attention: {
    title: 'Leitura do cenário',
    body: 'O cenário exige atenção. Taxas, prazo ou antecipação podem reduzir parte da margem do tratamento.',
    tone: 'attention',
  },
  critical: {
    title: 'Leitura do cenário',
    body: 'O cenário indica risco financeiro relevante. A proposta pode estar deixando uma parte importante do resultado nas taxas ou na antecipação.',
    tone: 'critical',
  },
}

function buildScenarioReading(
  result: ParcelamentoOrchestratorResult,
): ParcelamentoNarrativeSection {
  const section = SCENARIO_BY_STATUS[result.diagnostic.status]
  return {
    ...section,
    body: truncateText(section.body, LIMIT_SECTION_BODY),
  }
}

// ── Ação prática ───────────────────────────────────────────────────────

const TONE_BY_STATUS: Record<ParcelamentoDiagnosticStatus, ParcelamentoNarrativeTone> = {
  critical: 'critical',
  attention: 'attention',
  healthy: 'neutral',
  excellent: 'positive',
}

function buildPracticalAction(
  result: ParcelamentoOrchestratorResult,
): ParcelamentoNarrativeSection {
  return {
    title: result.recommendedAction.title,
    body: truncateText(result.recommendedAction.message, LIMIT_SECTION_BODY),
    tone: TONE_BY_STATUS[result.diagnostic.status],
  }
}

// ── Alertas principais ─────────────────────────────────────────────────

function buildKeyAlerts(
  result: ParcelamentoOrchestratorResult,
): ParcelamentoNarrativeSection[] {
  // Level 1: up to 3 critical alerts
  if (result.criticalAlerts.length > 0) {
    return result.criticalAlerts.slice(0, 3).map((playbook) => ({
      title: playbook.title,
      body: truncateText(
        `${playbook.whyItMatters} ${playbook.recommendedAction}`,
        LIMIT_SECTION_BODY,
      ),
      tone: 'critical' as ParcelamentoNarrativeTone,
    }))
  }

  // Level 2: up to 2 high-priority playbooks from prioritized set
  const highItems = result.prioritizedPlaybooks.filter(
    (p) => p.priority === 'high',
  )
  if (highItems.length > 0) {
    return highItems.slice(0, 2).map((playbook) => ({
      title: playbook.title,
      body: truncateText(
        `${playbook.whyItMatters} ${playbook.recommendedAction}`,
        LIMIT_SECTION_BODY,
      ),
      tone: 'attention' as ParcelamentoNarrativeTone,
    }))
  }

  return []
}

// ── Oportunidades ──────────────────────────────────────────────────────

function buildOpportunities(
  result: ParcelamentoOrchestratorResult,
): ParcelamentoNarrativeSection[] {
  return result.opportunities.slice(0, 2).map((playbook) => ({
    title: playbook.title,
    body: truncateText(playbook.expectedImpact, LIMIT_OPPORTUNITY_BODY),
    tone: 'positive' as ParcelamentoNarrativeTone,
  }))
}

// ── Nota de encerramento ───────────────────────────────────────────────

const CLOSING_BY_STATUS: Record<ParcelamentoDiagnosticStatus, string> = {
  critical:
    'Antes de apresentar a condição ao paciente, revise prazo, entrada e valor total.',
  attention: 'Uma pequena simulação alternativa pode evitar perda de margem.',
  healthy: 'Use este resultado como apoio para uma proposta mais consciente.',
  excellent:
    'Este cenário pode ser usado como referência para decisões semelhantes.',
}

function buildClosingNote(result: ParcelamentoOrchestratorResult): string {
  return truncateText(
    CLOSING_BY_STATUS[result.diagnostic.status],
    LIMIT_CLOSING,
  )
}

// ── Função principal ───────────────────────────────────────────────────

export function generateParcelamentoNarrative(
  result: ParcelamentoOrchestratorResult,
): ParcelamentoNarrative {
  return {
    headline: buildHeadline(result),
    summary: buildSummary(result),
    scenarioReading: buildScenarioReading(result),
    practicalAction: buildPracticalAction(result),
    keyAlerts: buildKeyAlerts(result),
    opportunities: buildOpportunities(result),
    closingNote: buildClosingNote(result),
  }
}
