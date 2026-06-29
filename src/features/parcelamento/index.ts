// ── Types ──────────────────────────────────────────────────────────────

export type {
  ParcelamentoInput,
  ParcelamentoCalculationResult,
  ParcelamentoDiagnosticSeverity,
  ParcelamentoDiagnosticStatus,
  ParcelamentoDiagnosticItem,
  ParcelamentoDiagnosticResult,
  ParcelamentoPlaybookPriority,
  ParcelamentoPlaybookCategory,
  ParcelamentoPlaybookUrgency,
  ParcelamentoPlaybookImplementationEffort,
  ParcelamentoPlaybookFinancialImpactLevel,
  ParcelamentoPlaybook,
  ParcelamentoPlaybookResult,
  ParcelamentoRecommendedAction,
  ParcelamentoOrchestratorResult,
  ParcelamentoNarrativeTone,
  ParcelamentoNarrativeSection,
  ParcelamentoNarrative,
} from './types'

// ── Constants ──────────────────────────────────────────────────────────

export {
  MIN_INSTALLMENTS,
  MAX_INSTALLMENTS,
  DEFAULT_CARD_FEE_PERCENT,
  DEFAULT_ANTICIPATION_FEE_PERCENT,
  DEFAULT_DESIRED_MARGIN_PERCENT,
} from './constants'

// ── Engines ────────────────────────────────────────────────────────────

export { calculateParcelamento } from './calculator'
export { diagnoseParcelamento } from './diagnostics'
export { getParcelamentoPlaybooks } from './playbooks'
export { runParcelamentoSimulator } from './orchestrator'
export { generateParcelamentoNarrative } from './narrative'
export { runParcelamentoHomologation } from './homologation'
export type {
  ParcelamentoHomologationScenario,
  ParcelamentoHomologationResult,
  ParcelamentoHomologationReport,
} from './homologation'
