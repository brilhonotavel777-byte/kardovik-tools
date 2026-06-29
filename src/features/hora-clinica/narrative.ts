import type {
  HoraClinicaDiagnosticStatus,
  HoraClinicaNarrative,
  HoraClinicaOrchestratorResult,
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

const HEADLINES: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent: 'Hora clínica bem estruturada.',
  healthy: 'Hora clínica administrável.',
  attention: 'Hora clínica exige revisão.',
  critical: 'Hora clínica em condição crítica.',
}

function buildHeadline(result: HoraClinicaOrchestratorResult): string {
  return truncateText(HEADLINES[result.diagnostic.status], LIMIT_HEADLINE)
}

// ── Summary ────────────────────────────────────────────────────────────

const SUMMARY_FALLBACK: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent:
    'A hora clínica apresenta boa estrutura operacional e pode ser usada como referência para decisões financeiras.',
  healthy:
    'A hora clínica está em condição administrável, mas alguns fatores devem ser acompanhados periodicamente.',
  attention:
    'A hora clínica apresenta sinais de pressão operacional e deve ser revisada antes de orientar decisões de preço.',
  critical:
    'A hora clínica está pressionada e exige revisão antes de sustentar novas decisões de precificação.',
}

function buildSummary(result: HoraClinicaOrchestratorResult): string {
  const text =
    result.executiveSummary || SUMMARY_FALLBACK[result.diagnostic.status]
  return truncateSmart(text, LIMIT_SUMMARY)
}

// ── Scenario Reading ───────────────────────────────────────────────────

const SCENARIO_BASE: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent:
    'A operação apresenta boa capacidade produtiva e uso eficiente das horas clínicas disponíveis.',
  healthy:
    'A operação está em equilíbrio parcial, com custos e ocupação ainda administráveis.',
  attention:
    'A operação mostra pontos de atenção em ocupação, custo da hora ou capacidade produtiva.',
  critical:
    'A operação apresenta pressão relevante sobre a hora clínica e exige correção antes de novas decisões.',
}

function buildScenarioReading(result: HoraClinicaOrchestratorResult): string {
  const { calculation, diagnostic } = result
  let reading = SCENARIO_BASE[diagnostic.status]

  if (calculation.occupancyRatePercent < 65) {
    reading += ' A ocupação está abaixo do ideal e aumenta o peso das horas ociosas.'
  }
  if (calculation.clinicalHourCost > 400) {
    reading += ' O custo da hora clínica está elevado e pode pressionar a precificação.'
  }
  if (calculation.revenueGapPercent > 25) {
    reading += ' A meta de lucro amplia a receita necessária por hora.'
  }
  if (calculation.productiveHours < 90) {
    reading += ' A capacidade produtiva mensal é limitada para diluir os custos.'
  }

  return truncateSmart(reading, LIMIT_SCENARIO_READING)
}

// ── Practical Action ───────────────────────────────────────────────────

const PRACTICAL_ACTION_FALLBACK: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent:
    'Padronize esta hora clínica como referência e revise os parâmetros periodicamente.',
  healthy:
    'Acompanhe ocupação, custos e meta de lucro antes de mudanças relevantes na agenda.',
  attention:
    'Revise agenda, custos e produtividade antes de usar esta hora clínica como referência definitiva.',
  critical:
    'Priorize a reestruturação da agenda, da ocupação e da base de custos antes de precificar novos procedimentos.',
}

function buildPracticalAction(result: HoraClinicaOrchestratorResult): string {
  const message =
    result.recommendedAction.message ||
    PRACTICAL_ACTION_FALLBACK[result.diagnostic.status]
  return truncateText(message, LIMIT_PRACTICAL_ACTION)
}

// ── Key Alerts ─────────────────────────────────────────────────────────

function buildKeyAlerts(result: HoraClinicaOrchestratorResult): string[] {
  const titles = result.criticalAlerts.slice(0, 5).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Opportunities ──────────────────────────────────────────────────────

function buildOpportunities(result: HoraClinicaOrchestratorResult): string[] {
  const titles = result.opportunities.slice(0, 4).map((p) => p.title)
  return deduplicateStrings(titles)
}

// ── Closing Note ───────────────────────────────────────────────────────

const CLOSING_BY_STATUS: Record<HoraClinicaDiagnosticStatus, string> = {
  excellent: 'Use este cenário como referência e acompanhe variações de agenda.',
  healthy: 'Manter acompanhamento periódico evita perda de previsibilidade.',
  attention: 'Uma revisão operacional agora reduz pressão futura na precificação.',
  critical:
    'Corrigir a operação antes de precificar evita decisões financeiramente frágeis.',
}

function buildClosingNote(result: HoraClinicaOrchestratorResult): string {
  return truncateText(
    CLOSING_BY_STATUS[result.diagnostic.status],
    LIMIT_CLOSING,
  )
}

// ── Função principal ───────────────────────────────────────────────────

export function generateHoraClinicaNarrative(
  result: HoraClinicaOrchestratorResult,
): HoraClinicaNarrative {
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
