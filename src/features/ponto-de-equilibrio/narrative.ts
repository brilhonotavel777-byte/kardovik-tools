import type {
  PontoEquilibrioDiagnosticStatus,
  PontoEquilibrioNarrative,
  PontoEquilibrioOrchestratorResult,
} from './types'

// ── Limites de texto ───────────────────────────────────────────────────

const LIMIT_HEADLINE = 60
const LIMIT_SUMMARY = 280
const LIMIT_SCENARIO_READING = 320
const LIMIT_PRACTICAL_ACTION = 220
const LIMIT_CLOSING = 120

// ── Helpers privados ───────────────────────────────────────────────────

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max - 3) + '...'
}

function truncateSmart(text: string, max: number): string {
  if (text.length <= max) return text
  const sliced = text.slice(0, max - 3)
  const lastSpace = sliced.lastIndexOf(' ')
  const cutAt = lastSpace > 0 ? lastSpace : sliced.length
  return sliced.slice(0, cutAt) + '...'
}

function deduplicateStrings(strings: string[]): string[] {
  return [...new Set(strings)]
}

// ── Headline ───────────────────────────────────────────────────────────

const HEADLINES: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent: 'Ponto de equilíbrio saudável.',
  healthy: 'Ponto de equilíbrio administrável.',
  attention: 'Ponto de equilíbrio exige revisão.',
  critical: 'Ponto de equilíbrio crítico.',
}

function buildHeadline(result: PontoEquilibrioOrchestratorResult): string {
  return truncateText(HEADLINES[result.diagnostic.status], LIMIT_HEADLINE)
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY_FALLBACK: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent:
    'O ponto de equilíbrio está bem estruturado para apoiar metas mensais, faturamento diário e decisões comerciais.',
  healthy:
    'O ponto de equilíbrio está administrável, mas deve ser acompanhado junto com margem, ticket e volume.',
  attention:
    'O ponto de equilíbrio apresenta pressão em margem, volume ou faturamento e precisa de revisão.',
  critical:
    'O ponto de equilíbrio está em condição crítica e exige reestruturação antes de novas metas comerciais.',
}

function buildSummary(result: PontoEquilibrioOrchestratorResult): string {
  const text =
    result.executiveSummary || SUMMARY_FALLBACK[result.diagnostic.status]
  return truncateSmart(text, LIMIT_SUMMARY)
}

// ── Scenario Reading ───────────────────────────────────────────────────

const SCENARIO_BASE: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent:
    'A clínica apresenta boa relação entre custos, ticket médio e faturamento atual.',
  healthy:
    'A operação está em condição administrável, com indicadores que ainda exigem acompanhamento.',
  attention:
    'A operação mostra pressão no equilíbrio financeiro e pode depender de ajustes em margem, ticket ou volume.',
  critical:
    'A operação está pressionada e pode não cobrir adequadamente custos fixos e variáveis.',
}

function buildScenarioReading(result: PontoEquilibrioOrchestratorResult): string {
  const { calculation, diagnostic } = result
  let reading = SCENARIO_BASE[diagnostic.status]

  if (calculation.contributionMarginPercent < 60) {
    reading += ' A margem de contribuição está abaixo do ideal.'
  }
  if (calculation.breakEvenProcedures > 140) {
    reading += ' O volume necessário para empatar está elevado.'
  }
  if (calculation.revenueGapPercent !== undefined && calculation.revenueGapPercent < 0) {
    reading += ' O faturamento atual está abaixo do ponto de equilíbrio.'
  }
  if (
    calculation.safetyMarginPercent !== undefined &&
    calculation.safetyMarginPercent < 5
  ) {
    reading += ' A margem de segurança está estreita.'
  }

  return truncateSmart(reading, LIMIT_SCENARIO_READING)
}

// ── Practical Action ───────────────────────────────────────────────────

const PRACTICAL_ACTION_FALLBACK: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent:
    'Padronize este cenário como referência mensal e acompanhe margem, ticket e faturamento diário.',
  healthy:
    'Monitore o ponto de equilíbrio mensalmente e revise custos, ticket e volume quando houver variações relevantes.',
  attention:
    'Revise custos fixos, margem de contribuição e ticket médio antes de definir novas metas comerciais.',
  critical:
    'Priorize a reestruturação de custos, margem e ticket antes de avançar em metas de crescimento.',
}

function buildPracticalAction(result: PontoEquilibrioOrchestratorResult): string {
  const message =
    result.recommendedAction.message ||
    PRACTICAL_ACTION_FALLBACK[result.diagnostic.status]
  return truncateText(message, LIMIT_PRACTICAL_ACTION)
}

// ── Key Alerts ─────────────────────────────────────────────────────────

function buildKeyAlerts(result: PontoEquilibrioOrchestratorResult): string[] {
  const titles = result.criticalAlerts.slice(0, 5).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Opportunities ──────────────────────────────────────────────────────

function buildOpportunities(result: PontoEquilibrioOrchestratorResult): string[] {
  const titles = result.opportunities.slice(0, 4).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Closing Note ───────────────────────────────────────────────────────

const CLOSING_BY_STATUS: Record<PontoEquilibrioDiagnosticStatus, string> = {
  excellent: 'Use este cenário como referência e acompanhe a evolução mensal.',
  healthy: 'Monitoramento periódico mantém previsibilidade e margem de segurança.',
  attention: 'Revisar agora reduz pressão futura sobre metas e faturamento.',
  critical:
    'Corrigir a estrutura antes de crescer evita metas financeiramente frágeis.',
}

function buildClosingNote(result: PontoEquilibrioOrchestratorResult): string {
  return truncateText(CLOSING_BY_STATUS[result.diagnostic.status], LIMIT_CLOSING)
}

// ── Função principal ───────────────────────────────────────────────────

export function generatePontoEquilibrioNarrative(
  result: PontoEquilibrioOrchestratorResult,
): PontoEquilibrioNarrative {
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
