import type {
  PrecificacaoDiagnosticStatus,
  PrecificacaoNarrative,
  PrecificacaoOrchestratorResult,
} from './types'

// ── Limites de texto ───────────────────────────────────────────────────

const LIMIT_HEADLINE = 60
const LIMIT_SUMMARY = 280
const LIMIT_SCENARIO_READING = 320
const LIMIT_PRACTICAL_ACTION = 220
const LIMIT_CLOSING = 120

// ── Helpers privados ───────────────────────────────────────────────────

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/** Trunca no limite sem cortar palavras ao meio. */
function truncateSmart(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const sliced = text.slice(0, maxLength - 3)
  const lastSpace = sliced.lastIndexOf(' ')
  const cutAt = lastSpace > 0 ? lastSpace : sliced.length
  return sliced.slice(0, cutAt) + '...'
}

function deduplicateStrings(strings: string[]): string[] {
  return [...new Set(strings)]
}

// ── Headline ───────────────────────────────────────────────────────────

const HEADLINES: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent: 'Precificação saudável.',
  healthy: 'Preço sustentável com pequenos ajustes.',
  attention: 'Existem oportunidades claras de melhoria.',
  critical: 'Esta precificação requer intervenção imediata.',
}

function buildHeadline(result: PrecificacaoOrchestratorResult): string {
  return truncateText(HEADLINES[result.diagnostic.status], LIMIT_HEADLINE)
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY_FALLBACK: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent:
    'O cenário simulado indica que o preço sugerido está bem estruturado e preserva a margem desejada.',
  healthy:
    'O preço sugerido é viável, mas há espaço para melhorar a composição de custos ou a margem.',
  attention:
    'O cenário exige revisão. Ajustes no preço ou nos custos podem melhorar a rentabilidade do procedimento.',
  critical:
    'A precificação atual apresenta risco financeiro relevante e deve ser revisada antes de qualquer atendimento.',
}

function buildSummary(result: PrecificacaoOrchestratorResult): string {
  const text = result.executiveSummary || SUMMARY_FALLBACK[result.diagnostic.status]
  return truncateSmart(text, LIMIT_SUMMARY)
}

// ── Leitura do cenário ─────────────────────────────────────────────────

const SCENARIO_BASE: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent:
    'O preço sugerido cobre os custos diretos e preserva a margem desejada.',
  healthy:
    'O procedimento apresenta viabilidade financeira com espaço para melhora na rentabilidade.',
  attention:
    'O custo operacional está pressionando a precificação e reduzindo a margem estimada.',
  critical:
    'O procedimento apresenta risco financeiro relevante na formação de preço atual.',
}

const CURRENT_PRICE_STATUS_COMPLEMENT: Record<string, string> = {
  belowMinimum: ' O preço atual encontra-se abaixo do mínimo recomendado.',
  belowSuggested: ' O preço atual cobre os custos, mas fica abaixo da meta de margem.',
  healthy: ' O preço praticado está alinhado ao preço recomendado.',
}

function buildScenarioReading(result: PrecificacaoOrchestratorResult): string {
  const { calculation, diagnostic } = result
  let reading = SCENARIO_BASE[diagnostic.status]

  if (calculation.currentPriceStatus !== undefined) {
    reading += CURRENT_PRICE_STATUS_COMPLEMENT[calculation.currentPriceStatus] ?? ''
  }

  const { estimatedMarginPercent, desiredMarginPercent } = calculation
  if (
    diagnostic.status !== 'excellent' &&
    estimatedMarginPercent < desiredMarginPercent
  ) {
    const gap = Math.round(desiredMarginPercent - estimatedMarginPercent)
    if (gap > 0) {
      reading += ` A margem estimada fica ${gap}% abaixo da meta desejada.`
    }
  }

  return truncateSmart(reading, LIMIT_SCENARIO_READING)
}

// ── Ação prática ───────────────────────────────────────────────────────

const PRACTICAL_ACTION_FALLBACK: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent: 'Mantenha o padrão atual e monitore periodicamente.',
  healthy: 'Implemente pequenos ajustes e acompanhe os indicadores.',
  attention: 'Revise a composição dos custos antes do próximo atendimento.',
  critical: 'Recalcule imediatamente a tabela de preços.',
}

function buildPracticalAction(result: PrecificacaoOrchestratorResult): string {
  const message =
    result.recommendedAction.message ||
    PRACTICAL_ACTION_FALLBACK[result.diagnostic.status]
  return truncateText(message, LIMIT_PRACTICAL_ACTION)
}

// ── Alertas principais ─────────────────────────────────────────────────

function buildKeyAlerts(result: PrecificacaoOrchestratorResult): string[] {
  const titles = result.criticalAlerts
    .slice(0, 5)
    .map((p) => p.title)

  return deduplicateStrings(titles)
}

// ── Oportunidades ──────────────────────────────────────────────────────

function buildOpportunities(result: PrecificacaoOrchestratorResult): string[] {
  const titles = result.opportunities
    .slice(0, 4)
    .map((p) => p.title)

  return deduplicateStrings(titles)
}

// ── Nota de encerramento ───────────────────────────────────────────────

const CLOSING_BY_STATUS: Record<PrecificacaoDiagnosticStatus, string> = {
  excellent: 'Acompanhar periodicamente garante consistência financeira.',
  healthy: 'Pequenos ajustes agora evitam perdas futuras.',
  attention: 'Revisões preventivas preservam margem e competitividade.',
  critical:
    'Corrigir a precificação deve ser prioridade antes de novos atendimentos.',
}

function buildClosingNote(result: PrecificacaoOrchestratorResult): string {
  return truncateText(CLOSING_BY_STATUS[result.diagnostic.status], LIMIT_CLOSING)
}

// ── Função principal ───────────────────────────────────────────────────

export function generatePrecificacaoNarrative(
  result: PrecificacaoOrchestratorResult,
): PrecificacaoNarrative {
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
