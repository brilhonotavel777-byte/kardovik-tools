import type {
  RentabilidadeProcedimentoDiagnosticStatus,
  RentabilidadeProcedimentoNarrative,
  RentabilidadeProcedimentoOrchestratorResult,
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

const HEADLINES: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent: 'Procedimento rentável.',
  healthy: 'Rentabilidade administrável.',
  attention: 'Rentabilidade exige revisão.',
  critical: 'Rentabilidade crítica.',
}

function buildHeadline(result: RentabilidadeProcedimentoOrchestratorResult): string {
  return truncateText(HEADLINES[result.diagnostic.status], LIMIT_HEADLINE)
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY_FALLBACK: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent:
    'O procedimento apresenta rentabilidade saudável, com margem, ROI e lucro por hora bem estruturados.',
  healthy:
    'O procedimento está rentável, mas deve ser acompanhado junto com custo, tempo clínico e margem.',
  attention:
    'O procedimento apresenta pressão em margem, ROI ou lucro por hora e precisa de revisão.',
  critical:
    'O procedimento está em condição crítica e exige revisão antes de ser mantido como referência financeira.',
}

function buildSummary(result: RentabilidadeProcedimentoOrchestratorResult): string {
  const text = result.executiveSummary || SUMMARY_FALLBACK[result.diagnostic.status]
  return truncateSmart(text, LIMIT_SUMMARY)
}

// ── Scenario Reading ───────────────────────────────────────────────────

const SCENARIO_BASE: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent:
    'O procedimento apresenta boa relação entre preço, custo, tempo clínico e retorno operacional.',
  healthy:
    'O procedimento está em condição administrável, com indicadores que ainda exigem acompanhamento.',
  attention:
    'O procedimento mostra pressão financeira e pode depender de ajustes em preço, custo ou tempo clínico.',
  critical:
    'O procedimento está pressionado e pode gerar prejuízo ou baixa sustentabilidade financeira.',
}

function buildScenarioReading(result: RentabilidadeProcedimentoOrchestratorResult): string {
  const { calculation, diagnostic } = result
  let reading = SCENARIO_BASE[diagnostic.status]

  if (calculation.netProfit < 0) {
    reading += ' O lucro líquido está negativo.'
  }
  if (calculation.profitMarginPercent < 20) {
    reading += ' A margem líquida está pressionada.'
  }
  if (calculation.operationalRoiPercent < 25) {
    reading += ' O ROI operacional está baixo.'
  }
  if (calculation.priceAdjustmentNeeded > 0) {
    reading += ' O preço atual está abaixo do sugerido para a margem desejada.'
  }

  return truncateSmart(reading, LIMIT_SCENARIO_READING)
}

// ── Practical Action ───────────────────────────────────────────────────

const PRACTICAL_ACTION_FALLBACK: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent:
    'Padronize este procedimento como referência e acompanhe margem, ROI e rentabilidade por hora.',
  healthy:
    'Monitore a rentabilidade mensalmente e revise custos, tempo clínico e preço quando houver variações.',
  attention:
    'Revise preço, custos diretos, tempo clínico e margem desejada antes de manter este procedimento como referência.',
  critical:
    'Priorize reestruturação de preço, custo e tempo clínico antes de escalar ou manter o procedimento.',
}

function buildPracticalAction(result: RentabilidadeProcedimentoOrchestratorResult): string {
  const message =
    result.recommendedAction.message ||
    PRACTICAL_ACTION_FALLBACK[result.diagnostic.status]
  return truncateText(message, LIMIT_PRACTICAL_ACTION)
}

// ── Key Alerts ─────────────────────────────────────────────────────────

function buildKeyAlerts(result: RentabilidadeProcedimentoOrchestratorResult): string[] {
  const titles = result.criticalAlerts.slice(0, 5).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Opportunities ──────────────────────────────────────────────────────

function buildOpportunities(result: RentabilidadeProcedimentoOrchestratorResult): string[] {
  const titles = result.opportunities.slice(0, 4).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Closing Note ───────────────────────────────────────────────────────

const CLOSING_BY_STATUS: Record<RentabilidadeProcedimentoDiagnosticStatus, string> = {
  excellent: 'Use este procedimento como referência para decisões clínicas e comerciais.',
  healthy: 'Monitoramento periódico preserva previsibilidade e margem.',
  attention: 'Revisar agora reduz risco de perda de margem no procedimento.',
  critical: 'Corrigir preço, custo e tempo evita manter um procedimento financeiramente frágil.',
}

function buildClosingNote(result: RentabilidadeProcedimentoOrchestratorResult): string {
  return truncateText(CLOSING_BY_STATUS[result.diagnostic.status], LIMIT_CLOSING)
}

// ── Função principal ───────────────────────────────────────────────────

export function generateRentabilidadeNarrative(
  result: RentabilidadeProcedimentoOrchestratorResult,
): RentabilidadeProcedimentoNarrative {
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
