// ── Motor financeiro — Calculadora de Precificação Odontológica ────────

export type PrecificacaoCurrentPriceStatus =
  | 'healthy'        // currentPrice >= suggestedPrice
  | 'belowSuggested' // currentPrice >= minimumPrice, but < suggestedPrice
  | 'belowMinimum'   // currentPrice < minimumPrice

export interface PrecificacaoInput {
  procedureName?: string

  materialCost: number
  labCost: number
  clinicalTimeMinutes: number
  hourlyClinicalCost: number
  cardFeePercent: number
  taxPercent: number
  desiredMarginPercent: number

  currentPrice?: number
}

export interface PrecificacaoCalculationResult {
  // Inputs espelhados
  procedureName?: string
  materialCost: number
  labCost: number
  clinicalTimeMinutes: number
  hourlyClinicalCost: number
  cardFeePercent: number
  taxPercent: number
  desiredMarginPercent: number

  // Tempo clínico
  clinicalTimeHours: number
  clinicalTimeCost: number

  // Custo total e deduções
  directCost: number
  deductionPercent: number

  // Preços calculados
  minimumPrice: number
  suggestedPrice: number
  deductionAmount: number
  estimatedProfit: number
  estimatedMarginPercent: number

  // Comparação com preço atual (opcionais — presentes somente quando currentPrice informado)
  currentPrice?: number
  priceGap?: number
  priceGapPercent?: number
  currentPriceStatus?: PrecificacaoCurrentPriceStatus
}

// ── Motor de diagnóstico ───────────────────────────────────────────────

export type PrecificacaoDiagnosticSeverity = 'success' | 'info' | 'warning' | 'danger'

export type PrecificacaoDiagnosticStatus = 'excellent' | 'healthy' | 'attention' | 'critical'

export interface PrecificacaoDiagnosticItem {
  id: string
  severity: PrecificacaoDiagnosticSeverity
  title: string
  message: string
}

export interface PrecificacaoDiagnosticResult {
  status: PrecificacaoDiagnosticStatus
  score: number
  summary: string
  positives: PrecificacaoDiagnosticItem[]
  warnings: PrecificacaoDiagnosticItem[]
}

// ── Motor de playbooks ─────────────────────────────────────────────────

export type PrecificacaoPlaybookPriority = 'low' | 'medium' | 'high' | 'critical'

export type PrecificacaoPlaybookCategory =
  | 'margin'
  | 'pricing'
  | 'costs'
  | 'time'
  | 'lab'
  | 'fees'
  | 'sales'
  | 'risk'
  | 'opportunity'
  | 'standardization'

export type PrecificacaoPlaybookUrgency = 'low' | 'medium' | 'high' | 'critical'

export type PrecificacaoPlaybookImplementationEffort = 'low' | 'medium' | 'high'

export type PrecificacaoPlaybookFinancialImpactLevel = 'low' | 'medium' | 'high'

export interface PrecificacaoPlaybook {
  id: string
  title: string
  /** Subtitle curto para exibição na interface — opcional, exclusivo dos compostos. */
  subtitle?: string
  category: PrecificacaoPlaybookCategory
  priority: PrecificacaoPlaybookPriority
  urgency: PrecificacaoPlaybookUrgency
  implementationEffort: PrecificacaoPlaybookImplementationEffort
  financialImpactLevel: PrecificacaoPlaybookFinancialImpactLevel
  trigger: string
  objective: string
  whyItMatters: string
  recommendedAction: string
  expectedImpact: string
  checklist: string[]
}

export interface PrecificacaoPlaybookResult {
  playbooks: PrecificacaoPlaybook[]
}

// ── Motor de orquestração ──────────────────────────────────────────────

export interface PrecificacaoRecommendedAction {
  title: string
  message: string
  playbookId?: string
}

// ── Motor de narrativa ─────────────────────────────────────────────────

export interface PrecificacaoNarrative {
  headline: string
  summary: string
  scenarioReading: string
  practicalAction: string
  keyAlerts: string[]
  opportunities: string[]
  closingNote: string
}

export interface PrecificacaoOrchestratorResult {
  calculation: PrecificacaoCalculationResult
  diagnostic: PrecificacaoDiagnosticResult
  /** Todos os playbooks aplicáveis, ordenados por score interno. */
  allPlaybooks: PrecificacaoPlaybook[]
  /** Subconjunto priorizado — no máximo 5, com diversidade de categoria. */
  prioritizedPlaybooks: PrecificacaoPlaybook[]
  /** Playbooks com priority ou urgency "critical". */
  criticalAlerts: PrecificacaoPlaybook[]
  /** Playbooks com category "opportunity" ou "standardization". */
  opportunities: PrecificacaoPlaybook[]
  recommendedAction: PrecificacaoRecommendedAction
  executiveSummary: string
}
